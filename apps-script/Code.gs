/**
 * PETRO · conexión entre la app y el Google Sheet.
 *
 * Cómo instalarlo (una sola vez):
 * 1. En el Google Sheet: Extensiones → Apps Script.
 * 2. Borrar lo que haya y pegar todo este archivo.
 * 3. Poner una clave distinta para cada una en CLAVES (abajo). Cada una usa la suya en la app.
 *    Si una clave se filtra, se cambia solo esa y se vuelve a implementar (Implementar → Administrar implementaciones → editar → Nueva versión).
 * 4. Implementar → Nueva implementación → Tipo: Aplicación web.
 *    Ejecutar como: "Yo". Quién tiene acceso: "Cualquier persona".
 *    ("Cualquier persona" es necesario para que la app se conecte; sin una clave válida el script no responde nada.)
 * 5. Copiar la URL que termina en /exec y pegarla en la app junto con la clave.
 *
 * La app solo puede escribir montos en las celdas de los meses (enero a diciembre)
 * de las filas de conceptos y repartos de "Control 2026". Nunca pisa fórmulas de cálculo.
 * Todo lo que se anota queda en la hoja "Registro app": quién, cuándo, qué y el valor anterior.
 */
const CLAVES = {
  Cele: 'clave-de-cele',
  Mica: 'clave-de-mica',
  Anto: 'clave-de-anto',
};
const HOJA_REGISTRO = 'Registro app';

const HOJA_CONTROL = 'Control 2026';
const RANGOS = {
  control: [HOJA_CONTROL, 'A1:AK60'],
  unidades: ['Unidades', 'A1:M12'],
  aysa: ['AySA', 'A1:N47'],
  fondo: ['Fondo de ahorro', 'A1:K30'],
};
const COL_ENERO = 6; // columna F

function doGet(e) { return responder(e.parameter || {}); }
function doPost(e) {
  let datos = {};
  try { datos = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'Pedido mal armado.' }); }
  return responder(datos);
}

function quienEs(clave) {
  clave = String(clave || '');
  if (clave.length < 6) return null;
  const nombres = Object.keys(CLAVES);
  for (let i = 0; i < nombres.length; i++) if (CLAVES[nombres[i]] === clave) return nombres[i];
  return null;
}

function responder(p) {
  const quien = quienEs(p.clave);
  if (!quien) { Utilities.sleep(1500); return json({ ok: false, error: 'La clave no es correcta.' }); }
  try {
    if (p.accion === 'leer') return json({ ok: true, quien: quien, datos: leer() });
    if (p.accion === 'anotar') return json(Object.assign({ quien: quien }, anotar(p, quien)));
    if (p.accion === 'mes') return json(cambiarMes(p));
    return json({ ok: false, error: 'Acción desconocida.' });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

function leer() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const salida = { leido: new Date().toISOString() };
  Object.keys(RANGOS).forEach(function (k) {
    const hoja = libro.getSheetByName(RANGOS[k][0]);
    salida[k] = hoja ? limpiar(hoja.getRange(RANGOS[k][1]).getValues()) : null;
  });
  return salida;
}

function limpiar(filas) {
  return filas.map(function (f) {
    return f.map(function (v) { return v instanceof Date ? v.toISOString() : v; });
  });
}

// Fórmulas que son solo cuentas con números (por ejemplo =280000+624500) se pueden reemplazar.
function esCuentaSimple(f) { return /^=[\d\s.,+\-*/()]+$/.test(f); }

function anotar(p, quien) {
  const items = Array.isArray(p.items) ? p.items : [p];
  if (!items.length || items.length > 10) return { ok: false, error: 'Nada para anotar.' };
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_CONTROL);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // primero se valida todo; si algo falla no se escribe nada
    const celdas = items.map(function (it) {
      const fila = Number(it.fila), mes = Number(it.mes);
      if (!(fila >= 5 && fila <= 60) || !(mes >= 1 && mes <= 12)) throw new Error('Fila o mes fuera de rango.');
      const concepto = String(hoja.getRange(fila, 2).getValue()).trim();
      if (concepto !== String(it.concepto || '').trim()) throw new Error('La fila de "' + it.concepto + '" cambió en el Sheet. Recargá la app y probá de nuevo.');
      if (!String(hoja.getRange(fila, 4).getValue()).trim()) throw new Error('"' + concepto + '" no se carga a mano.');
      const celda = hoja.getRange(fila, COL_ENERO + mes - 1);
      const formula = celda.getFormula();
      if (formula && !esCuentaSimple(formula)) throw new Error('Esa celda tiene una fórmula y no se toca desde la app.');
      const v = it.valor;
      const valido = v === '' || v === null || (typeof v === 'number' && isFinite(v)) ||
        (typeof v === 'string' && (esCuentaSimple(v) || (v.charAt(0) !== '=' && v.length <= 40)));
      if (!valido) throw new Error('El valor para "' + concepto + '" no es válido.');
      return { celda: celda, valor: v, concepto: concepto, mes: mes, antes: formula || celda.getValue() };
    });
    celdas.forEach(function (c) {
      if (c.valor === '' || c.valor === null) c.celda.clearContent();
      else if (typeof c.valor === 'string' && c.valor.charAt(0) === '=') c.celda.setFormula(c.valor);
      else c.celda.setValue(c.valor);
    });
    registrar(quien, celdas);
    SpreadsheetApp.flush();
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  } finally {
    lock.releaseLock();
  }
  return { ok: true, datos: leer() };
}

function registrar(quien, celdas) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(HOJA_REGISTRO);
  if (!hoja) {
    hoja = libro.insertSheet(HOJA_REGISTRO);
    hoja.appendRow(['Fecha', 'Quién', 'Concepto', 'Mes', 'Antes', 'Ahora']);
    hoja.setFrozenRows(1);
  }
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const ahora = new Date();
  // el apóstrofo evita que Sheets tome "=a+b" como fórmula en el registro
  const txt = function (v) { return v === '' || v === null ? '(vacío)' : "'" + String(v); };
  const filas = celdas.map(function (c) { return [ahora, quien, c.concepto, meses[c.mes - 1], txt(c.antes), txt(c.valor)]; });
  hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, 6).setValues(filas);
}

function cambiarMes(p) {
  const mes = Number(p.mes);
  if (!(mes >= 1 && mes <= 12)) return { ok: false, error: 'Mes fuera de rango.' };
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_CONTROL).getRange('F2').setValue(mes);
  SpreadsheetApp.flush();
  return { ok: true, datos: leer() };
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

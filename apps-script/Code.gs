/**
 * PETRO · la app vive dentro del Google Sheet.
 *
 * Quién puede entrar: solo las cuentas de Google con permiso de EDICIÓN en el Sheet.
 * Para sumar o sacar a alguien, se comparte o se deja de compartir el Sheet. No hay claves.
 *
 * Cómo instalarlo (una sola vez, desde la compu):
 * 1. En el Google Sheet: Extensiones → Apps Script.
 * 2. En Code.gs: borrar lo que haya y pegar todo este archivo.
 * 3. Al lado de "Archivos", tocar + → HTML, llamarlo  index  y pegar el contenido de apps-script/index.html.
 * 4. Guardar. Implementar → Nueva implementación → Tipo: Aplicación web.
 *    Ejecutar como: "Usuario que accede a la aplicación web".
 *    Quién tiene acceso: "Cualquier persona con una cuenta de Google".
 *    (Igual solo funciona para quien tenga el Sheet compartido; el resto ve "no tenés acceso".)
 * 5. Copiar la URL que termina en /exec. Ese es el link de la app.
 *
 * La app solo escribe montos en las celdas de los meses (enero a diciembre) de las filas
 * de conceptos y repartos de "Control 2026". Nunca pisa fórmulas de cálculo.
 * Todo lo que se anota queda en la hoja "Registro app": quién (mail), cuándo, qué y el valor anterior.
 */
const HOJA_CONTROL = 'Control 2026';
const HOJA_REGISTRO = 'Registro app';
const RANGOS = {
  control: [HOJA_CONTROL, 'A1:AK60'],
  unidades: ['Unidades', 'A1:M12'],
  aysa: ['AySA', 'A1:N47'],
  fondo: ['Fondo de ahorro', 'A1:K30'],
};
const COL_ENERO = 6; // columna F
const ICONO = 'https://raw.githubusercontent.com/CelePetrone/petro-app/main/icon-512.png';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('PETRO')
    .setFaviconUrl(ICONO)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

// La app llama a esta función con google.script.run.api({...})
function api(p) {
  p = p || {};
  let libro;
  try {
    libro = SpreadsheetApp.getActiveSpreadsheet();
    libro.getSheetByName(HOJA_CONTROL).getRange('B1').getValue();
  } catch (err) {
    return { ok: false, error: 'Tu cuenta de Google no tiene acceso al Sheet de PETRO. Pedile a Cele que te lo comparta como editora.' };
  }
  const quien = Session.getActiveUser().getEmail() || 'sin mail';
  try {
    if (p.accion === 'leer') return { ok: true, quien: quien, datos: leer(libro) };
    if (p.accion === 'anotar') return Object.assign({ quien: quien }, anotar(libro, p, quien));
    return { ok: false, error: 'Acción desconocida.' };
  } catch (err) {
    return { ok: false, error: String(err && err.message || err) };
  }
}

function leer(libro) {
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

function anotar(libro, p, quien) {
  const items = Array.isArray(p.items) ? p.items : [];
  if (!items.length || items.length > 10) return { ok: false, error: 'Nada para anotar.' };
  const hoja = libro.getSheetByName(HOJA_CONTROL);
  const lock = LockService.getDocumentLock();
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
    registrar(libro, quien, celdas);
    SpreadsheetApp.flush();
  } catch (err) {
    return { ok: false, error: String(err.message || err) };
  } finally {
    lock.releaseLock();
  }
  return { ok: true, datos: leer(libro) };
}

function registrar(libro, quien, celdas) {
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

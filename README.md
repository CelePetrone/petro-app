# PETRO · app

App para anotar pagos, cobros y repartos del emprendimiento PETRO y ver cómo viene cada mes. Lee y escribe directo en el Google Sheet de control.

Este repositorio es público y **no tiene datos ni claves**. La app corre dentro del Google Sheet (Apps Script) y se entra con la cuenta de Google: **solo pueden usarla las cuentas que tienen el Sheet compartido como editoras**. Para sumar o sacar a alguien, se comparte o se deja de compartir el Sheet.

## Qué tiene

- **Mes**: cobrado, pagado, ganancia, repartido y lo que quedó; qué falta pagar o cobrar; próximos ajustes de alquiler.
- **Anotar**: todos los conceptos del mes con su color (verde anotado, amarillo toca este mes, rojo atrasado, gris no corresponde). Se toca uno y se carga el monto.
- **Repartos**: cuánto se puede repartir, el sugerido para cada una, anotar el reparto de las tres de una vez y el fondo de ahorro en dólares (meta USD 100 a 200 por mes).
- **Tablero**: evolución mes a mes, de dónde viene la plata y en qué se va, AySA del edificio y el fondo.

## Archivos

- `apps-script/Code.gs` y `apps-script/index.html`: la app. Se pegan en el Apps Script del Sheet.
- `index.html`: página de presentación del repositorio.

## Puesta en marcha (una sola vez, desde la compu)

1. En el Google Sheet: **Extensiones → Apps Script**.
2. En `Code.gs`: borrar lo que haya y pegar [`apps-script/Code.gs`](apps-script/Code.gs).
3. Tocar **+ → HTML**, llamarlo `index` (sin el .html) y pegar [`apps-script/index.html`](apps-script/index.html).
4. Guardar. **Implementar → Nueva implementación → Aplicación web**:
   - Ejecutar como: **Usuario que accede a la aplicación web**.
   - Quién tiene acceso: **Cualquier persona con una cuenta de Google**.
5. Copiar la URL que termina en `/exec`. Ese es el link de la app para las tres.

La primera vez que cada una la abre, Google pide permiso para que la app use el Sheet con su cuenta. Si aparece "Google no verificó esta app": Configuración avanzada → Ir a PETRO.

En el celu: abrir el link y "Agregar a la pantalla de inicio".

## Cuidados

- La app solo escribe montos en las celdas de enero a diciembre de las filas de conceptos y repartos de "Control 2026". No toca fórmulas.
- Todo lo que se anota desde la app queda en la hoja "Registro app" del Sheet: quién (mail), cuándo, qué y el valor anterior.
- Si se agregan filas al Sheet, copiar una fila de la misma sección, como siempre. La app las reconoce sola.
- Para actualizar la app después de un cambio en el código: pegar los archivos nuevos y en Implementar → Administrar implementaciones → editar → Versión: nueva.

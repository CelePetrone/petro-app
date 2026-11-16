# PETRO · app

App para anotar pagos, cobros y repartos del emprendimiento PETRO y ver cómo viene cada mes. Lee y escribe directo en el Google Sheet de control.

Este repositorio es público y **no tiene datos**: los números viven en el Google Sheet y la app los trae cuando se abre, con la dirección y la clave que cada una carga en su celu.

## Qué tiene

- **Mes**: cobrado, pagado, ganancia, repartido y lo que quedó; qué falta pagar o cobrar; próximos ajustes de alquiler.
- **Anotar**: todos los conceptos del mes con su color (verde anotado, amarillo toca este mes, rojo atrasado, gris no corresponde). Se toca uno y se carga el monto.
- **Repartos**: cuánto se puede repartir, el sugerido para cada una, anotar el reparto de las tres de una vez y el fondo de ahorro en dólares (meta USD 100 a 200 por mes).
- **Tablero**: evolución mes a mes, de dónde viene la plata y en qué se va, AySA del edificio y el fondo.

## Puesta en marcha (una sola vez)

1. **El Sheet**: el Excel tiene que estar como Google Sheet (Archivo → Guardar como Hojas de cálculo de Google).
2. **La conexión**: en el Sheet, Extensiones → Apps Script. Pegar el contenido de [`apps-script/Code.gs`](apps-script/Code.gs), cambiar la `CLAVE` y guardar. Después Implementar → Nueva implementación → Aplicación web, ejecutar como "Yo" y acceso "Cualquier persona". Google pide autorizar: aceptar. Copiar la URL que termina en `/exec`.
3. **La app**: abrir la página de GitHub Pages, pegar la URL y la clave. En el celu, "Agregar a la pantalla de inicio" para tenerla como app.

## Cuidados

- La app solo escribe montos en las celdas de enero a diciembre de las filas de conceptos y repartos de "Control 2026". No toca fórmulas.
- La URL y la clave son como una llave: compartirlas solo entre las tres.
- Si se agregan filas al Sheet, copiar una fila de la misma sección, como siempre. La app las reconoce sola.

# PETRO · app

App para anotar pagos, cobros y repartos del emprendimiento PETRO y ver cómo viene cada mes. Lee y escribe directo en el Google Sheet "PETRO 2026 - Control".

Es una sola página publicada con GitHub Pages, igual que Panel ADM. Este repositorio **no tiene datos**: los números viven en el Sheet. Cada una entra con su cuenta de Google y solo funciona si tiene el Sheet compartido como editora.

## Qué tiene

- **Mes**: cobrado, pagado, ganancia, repartido y lo que quedó; qué falta pagar o cobrar; próximos ajustes de alquiler.
- **Anotar**: todos los conceptos del mes con su color (verde anotado, amarillo toca este mes, rojo atrasado, gris no corresponde). Se toca uno y se carga el monto.
- **Repartos**: cuánto se puede repartir, el sugerido para cada una, anotar el reparto de las tres de una vez y el fondo de ahorro en dólares (meta USD 100 a 200 por mes).
- **Tablero**: evolución mes a mes, de dónde viene la plata y en qué se va, AySA del edificio y el fondo.

## Quién puede entrar

Hacen falta las dos cosas:

1. Que su Gmail esté como **usuario de prueba** en Google Cloud. Se usa el mismo proyecto que Panel ADM: [console.cloud.google.com](https://console.cloud.google.com) → proyecto Panel ADM → Google Auth Platform → **Público** → Usuarios de prueba → agregar.
2. Que tenga el **Sheet compartido como editora**.

Para sacar a alguien, alcanza con dejar de compartirle el Sheet.

## Publicarlo (una sola vez)

En GitHub: **Settings › Pages**. En *Branch* elegir `main` y la carpeta `/ (root)`, y tocar **Save**. A los pocos minutos queda en `https://celepetrone.github.io/petro-app/`.

El cliente de Google del proyecto Panel ADM ya tiene autorizado `https://celepetrone.github.io`, así que no hace falta tocar nada más en Google Cloud.

## Archivos

- `index.html`: la app.
- `config.js`: ID de cliente de Google y del Sheet. No son secretos: sin una cuenta autorizada no dan acceso a nada.
- `manifest.json` e `icon-512.png`: para instalarla en el celu ("Agregar a la pantalla de inicio").

## Cuidados

- La app solo escribe montos en las celdas de enero a diciembre de las filas de conceptos y repartos de "Control 2026". No toca fórmulas.
- Todo lo que se anota desde la app queda en la hoja "Registro app" del Sheet: quién (mail), cuándo, qué y el valor anterior.
- Si se agregan filas al Sheet, copiar una fila de la misma sección, como siempre. La app las reconoce sola.
- Google pide volver a confirmar una vez por hora. Si se vence mientras están cargando, aparece "Seguir conectada".
- Si la ventana de Google se cierra sola ("popup_closed"), suele ser el bloqueo del navegador: en Brave, desactivar los escudos para la página.

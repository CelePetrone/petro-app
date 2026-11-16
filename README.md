# PETRO · app

App para anotar pagos, cobros y repartos del emprendimiento PETRO y ver cómo viene cada mes. Lee y escribe directo en el Google Sheet "PETRO 2026 - Control".

Es una sola página publicada con GitHub Pages. Este repositorio **no tiene datos**: los números viven en el Sheet. Cada una entra con su cuenta de Google y solo funciona si tiene el Sheet compartido como editora.

## Qué tiene

Menú a la izquierda (en el celu se abre con ☰). Colores: verde hecho, amarillo a la espera o toca este mes, rojo falta o atrasado.

- **Cargar y pendientes**: números del mes, lo que falta cobrar y pagar (con el monto para anotar ahí mismo), próximos ajustes de alquiler, "Cargar otra cosa" (incluye "Otro" para lo que no está en la lista) y "Para revisar" con posibles errores.
- **Meses**: un mes por vez, con cada concepto, el mes anterior al lado y aviso si cambió mucho. Se corrige tocando el monto.
- **Repartos y fondo**: cuánto se puede repartir, de qué se reparte (Santa Elena, Javier, San Martín u otros), lo que le queda a cada una después de sus deudas internas, y el fondo en dólares o en pesos.
- **Deudas internas**: compras personales con la tarjeta del negocio y préstamos a alguna de las tres, en cuotas que se descuentan solas del reparto.
- **Tablero**: evolución mes a mes, de dónde viene la plata y en qué se va, ajustes, AySA y el fondo en dólares.

## Conectarlo con Google (una sola vez)

PETRO tiene su propio proyecto de Google Cloud, separado de cualquier otro.

1. Entrar a [console.cloud.google.com](https://console.cloud.google.com) y crear un proyecto llamado `PETRO`.
2. En **APIs y servicios › Biblioteca**, buscar **Google Sheets API** y tocar **Habilitar**.
3. En **Google Auth Platform**, completar el nombre de la app (`PETRO`) y el mail, con tipo de usuario **Externo**.
4. En **Público**, dejarlo en modo **Prueba** y agregar como usuarios de prueba los Gmail de las tres hermanas.
5. En **Clientes**, crear un cliente de tipo **Aplicación web**. En **Orígenes autorizados de JavaScript** poner `https://celepetrone.github.io`.
6. Copiar el **ID de cliente** (termina en `.apps.googleusercontent.com`) y pegarlo en `config.js`, en `googleClientId`.

## Quién puede entrar

Hacen falta las dos cosas: estar como **usuaria de prueba** en el proyecto PETRO de Google Cloud y tener el **Sheet compartido como editora**. Para sacar a alguien, alcanza con dejar de compartirle el Sheet.

## Publicarlo

GitHub Pages ya está activo desde `main`: `https://celepetrone.github.io/petro-app/`.

## Archivos

- `index.html`: la app.
- `config.js`: ID de cliente de Google y del Sheet. No son secretos: sin una cuenta autorizada no dan acceso a nada.
- `manifest.json` e `icon-512.png`: para instalarla en el celu ("Agregar a la pantalla de inicio").

## Cuidados

- La app solo escribe montos en las celdas de enero a diciembre de las filas de conceptos y repartos de "Control 2026". No toca fórmulas.
- Todo lo que se anota desde la app queda en la hoja "Registro app" del Sheet: quién (mail), cuándo, qué y el valor anterior.
- La app crea sola, la primera vez que se usan, las hojas "Otros movimientos" (lo cargado como "Otro") y "Deudas internas". Lo de "Otros movimientos" lo suma la app; los totales de "Control 2026" no lo incluyen.
- El fondo en dólares se anota también en las columnas H e I de "Fondo de ahorro" (pesos pasados a dólares y tipo de cambio).
- Si se agregan filas al Sheet, copiar una fila de la misma sección, como siempre. La app las reconoce sola.
- Google pide volver a confirmar una vez por hora. Si se vence mientras están cargando, aparece "Seguir conectada".
- Si la ventana de Google se cierra sola ("popup_closed"), suele ser el bloqueo del navegador: en Brave, desactivar los escudos para la página.

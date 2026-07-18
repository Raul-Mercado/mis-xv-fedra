# Cómo poner en marcha tu invitación

## 1. Personalizar el contenido
Abrí `config.js` y editá los datos del evento, fotos, dress code, alias de MP, etc.

## 2. Reglas de Firestore (actualizadas — por familia)
En Firebase Console → Firestore Database → pestaña "Reglas", pegá esto y publicá:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /invitados/{doc} {
      allow read: if true;
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['estado', 'integrantes']);
      allow create, delete: if false;
    }
    match /regalos/{doc} {
      allow read, write: if true;
    }
    /* La colección "regalos" ya no se usa (se sacó la mesa de regalos, solo queda
       el alias de Mercado Pago en config.js) — podés dejar esta regla igual, no molesta. */
    match /canciones/{doc} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

## 3. Cargar la lista de familias con sus integrantes
En Firestore Database → pestaña "Datos" → colección `invitados` → un documento por FAMILIA
(no por persona), con estos campos:

| Campo       | Tipo    | Valor                                                    |
|-------------|---------|-----------------------------------------------------------|
| familia     | string  | Nombre por el que va a buscar la cabeza de familia (ej: "Familia Pérez") |
| mesa        | string  | Número de mesa asignada a toda la familia (ej: "5")       |
| estado      | string  | "pendiente"                                                |
| integrantes | array   | Un elemento (tipo *map*) por cada persona de esa familia   |

Cada elemento de `integrantes` es un **map** con tres campos:
- `nombre` (string): nombre de esa persona
- `asiste` (boolean): dejalo en `true` por defecto
- `celiaco` (boolean): dejalo en `false` por defecto — el invitado lo puede tildar si esa persona es celíaca

Para cargarlo en la consola de Firebase: al crear el documento, agregá un campo `integrantes`,
elegí tipo **array**, y dentro agregá un elemento por persona de tipo **map**, con `nombre` y
`asiste` adentro de cada uno.

Cuando la cabeza de familia busca su apellido, va a ver la lista completa de su familia con un
checkbox al lado de cada uno (todos tildados por defecto) — destildan a quien no vaya, y al
guardar, la web actualiza `integrantes` y `estado` solos.

Podés ir cargando familias de a poco, no hace falta tener la lista completa desde el arranque.

## 4. Música de fondo
1. Conseguí un archivo mp3 de una canción que tengas derecho a usar (comprada, propia, o de
   un banco de música libre de derechos).
2. Guardalo en la misma carpeta que los demás archivos (ej: `musica-fedra.mp3`).
3. En `config.js`, poné ese nombre en `musicaUrl: "musica-fedra.mp3"`.
4. Va a aparecer un botoncito flotante con una nota musical (♪) abajo a la derecha de la
   página — los invitados lo tocan para reproducir. (Los navegadores no dejan que la música
   arranque sola con sonido sin que la persona toque algo primero, por eso el botón.)

## 5. La sección de fotos compartidas (QR)
Ya está activa, apuntando a tu álbum de Google Fotos.

## 6. Publicar cambios en GitHub
Cada vez que edites un archivo, subilo de nuevo al repositorio (arrastrándolo igual que la
primera vez — GitHub te va a preguntar si querés reemplazar el archivo existente, confirmá que sí).

## Cómo ver confirmaciones, mesas, regalos y canciones
Todo se ve y se edita desde Firebase Console → Firestore Database → pestaña "Datos".

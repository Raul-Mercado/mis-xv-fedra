# Cómo poner en marcha tu invitación

## 1. Personalizar el contenido
Abrí `config.js` y editá los datos del evento, fotos, dress code, alias de MP, etc.
No hace falta tocar ningún otro archivo para eso.

## 2. Reglas de Firestore (actualizadas)
En Firebase Console → Firestore Database → pestaña "Reglas", pegá esto y publicá:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /invitados/{doc} {
      allow read: if true;
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['estado']);
      allow create, delete: if false;
    }
    match /regalos/{doc} {
      allow read, write: if true;
    }
    match /canciones/{doc} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

Esto permite que cualquiera con el link pueda leer la lista de invitados (para buscarse) y
cambiar únicamente su propio campo `estado` — no pueden tocar su nombre ni su mesa.

## 3. Cargar la lista de invitados
En Firestore Database → pestaña "Datos" → creá la colección `invitados` (si no existe) y
agregá un documento por cada persona invitada, con estos campos:

| Campo    | Tipo   | Valor                                  |
|----------|--------|-----------------------------------------|
| nombre   | string | Nombre y apellido tal como lo va a buscar |
| mesa     | string | Número de mesa (ej: "5") — lo podés dejar vacío y completarlo después |
| estado   | string | "pendiente"                             |

Podés ir agregando invitados cuando quieras — no hace falta tener la lista completa
desde el principio. La web va a mostrar automáticamente a cada uno cuando busque su nombre.

## 4. La sección de fotos compartidas (QR)
1. Creá una carpeta en Google Drive (o similar).
2. Compartila con el link, con permiso "Cualquier persona con el enlace puede subir archivos"
   (en Drive: click derecho en la carpeta → Compartir → cambiá el permiso a Editor y
   activá "cualquiera con el enlace").
3. Pegá ese link en `config.js`, en `fotosCompartidasUrl`. La sección con el QR aparece
   automáticamente sola cuando ese campo no está vacío.

## 5. Publicar la web (GitHub Pages, gratis)
1. Creá un repositorio nuevo en GitHub, por ejemplo `mis-xv-fedra`.
2. Subí los 4 archivos: `index.html`, `style.css`, `script.js`, `config.js`.
3. Settings → Pages → Source: rama `main` → Save.
4. En un par de minutos tu invitación va a estar en:
   `https://tu-usuario.github.io/mis-xv-fedra/`
5. Ese es el link que mandás por WhatsApp — es el mismo para todos los invitados.

## Cómo ver confirmaciones, mesas, regalos y canciones
Todo se ve y se edita desde Firebase Console → Firestore Database → pestaña "Datos",
en las colecciones `invitados`, `regalos` y `canciones`. Es como una planilla: se
puede ordenar, filtrar y exportar.

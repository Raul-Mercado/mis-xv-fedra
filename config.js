/* =========================================================
   CONFIGURACIÓN DE LA INVITACIÓN
   Editá solo este archivo para personalizar el evento.
   No hace falta tocar los demás archivos.
   ========================================================= */

const CONFIG = {
  // --- Datos principales ---
  nombreQuinceañera: "Fedra",
  fraseIntro: "Mis XV",
  fraseDedicatoria: "Se viene la fiesta del año y no podés faltar. ¡Te espero para bailar hasta que duelan los pies en mis XV!",
  fechaEvento: "2026-11-14T21:30:00", // formato AAAA-MM-DDTHH:MM:SS
  fechaLimiteConfirmar: "30 de octubre",

  // --- Ubicación ---
  lugar: "Complejo Tierra Dorada",
  direccion: "Calle Ramón Franco, Medano de Oro",
  mapaEmbedSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3398.079627923598!2d-68.4754164!3d-31.6042778!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x968115b08b366e01%3A0x79335430f5dae727!2sComplejo%20Tierra%20Dorada!5e0!3m2!1ses!2sar!4v1784393489534!5m2!1ses!2sar",

  // --- Dress code ---
  dressCode: "Formal Sport",

  // --- Galería de fotos (URLs de imágenes) ---
  fotos: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800"
  ],

  // --- Link a la carpeta (Google Drive u otro) donde los invitados suben sus fotos/videos ---
  fotosCompartidasUrl: "https://photos.app.goo.gl/3Hmdoec2aohtwajS9",

  // --- Foto de fondo de la portada (efecto transparente detrás del texto) ---
  // Poné acá el nombre del archivo de imagen una vez que lo subas a la misma carpeta
  // (ej: "fondo-fedra.jpg"). Dejalo vacío ("") si todavía no la tenés.
  fotoFondo: "fondo-fedra.jpg",

  // --- Música de fondo (URL de un mp3) ---
  musicaUrl: "Ed-Sheeran-Perfect.mp3",

  // --- Regalo en dinero (Mercado Pago) ---
  aliasMercadoPago: "fedra.ferrero.",
  cvuMercadoPago: "0000003100088488554734",

  // --- Firebase ---
  firebaseConfig: {
    apiKey: "AIzaSyCl_RkTd4GkxeHgy5pmm-3TL3o_eom28IU",
    authDomain: "fedra-10107.firebaseapp.com",
    projectId: "fedra-10107",
    storageBucket: "fedra-10107.firebasestorage.app",
    messagingSenderId: "796002371959",
    appId: "1:796002371959:web:632cb1f980e9f3322bb972"
  }
};

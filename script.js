/* =========================================================
   LÓGICA DE LA INVITACIÓN
   No hace falta editar este archivo — toda la personalización
   se hace desde config.js. La lista de invitados se carga y
   edita directo en Firestore (colección "invitados"), cada uno
   con los campos: nombre, mesa, estado ("pendiente" por defecto).
   ========================================================= */

// --- Inicializar Firebase ---
let db = null;
try {
  if (CONFIG.firebaseConfig.apiKey !== "TU_API_KEY") {
    firebase.initializeApp(CONFIG.firebaseConfig);
    db = firebase.firestore();
  }
} catch (e) {
  console.warn("Firebase no configurado todavía:", e);
}

// --- Estrellitas cayendo ---
const cielo = document.getElementById("cielo-estrellas");
const CANTIDAD_ESTRELLAS = 28;
for (let i = 0; i < CANTIDAD_ESTRELLAS; i++) {
  const estrella = document.createElement("span");
  estrella.className = "estrella";
  estrella.textContent = Math.random() > 0.5 ? "✦" : "✧";
  estrella.style.left = Math.random() * 100 + "vw";
  estrella.style.fontSize = (0.5 + Math.random() * 1) + "rem";
  const duracion = 6 + Math.random() * 10;
  estrella.style.animationDuration = duracion + "s";
  estrella.style.animationDelay = (Math.random() * duracion) + "s";
  cielo.appendChild(estrella);
}

// --- Portada ---
document.getElementById("eyebrow-frase").textContent = CONFIG.fraseIntro;
document.getElementById("titulo-nombre").textContent = CONFIG.nombreQuinceañera;
document.getElementById("dedicatoria-texto").textContent = CONFIG.fraseDedicatoria;

if (CONFIG.fotoFondo) {
  document.querySelector(".portada").style.backgroundImage = `url('${CONFIG.fotoFondo}')`;
}

const fechaEvento = new Date(CONFIG.fechaEvento);
document.getElementById("fecha-larga").textContent = fechaEvento.toLocaleDateString("es-AR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
});

// --- Cuenta regresiva ---
function actualizarCuenta() {
  const ahora = new Date();
  let diff = fechaEvento - ahora;
  if (diff < 0) diff = 0;
  document.getElementById("c-dias").textContent = String(Math.floor(diff / 86400000)).padStart(2, "0");
  document.getElementById("c-horas").textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
  document.getElementById("c-min").textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  document.getElementById("c-seg").textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
}
actualizarCuenta();
setInterval(actualizarCuenta, 1000);

// --- Ubicación / mapa ---
document.getElementById("lugar-nombre").textContent = CONFIG.lugar;
document.getElementById("direccion-texto").textContent = CONFIG.direccion;
document.getElementById("mapa-iframe").src = CONFIG.mapaEmbedSrc;
document.getElementById("btn-como-llegar").href =
  "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(CONFIG.direccion);

// --- Dress code ---
document.getElementById("dresscode-texto").textContent = CONFIG.dressCode;

// --- Galería ---
const galeriaGrid = document.getElementById("galeria-grid");
CONFIG.fotos.forEach(url => {
  const img = document.createElement("img");
  img.src = url;
  img.alt = "Foto de " + CONFIG.nombreQuinceañera;
  img.loading = "lazy";
  galeriaGrid.appendChild(img);
});

// --- Música de fondo ---
const audio = document.getElementById("audio-fondo");
const btnMusica = document.getElementById("btn-musica");
if (CONFIG.musicaUrl) {
  audio.src = CONFIG.musicaUrl;
  btnMusica.addEventListener("click", () => {
    if (audio.paused) { audio.play(); btnMusica.textContent = "❚❚"; }
    else { audio.pause(); btnMusica.textContent = "♪"; }
  });
} else {
  btnMusica.style.display = "none";
}

// --- Playlist (sugerencias de canciones) ---
const formPlaylist = document.getElementById("form-playlist");
const playlistEstado = document.getElementById("playlist-estado");
formPlaylist.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cancion = document.getElementById("playlist-cancion").value.trim();
  if (!db) { playlistEstado.textContent = "⚠️ Falta conectar la base de datos."; return; }
  try {
    await db.collection("canciones").add({
      cancion,
      fecha: firebase.firestore.FieldValue.serverTimestamp()
    });
    playlistEstado.textContent = "¡Gracias, la sumamos a la playlist! 🎶";
    formPlaylist.reset();
  } catch (err) {
    console.error(err);
    playlistEstado.textContent = "No se pudo guardar. Probá de nuevo.";
  }
});

// --- Confirmación: buscador de invitados ---
document.getElementById("deadline-texto").textContent =
  "Por favor confirmá antes del " + CONFIG.fechaLimiteConfirmar + ".";

const inputBuscar = document.getElementById("buscar-invitado");
const sugerenciasLista = document.getElementById("sugerencias-lista");
const tarjetaInvitado = document.getElementById("tarjeta-invitado");
const tarjetaNombre = document.getElementById("tarjeta-nombre");
const tarjetaEstado = document.getElementById("tarjeta-estado");
const tarjetaMesa = document.getElementById("tarjeta-mesa");
const btnConfirmar = document.getElementById("btn-confirmar");
const btnCancelar = document.getElementById("btn-cancelar");
const rsvpEstado = document.getElementById("rsvp-estado");

let listaInvitados = []; // { id, nombre, mesa, estado }
let invitadoSeleccionadoId = null;

if (db) {
  db.collection("invitados").onSnapshot(snapshot => {
    listaInvitados = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    // Si hay un invitado abierto, refrescar su tarjeta con datos nuevos (ej. mesa asignada)
    if (invitadoSeleccionadoId) mostrarTarjeta(invitadoSeleccionadoId);
  });
}

inputBuscar.addEventListener("input", () => {
  const texto = inputBuscar.value.trim().toLowerCase();
  sugerenciasLista.innerHTML = "";
  if (!texto) { sugerenciasLista.style.display = "none"; return; }
  const coincidencias = listaInvitados
    .filter(inv => (inv.nombre || "").toLowerCase().includes(texto))
    .slice(0, 8);
  if (coincidencias.length === 0) { sugerenciasLista.style.display = "none"; return; }
  sugerenciasLista.style.display = "block";
  coincidencias.forEach(inv => {
    const opcion = document.createElement("div");
    opcion.textContent = inv.nombre;
    opcion.addEventListener("click", () => {
      inputBuscar.value = inv.nombre;
      sugerenciasLista.style.display = "none";
      mostrarTarjeta(inv.id);
    });
    sugerenciasLista.appendChild(opcion);
  });
});

function mostrarTarjeta(id) {
  const inv = listaInvitados.find(i => i.id === id);
  if (!inv) return;
  invitadoSeleccionadoId = id;
  tarjetaInvitado.style.display = "block";
  tarjetaNombre.textContent = inv.nombre;

  const estado = inv.estado || "pendiente";
  tarjetaEstado.textContent = estado === "confirmado" ? "Confirmado" : estado === "cancelado" ? "No asiste" : "Pendiente";
  tarjetaEstado.className = "estado-badge " + estado;

  if (estado === "confirmado" && inv.mesa) {
    tarjetaMesa.style.display = "block";
    tarjetaMesa.textContent = "Tu mesa es la N.º " + inv.mesa;
  } else {
    tarjetaMesa.style.display = "none";
  }

  btnConfirmar.disabled = estado === "confirmado";
  btnCancelar.disabled = estado === "cancelado";
  rsvpEstado.textContent = "";
}

async function actualizarEstado(nuevoEstado) {
  if (!invitadoSeleccionadoId) return;
  try {
    await db.collection("invitados").doc(invitadoSeleccionadoId).update({ estado: nuevoEstado });
    rsvpEstado.textContent = nuevoEstado === "confirmado"
      ? "¡Gracias por confirmar! 🎉"
      : "Quedó registrado, ¡gracias por avisar!";
  } catch (err) {
    console.error(err);
    rsvpEstado.textContent = "Hubo un problema, probá de nuevo.";
  }
}

btnConfirmar.addEventListener("click", () => actualizarEstado("confirmado"));
btnCancelar.addEventListener("click", () => actualizarEstado("cancelado"));

// --- Mesa de regalos ---
const regalosLista = document.getElementById("regalos-lista");

function pintarRegalos(reservadosIds) {
  regalosLista.innerHTML = "";
  CONFIG.regalos.forEach(r => {
    const reservado = reservadosIds.has(r.id);
    const item = document.createElement("div");
    item.className = "regalo-item" + (reservado ? " reservado" : "");
    item.innerHTML = `
      <span class="nombre">${r.nombre}</span>
      <span class="tag ${reservado ? "reservado-tag" : "disponible"}">${reservado ? "Reservado" : "Disponible"}</span>
      <button ${reservado ? "disabled" : ""} data-id="${r.id}" data-nombre="${r.nombre}">
        ${reservado ? "Ya elegido" : "Elegir"}
      </button>
    `;
    regalosLista.appendChild(item);
  });

  regalosLista.querySelectorAll("button:not(:disabled)").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!db) { alert("Falta conectar la base de datos."); return; }
      const quien = prompt("¿Tu nombre, para avisarle a " + CONFIG.nombreQuinceañera + "?");
      if (!quien) return;
      try {
        await db.collection("regalos").doc(btn.dataset.id).set({
          nombre: btn.dataset.nombre,
          reservadoPor: quien,
          fecha: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (err) {
        console.error(err);
        alert("No se pudo reservar. Probá de nuevo.");
      }
    });
  });
}

if (db) {
  db.collection("regalos").onSnapshot(snapshot => {
    const reservados = new Set(snapshot.docs.map(d => d.id));
    pintarRegalos(reservados);
  });
} else {
  pintarRegalos(new Set());
}

// --- Alias / CVU Mercado Pago ---
document.getElementById("mp-alias-valor").textContent = "Alias: " + CONFIG.aliasMercadoPago;
document.getElementById("mp-cvu-valor").textContent = "CVU: " + CONFIG.cvuMercadoPago;

function copiarTexto(texto, boton) {
  navigator.clipboard.writeText(texto).then(() => {
    const original = boton.textContent;
    boton.textContent = "¡Copiado!";
    setTimeout(() => { boton.textContent = original; }, 1500);
  });
}
document.getElementById("btn-copiar-alias").addEventListener("click", (e) => copiarTexto(CONFIG.aliasMercadoPago, e.target));
document.getElementById("btn-copiar-cvu").addEventListener("click", (e) => copiarTexto(CONFIG.cvuMercadoPago, e.target));

// --- QR para compartir fotos ---
if (CONFIG.fotosCompartidasUrl) {
  document.getElementById("fotos-compartidas-seccion").style.display = "block";
  const qrSrc = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" + encodeURIComponent(CONFIG.fotosCompartidasUrl);
  document.getElementById("qr-fotos-img").src = qrSrc;
}

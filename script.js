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

// --- Pantalla del sobre ---
document.body.classList.add("sobre-activo");
const sobreOverlay = document.getElementById("sobre-overlay");
const sobreEl = document.getElementById("sobre");
sobreOverlay.addEventListener("click", () => {
  if (sobreEl.classList.contains("abierto")) return;
  sobreEl.classList.add("abierto");

  // Este clic es un gesto real del usuario: el mejor momento para intentar la música
  if (CONFIG.musicaUrl) {
    const audioEl = document.getElementById("audio-fondo");
    if (audioEl.src) audioEl.play().catch(() => {});
  }

  setTimeout(() => {
    sobreOverlay.classList.add("oculto");
    document.body.classList.remove("sobre-activo");
  }, 1900);
});

// --- Estrellitas cayendo ---
const cielo = document.getElementById("cielo-estrellas");
const CANTIDAD_ESTRELLAS = 28;
for (let i = 0; i < CANTIDAD_ESTRELLAS; i++) {
  const estrella = document.createElement("span");
  const esBrillosa = Math.random() < 0.22; // ~1 de cada 5 tiene reflejo brilloso
  estrella.className = "estrella" + (esBrillosa ? " brillosa" : "");
  estrella.style.left = Math.random() * 100 + "vw";
  const tam = 4 + Math.random() * 6;
  estrella.style.width = tam + "px";
  estrella.style.height = tam + "px";
  estrella.style.setProperty("--vaiven", (10 + Math.random() * 26) + "px");
  const duracion = 11 + Math.random() * 16; // caída más lenta
  estrella.style.animationDuration = esBrillosa ? (duracion + "s, 2.4s") : (duracion + "s");
  estrella.style.animationDelay = esBrillosa ? ((Math.random() * duracion) + "s, " + (Math.random() * 2) + "s") : ((Math.random() * duracion) + "s");
  cielo.appendChild(estrella);
}

// --- Estrella fugaz aleatoria, cada 15 seg aprox. ---
function crearFugaz() {
  const el = document.createElement("div");
  el.className = "fugaz";

  const startX = Math.random() * 55;        // vw — arranca en la mitad izquierda/centro
  const startY = 3 + Math.random() * 32;    // vh — franja superior
  const angulo = 12 + Math.random() * 20;   // grados hacia abajo
  const distancia = (45 + Math.random() * 35) * window.innerWidth / 100; // px
  const dy = distancia * Math.tan(angulo * Math.PI / 180);
  const largo = 70 + Math.random() * 60;    // px
  const duracion = 0.9 + Math.random() * 0.6;

  el.style.left = startX + "vw";
  el.style.top = startY + "vh";
  el.style.width = largo + "px";
  el.style.setProperty("--dx", distancia + "px");
  el.style.setProperty("--dy", dy + "px");
  el.style.setProperty("--ang", angulo + "deg");
  el.style.animationDuration = duracion + "s";

  cielo.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}
setTimeout(crearFugaz, 3000);
setInterval(() => crearFugaz(), 15000);

// --- Destello dorado al tocar la pantalla ---
document.addEventListener("pointerdown", (e) => {
  const destello = document.createElement("div");
  destello.className = "toque-destello";
  destello.style.left = e.clientX + "px";
  destello.style.top = e.clientY + "px";
  document.body.appendChild(destello);
  destello.addEventListener("animationend", () => destello.remove());
});

// --- Portada ---
document.getElementById("eyebrow-frase").textContent = CONFIG.fraseIntro;
document.getElementById("titulo-nombre").textContent = CONFIG.nombreQuinceañera;
document.getElementById("dedicatoria-texto").textContent = CONFIG.fraseDedicatoria;
document.getElementById("sobre-inicial").textContent = CONFIG.nombreQuinceañera || "?";

if (CONFIG.fotoFondo) {
  document.querySelector(".portada").style.setProperty("--foto", `url('${CONFIG.fotoFondo}')`);
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

// --- Recordatorio de calendario ---
function formatoFechaUTC(fecha) {
  return fecha.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}
const finEvento = new Date(fechaEvento.getTime() + 4 * 60 * 60 * 1000); // 4 horas de duración
const tituloEvento = "Mis XV " + CONFIG.nombreQuinceañera;
const detalleEvento = CONFIG.fraseDedicatoria + " — " + CONFIG.lugar;

const linkGoogleCal =
  "https://www.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent(tituloEvento) +
  "&dates=" + formatoFechaUTC(fechaEvento) + "/" + formatoFechaUTC(finEvento) +
  "&details=" + encodeURIComponent(detalleEvento) +
  "&location=" + encodeURIComponent(CONFIG.direccion) +
  "&ctz=America/Argentina/Buenos_Aires";
document.getElementById("btn-google-calendar").href = linkGoogleCal;

document.getElementById("btn-ics").addEventListener("click", () => {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "SUMMARY:" + tituloEvento,
    "DTSTART:" + formatoFechaUTC(fechaEvento),
    "DTEND:" + formatoFechaUTC(finEvento),
    "LOCATION:" + CONFIG.direccion,
    "DESCRIPTION:" + detalleEvento,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mis-xv-" + CONFIG.nombreQuinceañera.toLowerCase() + ".ics";
  a.click();
  URL.revokeObjectURL(url);
});

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
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });

  // El ícono del botón siempre refleja lo que está pasando de verdad
  audio.addEventListener("play", () => { btnMusica.textContent = "❚❚"; });
  audio.addEventListener("pause", () => { btnMusica.textContent = "♪"; });

  // Intento de arranque automático a los 3 segundos de abrir la página
  setTimeout(() => {
    audio.play().catch(() => {
      // El navegador bloqueó el autoplay (pasa en algunos celulares) — arranca
      // apenas el invitado toque la pantalla por primera vez, sin que note nada raro.
      const arrancarConPrimerToque = () => {
        audio.play().catch(() => {});
        document.removeEventListener("pointerdown", arrancarConPrimerToque);
      };
      document.addEventListener("pointerdown", arrancarConPrimerToque, { once: true });
    });
  }, 3000);
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

// --- Confirmación: buscador de familias ---
document.getElementById("deadline-texto").textContent =
  "Por favor confirmá antes del " + CONFIG.fechaLimiteConfirmar + ".";

const inputBuscar = document.getElementById("buscar-invitado");
const sugerenciasLista = document.getElementById("sugerencias-lista");
const tarjetaInvitado = document.getElementById("tarjeta-invitado");
const tarjetaNombre = document.getElementById("tarjeta-nombre");
const listaIntegrantesEl = document.getElementById("lista-integrantes");
const tarjetaMesa = document.getElementById("tarjeta-mesa");
const btnGuardarFamilia = document.getElementById("btn-guardar-familia");
const rsvpEstado = document.getElementById("rsvp-estado");

let listaFamilias = []; // { id, familia, mesa, estado, integrantes: [{nombre, asiste}] }
let familiaSeleccionadaId = null;
let yaAbrioPorLink = false;

const numeroEnLink = new URLSearchParams(window.location.search).get("n");

if (db) {
  db.collection("invitados").onSnapshot(snapshot => {
    listaFamilias = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (familiaSeleccionadaId) mostrarTarjeta(familiaSeleccionadaId);

    if (numeroEnLink && !yaAbrioPorLink) {
      const familiaDelLink = listaFamilias.find(f => (f.numero || "").toString() === numeroEnLink);
      if (familiaDelLink) {
        yaAbrioPorLink = true;
        inputBuscar.value = familiaDelLink.familia;
        mostrarTarjeta(familiaDelLink.id);
      }
    }
  });
}

inputBuscar.addEventListener("input", () => {
  const texto = inputBuscar.value.trim().toLowerCase();
  sugerenciasLista.innerHTML = "";
  if (!texto) { sugerenciasLista.style.display = "none"; return; }
  const coincidencias = listaFamilias
    .filter(fam => {
      const enFamilia = (fam.familia || "").toLowerCase().includes(texto);
      const enNumero = (fam.numero || "").toString().toLowerCase().includes(texto);
      const enIntegrantes = (fam.integrantes || []).some(i => (i.nombre || "").toLowerCase().includes(texto));
      return enFamilia || enNumero || enIntegrantes;
    })
    .slice(0, 8);
  if (coincidencias.length === 0) { sugerenciasLista.style.display = "none"; return; }
  sugerenciasLista.style.display = "block";
  coincidencias.forEach(fam => {
    const opcion = document.createElement("div");
    opcion.textContent = fam.familia + (fam.numero ? " — N° " + fam.numero : "");
    opcion.addEventListener("click", () => {
      inputBuscar.value = fam.familia;
      sugerenciasLista.style.display = "none";
      mostrarTarjeta(fam.id);
    });
    sugerenciasLista.appendChild(opcion);
  });
});

function mostrarTarjeta(id) {
  const fam = listaFamilias.find(f => f.id === id);
  if (!fam) return;
  familiaSeleccionadaId = id;
  tarjetaInvitado.style.display = "block";
  tarjetaNombre.textContent = fam.familia;
  document.getElementById("tarjeta-numero").textContent = fam.numero ? "N° de invitación: " + fam.numero : "";

  const integrantes = fam.integrantes || [];
  listaIntegrantesEl.innerHTML = "";
  integrantes.forEach((integrante, idx) => {
    const fila = document.createElement("div");
    fila.className = "integrante-row";
    const idAsiste = "asiste-" + idx;
    const idCeliaco = "celiaco-" + idx;
    const marcado = integrante.asiste !== false; // por defecto tildado
    const esCeliaco = integrante.celiaco === true; // por defecto sin marcar
    fila.innerHTML = `
      <input type="checkbox" id="${idAsiste}" data-idx="${idx}" data-campo="asiste" ${marcado ? "checked" : ""}>
      <label for="${idAsiste}" class="nombre-integrante">${integrante.nombre}</label>
      <span class="celiaco-check">
        <input type="checkbox" id="${idCeliaco}" data-idx="${idx}" data-campo="celiaco" ${esCeliaco ? "checked" : ""}>
        <label for="${idCeliaco}">Celíaco/a</label>
      </span>
    `;
    listaIntegrantesEl.appendChild(fila);
  });

  if (fam.estado === "confirmado" && fam.mesa) {
    tarjetaMesa.style.display = "block";
    tarjetaMesa.textContent = "Su mesa es la N.º " + fam.mesa;
  } else {
    tarjetaMesa.style.display = "none";
  }
  rsvpEstado.textContent = "";
}

btnGuardarFamilia.addEventListener("click", async () => {
  if (!familiaSeleccionadaId || !db) return;
  const fam = listaFamilias.find(f => f.id === familiaSeleccionadaId);
  if (!fam) return;

  const checkboxes = listaIntegrantesEl.querySelectorAll("input[type=checkbox]");
  const integrantesActualizados = (fam.integrantes || []).map((integrante, idx) => {
    const cbAsiste = listaIntegrantesEl.querySelector(`[data-idx="${idx}"][data-campo="asiste"]`);
    const cbCeliaco = listaIntegrantesEl.querySelector(`[data-idx="${idx}"][data-campo="celiaco"]`);
    return {
      nombre: integrante.nombre,
      asiste: cbAsiste ? cbAsiste.checked : false,
      celiaco: cbCeliaco ? cbCeliaco.checked : false
    };
  });
  const algunoAsiste = integrantesActualizados.some(i => i.asiste);

  try {
    await db.collection("invitados").doc(familiaSeleccionadaId).update({
      integrantes: integrantesActualizados,
      estado: algunoAsiste ? "confirmado" : "cancelado"
    });
    rsvpEstado.textContent = algunoAsiste
      ? "¡Gracias por confirmar! 🎉"
      : "Quedó registrado, ¡gracias por avisar!";
  } catch (err) {
    console.error(err);
    rsvpEstado.textContent = "Hubo un problema, probá de nuevo.";
  }
});

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
  const linkTexto = document.getElementById("link-fotos-texto");
  linkTexto.href = CONFIG.fotosCompartidasUrl;
  linkTexto.textContent = CONFIG.fotosCompartidasUrl;
}

// --- Efecto al scrollear: parallax en la foto de portada ---
const portadaEl = document.querySelector(".portada");
let ticking = false;
function actualizarParallax() {
  const desplazado = window.scrollY;
  portadaEl.style.setProperty("--parallax", (desplazado * 0.32) + "px");
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(actualizarParallax);
    ticking = true;
  }
}, { passive: true });

// --- Efecto al scrollear: cada sección aparece con fundido al entrar en pantalla ---
if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

  document.querySelectorAll(".seccion").forEach(sec => observador.observe(sec));
} else {
  document.querySelectorAll(".seccion").forEach(sec => sec.classList.add("visible"));
}

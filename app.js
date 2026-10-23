/**
 * San José · Taller de Enmarcaciones
 * app.js — lógica principal de la landing page y el configurador
 */

'use strict';

/* ============================================================
   CONSTANTES Y ESTADO GLOBAL
   ============================================================ */
const WHATSAPP_NUMERO = '5491100000000'; // ← Reemplazar con el número real

const estado = {
  imagen: null,
  medida: OPCIONES_CONFIGURADOR.medidas[2], // 24×30 por defecto
  moldura: OPCIONES_CONFIGURADOR.molduras[0],
  paspartuActivo: true,
  paspartuColor: OPCIONES_CONFIGURADOR.paspartu.colores[0],
  paspartuAncho: OPCIONES_CONFIGURADOR.paspartu.anchos[1],
};

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
function initNavegacion() {
  const encabezado = document.getElementById('encabezado');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const overlay = document.getElementById('nav-overlay');

  // Scroll → fondo semitransparente
  const onScroll = () => {
    encabezado.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburguesa mobile
  const abrirMenu = () => {
    const abierto = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!abierto));
    toggle.classList.toggle('abierto', !abierto);
    menu.classList.toggle('abierto', !abierto);
    overlay.classList.toggle('visible', !abierto);
    document.body.style.overflow = !abierto ? 'hidden' : '';
  };

  const cerrarMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('abierto');
    menu.classList.remove('abierto');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', abrirMenu);
  overlay.addEventListener('click', cerrarMenu);

  // Cerrar al hacer clic en un enlace
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', cerrarMenu);
  });

  // Teclado: ESC cierra el menú
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarMenu();
  });
}

/* ============================================================
   CATÁLOGO — generar tarjetas desde datos
   ============================================================ */
function initCatalogo() {
  const grid = document.getElementById('catalogo-grid');
  if (!grid) return;

  CATALOGO.forEach(modelo => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta fade-in';
    tarjeta.setAttribute('role', 'listitem');
    tarjeta.setAttribute('data-modelo-id', modelo.id);
    tarjeta.setAttribute('tabindex', '0');
    tarjeta.setAttribute('aria-label', `Modelo ${modelo.nombre} — ${modelo.moldura}, ${modelo.acabado}`);

    const tags = [
      modelo.moldura,
      modelo.acabado,
      ...modelo.medidas.slice(0, 2).map(m => m + ' cm'),
    ];

    tarjeta.innerHTML = `
      <div class="tarjeta__imagen">
        <img
          src="${modelo.imagen}"
          alt="Marco ${modelo.nombre}: ${modelo.moldura}, ${modelo.acabado}"
          width="400"
          height="533"
          loading="lazy"
        />
      </div>
      <div class="tarjeta__cuerpo">
        <h3 class="tarjeta__nombre">${modelo.nombre}</h3>
        <p class="tarjeta__meta">${modelo.moldura} · ${modelo.acabado}</p>
        <p class="tarjeta__descripcion">${modelo.descripcion}</p>
        <div class="tarjeta__tags" aria-label="Características">
          ${tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <button
          class="btn btn--secundario tarjeta__accion"
          type="button"
          aria-label="Diseñar marco con modelo ${modelo.nombre}"
          data-modelo-id="${modelo.id}"
          id="btn-modelo-${modelo.id}"
        >
          Diseñar con este modelo
        </button>
      </div>
    `;

    // Clic en la tarjeta o en el botón → abrir configurador con este modelo
    const btnModelo = tarjeta.querySelector('.tarjeta__accion');
    const accion = () => seleccionarModeloEnConfigurador(modelo.id);
    btnModelo.addEventListener('click', accion);
    tarjeta.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') accion();
    });

    grid.appendChild(tarjeta);
  });
}

/* Selecciona un modelo y lleva al configurador */
function seleccionarModeloEnConfigurador(modeloId) {
  const modelo = CATALOGO.find(m => m.id === modeloId);
  if (!modelo) return;

  // Intentar mapear moldura del modelo a opciones del configurador
  const molduraMatch = OPCIONES_CONFIGURADOR.molduras.find(
    m => m.id === modeloId || modelo.moldura.toLowerCase().includes(m.label.toLowerCase().split(' ')[0])
  );
  if (molduraMatch) {
    estado.moldura = molduraMatch;
    actualizarSeleccionMoldura();
  }

  // Scroll al configurador
  document.getElementById('configurador').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Render
  renderPreview();
}

/* ============================================================
   CONFIGURADOR — inicializar controles
   ============================================================ */
function initConfigurador() {
  // Medidas
  const selMedida = document.getElementById('sel-medida');
  OPCIONES_CONFIGURADOR.medidas.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.label;
    selMedida.appendChild(opt);
  });
  selMedida.value = estado.medida.id;
  selMedida.addEventListener('change', () => {
    estado.medida = OPCIONES_CONFIGURADOR.medidas.find(m => m.id === selMedida.value);
    actualizarResumen();
    renderPreview();
  });

  // Molduras
  const molduraOpciones = document.getElementById('moldura-opciones');
  OPCIONES_CONFIGURADOR.molduras.forEach((m, idx) => {
    const label = document.createElement('label');
    label.className = 'moldura-opcion';
    label.setAttribute('title', m.label);

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'moldura';
    input.value = m.id;
    input.id = `moldura-${m.id}`;
    input.checked = idx === 0;
    input.setAttribute('aria-label', m.label);

    const muestra = document.createElement('div');
    muestra.className = 'moldura-opcion__muestra';
    muestra.style.backgroundColor = m.color;
    // Borde de muestra para moldura blanca
    if (m.color === '#F0EDE6') {
      muestra.style.boxShadow = 'inset 0 0 0 1px #D8D5CC';
    }

    const etiqueta = document.createElement('span');
    etiqueta.className = 'moldura-opcion__etiqueta';
    etiqueta.textContent = m.label;

    label.append(input, muestra, etiqueta);

    input.addEventListener('change', () => {
      if (input.checked) {
        estado.moldura = m;
        actualizarResumen();
        renderPreview();
      }
    });

    molduraOpciones.appendChild(label);
  });

  // Toggle paspartú
  const togglePaspartu = document.getElementById('toggle-paspartu');
  const paspartuControles = document.getElementById('paspartu-controles');
  togglePaspartu.addEventListener('change', () => {
    estado.paspartuActivo = togglePaspartu.checked;
    paspartuControles.classList.toggle('oculto', !togglePaspartu.checked);
    actualizarResumen();
    renderPreview();
  });

  // Colores paspartú
  const paspartuColoresDiv = document.getElementById('paspartu-colores');
  OPCIONES_CONFIGURADOR.paspartu.colores.forEach((c, idx) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch' + (idx === 0 ? ' activo' : '');
    swatch.style.backgroundColor = c.hex;
    swatch.style.boxShadow = c.hex === '#FFFFFF' ? 'inset 0 0 0 1px #D8D5CC' : 'none';
    swatch.setAttribute('aria-label', `Paspartú ${c.label}`);
    swatch.setAttribute('aria-pressed', String(idx === 0));
    swatch.dataset.colorId = c.id;

    swatch.addEventListener('click', () => {
      paspartuColoresDiv.querySelectorAll('.color-swatch').forEach(s => {
        s.classList.remove('activo');
        s.setAttribute('aria-pressed', 'false');
      });
      swatch.classList.add('activo');
      swatch.setAttribute('aria-pressed', 'true');
      estado.paspartuColor = c;
      actualizarResumen();
      renderPreview();
    });

    paspartuColoresDiv.appendChild(swatch);
  });

  // Ancho paspartú
  const selAncho = document.getElementById('sel-ancho-paspartu');
  OPCIONES_CONFIGURADOR.paspartu.anchos.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.id;
    opt.textContent = a.label;
    selAncho.appendChild(opt);
  });
  selAncho.value = estado.paspartuAncho.id;
  selAncho.addEventListener('change', () => {
    estado.paspartuAncho = OPCIONES_CONFIGURADOR.paspartu.anchos.find(a => a.id === selAncho.value);
    actualizarResumen();
    renderPreview();
  });

  // Upload de foto
  initUpload();

  // Botón descargar
  document.getElementById('btn-descargar').addEventListener('click', descargarPreview);

  // Botón WhatsApp
  document.getElementById('btn-whatsapp').addEventListener('click', abrirWhatsApp);

  // Inicializar resumen
  actualizarResumen();
  renderPreview();
}

function actualizarSeleccionMoldura() {
  const inputs = document.querySelectorAll('input[name="moldura"]');
  inputs.forEach(input => {
    input.checked = input.value === estado.moldura.id;
  });
}

/* ============================================================
   UPLOAD DE FOTO
   ============================================================ */
function initUpload() {
  const inputFoto = document.getElementById('input-foto');
  const uploadZona = document.getElementById('upload-zona');

  inputFoto.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) cargarImagen(file);
  });

  // Drag & Drop
  uploadZona.addEventListener('dragover', e => {
    e.preventDefault();
    uploadZona.classList.add('drag-over');
  });

  uploadZona.addEventListener('dragleave', () => {
    uploadZona.classList.remove('drag-over');
  });

  uploadZona.addEventListener('drop', e => {
    e.preventDefault();
    uploadZona.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      cargarImagen(file);
    }
  });

  // Accesibilidad teclado en la zona
  uploadZona.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputFoto.click();
    }
  });
}

function cargarImagen(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      estado.imagen = img;

      // Actualizar UI de upload
      const zona = document.getElementById('upload-zona');
      const nombreArchivo = file.name.length > 30
        ? file.name.substring(0, 27) + '...'
        : file.name;
      zona.querySelector('.upload-zona__texto').innerHTML = `
        <strong style="color:var(--color-carbon)">${nombreArchivo}</strong><br>
        <span style="font-size:0.75rem">Clic para cambiar</span>
      `;

      // Mostrar acciones
      document.getElementById('preview-acciones').style.display = 'flex';
      const placeholder = document.getElementById('preview-placeholder');
      if (placeholder) placeholder.style.display = 'none';

      renderPreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

/* ============================================================
   CANVAS — previsualización dinámica
   ============================================================ */
function renderPreview() {
  const canvas = document.getElementById('preview-canvas');
  const wrap = document.getElementById('preview-wrap');

  // Dimensiones del canvas = dimensiones del contenedor
  const W = wrap.clientWidth || 640;
  const H = wrap.clientHeight || 480;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  // Fondo del canvas
  ctx.fillStyle = '#E8E5DE';
  ctx.fillRect(0, 0, W, H);

  // --- Calcular proporciones del marco ---
  const medida = estado.medida;
  const ratio = medida.h / medida.w;

  // Área disponible con margen
  const MARGEN = 0.1;
  const areaW = W * (1 - MARGEN * 2);
  const areaH = H * (1 - MARGEN * 2);

  let marcoW, marcoH;
  if (ratio > areaH / areaW) {
    marcoH = areaH;
    marcoW = marcoH / ratio;
  } else {
    marcoW = areaW;
    marcoH = marcoW * ratio;
  }

  const marcoX = (W - marcoW) / 2;
  const marcoY = (H - marcoH) / 2;

  // Grosor de la moldura (proporcional)
  const GROSOR_MOLDURA = Math.max(10, Math.min(marcoW, marcoH) * 0.055);

  // Paspartú
  let paspartuAncho = 0;
  if (estado.paspartuActivo) {
    const pxPorCm = marcoW / medida.w;
    paspartuAncho = estado.paspartuAncho.valor * pxPorCm * 0.7;
    paspartuAncho = Math.min(paspartuAncho, Math.min(marcoW, marcoH) * 0.22);
  }

  // === Dibujar sombra del marco ===
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.22)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = 'transparent';
  ctx.fillRect(marcoX, marcoY, marcoW, marcoH);
  ctx.restore();

  // === Dibujar moldura (exterior) ===
  const molduraColor = estado.moldura.color;
  dibujarMoldura(ctx, marcoX, marcoY, marcoW, marcoH, GROSOR_MOLDURA, molduraColor);

  // === Zona interior (dentro de la moldura) ===
  const interiorX = marcoX + GROSOR_MOLDURA;
  const interiorY = marcoY + GROSOR_MOLDURA;
  const interiorW = marcoW - GROSOR_MOLDURA * 2;
  const interiorH = marcoH - GROSOR_MOLDURA * 2;

  // === Paspartú ===
  if (estado.paspartuActivo) {
    ctx.fillStyle = estado.paspartuColor.hex;
    ctx.fillRect(interiorX, interiorY, interiorW, interiorH);

    // Borde interior sutil del paspartú
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.strokeRect(interiorX, interiorY, interiorW, interiorH);
  }

  // === Zona de la imagen ===
  const imgZonaX = interiorX + paspartuAncho;
  const imgZonaY = interiorY + paspartuAncho;
  const imgZonaW = interiorW - paspartuAncho * 2;
  const imgZonaH = interiorH - paspartuAncho * 2;

  // Imagen del usuario
  if (estado.imagen) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(imgZonaX, imgZonaY, imgZonaW, imgZonaH);
    ctx.clip();

    // Ajuste contain: cubrir la zona de imagen manteniendo proporciones
    const imgRatio = estado.imagen.naturalWidth / estado.imagen.naturalHeight;
    const zonaRatio = imgZonaW / imgZonaH;
    let drawW, drawH, drawX, drawY;

    if (imgRatio > zonaRatio) {
      drawH = imgZonaH;
      drawW = drawH * imgRatio;
    } else {
      drawW = imgZonaW;
      drawH = drawW / imgRatio;
    }

    drawX = imgZonaX + (imgZonaW - drawW) / 2;
    drawY = imgZonaY + (imgZonaH - drawH) / 2;

    ctx.drawImage(estado.imagen, drawX, drawY, drawW, drawH);
    ctx.restore();
  } else {
    // Placeholder gris cuando no hay imagen
    ctx.fillStyle = '#CFCBC4';
    ctx.fillRect(imgZonaX, imgZonaY, imgZonaW, imgZonaH);

    // Ícono de foto centrado
    ctx.save();
    ctx.strokeStyle = 'rgba(52,56,47,0.25)';
    ctx.lineWidth = 1.5;
    const cx = imgZonaX + imgZonaW / 2;
    const cy = imgZonaY + imgZonaH / 2;
    const sz = Math.min(imgZonaW, imgZonaH) * 0.2;

    // Marco pequeño decorativo
    ctx.strokeRect(cx - sz, cy - sz * 0.75, sz * 2, sz * 1.5);
    ctx.beginPath();
    ctx.arc(cx, cy - 4, sz * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Texto placeholder
    ctx.save();
    ctx.fillStyle = 'rgba(52,56,47,0.4)';
    ctx.font = `${Math.max(10, imgZonaW * 0.06)}px Manrope, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('tu foto', cx, cy + sz * 0.9);
    ctx.restore();
  }

  // === Línea interior del paspartú (bevel sutil) ===
  if (estado.paspartuActivo && paspartuAncho > 4) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,0,0,0.09)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(
      imgZonaX - 1,
      imgZonaY - 1,
      imgZonaW + 2,
      imgZonaH + 2
    );
    ctx.restore();
  }
}

function dibujarMoldura(ctx, x, y, w, h, grosor, color) {
  // Dibuja la moldura como 4 trapecios para perspectiva
  const colores = calcularColoresMoldura(color);

  // Superior
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - grosor, y + grosor);
  ctx.lineTo(x + grosor, y + grosor);
  ctx.fillStyle = colores.top;
  ctx.fill();

  // Inferior
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w - grosor, y + h - grosor);
  ctx.lineTo(x + grosor, y + h - grosor);
  ctx.fillStyle = colores.bottom;
  ctx.fill();

  // Izquierda
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + grosor, y + h - grosor);
  ctx.lineTo(x + grosor, y + grosor);
  ctx.fillStyle = colores.left;
  ctx.fill();

  // Derecha
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w - grosor, y + h - grosor);
  ctx.lineTo(x + w - grosor, y + grosor);
  ctx.fillStyle = colores.right;
  ctx.fill();

  // Borde exterior sutil
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function calcularColoresMoldura(baseColor) {
  // Crear variantes de luz para dar sensación de relieve
  const hex2rgb = hex => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const rgb2hex = (r, g, b) => {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  };

  const ajustar = (hex, factor) => {
    const [r, g, b] = hex2rgb(hex);
    return rgb2hex(r * factor, g * factor, b * factor);
  };

  return {
    top:    ajustar(baseColor, 1.1),
    bottom: ajustar(baseColor, 0.78),
    left:   ajustar(baseColor, 0.95),
    right:  ajustar(baseColor, 0.88),
  };
}

/* ============================================================
   RESUMEN DE CONFIGURACIÓN
   ============================================================ */
function actualizarResumen() {
  document.getElementById('res-medida').textContent = estado.medida.label;
  document.getElementById('res-moldura').textContent = estado.moldura.label;
  document.getElementById('res-paspartu').textContent = estado.paspartuActivo ? 'Sí' : 'No';
  document.getElementById('res-color-paspartu').textContent = estado.paspartuActivo
    ? `${estado.paspartuColor.label} · ${estado.paspartuAncho.label}`
    : '—';
}

/* ============================================================
   DESCARGAR PREVIEW
   ============================================================ */
function descargarPreview() {
  const canvas = document.getElementById('preview-canvas');
  const link = document.createElement('a');
  link.download = 'sanjose-preview.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/* ============================================================
   WHATSAPP
   ============================================================ */
function abrirWhatsApp() {
  const nombre = document.getElementById('input-nombre').value.trim();
  const telefono = document.getElementById('input-telefono').value.trim();
  const mensaje = document.getElementById('input-mensaje').value.trim();

  let texto = '¡Hola! Me gustaría consultar una enmarcación.\n\n';
  texto += `*Medida:* ${estado.medida.label}\n`;
  texto += `*Moldura:* ${estado.moldura.label}\n`;
  texto += `*Paspartú:* ${estado.paspartuActivo ? estado.paspartuColor.label + ' · ' + estado.paspartuAncho.label : 'Sin paspartú'}\n`;
  if (nombre) texto += `\n*Nombre:* ${nombre}`;
  if (telefono) texto += `\n*Teléfono:* ${telefono}`;
  if (mensaje) texto += `\n\n*Comentarios:* ${mensaje}`;

  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ============================================================
   ANIMACIONES DE ENTRADA (IntersectionObserver)
   ============================================================ */
function initAnimaciones() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

/* ============================================================
   RESIZE → re-render del canvas
   ============================================================ */
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    renderPreview();
  }, 150);
});

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavegacion();
  initCatalogo();
  initConfigurador();
  initAnimaciones();
});

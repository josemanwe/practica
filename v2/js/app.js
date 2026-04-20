// ============================================================
// GESTOR DE NOTAS - Versión 2 (Nueva funcionalidad: Completar)
// ⚠️ ADVERTENCIA: Este código contiene vulnerabilidades XSS
//    deliberadas con fines educativos. NO usar en producción.
// ============================================================

let notas = [];
let modoEdicion = false;
let idEditando = null;
let filtroActual = 'todas';

// --- Cargar notas desde localStorage ---
function cargarNotas() {
  const datos = localStorage.getItem('notas_v2');
  notas = datos ? JSON.parse(datos) : [];
}

// --- Guardar notas en localStorage ---
function guardarNotas() {
  localStorage.setItem('notas_v2', JSON.stringify(notas));
}

// --- Filtrar notas según filtro activo ---
function notasFiltradas() {
  if (filtroActual === 'pendientes') return notas.filter(n => !n.completada);
  if (filtroActual === 'completadas') return notas.filter(n => n.completada);
  return notas;
}

// --- Renderizar lista de notas ---
// ⚠️ VULNERABILIDAD XSS: Se usa innerHTML con datos del usuario sin sanitizar
function renderizarNotas() {
  const container = document.getElementById('notas-list');
  const sinNotas = document.getElementById('sin-notas');
  const contador = document.getElementById('contador');

  container.innerHTML = '';
  contador.textContent = notas.length;

  const lista = notasFiltradas();

  if (lista.length === 0) {
    sinNotas.classList.remove('oculto');
    return;
  }

  sinNotas.classList.add('oculto');

  lista.forEach(nota => {
    const fecha = new Date(nota.fechaCreacion).toLocaleString('es-ES');
    const claseCompletada = nota.completada ? 'completada' : '';
    const textoBtnCompletar = nota.completada ? '↩️ Deshacer' : '✅ Completar';
    const badgeCompletada = nota.completada
      ? '<span class="badge-completada">✔ Completada</span>'
      : '';

    // ⚠️ VULNERABLE: nota.titulo y nota.contenido se insertan directamente
    //    en innerHTML sin ningún escape ni sanitización.
    //    Payload de prueba en título: <img src=x onerror="alert('XSS en título')">
    //    Payload de prueba en contenido: <script>alert('XSS')</script>
    const notaHTML = `
      <div class="nota-card ${claseCompletada}">
        ${badgeCompletada}
        <h3>${nota.titulo}</h3>
        <p>${nota.contenido}</p>
        <div class="nota-fecha">📅 ${fecha}</div>
        <div class="nota-acciones">
          <button class="btn-completar" onclick="toggleCompletar(${nota.id})">${textoBtnCompletar}</button>
          <button class="btn-editar" onclick="iniciarEdicion(${nota.id})">✏️ Editar</button>
          <button class="btn-eliminar" onclick="eliminarNota(${nota.id})">🗑️ Eliminar</button>
        </div>
      </div>
    `;
    container.innerHTML += notaHTML;  // ⚠️ VULNERABLE a XSS
  });
}

// --- Crear o actualizar nota ---
function guardarNota(event) {
  event.preventDefault();

  const titulo = document.getElementById('titulo').value.trim();
  const contenido = document.getElementById('contenido').value.trim();

  if (!titulo || !contenido) return;

  if (modoEdicion) {
    const index = notas.findIndex(n => n.id === idEditando);
    if (index !== -1) {
      notas[index].titulo = titulo;
      notas[index].contenido = contenido;
      notas[index].fechaEdicion = new Date().toISOString();
    }
    terminarEdicion();
  } else {
    const nuevaNota = {
      id: Date.now(),
      titulo: titulo,
      contenido: contenido,
      completada: false,
      fechaCreacion: new Date().toISOString(),
      fechaEdicion: new Date().toISOString()
    };
    notas.push(nuevaNota);
  }

  guardarNotas();
  renderizarNotas();
  document.getElementById('nota-form').reset();
}

// --- Marcar/desmarcar nota como completada ---
function toggleCompletar(id) {
  const index = notas.findIndex(n => n.id === id);
  if (index !== -1) {
    notas[index].completada = !notas[index].completada;
    notas[index].fechaEdicion = new Date().toISOString();
    guardarNotas();
    renderizarNotas();
  }
}

// --- Iniciar edición de nota ---
function iniciarEdicion(id) {
  const nota = notas.find(n => n.id === id);
  if (!nota) return;

  modoEdicion = true;
  idEditando = id;

  document.getElementById('titulo').value = nota.titulo;
  document.getElementById('contenido').value = nota.contenido;
  document.getElementById('form-titulo').textContent = 'Editar Nota';
  document.getElementById('btn-guardar').textContent = 'Guardar Cambios';
  document.getElementById('btn-cancelar').classList.remove('oculto');

  document.querySelector('.formulario-seccion').scrollIntoView({ behavior: 'smooth' });
}

// --- Cancelar edición ---
function terminarEdicion() {
  modoEdicion = false;
  idEditando = null;
  document.getElementById('form-titulo').textContent = 'Nueva Nota';
  document.getElementById('btn-guardar').textContent = 'Crear Nota';
  document.getElementById('btn-cancelar').classList.add('oculto');
  document.getElementById('nota-form').reset();
}

// --- Eliminar nota ---
function eliminarNota(id) {
  if (!confirm('¿Seguro que quieres eliminar esta nota?')) return;
  notas = notas.filter(n => n.id !== id);
  guardarNotas();
  renderizarNotas();
}

// --- Cambiar filtro ---
function cambiarFiltro(filtro) {
  filtroActual = filtro;
  document.querySelectorAll('.filtro').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.filtro === filtro);
  });
  renderizarNotas();
}

// --- Inicialización ---
document.getElementById('nota-form').addEventListener('submit', guardarNota);
document.getElementById('btn-cancelar').addEventListener('click', terminarEdicion);

document.querySelectorAll('.filtro').forEach(btn => {
  btn.addEventListener('click', () => cambiarFiltro(btn.dataset.filtro));
});

cargarNotas();
renderizarNotas();

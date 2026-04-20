// ============================================================
// GESTOR DE NOTAS - Versión 1 (MVP Vulnerable)
// ⚠️ ADVERTENCIA: Este código contiene vulnerabilidades XSS
//    deliberadas con fines educativos. NO usar en producción.
// ============================================================

let notas = [];
let modoEdicion = false;
let idEditando = null;

// --- Cargar notas desde localStorage ---
function cargarNotas() {
  const datos = localStorage.getItem('notas_v1');
  notas = datos ? JSON.parse(datos) : [];
}

// --- Guardar notas en localStorage ---
function guardarNotas() {
  localStorage.setItem('notas_v1', JSON.stringify(notas));
}

// --- Renderizar lista de notas ---
// ⚠️ VULNERABILIDAD XSS: Se usa innerHTML con datos del usuario sin sanitizar
function renderizarNotas() {
  const container = document.getElementById('notas-list');
  const sinNotas = document.getElementById('sin-notas');
  const contador = document.getElementById('contador');

  container.innerHTML = '';
  contador.textContent = notas.length;

  if (notas.length === 0) {
    sinNotas.classList.remove('oculto');
    return;
  }

  sinNotas.classList.add('oculto');

  notas.forEach(nota => {
    const fecha = new Date(nota.fechaCreacion).toLocaleString('es-ES');

    // ⚠️ VULNERABLE: nota.titulo y nota.contenido se insertan directamente
    //    en innerHTML sin ningún escape ni sanitización.
    //    Payload de prueba en título: <img src=x onerror="alert('XSS')">
    //    Payload de prueba en contenido: <svg onload="alert('XSS')">
    const notaHTML = `
      <div class="nota-card">
        <h3>${nota.titulo}</h3>
        <p>${nota.contenido}</p>
        <div class="nota-fecha">📅 ${fecha}</div>
        <div class="nota-acciones">
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
    // Actualizar nota existente
    const index = notas.findIndex(n => n.id === idEditando);
    if (index !== -1) {
      notas[index].titulo = titulo;
      notas[index].contenido = contenido;
      notas[index].fechaEdicion = new Date().toISOString();
    }
    terminarEdicion();
  } else {
    // Crear nueva nota
    const nuevaNota = {
      id: Date.now(),
      titulo: titulo,
      contenido: contenido,
      fechaCreacion: new Date().toISOString(),
      fechaEdicion: new Date().toISOString()
    };
    notas.push(nuevaNota);
  }

  guardarNotas();
  renderizarNotas();
  document.getElementById('nota-form').reset();
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

  // Desplazarse al formulario
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

// --- Inicialización ---
document.getElementById('nota-form').addEventListener('submit', guardarNota);
document.getElementById('btn-cancelar').addEventListener('click', terminarEdicion);

cargarNotas();
renderizarNotas();

// Verification de Sesion Global con Supabase Auth
async function checkAuth() {
    if (typeof initSupabase !== 'function') return null;
    const db = initSupabase();
    if (!db) return null;

    const { data: { session } } = await db.auth.getSession();
    const esPaginaLogin = window.location.href.includes('index.html');

    if (!session && !esPaginaLogin) {
        window.location.href = 'index.html';
    } else if (session && esPaginaLogin) {
        window.location.href = 'dashboard.html';
    }

    return session;
}

// Cerrar Sesion
async function logout() {
    if (typeof initSupabase === 'function') {
        const db = initSupabase();
        if (db) await db.auth.signOut();
    }
    localStorage.removeItem('sesion_activa');
    window.location.href = 'index.html';
}

// Subir una foto individual a Supabase Storage
async function subirFotoSupabase(file) {
    const db = initSupabase();
    if (!db) throw new Error("No se pudo conectar con Supabase");

    const extension = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${extension}`;

    const { data, error } = await db.storage
        .from('fotos-ordenes')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
        console.error('Error al subir imagen a Storage:', error);
        throw error;
    }

    const { data: publicUrlData } = db.storage
        .from('fotos-ordenes')
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}

function mostrarToast(mensaje, tipo = 'exito') {
    const toastEl = document.getElementById('toastNotificacion');
    const toastBody = document.getElementById('toastMensaje');

    if (!toastEl || !toastBody) return;

    // Configurar color según tipo ('exito', 'error', 'info')
    toastEl.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning', 'text-dark');
    
    if (tipo === 'exito') {
        toastEl.classList.add('bg-success', 'text-white');
        toastBody.innerHTML = `<i class="bi bi-check-circle-fill me-2 fs-5"></i> ${mensaje}`;
    } else if (tipo === 'error') {
        toastEl.classList.add('bg-danger', 'text-white');
        toastBody.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i> ${mensaje}`;
    } else if (tipo === 'info') {
        toastEl.classList.add('bg-info', 'text-dark');
        toastBody.innerHTML = `<i class="bi bi-info-circle-fill me-2 fs-5"></i> ${mensaje}`;
    }

    // Inicializar y mostrar el Toast de Bootstrap con autodestrucción en 3000ms
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

function asignarDatosVehiculoUI(info, patente) {
  // 1. Guardar en la variable global
  vehiculoSeleccionado = {
    patente: patente,
    marca: info.marca,
    modelo: info.modelo,
    ano: info.ano,
    color: info.color,
    vin: info.vin,
    transmision: info.transmision,
    n_motor: info.n_motor
  };

  // 2. Actualizar la tarjeta de Vehículo en el DOM
  // (Verifica que los IDs coincidan con los de tu HTML o ajusta según tu maquetación)
  const elTitulo = document.getElementById('lblVehiculoTitulo');
  if (elTitulo) elTitulo.textContent = `${info.marca} ${info.modelo}`.trim();

  const elColor = document.getElementById('lblVehiculoColor');
  if (elColor) elColor.textContent = info.color || '-';

  const elAno = document.getElementById('lblVehiculoAno');
  if (elAno) elAno.textContent = info.ano || '-';

  const elTransmision = document.getElementById('lblVehiculoTransmision');
  if (elTransmision) elTransmision.textContent = info.transmision || '-';

  const elMotor = document.getElementById('lblVehiculoMotor');
  if (elMotor) elMotor.textContent = info.n_motor || '-';

  const elVin = document.getElementById('lblVehiculoVin');
  if (elVin) elVin.textContent = info.vin || '-';
}

async function verificarClienteEnBaseDeDatos(apiData) {
  // Si la API trae rut/propietario, intenta buscarlo; si no, abre modal o deja en blanco
  console.log(" Verificando si existe cliente asociado...", apiData);
  const rutPropietario = apiData.rut || apiData.owner_rut || apiData.rut_propietario;

  if (!rutPropietario) {
    if (typeof modalRegistroInstance !== 'undefined' && modalRegistroInstance) {
      modalRegistroInstance.show();
    }
    return;
  }

  // Si existe cliente en BD lo carga, si no, abre modal para registrarlo
  const db = typeof initSupabase === 'function' ? initSupabase() : supabaseClient;
  const { data: cliente } = await db
    .from('clientes')
    .select('*')
    .eq('rut', rutPropietario)
    .maybeSingle();

  if (cliente) {
    clienteSeleccionado = cliente;
    if (typeof actualizarVistaCliente === 'function') actualizarVistaCliente(cliente);
  } else if (typeof modalRegistroInstance !== 'undefined' && modalRegistroInstance) {
    modalRegistroInstance.show();
  }
}
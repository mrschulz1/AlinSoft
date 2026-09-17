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

function verPDFPresupuesto() {
  if (!listItems || listItems.length === 0) {
    if (typeof mostrarToast === 'function') mostrarToast("Agrega al menos un ítem al presupuesto.", "error");
    return;
  }

  // 1. Extracción de datos
  const patente = vehiculoSeleccionado?.patente || 'S/N';
  const clienteNombre = clienteSeleccionado?.nombre || 'Cliente General';
  const clienteRut = clienteSeleccionado?.rut || 'S/I';
  const clienteTelefono = clienteSeleccionado?.telefono || '-';

  const vehiculoMarcaModelo = [
    vehiculoSeleccionado?.marca,
    vehiculoSeleccionado?.modelo,
    vehiculoSeleccionado?.color,
    vehiculoSeleccionado?.ano || vehiculoSeleccionado?.anio,
    vehiculoSeleccionado?.tipo
  ].filter(Boolean).join(' - ').toUpperCase() || 'VEHÍCULO NUEVO';

  const vehiculoVin = vehiculoSeleccionado?.vin || vehiculoSeleccionado?.chasis || '-';
  const vehiculoMotor = vehiculoSeleccionado?.n_motor || vehiculoSeleccionado?.motor || '-';

  const numPresupuesto = document.getElementById('lblFolioOT')?.textContent || '#348';
  const fechaHoy = new Date().toLocaleDateString('es-CL');
  const comentarios = document.getElementById('txtObservaciones')?.value || document.getElementById('inputComentarios')?.value || '';

  // 2. Totales
  const subtotalNeto = listItems.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  const descuentoTotal = listItems.reduce((acc, item) => acc + (item.descuento || 0), 0);
  const aplicarIVA = document.getElementById('checkAplicarIVA')?.checked ?? true;
  const baseImponible = Math.max(0, subtotalNeto - descuentoTotal);
  const montoIVA = aplicarIVA ? Math.round(baseImponible * 0.19) : 0;
  const totalFinal = baseImponible + montoIVA;

  // 3. Filas de tabla
  const filasHTML = listItems.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: bold; font-size: 11px; text-transform: uppercase;">${item.descripcion || item.titulo || 'SERVICIO / REPUESTO'}</div>
        ${(item.subdescripcion || item.detalle) ? `<div style="font-size: 9px; color: #4b5563; text-transform: uppercase; margin-top: 2px;">${item.subdescripcion || item.detalle}</div>` : ''}
      </td>
      <td style="padding: 8px 0; text-align: right; font-size: 11px; border-bottom: 1px solid #e5e7eb;">$${(item.precioUnitario || 0).toLocaleString('es-CL')}</td>
      <td style="padding: 8px 0; text-align: center; font-size: 11px; border-bottom: 1px solid #e5e7eb;">${item.cantidad || 1}</td>
      <td style="padding: 8px 0; text-align: center; font-size: 11px; border-bottom: 1px solid #e5e7eb;">${item.descuento ? '$' + item.descuento.toLocaleString('es-CL') : '--'}</td>
      <td style="padding: 8px 0; text-align: right; font-size: 11px; font-weight: bold; border-bottom: 1px solid #e5e7eb;">$${((item.cantidad * item.precioUnitario) - (item.descuento || 0)).toLocaleString('es-CL')}</td>
    </tr>
  `).join('');

  // 4. Plantilla con visor independiente (Toolbar + A4 centrada + @media print)
  const htmlDoc = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Presupuesto_${patente}_${numPresupuesto}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #000000;
          background-color: #525659;
          margin: 0;
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* BARRA SUPERIOR DE ACCIONES EN NAVEGADOR */
        .toolbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 50px;
          background: #323639;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          color: #ffffff;
          z-index: 1000;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
        .toolbar h1 { font-size: 14px; margin: 0; font-weight: normal; color: #f1f5f9; }
        .btn-print {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
        }
        .btn-print:hover { background: #dc2626; }

        /* HOJA A4 EN PANTALLA */
        .page {
          background: #ffffff;
          width: 210mm;
          min-height: 297mm;
          padding: 15mm;
          margin-top: 50px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        /* TABLAS DE ESTRUCTURA */
        table.full-width { width: 100%; border-collapse: collapse; }

        .header-table { margin-bottom: 15px; border-bottom: 1px solid #d1d5db; padding-bottom: 15px; }
        .empresa-title { font-size: 15px; font-weight: bold; margin-bottom: 3px; }
        .empresa-info { font-size: 10px; line-height: 1.4; color: #111111; }
        .doc-num { font-size: 13px; font-weight: bold; text-transform: uppercase; text-align: right; }
        .doc-fecha { font-size: 10px; text-align: right; margin-top: 4px; color: #333333; }

        .info-block-table { margin-bottom: 15px; border-bottom: 1px solid #d1d5db; padding-bottom: 15px; }
        .block-title { color: #6b7280; font-weight: bold; font-size: 10px; margin-bottom: 3px; text-transform: uppercase; }
        .block-text { font-size: 10px; line-height: 1.5; }

        .items-table { margin-top: 15px; margin-bottom: 15px; }
        .items-table th { border-bottom: 1.5px solid #000; font-size: 10px; text-transform: uppercase; padding: 8px 0; color: #000000; }

        .totales-table { width: 220px; margin-left: auto; border-collapse: collapse; font-size: 11px; line-height: 1.6; }

        .box-title { font-size: 9px; font-weight: bold; margin-bottom: 4px; color: #000000; }
        .box-content { border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px 12px; font-size: 10px; color: #374151; min-height: 22px; }

        /* MODO IMPRESIÓN / PDF */
        @media print {
          body { background: white; padding: 0; }
          .toolbar { display: none !important; }
          .page {
            margin-top: 0;
            box-shadow: none;
            width: 100%;
            padding: 0;
          }
          @page { size: A4; margin: 12mm; }
        }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <h1>Vista Previa de Cotización — Patente ${patente}</h1>
        <button class="btn-print" onclick="window.print()">Imprimir / Guardar PDF</button>
      </div>

      <div class="page">
        <!-- HEADER -->
        <table class="full-width header-table">
          <tr>
            <td style="vertical-align: top;">
              <div class="empresa-title">Alineaciones Bustamante</div>
              <div class="empresa-info">
                <div>www.alineaciones.cl</div>
                <div>CONTACTO@ALINEACIONES.CL | +56229048965</div>
                <div>Bustamante 640, Ñuñoa, Santiago.</div>
                <div>Rut: 76540493-2</div>
                <div>Razón Social: Alineaciones Bustamante SPA</div>
              </div>
            </td>
            <td style="vertical-align: top; text-align: right;">
              <div class="doc-num">PRESUPUESTO ${numPresupuesto.startsWith('#') ? numPresupuesto : '#' + numPresupuesto}</div>
              <div class="doc-fecha">Fecha Creación: <strong>${fechaHoy}</strong></div>
            </td>
          </tr>
        </table>

        <!-- CLIENTE Y VEHICULO -->
        <table class="full-width info-block-table">
          <tr>
            <td style="width: 48%; vertical-align: top;" class="block-text">
              <div class="block-title">CLIENTE:</div>
              <div style="font-size: 12px; font-weight: bold; color: #000000;">${clienteNombre}</div>
              <div>RUT: ${clienteRut}</div>
              <div>${clienteTelefono}</div>
            </td>
            <td style="width: 4%;"></td>
            <td style="width: 48%; vertical-align: top;" class="block-text">
              <div class="block-title">VEHÍCULO:</div>
              <div style="font-size: 11px; font-weight: bold; color: #000000; text-transform: uppercase;">${vehiculoMarcaModelo}</div>
              <div>Patente: <strong style="font-size: 11px; letter-spacing: 1px;">${patente}</strong></div>
              <div>VIN: ${vehiculoVin}</div>
              <div>N° Motor: ${vehiculoMotor}</div>
            </td>
          </tr>
        </table>

        <!-- DETALLE ITEMS -->
        <table class="full-width items-table">
          <thead>
            <tr>
              <th style="text-align: left;">Ítem / Descripción</th>
              <th style="text-align: right; width: 80px;">Precio</th>
              <th style="text-align: center; width: 50px;">Cant</th>
              <th style="text-align: center; width: 50px;">Desc</th>
              <th style="text-align: right; width: 90px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${filasHTML}
          </tbody>
        </table>

        <div style="border-bottom: 1px solid #d1d5db; margin-bottom: 15px;"></div>

        <!-- TOTALES -->
        <div style="margin-bottom: 20px;">
          <table class="totales-table">
            <tr>
              <td style="font-weight: bold;">Subtotal:</td>
              <td style="text-align: right; font-weight: bold;">$${baseImponible.toLocaleString('es-CL')}</td>
            </tr>
            ${aplicarIVA ? `
            <tr>
              <td style="font-weight: bold;">IVA (19%):</td>
              <td style="text-align: right; font-weight: bold;">$${montoIVA.toLocaleString('es-CL')}</td>
            </tr>` : ''}
            <tr>
              <td style="font-weight: bold; font-size: 12px; padding-top: 4px;">TOTAL:</td>
              <td style="text-align: right; font-weight: bold; font-size: 12px; padding-top: 4px;">$${totalFinal.toLocaleString('es-CL')}</td>
            </tr>
          </table>
        </div>

        <!-- COMENTARIOS Y NOTAS -->
        <div style="margin-bottom: 12px;">
          <div class="box-title">Comentarios</div>
          <div class="box-content">${comentarios || 'Sin observaciones.'}</div>
        </div>

        <div>
          <div class="box-title">Notas</div>
          <div class="box-content" style="font-size: 9px; text-transform: uppercase;">
            COTIZACIÓN VALIDA POR 10 DÍAS DESDE LA FECHA DE EMISIÓN
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Abrir visor directo en nueva pestaña
  const printWin = window.open('', '_blank');
  if (printWin) {
    printWin.document.write(htmlDoc);
    printWin.document.close();
  } else if (typeof mostrarToast === 'function') {
    mostrarToast("Permite las ventanas emergentes (popups) en tu navegador.", "error");
  }
}
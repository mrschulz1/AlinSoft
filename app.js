// Verificación de Sesión Global con Supabase
async function checkAuth() {
    const db = initSupabase();
    if (!db) return;

    // Verificar si hay una sesión activa en Supabase
    const { data: { session } } = await db.auth.getSession();

    const esPaginaLogin = window.location.href.includes('index.html');

    if (!session && !esPaginaLogin) {
        // Si no está autenticado y no está en index.html, redirigir al login
        window.location.href = 'index.html';
    } else if (session && esPaginaLogin) {
        // Si ya está autenticado y está en index.html, mandar al dashboard
        window.location.href = 'dashboard.html';
    }

    return session;
}

// Función para Cerrar Sesión
async function logout() {
    const db = initSupabase();
    if (db) {
        await db.auth.signOut();
    }
    localStorage.removeItem('sesion_activa');
    window.location.href = 'index.html';
}

// Convertir foto a Base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}
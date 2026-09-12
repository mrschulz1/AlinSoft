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
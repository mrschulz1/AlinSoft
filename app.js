// Verificación de Sesión Global
function checkAuth() {
    const sesion = localStorage.getItem('sesion_activa');
    if (!sesion && !window.location.href.includes('index.html')) {
        window.location.href = 'index.html';
    }
    return JSON.parse(sesion || '{}');
}

function logout() {
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
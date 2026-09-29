/**
 * Componente Layout Global AlinSoft
 * Inyecta dinámicamente la barra lateral (Sidebar) y gestiona estados de navegación y auth.
 */

document.addEventListener("DOMContentLoaded", () => {
    initLayout();
});

function initLayout() {
    const sidebarContainer = document.getElementById("sidebar-container");
    if (!sidebarContainer) return;

    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    const navItems = [
        { href: "dashboard.html", icon: "bi-house-door", label: "Inicio" },
        { href: "ordenes.html", icon: "bi-file-earmark-text", label: "Órdenes" },
        { href: "presupuesto.html", icon: "bi-calculator", label: "Presupuestos" },
        { href: "mantenedor_base.html", icon: "bi-people", label: "Mantenedor de Datos" }
    ];

    const navLinksHTML = navItems.map(item => {
        const isActive = currentPath === item.href ? "active" : "";
        return `
            <li class="nav-item">
                <a href="${item.href}" class="nav-link ${isActive}">
                    <i class="bi ${item.icon} me-2"></i> ${item.label}
                </a>
            </li>
        `;
    }).join("");

    sidebarContainer.innerHTML = `
        <div class="sidebar d-flex flex-column justify-content-between">
            <div>
                <div class="d-flex align-items-center px-2 py-3 mb-3">
                    <i class="bi bi-cpu-fill text-danger fs-3 me-3"></i>
                    <span class="fs-4 brand-logo">AlinSoft<span class="text-danger">.io</span></span>
                </div>
                <ul class="nav nav-pills flex-column">
                    ${navLinksHTML}
                </ul>
            </div>
            <div class="px-2 py-2 border-top border-secondary border-opacity-25">
                <a href="#" onclick="logout(event)" class="nav-link text-danger p-2 mb-0">
                    <i class="bi bi-power me-2"></i> Cerrar Sesión
                </a>
            </div>
        </div>
    `;
}

async function logout(e) {
    if (e) e.preventDefault();
    try {
        const db = typeof initSupabase === 'function' ? initSupabase() : window.supabaseClient;
        if (db && db.auth) {
            await db.auth.signOut();
        }
    } catch (err) {
        console.error("Error durante el cierre de sesión:", err);
    } finally {
        window.location.href = "index.html";
    }
}
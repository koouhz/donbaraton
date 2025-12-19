// src/components/ProtectedRoute.jsx
// Componente para proteger rutas basado en roles de usuario
import { Navigate, useLocation } from 'react-router-dom';

// Definición de roles del sistema (sincronizado con Sidebar)
const ROLES = {
    ADMINISTRADOR: "administrador",
    CAJERO: "cajero",
    ENCARGADO_ALMACEN: "encargado de almacén",
    ENCARGADO_COMPRAS: "encargado de compras",
    SUPERVISOR_CAJA: "supervisor de caja",
    GERENTE: "gerente",
    CONTADOR: "contador",
    USUARIO: "usuario"
};

// Mapeo de IDs de rol a nombres
const ROLE_MAP = {
    1: ROLES.ADMINISTRADOR,
    2: ROLES.CAJERO,
    3: ROLES.ENCARGADO_ALMACEN,
    4: ROLES.ENCARGADO_COMPRAS,
    5: ROLES.SUPERVISOR_CAJA,
    6: ROLES.GERENTE,
    7: ROLES.CONTADOR,
    8: ROLES.USUARIO
};

// Mapeo de cargos a roles
const CARGO_MAP = {
    "Administrador": ROLES.ADMINISTRADOR,
    "Cajero": ROLES.CAJERO,
    "Encargado de Almacén": ROLES.ENCARGADO_ALMACEN,
    "Encargado de Compras": ROLES.ENCARGADO_COMPRAS,
    "Supervisor de Caja": ROLES.SUPERVISOR_CAJA,
    "Gerente": ROLES.GERENTE,
    "Contador": ROLES.CONTADOR
};

// Configuración de permisos de ruta (sincronizado con MENU_CONFIG del Sidebar)
const ROUTE_PERMISSIONS = {
    // Panel Principal - Casi todos pueden acceder
    '/dashboard': [ROLES.ADMINISTRADOR, ROLES.GERENTE, ROLES.ENCARGADO_COMPRAS, ROLES.SUPERVISOR_CAJA, ROLES.CONTADOR, ROLES.USUARIO],
    '/': [ROLES.ADMINISTRADOR, ROLES.GERENTE, ROLES.ENCARGADO_COMPRAS, ROLES.SUPERVISOR_CAJA, ROLES.CONTADOR, ROLES.USUARIO],

    // Administración
    '/roles-cargos': [ROLES.ADMINISTRADOR],
    '/personal': [ROLES.ADMINISTRADOR, ROLES.GERENTE],
    '/asistencias': [ROLES.ADMINISTRADOR, ROLES.GERENTE],
    '/cajeros': [ROLES.ADMINISTRADOR],

    // Clientes
    '/clientes': [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE],
    '/cuentas-por-pagar': [ROLES.ADMINISTRADOR, ROLES.CONTADOR],

    // Productos e Inventario
    '/productos': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN, ROLES.GERENTE],
    '/categorias': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN],
    '/inventario': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN, ROLES.GERENTE],
    '/movimientos-inventario': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN],
    '/alertas-stock': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN, ROLES.GERENTE],
    '/stock-no-vendible': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN],

    // Compras
    '/compras': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS, ROLES.ENCARGADO_ALMACEN, ROLES.GERENTE],
    '/ordenes-compra': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS],
    '/proveedores': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS, ROLES.GERENTE],
    '/reportes-compras': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS, ROLES.CONTADOR],

    // Ventas
    '/ventas': [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE, ROLES.CONTADOR],
    '/caja': [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE],
    '/cierre-caja': [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.CONTADOR],
    '/devoluciones': [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE],
    '/devoluciones-ventas': [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE],
    '/reportes-ventas': [ROLES.ADMINISTRADOR, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE, ROLES.CONTADOR],

    // Reportes y Administración
    '/reportes': [ROLES.ADMINISTRADOR, ROLES.GERENTE, ROLES.CONTADOR],
    '/reportes-rentabilidad': [ROLES.ADMINISTRADOR, ROLES.GERENTE, ROLES.CONTADOR],
    '/reportes-inventario': [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN, ROLES.GERENTE],
    '/balance-general': [ROLES.ADMINISTRADOR, ROLES.CONTADOR],
    '/backups': [ROLES.ADMINISTRADOR],
    '/configuracion': [ROLES.ADMINISTRADOR],
};

// Función para obtener el rol del usuario
const getUserRole = (user) => {
    if (!user) return null;

    // Intentar obtener el rol de diferentes propiedades
    if (user.roles?.nombre) {
        return user.roles.nombre.toLowerCase();
    }

    if (user.rol) {
        return user.rol.toLowerCase();
    }

    if (user.id_rol) {
        return ROLE_MAP[user.id_rol] || ROLES.USUARIO;
    }

    if (user.cargo) {
        return CARGO_MAP[user.cargo] || ROLES.USUARIO;
    }

    return ROLES.USUARIO;
};

// Función para verificar si un rol tiene acceso a una ruta
const hasAccess = (userRole, path) => {
    // Si no hay permisos definidos para la ruta, denegar acceso
    const allowedRoles = ROUTE_PERMISSIONS[path];

    if (!allowedRoles) {
        // Si la ruta no está explícitamente definida, solo admin tiene acceso
        return userRole === ROLES.ADMINISTRADOR;
    }

    return allowedRoles.includes(userRole);
};

// Componente ProtectedRoute
export default function ProtectedRoute({ children, user }) {
    const location = useLocation();
    const currentPath = location.pathname;

    // Obtener el rol del usuario
    const userRole = getUserRole(user);

    // Verificar acceso
    if (!hasAccess(userRole, currentPath)) {
        console.warn(`Acceso denegado: Usuario con rol "${userRole}" intentó acceder a "${currentPath}"`);

        // Redirigir a una página permitida según el rol
        return (
            <div style={styles.accessDenied}>
                <div style={styles.accessDeniedCard}>
                    <div style={styles.accessDeniedIcon}>🚫</div>
                    <h2 style={styles.accessDeniedTitle}>Acceso Denegado</h2>
                    <p style={styles.accessDeniedText}>
                        No tienes permisos para acceder a esta página.
                    </p>
                    <p style={styles.accessDeniedRole}>
                        Tu rol actual: <strong>{userRole || 'No definido'}</strong>
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        style={styles.backButton}
                    >
                        ← Volver
                    </button>
                </div>
            </div>
        );
    }

    return children;
}

// Estilos para la página de acceso denegado
const styles = {
    accessDenied: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        padding: '20px'
    },
    accessDeniedCard: {
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        border: '1px solid #ffcdd2'
    },
    accessDeniedIcon: {
        fontSize: '64px',
        marginBottom: '20px'
    },
    accessDeniedTitle: {
        margin: '0 0 15px 0',
        fontSize: '24px',
        fontWeight: '700',
        color: '#c62828'
    },
    accessDeniedText: {
        margin: '0 0 10px 0',
        fontSize: '16px',
        color: '#666'
    },
    accessDeniedRole: {
        margin: '0 0 25px 0',
        fontSize: '14px',
        color: '#888',
        padding: '10px 15px',
        background: '#f5f5f5',
        borderRadius: '8px'
    },
    backButton: {
        padding: '12px 30px',
        background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    }
};

// src/components/Sidebar.jsx (actualizado con navegación corregida)
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Home, Shield, Users, Package, 
  ShoppingCart, Receipt, Truck, Wallet, 
  LogOut, Eye, EyeOff,
  UserCheck, AlertCircle, Settings,
  Building, Calculator, Warehouse, ShoppingBag, CreditCard,
  BarChart3, Calendar, Bell, FileText, ClipboardList,
  Store, ChevronRight, CheckCircle
} from "lucide-react";

// ==================== CONSTANTES Y CONFIGURACIÓN ====================

// Definición de roles del sistema
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

// Permisos por rol
const ROLE_PERMISSIONS = {
  [ROLES.ADMINISTRADOR]: [
    "Panel Principal", "Roles y Permisos", "Personal", "Clientes",
    "Productos", "Categorías", "Proveedores", "Inventario",
    "Compras", "Ventas", "Caja", "Reportes", "Alertas",
    "Configuración", "Órdenes de Compra", "Cierre de Caja"
  ],
  [ROLES.CAJERO]: [
    "Panel Principal", "Ventas", "Caja", "Clientes", "Cierre de Caja"
  ],
  [ROLES.ENCARGADO_ALMACEN]: [
    "Panel Principal", "Inventario", "Productos", "Categorías",
    "Alertas de Stock", "Movimientos de Inventario"
  ],
  [ROLES.ENCARGADO_COMPRAS]: [
    "Panel Principal", "Compras", "Proveedores", "Órdenes de Compra"
  ],
  [ROLES.SUPERVISOR_CAJA]: [
    "Panel Principal", "Ventas", "Caja", "Cierre de Caja",
    "Reportes de Ventas", "Clientes"
  ],
  [ROLES.GERENTE]: [
    "Panel Principal", "Ventas", "Compras", "Inventario",
    "Reportes", "Alertas", "Personal", "Clientes", "Proveedores"
  ],
  [ROLES.CONTADOR]: [
    "Panel Principal", "Reportes", "Ventas", "Compras",
    "Caja", "Cuentas por Pagar", "Cierre de Caja"
  ],
  [ROLES.USUARIO]: ["Panel Principal"]
};

// Configuración del menú - IMPORTANTE: Rutas actualizadas
const MENU_CONFIG = [
  // SECCIÓN: PANEL PRINCIPAL
  { 
    label: "Panel Principal", 
    icon: Home, 
    path: "/dashboard",  // Cambiado de "/" a "/dashboard"
    exact: true,
    roles: Object.values(ROLES),
    description: "Dashboard y estadísticas"
  },
  
  // SECCIÓN: ADMINISTRACIÓN
  { 
    label: "Roles y Permisos", 
    icon: Shield, 
    path: "/roles-cargos",  // Cambiado de "/roles" a "/roles-cargos"
    roles: [ROLES.ADMINISTRADOR],
    description: "Gestión de roles y permisos"
  },
  { 
    label: "Personal", 
    icon: Users, 
    path: "/empleados",
    roles: [ROLES.ADMINISTRADOR, ROLES.GERENTE],
    description: "Gestión de empleados"
  },
  { 
    label: "Clientes", 
    icon: Building, 
    path: "/clientes",
    roles: [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE],
    description: "Gestión de clientes"
  },
  
  // SECCIÓN: PRODUCTOS
  { 
    label: "Productos", 
    icon: Package, 
    path: "/productos",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN, ROLES.GERENTE],
    description: "Gestión de productos"
  },
  { 
    label: "Categorías", 
    icon: ClipboardList, 
    path: "/categorias",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN],
    description: "Categorías de productos"
  },
  
  // SECCIÓN: PROVEEDORES Y COMPRAS
  { 
    label: "Proveedores", 
    icon: Truck, 
    path: "/proveedores",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS, ROLES.GERENTE],
    description: "Gestión de proveedores"
  },
  { 
    label: "Compras", 
    icon: ShoppingBag, 
    path: "/compras",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS],
    description: "Órdenes de compra"
  },
  
  // SECCIÓN: INVENTARIO
  { 
    label: "Inventario", 
    icon: Warehouse, 
    path: "/inventario",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN, ROLES.GERENTE],
    description: "Control de stock"
  },
  
  // SECCIÓN: VENTAS
  { 
    label: "Ventas", 
    icon: ShoppingCart, 
    path: "/ventas",
    roles: [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE, ROLES.CONTADOR],
    description: "Registro de ventas"
  },
  { 
    label: "Caja", 
    icon: Receipt, 
    path: "/caja",
    roles: [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA],
    description: "Operaciones de caja"
  },
  { 
    label: "Cierre de Caja", 
    icon: Calculator, 
    path: "/cierre-caja",
    roles: [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.CONTADOR],
    description: "Cierre diario de caja"
  },
  
  // SECCIÓN: REPORTES
  { 
    label: "Reportes", 
    icon: BarChart3, 
    path: "/reportes",
    roles: [ROLES.ADMINISTRADOR, ROLES.GERENTE, ROLES.CONTADOR],
    description: "Reportes del sistema"
  },
  
  // SECCIÓN: SISTEMA
  { 
    label: "Configuración", 
    icon: Settings, 
    path: "/configuracion",
    roles: [ROLES.ADMINISTRADOR],
    description: "Configuración general"
  },
];

// Configuración de colores por rol (usando los del Dashboard)
const ROLE_COLORS = {
  [ROLES.ADMINISTRADOR]: "#1a5d1a", // Verde oscuro
  [ROLES.CAJERO]: "#2e8b57", // Verde mar
  [ROLES.ENCARGADO_ALMACEN]: "#3cb371", // Verde medio
  [ROLES.ENCARGADO_COMPRAS]: "#20b2aa", // Verde azulado
  [ROLES.SUPERVISOR_CAJA]: "#5f9ea0", // Verde azulado oscuro
  [ROLES.GERENTE]: "#8fbc8f", // Verde grisáceo
  [ROLES.CONTADOR]: "#66cdaa", // Verde aguamarina
  [ROLES.USUARIO]: "#98fb98" // Verde claro
};

// Configuración de badges por rol
const ROLE_BADGES = {
  [ROLES.ADMINISTRADOR]: "ADM",
  [ROLES.CAJERO]: "CAJ",
  [ROLES.ENCARGADO_ALMACEN]: "ALM",
  [ROLES.ENCARGADO_COMPRAS]: "COM",
  [ROLES.SUPERVISOR_CAJA]: "SUP",
  [ROLES.GERENTE]: "GER",
  [ROLES.CONTADOR]: "CON",
  [ROLES.USUARIO]: "USR"
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function Sidebar({ onLogout, empleado }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Efecto para actualizar breadcrumbs y página actual
  useEffect(() => {
    // Obtener la página actual basada en la ruta
    const currentPath = location.pathname;
    const currentMenuItem = MENU_CONFIG.find(item => item.path === currentPath);
    
    if (currentMenuItem) {
      setCurrentPage(currentMenuItem.label);
      
      // Crear breadcrumbs
      const crumbs = [
        { label: "Inicio", path: "/dashboard" }
      ];
      
      if (currentPath !== "/dashboard") {
        crumbs.push({ 
          label: currentMenuItem.label, 
          path: currentPath 
        });
      }
      
      setBreadcrumbs(crumbs);
    } else {
      // Si no encuentra la ruta, usar la ruta actual
      setCurrentPage(getPageTitleFromPath(currentPath));
      
      const crumbs = [
        { label: "Inicio", path: "/dashboard" },
        { label: getPageTitleFromPath(currentPath), path: currentPath }
      ];
      setBreadcrumbs(crumbs);
    }
  }, [location.pathname]);

  const getPageTitleFromPath = (path) => {
    const item = MENU_CONFIG.find(item => item.path === path);
    return item ? item.label : "Página Actual";
  };

  // Todos los permisos disponibles en el sistema
  const allPermissions = Array.from(
    new Set(Object.values(ROLE_PERMISSIONS).flat())
  );

  // ==================== FUNCIONES AUXILIARES ====================

  const getEmpleadoRol = () => {
    if (!empleado) return ROLES.USUARIO;
    
    if (empleado.roles?.nombre) {
      return empleado.roles.nombre.toLowerCase();
    }
    
    if (empleado.rol) {
      return empleado.rol.toLowerCase();
    }
    
    if (empleado.id_rol) {
      return ROLE_MAP[empleado.id_rol] || ROLES.USUARIO;
    }
    
    if (empleado.cargo) {
      return CARGO_MAP[empleado.cargo] || ROLES.USUARIO;
    }
    
    return ROLES.USUARIO;
  };

  const getEmpleadoNombre = () => {
    if (!empleado) return "Usuario";
    
    if (empleado.nombres) {
      const nombre = empleado.nombres.split(' ')[0];
      if (empleado.apellido_paterno) {
        return `${nombre} ${empleado.apellido_paterno.charAt(0)}.`;
      }
      return nombre;
    }
    
    return "Usuario";
  };

  const getRoleColor = (roleName) => ROLE_COLORS[roleName] || "#1a5d1a";
  const getRoleBadge = (roleName) => ROLE_BADGES[roleName] || "USR";

  const getUnavailablePermissions = (empleadoRol) => {
    const availablePerms = ROLE_PERMISSIONS[empleadoRol] || [];
    return allPermissions.filter(perm => !availablePerms.includes(perm));
  };

  // ==================== LÓGICA DEL COMPONENTE ====================

  const empleadoRol = getEmpleadoRol();
  const filteredItems = MENU_CONFIG.filter(item => 
    item.roles.includes(empleadoRol)
  );
  const unavailablePermissions = getUnavailablePermissions(empleadoRol);

  // Función para determinar si un item está activo
  const isItemActive = (itemPath, exact = false) => {
    if (exact) {
      return location.pathname === itemPath;
    }
    return location.pathname.startsWith(itemPath) || 
           location.pathname === itemPath;
  };

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      onLogout();
    }
  };

  const toggleRoleInfo = () => setShowRoleInfo(!showRoleInfo);

  // Función para navegar a una página
  const handleNavigation = (path) => {
    navigate(path);
  };

  // ==================== ESTILOS ====================

  const styles = {
    sidebar: {
      width: "280px",
      height: "100vh",
      background: "linear-gradient(160deg, #f8f9fa 0%, #e8f5e9 100%)",
      padding: "25px 20px",
      display: "flex",
      flexDirection: "column",
      boxShadow: "2px 0 20px rgba(26, 93, 26, 0.08)",
      position: "fixed",
      left: 0,
      top: 0,
      zIndex: 999,
      overflow: "hidden",
      borderRight: "1px solid rgba(26, 93, 26, 0.1)"
    }
  };

  const sidebarStyles = {
    header: {
      marginBottom: "25px",
      flexShrink: 0
    },
    logoContainer: {
      position: "relative",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "center"
    },
    logoImage: {
      width: "80px",
      height: "80px",
      borderRadius: "16px",
      objectFit: "contain",
      background: "white",
      padding: "10px",
      border: "3px solid white",
      boxShadow: "0 6px 20px rgba(26, 93, 26, 0.2)"
    },
    logoFallback: {
      width: "80px",
      height: "80px",
      borderRadius: "16px",
      background: "linear-gradient(135deg, #1a5d1a, #2e8b57)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "22px",
      fontWeight: "bold",
      border: "3px solid white",
      boxShadow: "0 6px 20px rgba(26, 93, 26, 0.2)"
    },
    brandSection: {
      textAlign: "center",
      marginBottom: "25px"
    },
    brandTitle: {
      margin: "0 0 6px 0",
      fontSize: "24px",
      fontWeight: 700,
      background: "linear-gradient(135deg, #1a5d1a, #2e8b57)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text"
    },
    brandSubtitle: {
      fontSize: "13px",
      color: "#2e8b57",
      opacity: 0.9,
      letterSpacing: "0.5px"
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "16px",
      background: "rgba(255, 255, 255, 0.9)",
      borderRadius: "14px",
      border: "1px solid rgba(26, 93, 26, 0.15)",
      boxShadow: "0 4px 12px rgba(26, 93, 26, 0.05)",
      marginBottom: "15px"
    },
    userAvatar: {
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #1a5d1a, #2e8b57)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      flexShrink: 0,
      boxShadow: "0 4px 10px rgba(26, 93, 26, 0.2)"
    },
    userDetails: {
      flex: 1,
      minWidth: 0
    },
    userName: {
      margin: "0 0 6px 0",
      fontSize: "15px",
      fontWeight: 600,
      color: "#1a5d1a",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    },
    userRoleSection: {
      display: "flex",
      alignItems: "center",
      gap: "10px"
    },
    userRoleBadge: {
      padding: "3px 10px",
      borderRadius: "20px",
      color: "white",
      fontSize: "11px",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    roleInfoButton: {
      background: "rgba(26, 93, 26, 0.1)",
      border: "none",
      color: "#1a5d1a",
      cursor: "pointer",
      padding: "4px 8px",
      borderRadius: "8px",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px"
    },
    rolePermissionsInfo: {
      marginTop: "15px",
      padding: "18px",
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "14px",
      border: "1px solid rgba(26, 93, 26, 0.1)",
      maxHeight: "300px",
      overflowY: "auto",
      boxShadow: "0 6px 20px rgba(26, 93, 26, 0.08)"
    },
    currentPageBadge: {
      display: "inline-block",
      background: "rgba(26, 93, 26, 0.1)",
      color: "#1a5d1a",
      padding: "4px 10px",
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: 500,
      marginTop: "5px",
      display: "flex",
      alignItems: "center",
      gap: "5px"
    },
    unavailableSection: {
      marginTop: "18px",
      paddingTop: "18px",
      borderTop: "1px solid rgba(220, 53, 69, 0.15)"
    },
    permissionsHeader: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "12px",
      fontSize: "12px",
      fontWeight: 600,
      color: "#1a5d1a",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    permissionsList: {
      listStyle: "none",
      padding: 0,
      margin: 0
    },
    permissionItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "6px 0",
      fontSize: "12px",
      color: "#2e8b57"
    },
    permissionDotAvailable: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #28a745, #20c997)",
      flexShrink: 0,
      boxShadow: "0 2px 4px rgba(40, 167, 69, 0.3)"
    },
    permissionDotUnavailable: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #dc3545, #e83e8c)",
      flexShrink: 0,
      boxShadow: "0 2px 4px rgba(220, 53, 69, 0.3)"
    },
    permissionTextAvailable: {
      color: "#28a745",
      fontWeight: 500
    },
    permissionTextUnavailable: {
      color: "#dc3545",
      fontWeight: 500
    },
    sidebarNav: {
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      paddingRight: "8px"
    },
    navList: {
      listStyle: "none",
      padding: 0,
      margin: 0
    },
    navItem: {
      marginBottom: "8px",
      borderRadius: "12px",
      overflow: "hidden",
      transition: "all 0.25s ease",
      background: "transparent",
      position: "relative",
      cursor: "pointer"
    },
    navItemActive: {
      background: "linear-gradient(135deg, rgba(26, 93, 26, 0.1), rgba(46, 139, 87, 0.15))",
      color: "#1a5d1a",
      fontWeight: 600,
      boxShadow: "0 4px 15px rgba(26, 93, 26, 0.1)"
    },
    navLink: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "14px 16px",
      color: "inherit",
      textDecoration: "none",
      fontSize: "14px",
      transition: "all 0.25s ease",
      position: "relative",
      width: "100%"
    },
    navIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      background: "rgba(26, 93, 26, 0.08)",
      transition: "all 0.25s ease",
      flexShrink: 0,
      color: "#1a5d1a"
    },
    navLabel: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      flex: 1
    },
    navActiveBadge: {
      background: "linear-gradient(135deg, #1a5d1a, #2e8b57)",
      color: "white",
      fontSize: "10px",
      padding: "2px 6px",
      borderRadius: "10px",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "3px"
    },
    navIndicator: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "4px",
      background: "linear-gradient(to bottom, #1a5d1a, #2e8b57)",
      borderRadius: "0 4px 4px 0",
      boxShadow: "0 2px 8px rgba(26, 93, 26, 0.3)"
    },
    noPermissions: {
      textAlign: "center",
      padding: "50px 20px",
      color: "#2e8b57"
    },
    noPermissionsIcon: {
      opacity: 0.5,
      marginBottom: "18px",
      color: "#1a5d1a"
    },
    noPermissionsTitle: {
      margin: "0 0 10px 0",
      fontSize: "17px",
      fontWeight: 600,
      color: "#1a5d1a"
    },
    noPermissionsDescription: {
      margin: 0,
      fontSize: "14px",
      opacity: 0.7,
      lineHeight: 1.5
    },
    sidebarFooter: {
      marginTop: "20px",
      flexShrink: 0
    },
    logoutButton: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      width: "100%",
      padding: "14px 16px",
      background: "linear-gradient(135deg, rgba(26, 93, 26, 0.1), rgba(220, 53, 69, 0.1))",
      border: "1px solid rgba(220, 53, 69, 0.2)",
      borderRadius: "12px",
      color: "#dc3545",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: 500,
      transition: "all 0.25s ease",
      marginBottom: "15px"
    },
    logoutIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "32px",
      height: "32px",
      borderRadius: "10px",
      background: "rgba(220, 53, 69, 0.15)"
    },
    sidebarCopyright: {
      fontSize: "12px",
      color: "#6c757d",
      textAlign: "center",
      opacity: 0.8,
      padding: "20px 0 10px",
      borderTop: "1px solid rgba(26, 93, 26, 0.1)",
      marginTop: "10px",
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    },
    version: {
      fontSize: "11px",
      opacity: 0.6,
      color: "#1a5d1a"
    }
  };

  // ==================== RENDER ====================

  // Si no hay empleado, mostrar estado de carga
  if (!empleado) {
    return (
      <aside style={styles.sidebar}>
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{
            width: "30px",
            height: "30px",
            border: "3px solid rgba(26, 93, 26, 0.2)",
            borderTop: "3px solid #1a5d1a",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 15px"
          }}></div>
          <p style={{ color: "#1a5d1a", fontSize: "14px" }}>Cargando...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside style={styles.sidebar}>
      {/* Header del Sidebar */}
      <div style={sidebarStyles.header}>
        {/* Logo con imagen */}
        <div style={sidebarStyles.logoContainer}>
          {!logoError ? (
            <img
              src="../logo/images.jpg"
              alt="Logo Supermercado"
              style={sidebarStyles.logoImage}
              onError={() => setLogoError(true)}
              onLoad={() => setLogoError(false)}
            />
          ) : (
            <div style={sidebarStyles.logoFallback}>
              <Store size={28} />
            </div>
          )}
        </div>
        
        <div style={sidebarStyles.brandSection}>
          <h2 style={sidebarStyles.brandTitle}>Supermercado</h2>
          <span style={sidebarStyles.brandSubtitle}>Gestión Comercial Inteligente</span>
        </div>
        
        {/* Información del usuario */}
        <div style={sidebarStyles.userInfo}>
          <div style={sidebarStyles.userAvatar}>
            <UserCheck size={18} />
          </div>
          <div style={sidebarStyles.userDetails}>
            <p style={sidebarStyles.userName}>
              {getEmpleadoNombre()}
            </p>
            <div style={sidebarStyles.userRoleSection}>
              <span 
                style={{
                  ...sidebarStyles.userRoleBadge,
                  background: `linear-gradient(135deg, ${getRoleColor(empleadoRol)}, ${ROLE_COLORS[empleadoRol]}99)`
                }}
                title={`Rol: ${empleadoRol}`}
              >
                {getRoleBadge(empleadoRol)}
              </span>
              <button 
                style={{
                  ...sidebarStyles.roleInfoButton,
                  background: showRoleInfo ? "rgba(26, 93, 26, 0.2)" : "rgba(26, 93, 26, 0.1)"
                }}
                onClick={toggleRoleInfo}
                title="Ver información de permisos"
              >
                {showRoleInfo ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
            
            {/* Indicador de página actual */}
            {currentPage && (
              <div style={sidebarStyles.currentPageBadge}>
                <CheckCircle size={10} />
                <span>{currentPage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Información de permisos del rol */}
        {showRoleInfo && (
          <div style={sidebarStyles.rolePermissionsInfo}>
            {/* Permisos disponibles (VERDE) */}
            <div>
              <div style={sidebarStyles.permissionsHeader}>
                <Settings size={14} />
                <span>Permisos disponibles - {empleadoRol.toUpperCase()}</span>
              </div>
              <ul style={sidebarStyles.permissionsList}>
                {(ROLE_PERMISSIONS[empleadoRol] || []).slice(0, 6).map((permiso, index) => (
                  <li key={`available-${index}`} style={sidebarStyles.permissionItem}>
                    <div style={sidebarStyles.permissionDotAvailable}></div>
                    <span style={sidebarStyles.permissionTextAvailable}>{permiso}</span>
                  </li>
                ))}
                {(ROLE_PERMISSIONS[empleadoRol] || []).length > 6 && (
                  <li style={sidebarStyles.permissionItem}>
                    <span style={{fontSize: '11px', color: '#1a5d1a', opacity: 0.7}}>
                      + {ROLE_PERMISSIONS[empleadoRol].length - 6} más...
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Permisos NO disponibles (ROJO) */}
            {unavailablePermissions.length > 0 && (
              <div style={sidebarStyles.unavailableSection}>
                <div style={sidebarStyles.permissionsHeader}>
                  <AlertCircle size={14} />
                  <span>Permisos restringidos</span>
                </div>
                <ul style={sidebarStyles.permissionsList}>
                  {unavailablePermissions.slice(0, 4).map((permiso, index) => (
                    <li key={`unavailable-${index}`} style={sidebarStyles.permissionItem}>
                      <div style={sidebarStyles.permissionDotUnavailable}></div>
                      <span style={sidebarStyles.permissionTextUnavailable}>{permiso}</span>
                    </li>
                  ))}
                  {unavailablePermissions.length > 4 && (
                    <li style={sidebarStyles.permissionItem}>
                      <span style={{fontSize: '11px', color: '#1a5d1a', opacity: 0.7}}>
                        + {unavailablePermissions.length - 4} más...
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navegación */}
      <nav style={sidebarStyles.sidebarNav}>
        {filteredItems.length === 0 ? (
          <div style={sidebarStyles.noPermissions}>
            <AlertCircle size={36} style={sidebarStyles.noPermissionsIcon} />
            <p style={sidebarStyles.noPermissionsTitle}>Sin permisos</p>
            <p style={sidebarStyles.noPermissionsDescription}>
              Tu rol de usuario no tiene acceso a las funciones del sistema.
            </p>
          </div>
        ) : (
          <ul style={sidebarStyles.navList}>
            {filteredItems.map((item, index) => {
              const active = isItemActive(item.path, item.exact);
              const IconComponent = item.icon;
              
              return (
                <li
                  key={index}
                  style={{
                    ...sidebarStyles.navItem,
                    ...(active ? sidebarStyles.navItemActive : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(26, 93, 26, 0.05)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.transform = "translateX(0)";
                    }
                  }}
                >
                  <div
                    onClick={() => handleNavigation(item.path)}
                    style={sidebarStyles.navLink}
                    title={item.description}
                  >
                    <span style={{
                      ...sidebarStyles.navIcon,
                      background: active ? "linear-gradient(135deg, #1a5d1a, #2e8b57)" : sidebarStyles.navIcon.background,
                      color: active ? "white" : "#1a5d1a",
                      boxShadow: active ? "0 4px 10px rgba(26, 93, 26, 0.3)" : "none"
                    }}>
                      <IconComponent size={16} />
                    </span>
                    <span style={sidebarStyles.navLabel}>
                      {item.label}
                    </span>
                    {active && (
                      <span style={sidebarStyles.navActiveBadge}>
                        <ChevronRight size={10} />
                        Activa
                      </span>
                    )}
                    {active && <div style={sidebarStyles.navIndicator} />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* Botón de Cerrar Sesión */}
      <div style={sidebarStyles.sidebarFooter}>
        <button
          onClick={handleLogout}
          style={{
            ...sidebarStyles.logoutButton,
            ':hover': {
              background: "linear-gradient(135deg, rgba(26, 93, 26, 0.15), rgba(220, 53, 69, 0.15))",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 15px rgba(220, 53, 69, 0.2)"
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(26, 93, 26, 0.15), rgba(220, 53, 69, 0.15))";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 15px rgba(220, 53, 69, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(26, 93, 26, 0.1), rgba(220, 53, 69, 0.1))";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
          title="Cerrar sesión del sistema"
        >
          <span style={sidebarStyles.logoutIcon}>
            <LogOut size={16} />
          </span>
          <span>Cerrar Sesión</span>
        </button>

        {/* Footer */}
        <div style={sidebarStyles.sidebarCopyright}>
          <div>© 2025 Sistema de Gestión</div>
          <span style={sidebarStyles.version}>v2.0 • Diseñado con React</span>
        </div>
      </div>

      {/* Estilos CSS inline */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Scrollbar personalizada para sidebar */
        nav::-webkit-scrollbar {
          width: 6px;
        }
        
        nav::-webkit-scrollbar-track {
          background: rgba(26, 93, 26, 0.05);
          border-radius: 3px;
        }
        
        nav::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #1a5d1a, #2e8b57);
          border-radius: 3px;
        }
        
        nav::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2e8b57, #1a5d1a);
        }

        /* Animación de entrada */
        aside {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </aside>
  );
}
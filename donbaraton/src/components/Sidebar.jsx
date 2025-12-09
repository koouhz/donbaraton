import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Home, Shield, Users, Package, 
  ShoppingCart, Receipt, Truck, Wallet, 
  Menu, X, LogOut, Eye, EyeOff,
  UserCheck, AlertCircle, Settings,
  Building, Calculator, Warehouse, ShoppingBag, CreditCard,
  BarChart3, Calendar, Bell, FileText, ClipboardList
} from "lucide-react";

// Importa tu logo - ajusta la ruta según donde tengas tu imagen
import logo from '../logo/images.jpg';

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

// Permisos por rol - centralizado para fácil mantenimiento
const ROLE_PERMISSIONS = {
  [ROLES.ADMINISTRADOR]: [
    "Panel Principal", "Roles y Permisos", "Personal", "Clientes",
    "Productos", "Categorías", "Proveedores", "Inventario",
    "Compras", "Ventas", "Caja", "Reportes",
    "Alertas", "Backups", "Configuración", "Órdenes de Compra",
    "Recepción de Mercadería", "Cuentas por Pagar", "Cierre de Caja",
    "Devoluciones", "Movimientos de Inventario", "Alertas de Stock",
    "Reportes de Inventario", "Reportes de Ventas", "Reportes de Compras",
    "Balance General", "Asistencias"
  ],
  [ROLES.CAJERO]: [
    "Panel Principal", "Ventas", "Caja", "Clientes", "Cierre de Caja"
  ],
  [ROLES.ENCARGADO_ALMACEN]: [
    "Panel Principal", "Inventario", "Productos", "Categorías",
    "Alertas de Stock", "Movimientos de Inventario", "Reportes de Inventario"
  ],
  [ROLES.ENCARGADO_COMPRAS]: [
    "Panel Principal", "Compras", "Proveedores", "Órdenes de Compra",
    "Recepción de Mercadería", "Cuentas por Pagar", "Reportes de Compras"
  ],
  [ROLES.SUPERVISOR_CAJA]: [
    "Panel Principal", "Ventas", "Caja", "Cierre de Caja",
    "Reportes de Ventas", "Devoluciones", "Clientes"
  ],
  [ROLES.GERENTE]: [
    "Panel Principal", "Ventas", "Compras", "Inventario",
    "Reportes", "Alertas", "Personal", "Clientes", "Proveedores", "Asistencias"
  ],
  [ROLES.CONTADOR]: [
    "Panel Principal", "Reportes", "Ventas", "Compras",
    "Caja", "Cuentas por Pagar", "Balance General", "Reportes de Ventas",
    "Reportes de Compras", "Cierre de Caja"
  ],
  [ROLES.USUARIO]: ["Panel Principal"]
};

// Configuración del menú - separada del componente para mayor claridad
const MENU_CONFIG = [
  // SECCIÓN: PANEL PRINCIPAL
  { 
    label: "Panel Principal", 
    icon: Home, 
    path: "/",
    roles: Object.values(ROLES), // Todos los roles tienen acceso
    description: "Dashboard y estadísticas generales",
    section: "general"
  },
  
  // SECCIÓN: ADMINISTRACIÓN
  { 
    label: "Roles y Permisos", 
    icon: Shield, 
    path: "/roles",
    roles: [ROLES.ADMINISTRADOR],
    description: "Gestión de roles y permisos del sistema",
    section: "administracion"
  },
  { 
    label: "Personal", 
    icon: Users, 
    path: "/empleados",
    roles: [ROLES.ADMINISTRADOR, ROLES.GERENTE],
    description: "Gestión de empleados y usuarios",
    section: "administracion"
  },
  { 
    label: "Clientes", 
    icon: Building, 
    path: "/clientes",
    roles: [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE],
    description: "Gestión de clientes y registro",
    section: "administracion"
  },
  
  // SECCIÓN: PRODUCTOS
  { 
    label: "Productos", 
    icon: Package, 
    path: "/productos",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN, ROLES.GERENTE],
    description: "Gestión de productos y precios",
    section: "productos"
  },
  { 
    label: "Categorías", 
    icon: ClipboardList, 
    path: "/categorias",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN],
    description: "Categorías y clasificación de productos",
    section: "productos"
  },
  
  // SECCIÓN: PROVEEDORES Y COMPRAS
  { 
    label: "Proveedores", 
    icon: Truck, 
    path: "/proveedores",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS, ROLES.GERENTE],
    description: "Gestión de proveedores",
    section: "compras"
  },
  { 
    label: "Compras", 
    icon: ShoppingBag, 
    path: "/compras",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS],
    description: "Órdenes de compra y recepción",
    section: "compras"
  },
  { 
    label: "Órdenes de Compra", 
    icon: FileText, 
    path: "/ordenes-compra",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS],
    description: "Crear y gestionar órdenes de compra",
    section: "compras"
  },
  { 
    label: "Cuentas por Pagar", 
    icon: CreditCard, 
    path: "/cuentas-por-pagar",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS, ROLES.CONTADOR],
    description: "Gestión de deudas con proveedores",
    section: "compras"
  },
  
  // SECCIÓN: INVENTARIO
  { 
    label: "Inventario", 
    icon: Warehouse, 
    path: "/inventario",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN, ROLES.GERENTE],
    description: "Control de stock y existencia",
    section: "inventario"
  },
  { 
    label: "Movimientos de Inventario", 
    icon: BarChart3, 
    path: "/movimientos-inventario",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN],
    description: "Historial de entradas y salidas",
    section: "inventario"
  },
  { 
    label: "Alertas de Stock", 
    icon: Bell, 
    path: "/alertas-stock",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_ALMACEN],
    description: "Alertas de stock mínimo y vencimientos",
    section: "inventario"
  },
  
  // SECCIÓN: VENTAS
  { 
    label: "Ventas", 
    icon: ShoppingCart, 
    path: "/ventas",
    roles: [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE, ROLES.CONTADOR],
    description: "Registro y gestión de ventas",
    section: "ventas"
  },
  { 
    label: "Caja", 
    icon: Receipt, 
    path: "/caja",
    roles: [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA],
    description: "Operaciones de caja y pagos",
    section: "ventas"
  },
  { 
    label: "Cierre de Caja", 
    icon: Calculator, 
    path: "/cierre-caja",
    roles: [ROLES.ADMINISTRADOR, ROLES.CAJERO, ROLES.SUPERVISOR_CAJA, ROLES.CONTADOR],
    description: "Cierre diario de caja",
    section: "ventas"
  },
  { 
    label: "Devoluciones", 
    icon: ShoppingCart, 
    path: "/devoluciones",
    roles: [ROLES.ADMINISTRADOR, ROLES.SUPERVISOR_CAJA],
    description: "Gestión de devoluciones de productos",
    section: "ventas"
  },
  
  // SECCIÓN: REPORTES
  { 
    label: "Reportes", 
    icon: BarChart3, 
    path: "/reportes",
    roles: [ROLES.ADMINISTRADOR, ROLES.GERENTE, ROLES.CONTADOR],
    description: "Reportes y análisis del sistema",
    section: "reportes"
  },
  { 
    label: "Reportes de Ventas", 
    icon: BarChart3, 
    path: "/reportes-ventas",
    roles: [ROLES.ADMINISTRADOR, ROLES.SUPERVISOR_CAJA, ROLES.GERENTE, ROLES.CONTADOR],
    description: "Reportes específicos de ventas",
    section: "reportes"
  },
  { 
    label: "Reportes de Compras", 
    icon: BarChart3, 
    path: "/reportes-compras",
    roles: [ROLES.ADMINISTRADOR, ROLES.ENCARGADO_COMPRAS, ROLES.CONTADOR],
    description: "Reportes de compras y proveedores",
    section: "reportes"
  },
  { 
    label: "Balance General", 
    icon: Calculator, 
    path: "/balance",
    roles: [ROLES.ADMINISTRADOR, ROLES.CONTADOR],
    description: "Balance financiero y contable",
    section: "reportes"
  },
  
  // SECCIÓN: SISTEMA
  { 
    label: "Backups", 
    icon: FileText, 
    path: "/backups",
    roles: [ROLES.ADMINISTRADOR],
    description: "Copia de seguridad del sistema",
    section: "sistema"
  },
  { 
    label: "Configuración", 
    icon: Settings, 
    path: "/configuracion",
    roles: [ROLES.ADMINISTRADOR],
    description: "Configuración general del sistema",
    section: "sistema"
  },
  { 
    label: "Asistencias", 
    icon: Calendar, 
    path: "/asistencias",
    roles: [ROLES.ADMINISTRADOR, ROLES.GERENTE],
    description: "Control de asistencias del personal",
    section: "administracion"
  },
];

// Configuración de colores por rol
const ROLE_COLORS = {
  [ROLES.ADMINISTRADOR]: "#dc3545", // Rojo
  [ROLES.CAJERO]: "#28a745", // Verde
  [ROLES.ENCARGADO_ALMACEN]: "#17a2b8", // Celeste
  [ROLES.ENCARGADO_COMPRAS]: "#007bff", // Azul
  [ROLES.SUPERVISOR_CAJA]: "#6f42c1", // Púrpura
  [ROLES.GERENTE]: "#fd7e14", // Naranja
  [ROLES.CONTADOR]: "#20c997", // Verde azulado
  [ROLES.USUARIO]: "#6c757d" // Gris
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

// ==================== HOOKS PERSONALIZADOS ====================

const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return isMobile;
};

// ==================== COMPONENTES AUXILIARES ====================

const LoadingState = () => (
  <aside style={styles.sidebarLoading}>
    <div style={styles.loadingContent}>
      <div style={styles.loadingSpinner}></div>
      <p>Cargando información...</p>
    </div>
  </aside>
);

const MobileMenuButton = ({ isOpen, toggleMenu }) => (
  <button 
    onClick={toggleMenu}
    style={styles.mobileMenuButton}
    aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
  >
    {isOpen ? <X size={20} /> : <Menu size={20} />}
  </button>
);

const MobileOverlay = ({ closeMenu }) => (
  <div
    onClick={closeMenu}
    style={styles.sidebarOverlay}
  />
);

const Logo = ({ logo }) => (
  <div style={sidebarStyles.logoContainer}>
    <img 
      src={logo} 
      alt="Don Baratón Logo" 
      style={sidebarStyles.logoImage}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
    <div style={sidebarStyles.logoFallback}>
      DB
    </div>
  </div>
);

const UserInfo = ({ 
  empleado, 
  empleadoRol, 
  showRoleInfo, 
  toggleRoleInfo,
  getEmpleadoNombre,
  getRoleColor,
  getRoleBadge 
}) => (
  <div style={sidebarStyles.userInfo}>
    <div style={sidebarStyles.userAvatar}>
      <UserCheck size={16} />
    </div>
    <div style={sidebarStyles.userDetails}>
      <p style={sidebarStyles.userName}>
        {getEmpleadoNombre(empleado)}
      </p>
      <div style={sidebarStyles.userRoleSection}>
        <span 
          style={{
            ...sidebarStyles.userRoleBadge,
            backgroundColor: getRoleColor(empleadoRol)
          }}
          title={`Rol: ${empleadoRol.charAt(0).toUpperCase() + empleadoRol.slice(1)}`}
        >
          {getRoleBadge(empleadoRol)}
        </span>
        <button 
          style={sidebarStyles.roleInfoButton}
          onClick={toggleRoleInfo}
          title="Ver información de permisos"
        >
          {showRoleInfo ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      </div>
    </div>
  </div>
);

const RolePermissionsInfo = ({ empleadoRol, unavailablePermissions }) => (
  <div style={sidebarStyles.rolePermissionsInfo}>
    <PermissionsSection 
      title={`Permisos disponibles - ${empleadoRol.toUpperCase()}`}
      permissions={ROLE_PERMISSIONS[empleadoRol] || []}
      isAvailable={true}
    />
    
    {unavailablePermissions.length > 0 && (
      <div style={sidebarStyles.unavailableSection}>
        <PermissionsSection 
          title="Permisos restringidos"
          permissions={unavailablePermissions}
          isAvailable={false}
        />
      </div>
    )}
  </div>
);

const PermissionsSection = ({ title, permissions, isAvailable }) => (
  <div>
    <div style={sidebarStyles.permissionsHeader}>
      {isAvailable ? <Settings size={14} /> : <AlertCircle size={14} />}
      <span>{title}</span>
    </div>
    <ul style={sidebarStyles.permissionsList}>
      {permissions.slice(0, isAvailable ? permissions.length : 5).map((permiso, index) => (
        <li key={`${isAvailable ? 'available' : 'unavailable'}-${index}`} 
            style={sidebarStyles.permissionItem}>
          <div style={{
            ...sidebarStyles.permissionDot,
            backgroundColor: isAvailable ? "#28a745" : "#dc3545"
          }}></div>
          <span style={{
            ...sidebarStyles.permissionText,
            color: isAvailable ? "#28a745" : "#dc3545"
          }}>{permiso}</span>
        </li>
      ))}
      {!isAvailable && permissions.length > 5 && (
        <li style={sidebarStyles.permissionItem}>
          <span style={{fontSize: '10px', color: '#6d4611'}}>
            + {permissions.length - 5} más...
          </span>
        </li>
      )}
    </ul>
  </div>
);

const Navigation = ({ filteredItems, location, isMobile, closeMenu }) => (
  <nav style={sidebarStyles.sidebarNav}>
    {filteredItems.length === 0 ? (
      <NoPermissions />
    ) : (
      <NavigationList 
        items={filteredItems} 
        location={location} 
        isMobile={isMobile} 
        closeMenu={closeMenu} 
      />
    )}
  </nav>
);

const NavigationList = ({ items, location, isMobile, closeMenu }) => {
  const sections = {};
  
  // Agrupar items por sección
  items.forEach(item => {
    if (!sections[item.section]) {
      sections[item.section] = [];
    }
    sections[item.section].push(item);
  });

  return (
    <ul style={sidebarStyles.navList}>
      {Object.entries(sections).map(([section, sectionItems]) => (
        <li key={section}>
          <div style={sidebarStyles.sectionDivider}></div>
          {sectionItems.map((item, index) => (
            <NavItem 
              key={index}
              item={item}
              isActive={location.pathname === item.path}
              isMobile={isMobile}
              closeMenu={closeMenu}
            />
          ))}
        </li>
      ))}
    </ul>
  );
};

const NavItem = ({ item, isActive, isMobile, closeMenu }) => {
  const IconComponent = item.icon;
  
  return (
    <li
      style={{
        ...sidebarStyles.navItem,
        ...(isActive ? sidebarStyles.navItemActive : {})
      }}
    >
      <Link
        to={item.path}
        style={sidebarStyles.navLink}
        onClick={() => isMobile && closeMenu()}
        title={item.description}
      >
        <span style={sidebarStyles.navIcon}>
          <IconComponent size={16} />
        </span>
        <span style={sidebarStyles.navLabel}>
          {item.label}
        </span>
        {isActive && <div style={sidebarStyles.navIndicator} />}
      </Link>
    </li>
  );
};

const NoPermissions = () => (
  <div style={sidebarStyles.noPermissions}>
    <AlertCircle size={32} style={sidebarStyles.noPermissionsIcon} />
    <p style={sidebarStyles.noPermissionsTitle}>Sin permisos</p>
    <p style={sidebarStyles.noPermissionsDescription}>
      Tu rol de usuario no tiene acceso a las funciones del sistema.
    </p>
  </div>
);

const Footer = ({ handleLogout }) => (
  <div style={sidebarStyles.sidebarFooter}>
    <button
      onClick={handleLogout}
      style={sidebarStyles.logoutButton}
      title="Cerrar sesión del sistema"
    >
      <span style={sidebarStyles.logoutIcon}>
        <LogOut size={16} />
      </span>
      <span>Cerrar Sesión</span>
    </button>

    <div style={sidebarStyles.sidebarCopyright}>
      © 2025 Don Baratón
      <span style={sidebarStyles.version}>v2.0.0</span>
    </div>
  </div>
);

// ==================== COMPONENTE PRINCIPAL ====================

export default function Sidebar({ onLogout, empleado }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useResponsive();
  const [isOpen, setIsOpen] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  // ==================== FUNCIONES AUXILIARES ====================

  const getEmpleadoRol = () => {
    if (!empleado) return ROLES.USUARIO;
    
    // Prioridad 1: roles.nombre
    if (empleado.roles?.nombre) {
      return empleado.roles.nombre.toLowerCase();
    }
    
    // Prioridad 2: campo rol
    if (empleado.rol) {
      return empleado.rol.toLowerCase();
    }
    
    // Prioridad 3: id_rol
    if (empleado.id_rol) {
      return ROLE_MAP[empleado.id_rol] || ROLES.USUARIO;
    }
    
    // Prioridad 4: cargo
    if (empleado.cargo) {
      return CARGO_MAP[empleado.cargo] || ROLES.USUARIO;
    }
    
    return ROLES.USUARIO;
  };

  const getEmpleadoNombre = (empleado) => {
    if (!empleado) return "Usuario";
    
    if (empleado.nombres) {
      const nombre = empleado.nombres.split(' ')[0];
      if (empleado.apellido_paterno) {
        return `${nombre} ${empleado.apellido_paterno.charAt(0)}.`;
      }
      return nombre;
    }
    
    if (empleado.nombre_completo) {
      return empleado.nombre_completo;
    }
    
    return "Usuario";
  };

  const getRoleColor = (roleName) => ROLE_COLORS[roleName] || "#6c757d";
  const getRoleBadge = (roleName) => ROLE_BADGES[roleName] || "USR";

  const getUnavailablePermissions = (empleadoRol) => {
    const availablePerms = ROLE_PERMISSIONS[empleadoRol] || [];
    const allPermissions = Object.values(ROLE_PERMISSIONS).flat();
    const uniquePermissions = [...new Set(allPermissions)];
    
    return uniquePermissions.filter(perm => !availablePerms.includes(perm));
  };

  // ==================== LÓGICA DEL COMPONENTE ====================

  const empleadoRol = getEmpleadoRol();
  const filteredItems = MENU_CONFIG.filter(item => 
    item.roles.includes(empleadoRol)
  );
  const unavailablePermissions = getUnavailablePermissions(empleadoRol);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      onLogout();
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const toggleRoleInfo = () => setShowRoleInfo(!showRoleInfo);

  // ==================== RENDER ====================

  if (!empleado) {
    return <LoadingState />;
  }

  return (
    <>
      {isMobile && <MobileMenuButton isOpen={isOpen} toggleMenu={toggleMenu} />}
      {isMobile && isOpen && <MobileOverlay closeMenu={closeMenu} />}

      <aside 
        style={{
          ...styles.sidebar,
          ...(isMobile ? styles.sidebarMobile : {}),
          ...(isOpen ? styles.sidebarOpen : {})
        }}
      >
        {/* Header */}
        <div style={sidebarStyles.header}>
          <Logo logo={logo} />
          
          <div style={sidebarStyles.brandSection}>
            <h2 style={sidebarStyles.brandTitle}>Don Baratón</h2>
            <span style={sidebarStyles.brandSubtitle}>Gestión Comercial</span>
          </div>
          
          <UserInfo 
            empleado={empleado}
            empleadoRol={empleadoRol}
            showRoleInfo={showRoleInfo}
            toggleRoleInfo={toggleRoleInfo}
            getEmpleadoNombre={getEmpleadoNombre}
            getRoleColor={getRoleColor}
            getRoleBadge={getRoleBadge}
          />

          {showRoleInfo && (
            <RolePermissionsInfo 
              empleadoRol={empleadoRol}
              unavailablePermissions={unavailablePermissions}
            />
          )}
        </div>

        {/* Navegación */}
        <Navigation 
          filteredItems={filteredItems}
          location={location}
          isMobile={isMobile}
          closeMenu={closeMenu}
        />

        {/* Footer */}
        <Footer handleLogout={handleLogout} />
      </aside>
    </>
  );
}

// ==================== ESTILOS ====================

const styles = {
  sidebarLoading: {
    width: "250px",
    height: "100vh",
    background: "linear-gradient(145deg, #f7dca1, #f2c786)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  loadingContent: {
    textAlign: "center",
    color: "#7a3b06"
  },
  loadingSpinner: {
    width: "30px",
    height: "30px",
    border: "3px solid rgba(122, 59, 6, 0.2)",
    borderTop: "3px solid #7a3b06",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 15px"
  },
  mobileMenuButton: {
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: 1001,
    background: "#7a3b06",
    color: "white",
    border: "none",
    borderRadius: "8px",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    transition: "all 0.3s ease"
  },
  sidebarOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 998
  },
  sidebar: {
    width: "280px",
    height: "100vh",
    background: "linear-gradient(145deg, #f7dca1, #f2c786)",
    padding: "25px 20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
    position: "relative",
    zIndex: 999,
    overflow: "hidden"
  },
  sidebarMobile: {
    position: "fixed",
    left: "-280px",
    top: 0,
    transition: "left 0.3s ease"
  },
  sidebarOpen: {
    left: 0
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
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #7a3b06",
    boxShadow: "0 4px 12px rgba(122, 59, 6, 0.2)",
    transition: "all 0.3s ease",
    cursor: "pointer"
  },
  logoFallback: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7a3b06, #a85a1a)",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    color: "#f7dca1",
    fontSize: "18px",
    fontWeight: "bold",
    border: "3px solid #7a3b06",
    boxShadow: "0 4px 12px rgba(122, 59, 6, 0.2)"
  },
  brandSection: {
    textAlign: "center",
    marginBottom: "20px"
  },
  brandTitle: {
    margin: "0 0 4px 0",
    fontSize: "22px",
    fontWeight: 700,
    color: "#7a3b06"
  },
  brandSubtitle: {
    fontSize: "13px",
    color: "#6d4611",
    opacity: 0.9
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    background: "rgba(122, 59, 6, 0.08)",
    borderRadius: "12px",
    border: "1px solid rgba(122, 59, 6, 0.1)"
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    background: "rgba(122, 59, 6, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#7a3b06",
    flexShrink: 0
  },
  userDetails: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    margin: "0 0 6px 0",
    fontSize: "14px",
    fontWeight: 600,
    color: "#7a3b06",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  userRoleSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  userRoleBadge: {
    padding: "2px 8px",
    borderRadius: "12px",
    color: "white",
    fontSize: "10px",
    fontWeight: 600,
    textTransform: "uppercase"
  },
  roleInfoButton: {
    background: "none",
    border: "none",
    color: "#6d4611",
    cursor: "pointer",
    padding: "2px",
    borderRadius: "4px",
    transition: "all 0.2s ease"
  },
  rolePermissionsInfo: {
    marginTop: "15px",
    padding: "15px",
    background: "rgba(255, 255, 255, 0.6)",
    borderRadius: "8px",
    border: "1px solid rgba(122, 59, 6, 0.1)",
    maxHeight: "300px",
    overflowY: "auto"
  },
  unavailableSection: {
    marginTop: "15px",
    paddingTop: "15px",
    borderTop: "1px solid rgba(220, 53, 69, 0.2)"
  },
  permissionsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#7a3b06"
  },
  permissionsList: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  permissionItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 0",
    fontSize: "11px",
    color: "#6d4611"
  },
  permissionDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0
  },
  permissionText: {
    fontWeight: 500
  },
  sidebarNav: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    paddingRight: "5px"
  },
  navList: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  sectionDivider: {
    height: "1px",
    background: "rgba(122, 59, 6, 0.1)",
    margin: "8px 0"
  },
  navItem: {
    marginBottom: "4px",
    borderRadius: "10px",
    overflow: "hidden",
    transition: "all 0.25s ease",
    background: "transparent",
    position: "relative",
    cursor: "pointer"
  },
  navItemActive: {
    background: "linear-gradient(135deg, #f7dca1, #e6b85c)",
    color: "#7a3b06",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(122, 59, 6, 0.15)"
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    color: "inherit",
    textDecoration: "none",
    fontSize: "14px",
    transition: "all 0.25s ease",
    position: "relative"
  },
  navIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(122, 59, 6, 0.08)",
    transition: "all 0.25s ease",
    flexShrink: 0
  },
  navLabel: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flex: 1
  },
  navIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "3px",
    background: "#7a3b06",
    borderRadius: "0 2px 2px 0"
  },
  noPermissions: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#6d4611"
  },
  noPermissionsIcon: {
    opacity: 0.5,
    marginBottom: "15px"
  },
  noPermissionsTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: 600,
    color: "#7a3b06"
  },
  noPermissionsDescription: {
    margin: 0,
    fontSize: "13px",
    opacity: 0.7,
    lineHeight: 1.4
  },
  sidebarFooter: {
    marginTop: "15px",
    flexShrink: 0
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    padding: "12px 16px",
    background: "rgba(122, 59, 6, 0.08)",
    border: "1px solid rgba(122, 59, 6, 0.2)",
    borderRadius: "10px",
    color: "#7a3b06",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.25s ease"
  },
  logoutIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: "rgba(122, 59, 6, 0.12)"
  },
  sidebarCopyright: {
    fontSize: "12px",
    color: "#6d4611",
    textAlign: "center",
    opacity: 0.8,
    padding: "15px 0 5px",
    borderTop: "1px solid rgba(122, 59, 6, 0.1)",
    marginTop: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  version: {
    fontSize: "10px",
    opacity: 0.6
  }
};
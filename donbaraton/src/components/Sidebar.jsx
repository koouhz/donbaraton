import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Home, Shield, DollarSign, Users, Package, 
  ShoppingCart, Receipt, Truck, Wallet, 
  Menu, X, LogOut, Eye, EyeOff,
  UserCheck, AlertCircle, Settings,
  Building, Calculator, Warehouse, ShoppingBag, CreditCard,
  BarChart3, Calendar, Bell, FileText, ClipboardList
} from "lucide-react";

// Importa tu logo - ajusta la ruta según donde tengas tu imagen
import logo from '../logo/images.jpg'; // Ajusta esta ruta

export default function Sidebar({ onLogout, empleado }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  // Definición de permisos por rol - ACTUALIZADO para Don Baratón
  const rolePermissions = {
    administrador: [
      "Panel Principal", "Roles y Permisos", "Personal", "Clientes",
      "Productos", "Categorías", "Proveedores", "Inventario",
      "Compras", "Ventas", "Caja", "Reportes",
      "Alertas", "Backups", "Configuración"
    ],
    cajero: [
      "Panel Principal", "Ventas", "Caja", "Clientes",
      "Cierre de Caja"
    ],
    "encargado de almacén": [
      "Panel Principal", "Inventario", "Productos", "Categorías",
      "Alertas de Stock", "Movimientos de Inventario", "Reportes de Inventario"
    ],
    "encargado de compras": [
      "Panel Principal", "Compras", "Proveedores", "Órdenes de Compra",
      "Recepción de Mercadería", "Cuentas por Pagar", "Reportes de Compras"
    ],
    "supervisor de caja": [
      "Panel Principal", "Ventas", "Caja", "Cierre de Caja",
      "Reportes de Ventas", "Devoluciones", "Clientes"
    ],
    gerente: [
      "Panel Principal", "Ventas", "Compras", "Inventario",
      "Reportes", "Alertas", "Personal", "Clientes", "Proveedores"
    ],
    contador: [
      "Panel Principal", "Reportes", "Ventas", "Compras",
      "Caja", "Cuentas por Pagar", "Balance General"
    ],
    usuario: [
      "Panel Principal"
    ]
  };

  // Todos los permisos disponibles en el sistema
  const allPermissions = [
    "Panel Principal", "Roles y Permisos", "Personal", "Clientes",
    "Productos", "Categorías", "Proveedores", "Inventario",
    "Compras", "Ventas", "Caja", "Reportes",
    "Alertas", "Backups", "Configuración", "Órdenes de Compra",
    "Recepción de Mercadería", "Cuentas por Pagar", "Cierre de Caja",
    "Devoluciones", "Movimientos de Inventario", "Alertas de Stock",
    "Reportes de Inventario", "Reportes de Ventas", "Reportes de Compras",
    "Balance General"
  ];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Items del menú con permisos - ACTUALIZADO para Don Baratón
  const menuItems = [
    { 
      label: "Panel Principal", 
      icon: Home, 
      path: "/",
      roles: ["administrador", "cajero", "encargado de almacén", "encargado de compras", "supervisor de caja", "gerente", "contador", "usuario"],
      description: "Dashboard y estadísticas generales"
    },
    // SECCIÓN: ADMINISTRACIÓN
    { 
      label: "Roles y Permisos", 
      icon: Shield, 
      path: "/roles",
      roles: ["administrador"],
      description: "Gestión de roles y permisos del sistema"
    },
    { 
      label: "Personal", 
      icon: Users, 
      path: "/empleados",
      roles: ["administrador", "gerente"],
      description: "Gestión de empleados y usuarios"
    },
    { 
      label: "Clientes", 
      icon: Building, 
      path: "/clientes",
      roles: ["administrador", "cajero", "supervisor de caja", "gerente"],
      description: "Gestión de clientes y registro"
    },
    // SECCIÓN: PRODUCTOS
    { 
      label: "Productos", 
      icon: Package, 
      path: "/productos",
      roles: ["administrador", "encargado de almacén", "gerente"],
      description: "Gestión de productos y precios"
    },
    { 
      label: "Categorías", 
      icon: ClipboardList, 
      path: "/categorias",
      roles: ["administrador", "encargado de almacén"],
      description: "Categorías y clasificación de productos"
    },
    // SECCIÓN: PROVEEDORES
    { 
      label: "Proveedores", 
      icon: Truck, 
      path: "/proveedores",
      roles: ["administrador", "encargado de compras", "gerente"],
      description: "Gestión de proveedores"
    },
    { 
      label: "Compras", 
      icon: ShoppingBag, 
      path: "/compras",
      roles: ["administrador", "encargado de compras"],
      description: "Órdenes de compra y recepción"
    },
    { 
      label: "Órdenes de Compra", 
      icon: FileText, 
      path: "/ordenes-compra",
      roles: ["administrador", "encargado de compras"],
      description: "Crear y gestionar órdenes de compra"
    },
    { 
      label: "Cuentas por Pagar", 
      icon: CreditCard, 
      path: "/cuentas-por-pagar",
      roles: ["administrador", "encargado de compras", "contador"],
      description: "Gestión de deudas con proveedores"
    },
    // SECCIÓN: INVENTARIO
    { 
      label: "Inventario", 
      icon: Warehouse, 
      path: "/inventario",
      roles: ["administrador", "encargado de almacén", "gerente"],
      description: "Control de stock y existencia"
    },
    { 
      label: "Movimientos de Inventario", 
      icon: BarChart3, 
      path: "/movimientos-inventario",
      roles: ["administrador", "encargado de almacén"],
      description: "Historial de entradas y salidas"
    },
    { 
      label: "Alertas de Stock", 
      icon: Bell, 
      path: "/alertas-stock",
      roles: ["administrador", "encargado de almacén"],
      description: "Alertas de stock mínimo y vencimientos"
    },
    // SECCIÓN: VENTAS
    { 
      label: "Ventas", 
      icon: ShoppingCart, 
      path: "/ventas",
      roles: ["administrador", "cajero", "supervisor de caja", "gerente", "contador"],
      description: "Registro y gestión de ventas"
    },
    { 
      label: "Caja", 
      icon: Receipt, 
      path: "/caja",
      roles: ["administrador", "cajero", "supervisor de caja"],
      description: "Operaciones de caja y pagos"
    },
    { 
      label: "Cierre de Caja", 
      icon: Calculator, 
      path: "/cierre-caja",
      roles: ["administrador", "cajero", "supervisor de caja", "contador"],
      description: "Cierre diario de caja"
    },
    { 
      label: "Devoluciones", 
      icon: ShoppingCart, 
      path: "/devoluciones",
      roles: ["administrador", "supervisor de caja"],
      description: "Gestión de devoluciones de productos"
    },
    // SECCIÓN: REPORTES
    { 
      label: "Reportes", 
      icon: BarChart3, 
      path: "/reportes",
      roles: ["administrador", "gerente", "contador"],
      description: "Reportes y análisis del sistema"
    },
    { 
      label: "Reportes de Ventas", 
      icon: BarChart3, 
      path: "/reportes-ventas",
      roles: ["administrador", "supervisor de caja", "gerente", "contador"],
      description: "Reportes específicos de ventas"
    },
    { 
      label: "Reportes de Compras", 
      icon: BarChart3, 
      path: "/reportes-compras",
      roles: ["administrador", "encargado de compras", "contador"],
      description: "Reportes de compras y proveedores"
    },
    { 
      label: "Balance General", 
      icon: Calculator, 
      path: "/balance",
      roles: ["administrador", "contador"],
      description: "Balance financiero y contable"
    },
    // SECCIÓN: SISTEMA
    { 
      label: "Backups", 
      icon: FileText, 
      path: "/backups",
      roles: ["administrador"],
      description: "Copia de seguridad del sistema"
    },
    { 
      label: "Configuración", 
      icon: Settings, 
      path: "/configuracion",
      roles: ["administrador"],
      description: "Configuración general del sistema"
    },
    { 
      label: "Asistencias", 
      icon: Calendar, 
      path: "/asistencias",
      roles: ["administrador", "gerente"],
      description: "Control de asistencias del personal"
    },
  ];

  // Función para obtener el rol del empleado
  const getEmpleadoRol = () => {
    if (!empleado) return "usuario";
    
    // Si viene del objeto empleado con relación roles
    if (empleado.roles && empleado.roles.nombre) {
      return empleado.roles.nombre.toLowerCase();
    }
    
    // Si viene directamente el campo rol
    if (empleado.rol) {
      return empleado.rol.toLowerCase();
    }
    
    // Si viene id_rol y necesitas mapearlo
    if (empleado.id_rol) {
      const rolMap = {
        1: "administrador",
        2: "cajero", 
        3: "encargado de almacén",
        4: "encargado de compras",
        5: "supervisor de caja",
        6: "gerente",
        7: "contador",
        8: "usuario"
      };
      return rolMap[empleado.id_rol] || "usuario";
    }
    
    // Si viene cargo (alternativa)
    if (empleado.cargo) {
      const cargoMap = {
        "Administrador": "administrador",
        "Cajero": "cajero",
        "Encargado de Almacén": "encargado de almacén",
        "Encargado de Compras": "encargado de compras",
        "Supervisor de Caja": "supervisor de caja",
        "Gerente": "gerente",
        "Contador": "contador"
      };
      return cargoMap[empleado.cargo] || "usuario";
    }
    
    return "usuario";
  };

  const empleadoRol = getEmpleadoRol();

  // Filtrar items según el rol del usuario
  const filteredItems = menuItems.filter(item => 
    item.roles.includes(empleadoRol)
  );

  // Obtener permisos NO disponibles para este rol
  const getUnavailablePermissions = () => {
    const availablePerms = rolePermissions[empleadoRol] || [];
    return allPermissions.filter(perm => !availablePerms.includes(perm));
  };

  const unavailablePermissions = getUnavailablePermissions();

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      onLogout();
    }
  };

  const getRoleColor = (roleName) => {
    const colors = {
      administrador: "#dc3545", // Rojo
      cajero: "#28a745", // Verde
      "encargado de almacén": "#17a2b8", // Celeste
      "encargado de compras": "#007bff", // Azul
      "supervisor de caja": "#6f42c1", // Púrpura
      gerente: "#fd7e14", // Naranja
      contador: "#20c997", // Verde azulado
      usuario: "#6c757d" // Gris
    };
    return colors[roleName] || "#6c757d";
  };

  const getRoleBadge = (roleName) => {
    const badges = {
      administrador: "ADM",
      cajero: "CAJ",
      "encargado de almacén": "ALM",
      "encargado de compras": "COM",
      "supervisor de caja": "SUP",
      gerente: "GER",
      contador: "CON",
      usuario: "USR"
    };
    return badges[roleName] || "USR";
  };

  // Función para obtener el nombre formateado del empleado
  const getEmpleadoNombre = () => {
    if (!empleado) return "Usuario";
    
    // Si hay nombres y apellidos separados
    if (empleado.nombres) {
      const nombre = empleado.nombres.split(' ')[0]; // Primer nombre
      if (empleado.apellido_paterno) {
        return `${nombre} ${empleado.apellido_paterno.charAt(0)}.`;
      }
      return nombre;
    }
    
    // Si viene como campo completo
    if (empleado.nombre_completo) {
      return empleado.nombre_completo;
    }
    
    return "Usuario";
  };

  // Estilos en objetos JavaScript
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

  // Agregar estilos globales para las animaciones
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  // Si no hay empleado, mostrar estado de carga
  if (!empleado) {
    return (
      <aside style={styles.sidebarLoading}>
        <div style={styles.loadingContent}>
          <div style={styles.loadingSpinner}></div>
          <p>Cargando información...</p>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Botón móvil del menú */}
      {isMobile && (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={styles.mobileMenuButton}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Overlay para móvil */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={styles.sidebarOverlay}
        />
      )}

      {/* Sidebar principal */}
      <aside 
        style={{
          ...styles.sidebar,
          ...(isMobile ? styles.sidebarMobile : {}),
          ...(isOpen ? styles.sidebarOpen : {})
        }}
      >
        {/* Header del Sidebar */}
        <div style={sidebarStyles.header}>
          {/* Logo minimalista */}
          <div style={sidebarStyles.logoContainer}>
            <img 
              src={logo} 
              alt="Don Baratón Logo" 
              style={sidebarStyles.logoImage}
              onError={(e) => {
                // Fallback si la imagen no carga
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            {/* Fallback en caso de que la imagen no cargue */}
            <div style={sidebarStyles.logoFallback}>
              DB
            </div>
          </div>
          
          <div style={sidebarStyles.brandSection}>
            <h2 style={sidebarStyles.brandTitle}>Don Baratón</h2>
            <span style={sidebarStyles.brandSubtitle}>Gestión Comercial</span>
          </div>
          
          {/* Información del usuario */}
          <div style={sidebarStyles.userInfo}>
            <div style={sidebarStyles.userAvatar}>
              <UserCheck size={16} />
            </div>
            <div style={sidebarStyles.userDetails}>
              <p style={sidebarStyles.userName}>
                {getEmpleadoNombre()}
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
                  onClick={() => setShowRoleInfo(!showRoleInfo)}
                  title="Ver información de permisos"
                >
                  {showRoleInfo ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
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
                  {rolePermissions[empleadoRol]?.map((permiso, index) => (
                    <li key={`available-${index}`} style={sidebarStyles.permissionItem}>
                      <div style={sidebarStyles.permissionDotAvailable}></div>
                      <span style={sidebarStyles.permissionTextAvailable}>{permiso}</span>
                    </li>
                  ))}
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
                    {unavailablePermissions.slice(0, 5).map((permiso, index) => (
                      <li key={`unavailable-${index}`} style={sidebarStyles.permissionItem}>
                        <div style={sidebarStyles.permissionDotUnavailable}></div>
                        <span style={sidebarStyles.permissionTextUnavailable}>{permiso}</span>
                      </li>
                    ))}
                    {unavailablePermissions.length > 5 && (
                      <li style={sidebarStyles.permissionItem}>
                        <span style={{fontSize: '10px', color: '#6d4611'}}>
                          + {unavailablePermissions.length - 5} más...
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
              <AlertCircle size={32} style={sidebarStyles.noPermissionsIcon} />
              <p style={sidebarStyles.noPermissionsTitle}>Sin permisos</p>
              <p style={sidebarStyles.noPermissionsDescription}>
                Tu rol de usuario no tiene acceso a las funciones del sistema.
              </p>
            </div>
          ) : (
            <ul style={sidebarStyles.navList}>
              {filteredItems.map((item, index) => {
                const active = location.pathname === item.path;
                const IconComponent = item.icon;
                
                return (
                  <li
                    key={index}
                    style={{
                      ...sidebarStyles.navItem,
                      ...(active ? sidebarStyles.navItemActive : {})
                    }}
                  >
                    <Link
                      to={item.path}
                      style={sidebarStyles.navLink}
                      onClick={() => isMobile && setIsOpen(false)}
                      title={item.description}
                    >
                      <span style={sidebarStyles.navIcon}>
                        <IconComponent size={16} />
                      </span>
                      <span style={sidebarStyles.navLabel}>
                        {item.label}
                      </span>
                      {active && <div style={sidebarStyles.navIndicator} />}
                    </Link>
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
            style={sidebarStyles.logoutButton}
            title="Cerrar sesión del sistema"
          >
            <span style={sidebarStyles.logoutIcon}>
              <LogOut size={16} />
            </span>
            <span>Cerrar Sesión</span>
          </button>

          {/* Footer */}
          <div style={sidebarStyles.sidebarCopyright}>
            © 2025 Don Baratón
            <span style={sidebarStyles.version}>v2.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

// Estilos CSS en objetos JavaScript
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
  permissionDotAvailable: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#28a745",
    flexShrink: 0
  },
  permissionDotUnavailable: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#dc3545",
    flexShrink: 0
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
    paddingRight: "5px"
  },
  navList: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  navItem: {
    marginBottom: "6px",
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
    textOverflow: "ellipsis"
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
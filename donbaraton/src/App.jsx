// src/App.jsx
import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loading para mejor rendimiento - carga las páginas solo cuando se necesitan
const Dashboard = lazy(() => import("./pages/Dashboard"));
const RolesYCargos = lazy(() => import("./pages/RolesYCargos"));

// Gestión de Personal
const Personal = lazy(() => import("./pages/Personal"));
const Asistencias = lazy(() => import("./pages/Asistencias"));

// Inventario y Productos
const Productos = lazy(() => import("./pages/Productos"));
const Categorias = lazy(() => import("./pages/Categorias"));
const Inventario = lazy(() => import("./pages/Inventario"));
const MovimientosInventario = lazy(() => import("./pages/MovimientosInventario"));
const AlertasStock = lazy(() => import("./pages/AlertasStock"));
const StockNoVendible = lazy(() => import("./pages/StockNoVendible"));

// Ventas
const Ventas = lazy(() => import("./pages/Ventas"));
const Caja = lazy(() => import("./pages/Caja"));
const CierreCaja = lazy(() => import("./pages/CierreCaja"));
const Devoluciones = lazy(() => import("./pages/Devoluciones"));
const DevolucionesVentas = lazy(() => import("./pages/DevolucionesVentas"));
const ReportesVentas = lazy(() => import("./pages/ReportesVentas"));

// Compras
const Compra = lazy(() => import("./pages/Compra"));
const OrdenesCompra = lazy(() => import("./pages/OrdenesCompra"));
const Proveedores = lazy(() => import("./pages/Proveedores"));
const ReportesCompras = lazy(() => import("./pages/ReportesCompras"));

// Clientes
const Clientes = lazy(() => import("./pages/Clientes"));
const CuentasPorPagar = lazy(() => import("./pages/CuentasPorPagar"));

// Reportes y Administración
const Reportes = lazy(() => import("./pages/Reportes"));
const ReportesRentabilidad = lazy(() => import("./pages/ReportesRentabilidad"));
const ReportesInventario = lazy(() => import("./pages/ReportesInventario"));
const BalanceGeneral = lazy(() => import("./pages/BalanceGeneral"));
const Backups = lazy(() => import("./pages/Backups"));
const Configuracion = lazy(() => import("./pages/Configuracion"));
const Cajeros = lazy(() => import("./pages/Cajeros"));

// Componente de carga mientras se cargan las páginas
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
      flexDirection: "column",
      gap: "15px",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        border: "4px solid #e9ecef",
        borderTop: "4px solid #1a5d1a",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
    <span style={{ color: "#1a5d1a", fontSize: "14px" }}>Cargando página...</span>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Revisar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #f0f9f0 0%, #c8e6c9 100%)",
        }}
      >
        <div style={{ color: "#1a5d1a", fontSize: "18px" }}>Cargando...</div>
      </div>
    );
  }

  // Componente helper para proteger rutas
  const Protected = ({ children }) => (
    <ProtectedRoute user={user}>{children}</ProtectedRoute>
  );

  return (
    <>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout onLogout={handleLogout} user={user} />}>
              {/* Panel Principal */}
              <Route index element={<Protected><Dashboard /></Protected>} />
              <Route path="dashboard" element={<Protected><Dashboard /></Protected>} />

              {/* Gestión de Personal y Roles */}
              <Route path="roles-cargos" element={<Protected><RolesYCargos /></Protected>} />
              <Route path="personal" element={<Protected><Personal /></Protected>} />
              <Route path="asistencias" element={<Protected><Asistencias /></Protected>} />

              {/* Inventario y Productos */}
              <Route path="productos" element={<Protected><Productos /></Protected>} />
              <Route path="categorias" element={<Protected><Categorias /></Protected>} />
              <Route path="inventario" element={<Protected><Inventario /></Protected>} />
              <Route path="movimientos-inventario" element={<Protected><MovimientosInventario /></Protected>} />
              <Route path="alertas-stock" element={<Protected><AlertasStock /></Protected>} />
              <Route path="stock-no-vendible" element={<Protected><StockNoVendible /></Protected>} />

              {/* Ventas */}
              <Route path="ventas" element={<Protected><Ventas /></Protected>} />
              <Route path="caja" element={<Protected><Caja /></Protected>} />
              <Route path="cierre-caja" element={<Protected><CierreCaja /></Protected>} />
              <Route path="devoluciones" element={<Protected><Devoluciones /></Protected>} />
              <Route path="devoluciones-ventas" element={<Protected><DevolucionesVentas /></Protected>} />
              <Route path="reportes-ventas" element={<Protected><ReportesVentas /></Protected>} />

              {/* Compras */}
              <Route path="compras" element={<Protected><Compra /></Protected>} />
              <Route path="ordenes-compra" element={<Protected><OrdenesCompra /></Protected>} />
              <Route path="proveedores" element={<Protected><Proveedores /></Protected>} />
              <Route path="reportes-compras" element={<Protected><ReportesCompras /></Protected>} />

              {/* Clientes */}
              <Route path="clientes" element={<Protected><Clientes /></Protected>} />
              <Route path="cuentas-por-pagar" element={<Protected><CuentasPorPagar /></Protected>} />

              {/* Reportes y Administración */}
              <Route path="reportes" element={<Protected><Reportes /></Protected>} />
              <Route path="reportes-rentabilidad" element={<Protected><ReportesRentabilidad /></Protected>} />
              <Route path="reportes-inventario" element={<Protected><ReportesInventario /></Protected>} />
              <Route path="balance-general" element={<Protected><BalanceGeneral /></Protected>} />
              <Route path="backups" element={<Protected><Backups /></Protected>} />
              <Route path="configuracion" element={<Protected><Configuracion /></Protected>} />
              <Route path="cajeros" element={<Protected><Cajeros /></Protected>} />

              {/* Redirigir cualquier ruta desconocida al dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      )}
    </>
  );
}

export default App;

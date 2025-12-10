// src/App.jsx
import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Login from "./pages/Login";

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

// Ventas
const Ventas = lazy(() => import("./pages/Ventas"));
const Caja = lazy(() => import("./pages/Caja"));
const CierreCaja = lazy(() => import("./pages/CierreCaja"));
const Devoluciones = lazy(() => import("./pages/Devoluciones"));
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
const BalanceGeneral = lazy(() => import("./pages/BalanceGeneral"));
const Backups = lazy(() => import("./pages/Backups"));
const Configuracion = lazy(() => import("./pages/Configuracion"));

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

  return (
    <>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout onLogout={handleLogout} user={user} />}>
              {/* Panel Principal */}
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Gestión de Personal y Roles */}
              <Route path="roles-cargos" element={<RolesYCargos />} />
              <Route path="personal" element={<Personal />} />
              <Route path="asistencias" element={<Asistencias />} />
              
              {/* Inventario y Productos */}
              <Route path="productos" element={<Productos />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="movimientos-inventario" element={<MovimientosInventario />} />
              <Route path="alertas-stock" element={<AlertasStock />} />
              
              {/* Ventas */}
              <Route path="ventas" element={<Ventas />} />
              <Route path="caja" element={<Caja />} />
              <Route path="cierre-caja" element={<CierreCaja />} />
              <Route path="devoluciones" element={<Devoluciones />} />
              <Route path="reportes-ventas" element={<ReportesVentas />} />
              
              {/* Compras */}
              <Route path="compras" element={<Compra />} />
              <Route path="ordenes-compra" element={<OrdenesCompra />} />
              <Route path="proveedores" element={<Proveedores />} />
              <Route path="reportes-compras" element={<ReportesCompras />} />
              
              {/* Clientes */}
              <Route path="clientes" element={<Clientes />} />
              <Route path="cuentas-por-pagar" element={<CuentasPorPagar />} />
              
              {/* Reportes y Administración */}
              <Route path="reportes" element={<Reportes />} />
              <Route path="balance-general" element={<BalanceGeneral />} />
              <Route path="backups" element={<Backups />} />
              <Route path="configuracion" element={<Configuracion />} />
              
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
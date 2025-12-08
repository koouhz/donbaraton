// src/App.jsx

import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// Páginas del sistema (COMENTADAS PORQUE ESTÁN VACÍAS POR AHORA)
// import RolesPermisos from "./pages/RolesPermisos";
// import Personal from "./pages/Personal";
// import Clientes from "./pages/Clientes";
// import Productos from "./pages/Productos";
// import Categorias from "./pages/Categorias";
// import Proveedores from "./pages/Proveedores";
// import Compras from "./pages/Compras";
// import OrdenesCompra from "./pages/OrdenesCompra";
// import CuentasPorPagar from "./pages/CuentasPorPagar";
// import Inventario from "./pages/Inventario";
// import MovimientosInventario from "./pages/MovimientosInventario";
// import AlertasStock from "./pages/AlertasStock";
// import Ventas from "./pages/Ventas";
// import Caja from "./pages/Caja";
// import CierreCaja from "./pages/CierreCaja";
// import Devoluciones from "./pages/Devoluciones";
// import Reportes from "./pages/Reportes";
// import ReportesVentas from "./pages/ReportesVentas";
// import ReportesCompras from "./pages/ReportesCompras";
// import BalanceGeneral from "./pages/BalanceGeneral";
// import Backups from "./pages/Backups";
// import Configuracion from "./pages/Configuracion";
// import Asistencias from "./pages/Asistencias";

function App() {
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedEmpleado = localStorage.getItem("empleado");
    if (savedEmpleado) {
      setEmpleado(JSON.parse(savedEmpleado));
    }
    setLoading(false);
  }, []);

  const handleLogin = (empleadoData) => {
    localStorage.setItem("empleado", JSON.stringify(empleadoData));
    localStorage.setItem("token", empleadoData.token || "fake-token"); // Guardar token si existe
    setEmpleado(empleadoData);
  };

  const handleLogout = () => {
    localStorage.removeItem("empleado");
    localStorage.removeItem("token");
    setEmpleado(null);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #fef5e6 0%, #f8e1c5 100%)",
        }}
      >
        <div 
          style={{ 
            textAlign: "center",
            color: "#7a3b06" 
          }}
        >
          <div 
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid rgba(122, 59, 6, 0.2)",
              borderTop: "4px solid #7a3b06",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px"
            }}
          ></div>
          <p style={{ fontSize: "18px", margin: 0 }}>Cargando sistema...</p>
          <p style={{ fontSize: "14px", opacity: 0.7, marginTop: "5px" }}>
            Don Baratón
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {!empleado ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Routes>
          <Route
            path="/"
            element={<Layout onLogout={handleLogout} empleado={empleado} />}
          >
            {/* Ruta principal */}
            <Route index element={<Dashboard empleado={empleado} />} />

            {/* ADMINISTRACIÓN - COMENTADAS */}
            {/* <Route path="roles-permisos" element={<RolesPermisos />} /> */}
            {/* <Route path="empleados" element={<Personal />} /> */}
            {/* <Route path="clientes" element={<Clientes />} /> */}

            {/* PRODUCTOS - COMENTADAS */}
            {/* <Route path="productos" element={<Productos />} /> */}
            {/* <Route path="categorias" element={<Categorias />} /> */}

            {/* PROVEEDORES - COMENTADAS */}
            {/* <Route path="proveedores" element={<Proveedores />} /> */}
            {/* <Route path="compras" element={<Compras />} /> */}
            {/* <Route path="ordenes-compra" element={<OrdenesCompra />} /> */}
            {/* <Route path="cuentas-por-pagar" element={<CuentasPorPagar />} /> */}

            {/* INVENTARIO - COMENTADAS */}
            {/* <Route path="inventario" element={<Inventario />} /> */}
            {/* <Route path="movimientos-inventario" element={<MovimientosInventario />} /> */}
            {/* <Route path="alertas-stock" element={<AlertasStock />} /> */}

            {/* VENTAS - COMENTADAS */}
            {/* <Route path="ventas" element={<Ventas />} /> */}
            {/* <Route path="caja" element={<Caja />} /> */}
            {/* <Route path="cierre-caja" element={<CierreCaja />} /> */}
            {/* <Route path="devoluciones" element={<Devoluciones />} /> */}

            {/* REPORTES - COMENTADAS */}
            {/* <Route path="reportes" element={<Reportes />} /> */}
            {/* <Route path="reportes-ventas" element={<ReportesVentas />} /> */}
            {/* <Route path="reportes-compras" element={<ReportesCompras />} /> */}
            {/* <Route path="balance" element={<BalanceGeneral />} /> */}

            {/* SISTEMA - COMENTADAS */}
            {/* <Route path="backups" element={<Backups />} /> */}
            {/* <Route path="configuracion" element={<Configuracion />} /> */}
            {/* <Route path="asistencias" element={<Asistencias />} /> */}

            {/* Ruta por defecto - redirige al dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </>
  );
}

export default App;
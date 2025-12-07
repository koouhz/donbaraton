// src/App.jsx

import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
// import RolesCargos from "./pages/RolesCargos";
import Login from "./pages/Login";

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
    setEmpleado(empleadoData);
  };

  const handleLogout = () => {
    localStorage.removeItem("empleado");
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
        <div style={{ color: "#7a3b06", fontSize: "18px" }}>Cargando...</div>
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
            <Route index element={<Dashboard />} />

            {/* <Route path="roles-cargos" element={<RolesCargos />} /> */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </>
  );
}

export default App;

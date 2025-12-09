// src/App.jsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";
import RolesYCargos from "./pages/RolesYCargos"; // Asegúrate de importar este componente
import Login from "./pages/Login";

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
        <Routes>
          <Route path="/" element={<Layout onLogout={handleLogout} user={user} />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="roles-cargos" element={<RolesYCargos />} />
            
            {/* Redirigir cualquier ruta desconocida al dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      )}
    </>
  );
}

export default App;
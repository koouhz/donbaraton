// src/layout/Layout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Layout({ onLogout, user }) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const updateSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false); // Cerrar sidebar si se cambia a escritorio
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Abrir/cerrar el sidebar en móvil
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Envuelve el onLogout para también cerrar el sidebar en móvil
  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#f8f9fa", // Cambiado a un color más neutro
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          position: isMobile ? "fixed" : "relative",
          zIndex: 1000,
          transition: "transform 0.3s ease",
          transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        <Sidebar
          onLogout={handleLogout}
          empleado={user} // El Sidebar espera "empleado" como prop
        />
      </div>

      {/* Overlay para móvil cuando el sidebar está abierto */}
      {isMobile && sidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            cursor: "pointer",
          }}
        />
      )}

      {/* Contenido principal */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: isMobile ? "20px 15px" : "30px",
          background: "#f8f9fa",
          transition: "all 0.3s ease",
          position: "relative",
          minHeight: "100vh",
          boxSizing: "border-box",
          width: "100%",
          marginLeft: isMobile ? 0 : "280px",
          maxWidth: isMobile ? "100%" : "calc(100% - 280px)",
        }}
      >
        {/* Botón para abrir sidebar en móvil */}
        {isMobile && (
          <button
            onClick={toggleSidebar}
            style={{
              position: "fixed",
              top: "15px",
              left: "15px",
              zIndex: 998,
              background: "#1a5d1a",
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
            }}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        )}

        {/* Avatar y nombre de usuario en móvil */}
        {isMobile && user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 15px 10px 60px",
              marginBottom: "15px",
              background: "white",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1a5d1a, #2e8b57)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {user.nombres?.[0] || "U"}
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "#1a5d1a" }}>
                {user.nombres || "Usuario"}
              </div>
              <div style={{ fontSize: "12px", color: "#6c757d" }}>
                {user.cargo || "Rol no especificado"}
              </div>
            </div>
          </div>
        )}

        {/* Contenido de la página */}
        <div
          style={{
            animation: "fadeInUp 0.3s ease",
            maxWidth: "1400px",
            margin: "0 auto",
            paddingTop: isMobile ? "10px" : "0",
          }}
        >
          <Outlet />
        </div>

        {/* Footer para móvil */}
        {isMobile && (
          <div
            style={{
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #e9ecef",
              textAlign: "center",
              fontSize: "12px",
              color: "#6c757d",
            }}
          >
            © 2025 Don Baraton • Sistema de Gestión v1.0
          </div>
        )}
      </main>

      {/* Estilos globales */}
      <style>{`
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @media (max-width: 767px) {
          main {
            width: 100% !important;
            margin-left: 0 !important;
          }
          
          /* Mejorar scroll en móvil */
          main::-webkit-scrollbar {
            width: 6px;
          }
          
          main::-webkit-scrollbar-thumb {
            background-color: rgba(26, 93, 26, 0.2);
            border-radius: 3px;
          }
        }

        /* Estilos para escritorio */
        @media (min-width: 768px) {
          main {
            margin-left: 280px;
            width: calc(100% - 280px);
          }
        }

        /* Mejorar rendimiento de animaciones */
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}
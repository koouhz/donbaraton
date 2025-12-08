// src/layout/Layout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Layout({ onLogout, empleado }) {
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

  // Función para abrir/cerrar el sidebar en móvil
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      backgroundColor: "#fdf6e3",
      overflow: "hidden"
    }}>
      {/* Sidebar */}
      <Sidebar 
        onLogout={onLogout} 
        empleado={empleado} 
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Contenido principal */}
      <main 
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: isMobile ? "15px" : "25px 25px 25px 30px",
          background: "#fdf6e3",
          transition: "all 0.3s ease",
          position: "relative",
          minHeight: "100vh",
          boxSizing: "border-box",
          marginLeft: isMobile ? 0 : "280px",
          width: isMobile ? "100%" : "calc(100% - 280px)"
        }}
      >
        {/* Contenido de la ruta actual */}
        <div 
          style={{
            animation: "fadeInUp 0.3s ease",
            maxWidth: "1400px",
            margin: "0 auto"
          }}
        >
          <Outlet />
        </div>
      </main>

      {/* Estilos globales para animaciones */}
      <style jsx>{`
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
        
        @media (max-width: 767px) {
          main {
            padding-top: 70px !important;
          }
        }
      `}</style>
    </div>
  );
}
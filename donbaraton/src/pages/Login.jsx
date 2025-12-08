// src/pages/Login.jsx
import { useState } from "react";
import { LogIn, Store } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Pequeña pausa para simular carga
    setTimeout(() => {
      try {
        // Validar que haya datos
        if (!username.trim() || !password.trim()) {
          setError("Por favor ingresa usuario y contraseña");
          setLoading(false);
          return;
        }

        // Verificar credenciales básicas
        const usuariosValidos = ["admin", "cajero", "almacen"];
        const passwordValida = "123";

        if (!usuariosValidos.includes(username.toLowerCase()) || password !== passwordValida) {
          setError("Credenciales incorrectas. Usa: admin/123, cajero/123, almacen/123");
          setLoading(false);
          return;
        }

        // Crear datos de empleado según el usuario
        let empleadoData;

        switch (username.toLowerCase()) {
          case "admin":
            empleadoData = {
              id: "EMP-0001",
              ci: "1234567",
              expedido: "LP",
              nombres: "Juan",
              apellido_paterno: "Pérez",
              apellido_materno: "Gómez",
              email: "admin@donbaraton.com",
              telefono: "77777777",
              celular: "77777777",
              cargo: "Administrador",
              salario: 5000,
              estado: "ACTIVO",
              usuario_id: 1,
              rol: "administrador",
              id_rol: 1,
              roles: {
                id: 1,
                nombre: "Administrador",
                descripcion: "Acceso completo al sistema"
              },
              cargo_id: 1,
              token: "jwt-demo-token-admin",
              fecha_login: new Date().toISOString(),
              estadoA: true
            };
            break;

          case "cajero":
            empleadoData = {
              id: "EMP-0002",
              ci: "7654321",
              expedido: "CB",
              nombres: "María",
              apellido_paterno: "López",
              apellido_materno: "Rodríguez",
              email: "cajero@donbaraton.com",
              telefono: "77777778",
              celular: "77777778",
              cargo: "Cajero",
              salario: 3000,
              estado: "ACTIVO",
              usuario_id: 2,
              rol: "cajero",
              id_rol: 2,
              roles: {
                id: 2,
                nombre: "Cajero",
                descripcion: "Puede realizar ventas"
              },
              cargo_id: 2,
              token: "jwt-demo-token-cajero",
              fecha_login: new Date().toISOString(),
              estadoA: true
            };
            break;

          case "almacen":
            empleadoData = {
              id: "EMP-0003",
              ci: "9876543",
              expedido: "SC",
              nombres: "Carlos",
              apellido_paterno: "Martínez",
              apellido_materno: "Vargas",
              email: "almacen@donbaraton.com",
              telefono: "77777779",
              celular: "77777779",
              cargo: "Encargado de Almacén",
              salario: 3500,
              estado: "ACTIVO",
              usuario_id: 3,
              rol: "encargado de almacén",
              id_rol: 3,
              roles: {
                id: 3,
                nombre: "Encargado de almacén",
                descripcion: "Gestión de inventario"
              },
              cargo_id: 3,
              token: "jwt-demo-token-almacen",
              fecha_login: new Date().toISOString(),
              estadoA: true
            };
            break;

          default:
            setError("Usuario no válido");
            setLoading(false);
            return;
        }

        console.log("Datos del empleado creados:", empleadoData);
        
        // Llamar a onLogin con los datos
        if (typeof onLogin === 'function') {
          onLogin(empleadoData);
        } else {
          console.error("Error: onLogin no es una función");
          setError("Error interno del sistema");
        }

      } catch (err) {
        console.error("Error en login:", err);
        setError("Error al iniciar sesión");
      } finally {
        setLoading(false);
      }
    }, 800); // Simular tiempo de carga
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fef5e6 0%, #f8e1c5 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "15px",
        boxShadow: "0 10px 40px rgba(122, 59, 6, 0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        {/* Logo y Título */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 20px",
            background: "linear-gradient(135deg, #7a3b06, #a85a1a)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f7dca1"
          }}>
            <Store size={40} />
          </div>
          <h1 style={{ color: "#7a3b06", marginBottom: "8px" }}>Don Baratón</h1>
          <p style={{ color: "#6d4611", opacity: 0.8 }}>Sistema de Gestión Comercial</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#7a3b06",
              fontWeight: "500"
            }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin, cajero, almacen"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #e9d8b5",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
                transition: "border-color 0.3s"
              }}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#7a3b06",
              fontWeight: "500"
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="123"
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #e9d8b5",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
                transition: "border-color 0.3s"
              }}
            />
          </div>

          {/* Mensaje de error */}
          {error && (
            <div style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #f5c6cb",
              marginBottom: "20px",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}

          {/* Botón de submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#ccc" : "#7a3b06",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.3s"
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>

          {/* Información de usuarios de prueba */}
          <div style={{
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e9d8b5"
          }}>
            <p style={{
              textAlign: "center",
              color: "#6d4611",
              fontSize: "14px",
              marginBottom: "15px",
              fontWeight: "500"
            }}>
              Usuarios de prueba:
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px"
            }}>
              <div style={{
                background: "rgba(122, 59, 6, 0.05)",
                padding: "10px",
                borderRadius: "6px",
                textAlign: "center"
              }}>
                <div style={{ fontWeight: "bold", color: "#7a3b06" }}>admin</div>
                <div style={{ fontSize: "12px", color: "#6d4611" }}>123</div>
              </div>
              <div style={{
                background: "rgba(122, 59, 6, 0.05)",
                padding: "10px",
                borderRadius: "6px",
                textAlign: "center"
              }}>
                <div style={{ fontWeight: "bold", color: "#7a3b06" }}>cajero</div>
                <div style={{ fontSize: "12px", color: "#6d4611" }}>123</div>
              </div>
              <div style={{
                background: "rgba(122, 59, 6, 0.05)",
                padding: "10px",
                borderRadius: "6px",
                textAlign: "center"
              }}>
                <div style={{ fontWeight: "bold", color: "#7a3b06" }}>almacen</div>
                <div style={{ fontSize: "12px", color: "#6d4611" }}>123</div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Estilos CSS inline */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          outline: none;
          border-color: #7a3b06 !important;
        }
      `}</style>
    </div>
  );
}
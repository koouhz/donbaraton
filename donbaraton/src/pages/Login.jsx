// src/pages/Login.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Eye, EyeOff, Store, AlertCircle, CheckCircle, X, LogIn } from "lucide-react";
import bgImage from "../logo/bg.png";

// Función para hashear contraseñas
// Función para hashear contraseñas
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Función para registrar auditoría usando tu procedimiento almacenado
  const registrarAuditoria = async (usuario, modulo, accion, detalles) => {
    try {
      const { data, error } = await supabase.rpc('fn_registrar_auditoria', {
        p_usuario: usuario,
        p_modulo: modulo,
        p_accion: accion,
        p_detalles: detalles
      });

      if (error) {
        console.warn("Error al registrar auditoría:", error.message);
        return null;
      }
      return data; // Retorna el ID de auditoría
    } catch (err) {
      console.warn("No se pudo registrar auditoría:", err.message);
      return null;
    }
  };

  // Función para autenticar usando tu nuevo procedimiento almacenado
  const autenticarConProcedimiento = async (username, password) => {
    try {
      // Primero hashear la contraseña
      const hashedPassword = await hashPassword(password);

      // Usar el procedimiento almacenado fn_autenticar_usuario
      const { data, error } = await supabase.rpc('fn_autenticar_usuario', {
        p_username: username,
        p_password_hash: hashedPassword
      });

      if (error) {
        console.log("Error en autenticación:", error);
        return null;
      }

      // El procedimiento retorna una tabla, así que data es un array
      if (data && data.length > 0) {
        const usuarioAutenticado = data[0];

        // Ahora obtener los datos completos del usuario
        const { data: datosCompletos, error: errorCompletos } = await supabase.rpc(
          'fn_obtener_datos_usuario',
          { p_usuario_id: usuarioAutenticado.usuario_id }
        );

        if (errorCompletos) {
          console.log("Error al obtener datos completos:", errorCompletos);
          // Usar datos básicos si falla
          return {
            usuario_id: usuarioAutenticado.usuario_id,
            username: usuarioAutenticado.username,
            empleado_id: usuarioAutenticado.empleado_id,
            rol: usuarioAutenticado.rol_nombre,
            cargo: usuarioAutenticado.cargo_nombre
          };
        }

        // Parsear el JSON retornado
        if (datosCompletos) {
          return {
            ...datosCompletos,
            usuario_id: usuarioAutenticado.usuario_id,
            username: usuarioAutenticado.username,
            rol: usuarioAutenticado.rol_nombre,
            cargo: usuarioAutenticado.cargo_nombre
          };
        }

        return usuarioAutenticado;
      }

      return null;
    } catch (err) {
      console.error("Error en autenticación con procedimiento:", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.username.trim() || !formData.password.trim()) {
        throw new Error("Por favor ingrese usuario y contraseña");
      }

      // Registrar intento de login
      await registrarAuditoria(
        formData.username,
        'SISTEMA',
        'INTENTO_LOGIN',
        `Intento de inicio de sesión - Usuario: ${formData.username}`
      );

      let empleadoData = null;
      let auditoriaId = null;

      console.log("Intentando autenticar con procedimiento almacenado...");

      const usuarioAutenticado = await autenticarConProcedimiento(
        formData.username,
        formData.password
      );

      if (usuarioAutenticado) {
        console.log("Autenticación exitosa con procedimiento:", usuarioAutenticado);

        // Registrar auditoría de login exitoso
        auditoriaId = await registrarAuditoria(
          formData.username,
          'SISTEMA',
          'LOGIN',
          `Inicio de sesión exitoso - Usuario: ${formData.username}`
        );

        // Construir objeto de empleado con estructura esperada
        empleadoData = {
          // Datos del usuario
          usuario_id: usuarioAutenticado.usuario_id || usuarioAutenticado.id,
          username: usuarioAutenticado.username,
          estado: 'ACTIVO',
          rol_id: usuarioAutenticado.rol_id || 1,

          // Datos del empleado
          id: usuarioAutenticado.empleado?.id || usuarioAutenticado.empleado_id,
          ci: usuarioAutenticado.empleado?.ci || "",
          expedido: usuarioAutenticado.empleado?.expedido || "",
          nombres: usuarioAutenticado.empleado?.nombres || "Usuario",
          apellido_paterno: usuarioAutenticado.empleado?.apellido_paterno || "",
          apellido_materno: usuarioAutenticado.empleado?.apellido_materno || "",
          email: usuarioAutenticado.empleado?.email || "",
          telefono: usuarioAutenticado.empleado?.telefono || "",
          celular: usuarioAutenticado.empleado?.celular || "",
          cargo_id: usuarioAutenticado.empleado?.cargo_id || 0,
          cargo: usuarioAutenticado.cargo || "Sin cargo",
          salario: usuarioAutenticado.empleado?.salario || 0,
          estado_empleado: "ACTIVO",

          // Datos del rol
          rol: usuarioAutenticado.rol?.toUpperCase() || "EMPLEADO",
          roles: {
            id: usuarioAutenticado.rol_id || 1,
            nombre: usuarioAutenticado.rol || "Sin rol",
            descripcion: "Rol asignado"
          },

          // Información adicional
          token: `jwt-token-${usuarioAutenticado.usuario_id}`,
          fecha_login: new Date().toISOString(),
          estadoA: true,
          auditoria_id: auditoriaId
        };
      }

      if (empleadoData) {
        setSuccess("Inicio de sesión exitoso");

        setTimeout(() => {
          if (typeof onLogin === 'function') {
            onLogin(empleadoData);
          } else {
            console.error("Error: onLogin no es una función");
            setError("Error interno del sistema");
          }
        }, 800);
      } else {
        setError("Credenciales incorrectas o usuario inactivo.");

        // Registrar auditoría de intentos fallidos
        await registrarAuditoria(
          formData.username,
          'SISTEMA',
          'LOGIN_FALLIDO',
          `Credenciales incorrectas - Usuario: ${formData.username}`
        );
      }

    } catch (error) {
      console.error("Error en login:", error);
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(26, 93, 26, 0.15)",
        border: "1px solid #d4edda",
        width: "100%",
        maxWidth: "420px"
      }}>
        {/* Logo y Título */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 20px",
            background: "linear-gradient(135deg, #1a5d1a, #3cb371)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white"
          }}>
            <Store size={40} />
          </div>
          <h1 style={{
            fontSize: "32px",
            color: "#1a5d1a",
            marginBottom: "8px",
            fontWeight: "700"
          }}>
            Supermercado
          </h1>
          <p style={{
            color: "#6c757d",
            fontSize: "16px",
            opacity: 0.8
          }}>
            Sistema de Gestión Comercial
          </p>
        </div>

        {/* Mensajes de Error/Éxito */}
        {error && (
          <div style={{
            background: "#f8d7da",
            border: "1px solid #f5c6cb",
            color: "#721c24",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                marginLeft: "auto",
                color: "#721c24"
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {success && (
          <div style={{
            background: "#d4edda",
            border: "1px solid #c3e6cb",
            color: "#155724",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#1a5d1a",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              Usuario *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #e9ecef",
                borderRadius: "8px",
                fontSize: "16px",
                color: "#495057",
                backgroundColor: loading ? "#f8f9fa" : "#fff",
                transition: "border-color 0.3s",
                boxSizing: "border-box",
                opacity: loading ? 0.7 : 1
              }}
              maxLength={50}
              autoComplete="username"
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#1a5d1a",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              Contraseña *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 45px 12px 15px",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "16px",
                  color: "#495057",
                  backgroundColor: loading ? "#f8f9fa" : "#fff",
                  transition: "border-color 0.3s",
                  boxSizing: "border-box",
                  opacity: loading ? 0.7 : 1
                }}
                maxLength={50}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  color: "#6c757d",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loading ? 0.5 : 1
                }}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#ccc" : "linear-gradient(135deg, #1a5d1a, #3cb371)",
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
              transition: "all 0.3s",
              boxShadow: "0 4px 12px rgba(26, 93, 26, 0.2)"
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(26, 93, 26, 0.3)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(26, 93, 26, 0.2)";
              }
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
        </form>


        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{
            color: "#6c757d",
            fontSize: "11px",
            opacity: 0.7
          }}>
            Sistema hecho por los lexus
          </p>
        </div>
      </div>

      {/* Estilos CSS inline */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          outline: none;
          border-color: #1a5d1a !important;
          box-shadow: 0 0 0 2px rgba(26, 93, 26, 0.1);
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
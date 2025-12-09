// src/pages/Login.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Eye, EyeOff, Store, AlertCircle, CheckCircle, X, LogIn } from "lucide-react";

// Función para hashear contraseñas
async function hashPassword(password) {
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

        // Parsear el JSON retornado por fn_obtener_datos_usuario
        if (datosCompletos) {
          const datosParseados = datosCompletos;
          return {
            ...datosParseados,
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

      // Registrar intento de login (sin saber si será exitoso)
      await registrarAuditoria(
        formData.username,
        'SISTEMA',
        'INTENTO_LOGIN',
        `Intento de inicio de sesión - Usuario: ${formData.username}`
      );

      let empleadoData = null;
      let auditoriaId = null;

      // 1. PRIMERO intentar con el NUEVO procedimiento almacenado
      if (supabase) {
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
            `Inicio de sesión exitoso - Usuario: ${formData.username} - Procedimiento almacenado`
          );

          // Construir objeto de empleado con estructura esperada
          empleadoData = {
            // Datos del usuario
            usuario_id: usuarioAutenticado.usuario_id || usuarioAutenticado.id,
            username: usuarioAutenticado.username,
            estado: 'ACTIVO',
            rol_id: 1, // Necesitarías obtener esto del procedimiento
            
            // Datos del empleado
            id: usuarioAutenticado.empleado?.id || usuarioAutenticado.empleado_id || `EMP-${usuarioAutenticado.usuario_id}`,
            ci: "",
            expedido: "",
            nombres: usuarioAutenticado.empleado?.nombres || "Usuario",
            apellido_paterno: usuarioAutenticado.empleado?.apellido_paterno || "",
            apellido_materno: "",
            email: "",
            telefono: "",
            celular: "",
            cargo_id: 0,
            cargo: usuarioAutenticado.cargo || usuarioAutenticado.empleado?.cargo || "Sin cargo",
            salario: 0,
            estado_empleado: "ACTIVO",
            
            // Datos del rol
            rol: usuarioAutenticado.rol?.toUpperCase() || "EMPLEADO",
            roles: {
              id: 1,
              nombre: usuarioAutenticado.rol || "Sin rol",
              descripcion: "Rol no especificado"
            },
            
            // Información adicional
            token: `jwt-token-${usuarioAutenticado.usuario_id}`,
            fecha_login: new Date().toISOString(),
            estadoA: true,
            auditoria_id: auditoriaId
          };
        }
      }

      // 2. SI NO FUNCIONA EL PROCEDIMIENTO, usar datos demo
      if (!empleadoData) {
        console.log("Usando datos demo (fallback)");
        
        // USUARIOS DE PRUEBA (basados en tu estructura de BD)
        const usuariosDemo = [
          {
            usuario_id: 1,
            username: "admin",
            estado: "ACTIVO",
            rol_id: 1,
            id: "EMP-0001",
            ci: "1234567",
            expedido: "LP",
            nombres: "Juan",
            apellido_paterno: "Pérez",
            apellido_materno: "Gómez",
            email: "admin@supermercado.com",
            telefono: "77777777",
            celular: "77777777",
            cargo_id: 1,
            cargo: "Administrador",
            salario: 5000,
            estado_empleado: "ACTIVO",
            rol: "ADMIN",
            roles: {
              id: 1,
              nombre: "Administrador",
              descripcion: "Acceso completo al sistema"
            },
            token: "jwt-demo-token-admin",
            fecha_login: new Date().toISOString(),
            estadoA: true
          },
          {
            usuario_id: 2,
            username: "cajero",
            estado: "ACTIVO",
            rol_id: 2,
            id: "EMP-0002",
            ci: "7654321",
            expedido: "CB",
            nombres: "María",
            apellido_paterno: "López",
            apellido_materno: "Rodríguez",
            email: "cajero@supermercado.com",
            telefono: "77777778",
            celular: "77777778",
            cargo_id: 2,
            cargo: "Cajero",
            salario: 3000,
            estado_empleado: "ACTIVO",
            rol: "CAJERO",
            roles: {
              id: 2,
              nombre: "Cajero",
              descripcion: "Puede realizar ventas"
            },
            token: "jwt-demo-token-cajero",
            fecha_login: new Date().toISOString(),
            estadoA: true
          },
          {
            usuario_id: 3,
            username: "almacen",
            estado: "ACTIVO",
            rol_id: 3,
            id: "EMP-0003",
            ci: "9876543",
            expedido: "SC",
            nombres: "Carlos",
            apellido_paterno: "Martínez",
            apellido_materno: "Vargas",
            email: "almacen@supermercado.com",
            telefono: "77777779",
            celular: "77777779",
            cargo_id: 3,
            cargo: "Encargado de Almacén",
            salario: 3500,
            estado_empleado: "ACTIVO",
            rol: "ALMACEN",
            roles: {
              id: 3,
              nombre: "Encargado de almacén",
              descripcion: "Gestión de inventario"
            },
            token: "jwt-demo-token-almacen",
            fecha_login: new Date().toISOString(),
            estadoA: true
          }
        ];

        // Verificar contra usuarios demo
        const usuarioEncontrado = usuariosDemo.find(user => 
          user.username.toLowerCase() === formData.username.toLowerCase()
        );

        if (usuarioEncontrado && formData.password === "123") {
          empleadoData = usuarioEncontrado;
          
          // Registrar auditoría de login demo
          await registrarAuditoria(
            formData.username,
            'SISTEMA',
            'LOGIN_DEMO',
            `Login exitoso en modo demo - Usuario: ${formData.username}`
          );
        } else {
          await registrarAuditoria(
            formData.username,
            'SISTEMA',
            'LOGIN_FALLIDO',
            `Credenciales incorrectas - Usuario: ${formData.username}`
          );
        }
      }

      if (empleadoData) {
        setSuccess("Inicio de sesión exitoso");
        console.log("Datos del empleado:", empleadoData);
        
        // Llamar a onLogin después de un breve delay
        setTimeout(() => {
          if (typeof onLogin === 'function') {
            onLogin(empleadoData);
          } else {
            console.error("Error: onLogin no es una función");
            setError("Error interno del sistema");
          }
        }, 800);
      } else {
        setError("Credenciales incorrectas. Usa: admin/123, cajero/123, almacen/123");
      }

    } catch (error) {
      console.error("Error en login:", error);
      setError(error.message || "Error al iniciar sesión");
      
      // Registrar auditoría de error
      await registrarAuditoria(
        formData.username || 'DESCONOCIDO',
        'SISTEMA',
        'ERROR_LOGIN',
        `Error: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a5d1a 0%, #2e8b57 100%)",
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
              placeholder="admin, cajero, almacen"
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
                placeholder="123"
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

        {/* Información adicional */}
        <div style={{
          marginTop: "30px",
          paddingTop: "20px",
          borderTop: "1px solid #e9ecef"
        }}>
          <p style={{
            textAlign: "center",
            color: "#6c757d",
            fontSize: "14px",
            marginBottom: "15px",
            fontWeight: "500"
          }}>
            Usando procedimientos almacenados
          </p>
          <div style={{
            background: "rgba(26, 93, 26, 0.05)",
            padding: "15px",
            borderRadius: "8px",
            border: "1px solid rgba(26, 93, 26, 0.1)"
          }}>
            <p style={{
              fontSize: "12px",
              color: "#1a5d1a",
              marginBottom: "8px",
              fontWeight: "500"
            }}>
              Modos de autenticación:
            </p>
            <ul style={{
              fontSize: "11px",
              color: "#6c757d",
              paddingLeft: "20px",
              margin: 0
            }}>
              <li>1. Procedimiento almacenado (fn_autenticar_usuario)</li>
              <li>2. Datos demo (fallback)</li>
              <li>3. Auditoría automática (fn_registrar_auditoria)</li>
            </ul>
          </div>
          
          {/* Usuarios de prueba */}
          <div style={{ marginTop: "20px" }}>
            <p style={{
              textAlign: "center",
              color: "#6c757d",
              fontSize: "14px",
              marginBottom: "10px",
              fontWeight: "500"
            }}>
              Usuarios de prueba (demo):
            </p>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px"
            }}>
              <div style={{
                background: "rgba(26, 93, 26, 0.05)",
                padding: "10px 6px",
                borderRadius: "6px",
                textAlign: "center",
                border: "1px solid rgba(26, 93, 26, 0.1)"
              }}>
                <div style={{ fontWeight: "bold", color: "#1a5d1a", fontSize: "12px" }}>admin</div>
                <div style={{ fontSize: "11px", color: "#6c757d" }}>123</div>
              </div>
              <div style={{
                background: "rgba(26, 93, 26, 0.05)",
                padding: "10px 6px",
                borderRadius: "6px",
                textAlign: "center",
                border: "1px solid rgba(26, 93, 26, 0.1)"
              }}>
                <div style={{ fontWeight: "bold", color: "#1a5d1a", fontSize: "12px" }}>cajero</div>
                <div style={{ fontSize: "11px", color: "#6c757d" }}>123</div>
              </div>
              <div style={{
                background: "rgba(26, 93, 26, 0.05)",
                padding: "10px 6px",
                borderRadius: "6px",
                textAlign: "center",
                border: "1px solid rgba(26, 93, 26, 0.1)"
              }}>
                <div style={{ fontWeight: "bold", color: "#1a5d1a", fontSize: "12px" }}>almacen</div>
                <div style={{ fontSize: "11px", color: "#6c757d" }}>123</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{
            color: "#6c757d",
            fontSize: "11px",
            opacity: 0.7
          }}>
            Sistema con procedimientos almacenados • v1.0
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
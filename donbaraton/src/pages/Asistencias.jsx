// src/pages/Asistencias.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock, UserCheck, UserX, Loader2, Calendar,
  LogIn, LogOut, Search, X,
  RefreshCw, AlertCircle, Users
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Asistencias() {
  // ==================== FUNCIONES DE UTILIDAD ====================

  // Función para obtener fecha local en formato YYYY-MM-DD
  const getLocalDate = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Obtener la hora local del dispositivo en formato HH:MM:SS
  const getLocalTime = useCallback(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }, []);

  // ==================== ESTADOS ====================
  const [asistencias, setAsistencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrando, setRegistrando] = useState(null);
  const [fecha, setFecha] = useState(getLocalDate());
  const [searchTerm, setSearchTerm] = useState('');
  const [horaActual, setHoraActual] = useState(getLocalTime());
  const [fechaActual, setFechaActual] = useState(getLocalDate());

  // Referencia para el intervalo de actualización
  const intervalRef = useRef(null);
  const fechaRef = useRef(fecha);

  // ==================== FUNCIONES ====================

  const getUsername = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try { return JSON.parse(user).username || 'admin'; }
      catch { return 'admin'; }
    }
    return 'admin';
  };

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      // Calcular rango de fechas para cubrir diferencias de timezone
      // El servidor usa CURRENT_DATE (UTC), pero el cliente usa fecha local
      // Consultamos fecha actual y día anterior para cubrir el desfase
      const fechaConsulta = fechaRef.current;
      const fechaAnterior = new Date(fechaConsulta + 'T00:00:00');
      fechaAnterior.setDate(fechaAnterior.getDate() - 1);
      const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];

      const fechaSiguiente = new Date(fechaConsulta + 'T00:00:00');
      fechaSiguiente.setDate(fechaSiguiente.getDate() + 1);
      const fechaSiguienteStr = fechaSiguiente.toISOString().split('T')[0];

      const [empRes, asistRes] = await Promise.all([
        supabase
          .from('empleados')
          .select(`
            id_empleado,
            ci,
            nombres,
            apellido_paterno,
            apellido_materno,
            telefono,
            estado,
            cargos (nombre)
          `)
          .eq('estado', 'ACTIVO')
          .order('nombres'),
        // Consultar asistencias en un rango de 3 días para cubrir timezone
        supabase
          .from('asistencias')
          .select('*')
          .gte('fecha', fechaAnteriorStr)
          .lte('fecha', fechaSiguienteStr)
      ]);

      if (empRes.error) console.error('Error empleados:', empRes.error);
      if (asistRes.error) console.error('Error asistencias:', asistRes.error);

      const empleadosTransformados = (empRes.data || []).map(emp => ({
        ...emp,
        cargo: emp.cargos?.nombre || '-',
        nombre_completo: `${emp.nombres || ''} ${emp.apellido_paterno || ''} ${emp.apellido_materno || ''}`.trim()
      }));

      // Filtrar asistencias: priorizar la fecha seleccionada, luego fechas cercanas
      const todasAsistencias = asistRes.data || [];
      const hoyLocal = getLocalDate();
      const esHoy = fechaConsulta === hoyLocal;

      // Agrupar por empleado y tomar el registro más relevante
      const asistenciasPorEmpleado = {};

      todasAsistencias.forEach(a => {
        const existing = asistenciasPorEmpleado[a.id_empleado];

        if (!existing) {
          asistenciasPorEmpleado[a.id_empleado] = a;
        } else {
          // Decidir cuál mantener
          const existingEsFechaExacta = existing.fecha === fechaConsulta;
          const actualEsFechaExacta = a.fecha === fechaConsulta;

          if (actualEsFechaExacta && !existingEsFechaExacta) {
            // Preferir el de la fecha exacta
            asistenciasPorEmpleado[a.id_empleado] = a;
          } else if (!existingEsFechaExacta && !actualEsFechaExacta) {
            // Ninguno es de la fecha exacta, tomar el más reciente
            if (a.fecha > existing.fecha) {
              asistenciasPorEmpleado[a.id_empleado] = a;
            }
          }
        }
      });

      // Para "hoy": mostrar todas las asistencias recientes (pueden estar guardadas con fecha UTC diferente)
      // Para otras fechas: filtrar solo la fecha exacta
      let asistenciasFinal = Object.values(asistenciasPorEmpleado);

      if (!esHoy) {
        // Solo mostrar asistencias de la fecha exacta seleccionada
        asistenciasFinal = asistenciasFinal.filter(a => a.fecha === fechaConsulta);
      }
      // Si es hoy, mostrar todas las del rango (incluye UTC día siguiente)

      setEmpleados(empleadosTransformados);
      setAsistencias(asistenciasFinal);

      // Debug detallado
      console.log('=== DEBUG ASISTENCIAS ===');
      console.log('Fecha local hoy:', hoyLocal);
      console.log('Fecha consulta:', fechaConsulta);
      console.log('Es hoy:', esHoy);
      console.log('Rango consultado:', fechaAnteriorStr, 'a', fechaSiguienteStr);
      console.log('Total asistencias en rango:', todasAsistencias.length);
      console.log('Asistencias mostradas:', asistenciasFinal.length);
      if (todasAsistencias.length > 0) {
        console.log('Fechas encontradas:', [...new Set(todasAsistencias.map(a => a.fecha))]);
      }

    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [getLocalDate]);

  // ==================== EFECTOS ====================

  // Efecto para actualizar la hora cada segundo y detectar cambio de día
  useEffect(() => {
    const actualizarReloj = () => {
      const nuevaHora = getLocalTime();
      const nuevaFecha = getLocalDate();

      setHoraActual(nuevaHora);

      // Detectar cambio de día
      if (nuevaFecha !== fechaActual) {
        setFechaActual(nuevaFecha);
        // Si estábamos viendo "hoy", actualizar a la nueva fecha
        if (fechaRef.current === fechaActual) {
          setFecha(nuevaFecha);
          fechaRef.current = nuevaFecha;
          toast.success('¡Nuevo día! Asistencias reiniciadas');
        }
      }
    };

    // Actualizar inmediatamente
    actualizarReloj();

    // Actualizar cada segundo
    const clockInterval = setInterval(actualizarReloj, 1000);

    return () => clearInterval(clockInterval);
  }, [getLocalTime, getLocalDate, fechaActual]);

  // Efecto para cargar datos cuando cambia la fecha seleccionada
  useEffect(() => {
    fechaRef.current = fecha;
    cargarDatos();
  }, [fecha, cargarDatos]);

  // Efecto para refrescar datos automáticamente cada 30 segundos
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      cargarDatos();
    }, 30000); // 30 segundos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cargarDatos]);

  // ==================== REGISTRO DE ASISTENCIA ====================

  const registrarAsistencia = async (empleado, tipo) => {
    if (!empleado.id_empleado) {
      toast.error('Error: No se pudo identificar al empleado');
      console.error('Empleado sin ID:', empleado);
      return;
    }

    // Solo permitir registrar asistencias del día actual
    if (fecha !== getLocalDate()) {
      toast.error('Solo puedes registrar asistencias del día actual');
      return;
    }

    // Verificar primero si ya existe asistencia en el estado local
    const asistenciaExistente = asistencias.find(a => a.id_empleado === empleado.id_empleado);

    if (tipo === 'ENTRADA' && asistenciaExistente?.hora_entrada) {
      toast.error('Ya se registró entrada para este empleado hoy');
      await cargarDatos(); // Refrescar para asegurar sincronización
      return;
    }

    if (tipo === 'SALIDA') {
      if (!asistenciaExistente?.hora_entrada) {
        toast.error('Primero debe registrar la entrada');
        return;
      }
      if (asistenciaExistente?.hora_salida) {
        toast.error('Ya se registró salida para este empleado hoy');
        await cargarDatos();
        return;
      }
    }

    setRegistrando(empleado.id_empleado);

    // Capturar la hora EXACTA del momento del clic
    const horaRegistro = getLocalTime();

    try {
      const { data, error } = await supabase.rpc('fn_registrar_asistencia', {
        p_id_empleado: empleado.id_empleado,
        p_tipo: tipo,
        p_hora: horaRegistro,
        p_observaciones: null,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        let errorMsg = error.message || 'Error al registrar asistencia';
        if (errorMsg.includes('Ya se registró una entrada')) {
          errorMsg = 'Ya se registró entrada para este empleado hoy';
        } else if (errorMsg.includes('No existe registro de entrada')) {
          errorMsg = 'Primero debe registrar la entrada';
        } else if (errorMsg.includes('Ya se registró una salida')) {
          errorMsg = 'Ya se registró salida para este empleado hoy';
        }
        toast.error(errorMsg);
      } else {
        // Éxito: mostrar la hora que se registró
        toast.success(
          `${tipo === 'ENTRADA' ? '✅ Entrada' : '🚪 Salida'} registrada a las ${horaRegistro.substring(0, 5)} para ${empleado.nombre_completo}`
        );
      }

      // Siempre refrescar datos después de intentar registrar
      await cargarDatos();

    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al registrar asistencia');
      await cargarDatos();
    } finally {
      setRegistrando(null);
    }
  };

  // ==================== FORMATEO ====================

  const formatTime = (time) => time?.substring(0, 5) || '--:--';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // ==================== DATOS CALCULADOS ====================

  const empleadosFiltrados = empleados.filter(emp =>
    emp.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.ci?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentes = empleadosFiltrados.filter(emp => {
    const asist = asistencias.find(a => a.id_empleado === emp.id_empleado);
    return asist?.hora_entrada;
  }).length;

  const ausentes = empleadosFiltrados.length - presentes;
  const esHoy = fecha === getLocalDate();

  // ==================== RENDER ====================

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Clock size={28} style={{ marginRight: '12px' }} />
            Control de Asistencias
          </h1>
          <p style={styles.subtitle}>
            Registro de entrada y salida del personal
          </p>
        </div>
        <div style={styles.headerActions}>
          {/* Reloj en tiempo real */}
          <div style={styles.clockDisplay}>
            <Clock size={16} />
            <span style={styles.clockTime}>{horaActual.substring(0, 5)}</span>
          </div>

          <button style={styles.refreshButton} onClick={cargarDatos} disabled={loading}>
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>

          <div style={styles.dateSelector}>
            <Calendar size={18} />
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              style={styles.dateInput}
            />
          </div>
        </div>
      </header>

      {/* Fecha actual */}
      <div style={styles.dateDisplay}>
        <span style={styles.dateBadge}>
          {esHoy ? '📅 Hoy: ' : '📅 '}{formatDate(fecha)}
        </span>
        {!esHoy && (
          <button
            style={styles.todayButton}
            onClick={() => setFecha(getLocalDate())}
          >
            Ir a hoy
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <UserCheck size={28} style={{ color: '#2e7d32' }} />
          <div>
            <span style={{ ...styles.statValue, color: '#2e7d32' }}>{presentes}</span>
            <span style={styles.statLabel}>Presentes</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <UserX size={28} style={{ color: '#c62828' }} />
          <div>
            <span style={{ ...styles.statValue, color: '#c62828' }}>{ausentes}</span>
            <span style={styles.statLabel}>Ausentes</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <Users size={28} style={{ color: '#1565c0' }} />
          <div>
            <span style={styles.statValue}>{empleadosFiltrados.length}</span>
            <span style={styles.statLabel}>Total Empleados</span>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={styles.clearButton}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      {esHoy && (
        <div style={styles.infoCard}>
          <AlertCircle size={18} />
          <p>
            La hora actual es <strong>{horaActual.substring(0, 5)}</strong>.
            Al registrar, se guardará la hora exacta del momento del clic.
          </p>
        </div>
      )}

      {/* Aviso si no es hoy */}
      {!esHoy && (
        <div style={styles.warningCard}>
          <AlertCircle size={18} />
          <p>Estás viendo las asistencias de una fecha anterior. Solo puedes registrar asistencias del día actual.</p>
        </div>
      )}

      {/* Tabla */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando asistencias...</p>
          </div>
        ) : empleadosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <Users size={48} style={{ color: '#ccc' }} />
            <p>{searchTerm ? 'No se encontraron empleados' : 'No hay empleados registrados'}</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Empleado</th>
                <th style={styles.th}>Cargo</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Entrada</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Salida</th>
                {esHoy && <th style={{ ...styles.th, textAlign: 'center' }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {empleadosFiltrados.map((emp) => {
                const asist = asistencias.find(a => a.id_empleado === emp.id_empleado);
                const tieneEntrada = asist?.hora_entrada;
                const tieneSalida = asist?.hora_salida;
                const estaRegistrando = registrando === emp.id_empleado;

                return (
                  <tr key={emp.id_empleado || emp.ci} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.avatar}>
                          {emp.nombre_completo?.[0] || 'E'}
                        </div>
                        <div>
                          <strong>{emp.nombre_completo}</strong>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>{emp.ci}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{emp.cargo || '-'}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {tieneEntrada ? (
                        <span style={styles.timeIn}>{formatTime(asist.hora_entrada)}</span>
                      ) : (
                        <span style={styles.noTime}>--:--</span>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {tieneSalida ? (
                        <span style={styles.timeOut}>{formatTime(asist.hora_salida)}</span>
                      ) : (
                        <span style={styles.noTime}>--:--</span>
                      )}
                    </td>
                    {esHoy && (
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={styles.actionButtons}>
                          {/* Botón de Entrada */}
                          <button
                            style={tieneEntrada ? styles.entradaButtonDisabled : styles.entradaButton}
                            onClick={() => registrarAsistencia(emp, 'ENTRADA')}
                            disabled={estaRegistrando || tieneEntrada}
                            title={tieneEntrada ? `Entrada registrada: ${formatTime(asist.hora_entrada)}` : "Registrar entrada"}
                          >
                            {estaRegistrando && !tieneEntrada ? (
                              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <><LogIn size={16} /> {tieneEntrada ? '✓' : 'Entrada'}</>
                            )}
                          </button>

                          {/* Botón de Salida */}
                          <button
                            style={!tieneEntrada || tieneSalida ? styles.salidaButtonDisabled : styles.salidaButton}
                            onClick={() => registrarAsistencia(emp, 'SALIDA')}
                            disabled={estaRegistrando || !tieneEntrada || tieneSalida}
                            title={!tieneEntrada ? "Primero registre la entrada" : tieneSalida ? `Salida registrada: ${formatTime(asist.hora_salida)}` : "Registrar salida"}
                          >
                            {estaRegistrando && tieneEntrada && !tieneSalida ? (
                              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <><LogOut size={16} /> {tieneSalida ? '✓' : 'Salida'}</>
                            )}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  headerActions: { display: 'flex', gap: '12px', alignItems: 'center' },
  clockDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)',
    borderRadius: '10px',
    color: 'white',
    fontWeight: '600'
  },
  clockTime: { fontSize: '18px', fontFamily: 'monospace' },
  refreshButton: { padding: '10px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dateSelector: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'white', borderRadius: '10px', border: '1px solid #e9ecef' },
  dateInput: { border: 'none', background: 'none', fontSize: '14px', color: '#333', outline: 'none', cursor: 'pointer' },
  dateDisplay: { marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' },
  dateBadge: { display: 'inline-block', padding: '8px 16px', background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', borderRadius: '10px', color: '#1a5d1a', fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' },
  todayButton: { padding: '8px 16px', background: '#1a5d1a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statValue: { display: 'block', fontSize: '28px', fontWeight: '700', color: '#1a5d1a' },
  statLabel: { fontSize: '13px', color: '#6c757d' },
  toolbar: { marginBottom: '15px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', maxWidth: '350px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
  infoCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', background: '#e3f2fd', borderRadius: '10px', marginBottom: '20px', color: '#1565c0', fontSize: '14px' },
  warningCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', background: '#fff3e0', borderRadius: '10px', marginBottom: '20px', color: '#e65100', fontSize: '14px' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef', transition: 'background 0.2s' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '16px' },
  timeIn: { padding: '4px 12px', background: '#e8f5e9', borderRadius: '6px', color: '#2e7d32', fontWeight: '600', fontSize: '13px' },
  timeOut: { padding: '4px 12px', background: '#e3f2fd', borderRadius: '6px', color: '#1565c0', fontWeight: '600', fontSize: '13px' },
  noTime: { color: '#ccc', fontSize: '14px' },
  actionButtons: { display: 'flex', gap: '8px', justifyContent: 'center' },
  entradaButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
  entradaButtonDisabled: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#c8e6c9', color: '#2e7d32', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'not-allowed', opacity: '0.8' },
  salidaButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'linear-gradient(135deg, #1565c0, #1976d2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
  salidaButtonDisabled: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#bbdefb', color: '#1565c0', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'not-allowed', opacity: '0.8' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
};

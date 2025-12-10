// src/pages/Asistencias.jsx
import { useState, useEffect } from 'react';
import { 
  Clock, UserCheck, UserX, Loader2, Calendar,
  CheckCircle, XCircle, Coffee
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Asistencias() {
  const [asistencias, setAsistencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    cargarDatos();
  }, [fecha]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [empRes, asistRes] = await Promise.all([
        supabase.rpc('fn_leer_empleados', { p_buscar: null }),
        supabase.from('asistencias').select('*').eq('fecha', fecha)
      ]);

      if (empRes.error) console.error(empRes.error);
      if (asistRes.error) console.error(asistRes.error);

      setEmpleados(empRes.data || []);
      setAsistencias(asistRes.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => time?.substring(0, 5) || '--:--';

  // Estadísticas
  const presentes = asistencias.filter(a => a.hora_entrada).length;
  const ausentes = empleados.length - presentes;

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
        <div style={styles.dateSelector}>
          <Calendar size={18} />
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </header>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <UserCheck size={28} style={{ color: '#2e7d32' }} />
          <div>
            <span style={{...styles.statValue, color: '#2e7d32'}}>{presentes}</span>
            <span style={styles.statLabel}>Presentes</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <UserX size={28} style={{ color: '#c62828' }} />
          <div>
            <span style={{...styles.statValue, color: '#c62828'}}>{ausentes}</span>
            <span style={styles.statLabel}>Ausentes</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <Clock size={28} style={{ color: '#1565c0' }} />
          <div>
            <span style={styles.statValue}>{empleados.length}</span>
            <span style={styles.statLabel}>Total Empleados</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={styles.infoCard}>
        <Clock size={18} />
        <p>Las asistencias se registran automáticamente con el sistema de control de acceso o pueden ingresarse manualmente por un administrador.</p>
      </div>

      {/* Tabla */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
          </div>
        ) : empleados.length === 0 ? (
          <div style={styles.emptyState}>
            <Clock size={48} style={{ color: '#ccc' }} />
            <p>No hay empleados registrados</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Empleado</th>
                <th style={styles.th}>Cargo</th>
                <th style={styles.th}>Entrada</th>
                <th style={styles.th}>Salida</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp, i) => {
                const asist = asistencias.find(a => a.empleado_id === emp.id);
                const tieneEntrada = asist?.hora_entrada;
                const tieneSalida = asist?.hora_salida;
                
                return (
                  <tr key={emp.id || i} style={styles.tr}>
                    <td style={styles.td}><strong>{emp.nombre_completo}</strong></td>
                    <td style={styles.td}>{emp.cargo || '-'}</td>
                    <td style={styles.td}>
                      {tieneEntrada ? (
                        <span style={styles.timeIn}>{formatTime(asist.hora_entrada)}</span>
                      ) : (
                        <span style={styles.noTime}>--:--</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {tieneSalida ? (
                        <span style={styles.timeOut}>{formatTime(asist.hora_salida)}</span>
                      ) : (
                        <span style={styles.noTime}>--:--</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {tieneEntrada ? (
                        <span style={{...styles.badge, background: '#e8f5e9', color: '#2e7d32'}}>
                          <CheckCircle size={14} /> Presente
                        </span>
                      ) : (
                        <span style={{...styles.badge, background: '#ffebee', color: '#c62828'}}>
                          <XCircle size={14} /> Ausente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  dateSelector: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'white', borderRadius: '10px', border: '1px solid #e9ecef' },
  dateInput: { border: 'none', background: 'none', fontSize: '14px', color: '#333', outline: 'none' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '25px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statValue: { display: 'block', fontSize: '32px', fontWeight: '700', color: '#1a5d1a' },
  statLabel: { fontSize: '14px', color: '#6c757d' },
  infoCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', background: '#e3f2fd', borderRadius: '10px', marginBottom: '20px', color: '#1565c0', fontSize: '14px' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  timeIn: { padding: '4px 10px', background: '#e8f5e9', borderRadius: '6px', color: '#2e7d32', fontWeight: '600' },
  timeOut: { padding: '4px 10px', background: '#e3f2fd', borderRadius: '6px', color: '#1565c0', fontWeight: '600' },
  noTime: { color: '#ccc' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '60px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
};

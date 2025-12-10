// src/pages/Devoluciones.jsx
import { useState, useEffect } from 'react';
import { 
  RotateCcw, Plus, Eye, X, Save, Loader2,
  Package, AlertTriangle, Calendar
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Devoluciones() {
  const [devoluciones, setDevoluciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDevoluciones();
  }, []);

  const cargarDevoluciones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_leer_devoluciones_proveedor');

      if (error) {
        console.error('Error:', error);
        toast.error('Error al cargar devoluciones');
      } else {
        setDevoluciones(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getMotivoStyle = (motivo) => {
    const estilos = {
      DAÑO: { bg: '#ffebee', color: '#c62828', icon: <AlertTriangle size={14} /> },
      VENCIDO: { bg: '#fff3e0', color: '#e65100', icon: <Calendar size={14} /> },
      DEFECTO: { bg: '#fce4ec', color: '#c2185b', icon: <Package size={14} /> }
    };
    return estilos[motivo] || estilos.DAÑO;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('es-BO');

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <RotateCcw size={28} style={{ marginRight: '12px' }} />
            Devoluciones a Proveedor
          </h1>
          <p style={styles.subtitle}>
            Gestión de devoluciones de mercadería • {devoluciones.length} registros
          </p>
        </div>
      </header>

      {/* Información */}
      <div style={styles.infoCard}>
        <AlertTriangle size={20} style={{ color: '#e65100' }} />
        <p>
          Las devoluciones se generan desde el módulo de Recepciones cuando se detecta 
          mercadería dañada o vencida. El stock se ajusta automáticamente.
        </p>
      </div>

      {/* Tabla */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando devoluciones...</p>
          </div>
        ) : devoluciones.length === 0 ? (
          <div style={styles.emptyState}>
            <RotateCcw size={48} style={{ color: '#ccc' }} />
            <p>No hay devoluciones registradas</p>
            <span style={{ color: '#999' }}>Las devoluciones aparecerán aquí cuando se registren desde recepción</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Cantidad</th>
                <th style={styles.th}>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {devoluciones.map((dev, i) => {
                const motivoStyle = getMotivoStyle(dev.motivo);
                return (
                  <tr key={dev.id || i} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} style={{ color: '#6c757d' }} />
                        {formatDate(dev.fecha)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <strong>{dev.producto}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.cantidad}>{dev.cantidad}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: motivoStyle.bg,
                        color: motivoStyle.color
                      }}>
                        {motivoStyle.icon}
                        {dev.motivo}
                      </span>
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
  container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  infoCard: { display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '20px', background: '#fff3e0', borderRadius: '12px', marginBottom: '20px', border: '1px solid #ffcc80' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  cantidad: { padding: '4px 12px', background: '#f8f9fa', borderRadius: '20px', fontWeight: '600' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px', textAlign: 'center' },
};

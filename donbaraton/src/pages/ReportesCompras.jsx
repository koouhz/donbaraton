// src/pages/ReportesCompras.jsx
import { useState, useEffect } from 'react';
import { 
  ShoppingBag, Calendar, Loader2, FileText,
  TrendingUp, Truck
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function ReportesCompras() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    cargarOrdenes();
  }, [fechaInicio, fechaFin]);

  const cargarOrdenes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_leer_ordenes_compra', {
        p_estado: null,
        p_fecha_inicio: fechaInicio,
        p_fecha_fin: fechaFin
      });

      if (error) throw error;
      setOrdenes(data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('es-BO');

  // Estadísticas
  const totalCompras = ordenes.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const ordenesRecibidas = ordenes.filter(o => o.estado === 'RECIBIDA').length;
  const ordenesPendientes = ordenes.filter(o => o.estado === 'PENDIENTE').length;

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <ShoppingBag size={28} style={{ marginRight: '12px' }} />
            Reportes de Compras
          </h1>
          <p style={styles.subtitle}>
            Análisis de órdenes de compra por período
          </p>
        </div>
      </header>

      {/* Filtros */}
      <div style={styles.filterCard}>
        <div style={styles.dateFilter}>
          <label><Calendar size={14} /> Desde</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={styles.dateInput} />
        </div>
        <div style={styles.dateFilter}>
          <label><Calendar size={14} /> Hasta</label>
          <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={styles.dateInput} />
        </div>
        <button style={styles.refreshBtn} onClick={cargarOrdenes} disabled={loading}>
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <TrendingUp size={16} />}
          Actualizar
        </button>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <FileText size={24} style={{ color: '#1a5d1a' }} />
          <span style={styles.statValue}>{ordenes.length}</span>
          <span style={styles.statLabel}>Total Órdenes</span>
        </div>
        <div style={styles.statCard}>
          <ShoppingBag size={24} style={{ color: '#2e7d32' }} />
          <span style={{...styles.statValue, color: '#2e7d32'}}>{formatCurrency(totalCompras)}</span>
          <span style={styles.statLabel}>Total Compras</span>
        </div>
        <div style={styles.statCard}>
          <Truck size={24} style={{ color: '#1565c0' }} />
          <span style={{...styles.statValue, color: '#1565c0'}}>{ordenesRecibidas}</span>
          <span style={styles.statLabel}>Recibidas</span>
        </div>
        <div style={styles.statCard}>
          <Calendar size={24} style={{ color: '#e65100' }} />
          <span style={{...styles.statValue, color: '#e65100'}}>{ordenesPendientes}</span>
          <span style={styles.statLabel}>Pendientes</span>
        </div>
      </div>

      {/* Lista */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
          </div>
        ) : ordenes.length === 0 ? (
          <div style={styles.emptyState}>
            <ShoppingBag size={48} style={{ color: '#ccc' }} />
            <p>No hay órdenes en el período seleccionado</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Proveedor</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden, i) => (
                <tr key={orden.id || i} style={styles.tr}>
                  <td style={styles.td}>{formatDate(orden.fecha)}</td>
                  <td style={styles.td}><strong>{orden.proveedor}</strong></td>
                  <td style={styles.td}>{formatCurrency(orden.total)}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: orden.estado === 'RECIBIDA' ? '#e8f5e9' : orden.estado === 'PENDIENTE' ? '#fff3e0' : '#ffebee',
                      color: orden.estado === 'RECIBIDA' ? '#2e7d32' : orden.estado === 'PENDIENTE' ? '#e65100' : '#c62828'
                    }}>
                      {orden.estado}
                    </span>
                  </td>
                </tr>
              ))}
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
  header: { marginBottom: '20px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  filterCard: { display: 'flex', gap: '20px', padding: '20px', background: 'white', borderRadius: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  dateFilter: { display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#6c757d' },
  dateInput: { padding: '10px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' },
  statCard: { background: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statValue: { display: 'block', fontSize: '28px', fontWeight: '700', color: '#1a5d1a', margin: '10px 0 5px' },
  statLabel: { fontSize: '13px', color: '#6c757d' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  badge: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '60px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
};

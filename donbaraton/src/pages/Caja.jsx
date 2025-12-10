// src/pages/Caja.jsx
import { useState, useEffect } from 'react';
import { 
  Wallet, ShoppingCart, TrendingUp, Clock,
  Loader2, DollarSign, CreditCard, QrCode, Banknote
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Caja() {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalHoy, setTotalHoy] = useState(0);
  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    cargarVentasHoy();
  }, []);

  const cargarVentasHoy = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_leer_ventas', {
        p_fecha_inicio: hoy,
        p_fecha_fin: hoy
      });

      if (error) throw error;
      
      const ventasActivas = (data || []).filter(v => v.estado);
      setVentas(ventasActivas);
      setTotalHoy(ventasActivas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0));
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;
  const formatTime = (date) => new Date(date).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Wallet size={28} style={{ marginRight: '12px' }} />
            Caja
          </h1>
          <p style={styles.subtitle}>
            Resumen de operaciones del día
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.primaryButton} onClick={() => navigate('/ventas')}>
            <ShoppingCart size={18} />
            Nueva Venta
          </button>
          <button style={styles.secondaryButton} onClick={() => navigate('/cierre-caja')}>
            <DollarSign size={18} />
            Cierre de Caja
          </button>
        </div>
      </header>

      {/* Dashboard de Caja */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTop: '4px solid #1a5d1a'}}>
          <ShoppingCart size={32} style={{ color: '#1a5d1a' }} />
          <div>
            <span style={styles.statValue}>{ventas.length}</span>
            <span style={styles.statLabel}>Ventas Hoy</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #2e7d32'}}>
          <DollarSign size={32} style={{ color: '#2e7d32' }} />
          <div>
            <span style={{...styles.statValue, color: '#2e7d32'}}>{formatCurrency(totalHoy)}</span>
            <span style={styles.statLabel}>Total Recaudado</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #1565c0'}}>
          <TrendingUp size={32} style={{ color: '#1565c0' }} />
          <div>
            <span style={{...styles.statValue, color: '#1565c0'}}>
              {formatCurrency(ventas.length > 0 ? totalHoy / ventas.length : 0)}
            </span>
            <span style={styles.statLabel}>Promedio por Venta</span>
          </div>
        </div>
      </div>

      {/* Ventas del día */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Clock size={20} />
          Ventas de Hoy
        </h2>

        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
          </div>
        ) : ventas.length === 0 ? (
          <div style={styles.emptyState}>
            <ShoppingCart size={48} style={{ color: '#ccc' }} />
            <p>No hay ventas registradas hoy</p>
            <button style={styles.primaryButton} onClick={() => navigate('/ventas')}>
              Iniciar Primera Venta
            </button>
          </div>
        ) : (
          <div style={styles.ventasList}>
            {ventas.map((venta, i) => (
              <div key={venta.id || i} style={styles.ventaCard}>
                <div style={styles.ventaTime}>
                  <Clock size={16} />
                  {formatTime(venta.fecha)}
                </div>
                <div style={styles.ventaCliente}>
                  {venta.cliente || 'Cliente General'}
                </div>
                <div style={styles.ventaComprobante}>
                  {venta.comprobante}
                </div>
                <div style={styles.ventaTotal}>
                  {formatCurrency(venta.total)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div style={styles.actionsGrid}>
        <button style={styles.actionCard} onClick={() => navigate('/ventas')}>
          <ShoppingCart size={28} style={{ color: '#1a5d1a' }} />
          <span>Punto de Venta</span>
        </button>
        <button style={styles.actionCard} onClick={() => navigate('/cierre-caja')}>
          <Wallet size={28} style={{ color: '#e65100' }} />
          <span>Cierre de Caja</span>
        </button>
        <button style={styles.actionCard} onClick={() => navigate('/reportes-ventas')}>
          <TrendingUp size={28} style={{ color: '#1565c0' }} />
          <span>Reportes</span>
        </button>
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
  headerActions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  secondaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'white', color: '#1a5d1a', border: '2px solid #1a5d1a', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  statValue: { display: 'block', fontSize: '32px', fontWeight: '700', color: '#1a5d1a' },
  statLabel: { fontSize: '14px', color: '#6c757d' },
  section: { background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#333' },
  ventasList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  ventaCard: { display: 'grid', gridTemplateColumns: '100px 1fr 120px 120px', alignItems: 'center', gap: '15px', padding: '15px 20px', background: '#f8f9fa', borderRadius: '10px' },
  ventaTime: { display: 'flex', alignItems: 'center', gap: '8px', color: '#6c757d', fontSize: '14px' },
  ventaCliente: { fontWeight: '500', color: '#333' },
  ventaComprobante: { fontSize: '13px', color: '#6c757d' },
  ventaTotal: { fontWeight: '700', color: '#1a5d1a', textAlign: 'right', fontSize: '16px' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  actionCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '25px', background: 'white', border: '2px solid #e9ecef', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', fontWeight: '500', color: '#333' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '60px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
};

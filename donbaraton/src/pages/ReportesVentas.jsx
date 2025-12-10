// src/pages/ReportesVentas.jsx
import { useState, useEffect } from 'react';
import { 
  BarChart3, Calendar, TrendingUp, Download,
  Loader2, DollarSign, Package, ShoppingCart
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function ReportesVentas() {
  const [reporteVentas, setReporteVentas] = useState([]);
  const [productosTop, setProductosTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    cargarReportes();
  }, [fechaInicio, fechaFin]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const [ventasRes, topRes] = await Promise.all([
        supabase.rpc('fn_reporte_ventas_periodo', {
          p_fecha_inicio: fechaInicio,
          p_fecha_fin: fechaFin
        }),
        supabase.rpc('fn_reporte_productos_top', {
          p_fecha_inicio: fechaInicio,
          p_fecha_fin: fechaFin,
          p_limite: 10
        })
      ]);

      if (ventasRes.error) console.error('Error ventas:', ventasRes.error);
      if (topRes.error) console.error('Error top:', topRes.error);

      setReporteVentas(ventasRes.data || []);
      setProductosTop(topRes.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const totales = reporteVentas.reduce((acc, dia) => ({
    ventas: acc.ventas + parseInt(dia.cantidad_ventas || 0),
    monto: acc.monto + parseFloat(dia.total_vendido || 0)
  }), { ventas: 0, monto: 0 });

  const promedioTicket = totales.ventas > 0 ? totales.monto / totales.ventas : 0;

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <BarChart3 size={28} style={{ marginRight: '12px' }} />
            Reportes de Ventas
          </h1>
          <p style={styles.subtitle}>
            Análisis de ventas por período
          </p>
        </div>
      </header>

      {/* Filtros de fecha */}
      <div style={styles.filterCard}>
        <div style={styles.dateFilter}>
          <label style={styles.filterLabel}>
            <Calendar size={16} />
            Desde
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={e => setFechaInicio(e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <div style={styles.dateFilter}>
          <label style={styles.filterLabel}>
            <Calendar size={16} />
            Hasta
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={e => setFechaFin(e.target.value)}
            style={styles.dateInput}
          />
        </div>
        <button style={styles.refreshBtn} onClick={cargarReportes} disabled={loading}>
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <TrendingUp size={16} />}
          Actualizar
        </button>
      </div>

      {/* Resumen */}
      <div style={styles.summaryCards}>
        <div style={styles.summaryCard}>
          <ShoppingCart size={28} style={{ color: '#1a5d1a' }} />
          <div>
            <span style={styles.summaryValue}>{totales.ventas}</span>
            <span style={styles.summaryLabel}>Total Ventas</span>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <DollarSign size={28} style={{ color: '#2e7d32' }} />
          <div>
            <span style={{...styles.summaryValue, color: '#2e7d32'}}>{formatCurrency(totales.monto)}</span>
            <span style={styles.summaryLabel}>Ingresos Totales</span>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <TrendingUp size={28} style={{ color: '#1565c0' }} />
          <div>
            <span style={{...styles.summaryValue, color: '#1565c0'}}>{formatCurrency(promedioTicket)}</span>
            <span style={styles.summaryLabel}>Ticket Promedio</span>
          </div>
        </div>
      </div>

      <div style={styles.reportsGrid}>
        {/* Ventas diarias */}
        <div style={styles.reportCard}>
          <h3 style={styles.reportTitle}>Ventas por Día</h3>
          {loading ? (
            <div style={styles.loadingState}>
              <Loader2 size={30} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            </div>
          ) : reporteVentas.length === 0 ? (
            <div style={styles.emptyState}>No hay datos para el período seleccionado</div>
          ) : (
            <div style={styles.chartContainer}>
              {reporteVentas.slice(0, 14).map((dia, i) => {
                const maxMonto = Math.max(...reporteVentas.map(d => parseFloat(d.total_vendido || 0)));
                const altura = maxMonto > 0 ? (parseFloat(dia.total_vendido || 0) / maxMonto) * 100 : 0;
                return (
                  <div key={i} style={styles.barWrapper}>
                    <div style={styles.barValue}>{formatCurrency(dia.total_vendido)}</div>
                    <div 
                      style={{
                        ...styles.bar,
                        height: `${Math.max(altura, 5)}%`,
                        background: `linear-gradient(180deg, #1a5d1a, #2e8b57)`
                      }}
                    />
                    <div style={styles.barLabel}>{formatDate(dia.fecha)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Productos Top */}
        <div style={styles.reportCard}>
          <h3 style={styles.reportTitle}>
            <Package size={18} />
            Top 10 Productos Más Vendidos
          </h3>
          {loading ? (
            <div style={styles.loadingState}>
              <Loader2 size={30} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            </div>
          ) : productosTop.length === 0 ? (
            <div style={styles.emptyState}>No hay datos</div>
          ) : (
            <div style={styles.topList}>
              {productosTop.map((prod, i) => (
                <div key={i} style={styles.topItem}>
                  <div style={styles.topRank}>#{prod.ranking}</div>
                  <div style={styles.topInfo}>
                    <span style={styles.topName}>{prod.producto}</span>
                    <span style={styles.topQty}>{prod.cantidad_total} unidades</span>
                  </div>
                  <div style={styles.topAmount}>
                    {formatCurrency(prod.ingresos_generados)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  header: { marginBottom: '20px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  filterCard: { display: 'flex', gap: '20px', padding: '20px', background: 'white', borderRadius: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  dateFilter: { display: 'flex', flexDirection: 'column', gap: '8px' },
  filterLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6c757d' },
  dateInput: { padding: '10px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
  summaryCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '25px' },
  summaryCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  summaryValue: { display: 'block', fontSize: '28px', fontWeight: '700', color: '#1a5d1a' },
  summaryLabel: { fontSize: '14px', color: '#6c757d' },
  reportsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' },
  reportCard: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  reportTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#333' },
  chartContainer: { display: 'flex', alignItems: 'flex-end', gap: '8px', height: '250px', padding: '20px 0', overflowX: 'auto' },
  barWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', height: '100%' },
  barValue: { fontSize: '10px', color: '#6c757d', marginBottom: '5px', whiteSpace: 'nowrap' },
  bar: { width: '40px', borderRadius: '6px 6px 0 0', transition: 'height 0.3s' },
  barLabel: { fontSize: '10px', color: '#6c757d', marginTop: '8px', textAlign: 'center', whiteSpace: 'nowrap' },
  topList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  topItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' },
  topRank: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' },
  topInfo: { flex: 1 },
  topName: { display: 'block', fontWeight: '600', color: '#333' },
  topQty: { fontSize: '12px', color: '#6c757d' },
  topAmount: { fontWeight: '700', color: '#1a5d1a', fontSize: '16px' },
  loadingState: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#6c757d' },
};

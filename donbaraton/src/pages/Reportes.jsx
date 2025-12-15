// src/pages/Reportes.jsx
import { useState, useEffect } from 'react';
import {
  FileBarChart, TrendingUp, Package, DollarSign,
  Loader2, ArrowRight, Calendar, Warehouse
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Reportes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rentabilidad, setRentabilidad] = useState([]);
  const [inventarioValorado, setInventarioValorado] = useState([]);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    setLoading(true);
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
    const finMes = hoy.toISOString().split('T')[0];

    try {
      const [rentRes, invRes] = await Promise.all([
        supabase.rpc('fn_reporte_rentabilidad_producto', {
          p_fecha_inicio: inicioMes,
          p_fecha_fin: finMes
        }),
        supabase.rpc('fn_reporte_inventario_valorado')
      ]);

      if (rentRes.error) console.error('Error rentabilidad:', rentRes.error);
      if (invRes.error) console.error('Error inventario:', invRes.error);

      setRentabilidad(rentRes.data || []);
      setInventarioValorado(invRes.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;

  // Totales de inventario
  const totalInventario = inventarioValorado.reduce((acc, cat) => ({
    productos: acc.productos + parseInt(cat.cantidad_productos || 0),
    stock: acc.stock + parseInt(cat.stock_total || 0),
    valorCosto: acc.valorCosto + parseFloat(cat.valor_costo_total || 0),
    valorVenta: acc.valorVenta + parseFloat(cat.valor_venta_potencial || 0)
  }), { productos: 0, stock: 0, valorCosto: 0, valorVenta: 0 });

  // Totales de rentabilidad (usando campos del fn_reporte_rentabilidad_producto)
  const totalRent = rentabilidad.reduce((acc, p) => {
    const cantidad = parseInt(p.cantidad_vendida || 0);
    const ingreso = cantidad * parseFloat(p.precio_venta || 0);
    const costo = cantidad * parseFloat(p.precio_costo || 0);
    return {
      ingreso: acc.ingreso + ingreso,
      costo: acc.costo + costo,
      ganancia: acc.ganancia + parseFloat(p.ganancia_total || 0)
    };
  }, { ingreso: 0, costo: 0, ganancia: 0 });

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FileBarChart size={28} style={{ marginRight: '12px' }} />
            Reportes
          </h1>
          <p style={styles.subtitle}>
            Centro de análisis y reportes del sistema
          </p>
        </div>
      </header>

      {/* Accesos rápidos */}
      <div style={styles.quickLinks}>
        <button style={styles.linkCard} onClick={() => navigate('/reportes-ventas')}>
          <TrendingUp size={24} style={{ color: '#1a5d1a' }} />
          <div>
            <strong>Reportes de Ventas</strong>
            <span>Análisis de ventas por período</span>
          </div>
          <ArrowRight size={20} style={{ color: '#ccc' }} />
        </button>
        <button style={styles.linkCard} onClick={() => navigate('/balance-general')}>
          <DollarSign size={24} style={{ color: '#2e7d32' }} />
          <div>
            <strong>Balance General</strong>
            <span>Resumen financiero</span>
          </div>
          <ArrowRight size={20} style={{ color: '#ccc' }} />
        </button>
        <button style={styles.linkCard} onClick={() => navigate('/inventario')}>
          <Warehouse size={24} style={{ color: '#1565c0' }} />
          <div>
            <strong>Inventario</strong>
            <span>Estado del stock</span>
          </div>
          <ArrowRight size={20} style={{ color: '#ccc' }} />
        </button>
      </div>

      {loading ? (
        <div style={styles.loadingState}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
          <p>Cargando reportes...</p>
        </div>
      ) : (
        <div style={styles.reportsGrid}>
          {/* Inventario Valorado */}
          <div style={styles.reportCard}>
            <h3 style={styles.reportTitle}>
              <Package size={20} />
              Inventario Valorado por Categoría
            </h3>
            <div style={styles.summaryRow}>
              <div style={styles.summaryItem}>
                <span>{totalInventario.productos}</span>
                <label>Productos</label>
              </div>
              <div style={styles.summaryItem}>
                <span>{totalInventario.stock}</span>
                <label>Unidades</label>
              </div>
              <div style={styles.summaryItem}>
                <span style={{ color: '#1a5d1a' }}>{formatCurrency(totalInventario.valorCosto)}</span>
                <label>Valor Costo</label>
              </div>
              <div style={styles.summaryItem}>
                <span style={{ color: '#2e7d32' }}>{formatCurrency(totalInventario.valorVenta)}</span>
                <label>Valor Venta</label>
              </div>
            </div>
            {inventarioValorado.length > 0 ? (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Categoría</th>
                      <th style={styles.th}>Productos</th>
                      <th style={styles.th}>Stock</th>
                      <th style={styles.th}>Valor Costo</th>
                      <th style={styles.th}>Valor Venta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventarioValorado.slice(0, 10).map((cat, i) => (
                      <tr key={i} style={styles.tr}>
                        <td style={styles.td}><strong>{cat.categoria}</strong></td>
                        <td style={styles.td}>{cat.cantidad_productos}</td>
                        <td style={styles.td}>{cat.stock_total}</td>
                        <td style={styles.td}>{formatCurrency(cat.valor_costo_total)}</td>
                        <td style={{ ...styles.td, color: '#2e7d32', fontWeight: '600' }}>{formatCurrency(cat.valor_venta_potencial)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.emptyState}>No hay datos</div>
            )}
          </div>

          {/* Rentabilidad */}
          <div style={styles.reportCard}>
            <h3 style={styles.reportTitle}>
              <TrendingUp size={20} />
              Rentabilidad del Mes
            </h3>
            <div style={styles.summaryRow}>
              <div style={styles.summaryItem}>
                <span>{formatCurrency(totalRent.ingreso)}</span>
                <label>Ingresos</label>
              </div>
              <div style={styles.summaryItem}>
                <span style={{ color: '#c62828' }}>{formatCurrency(totalRent.costo)}</span>
                <label>Costos</label>
              </div>
              <div style={styles.summaryItem}>
                <span style={{ color: '#2e7d32', fontSize: '20px' }}>{formatCurrency(totalRent.ganancia)}</span>
                <label>Ganancia Bruta</label>
              </div>
            </div>
            {rentabilidad.length > 0 ? (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Producto</th>
                      <th style={styles.th}>Vendidos</th>
                      <th style={styles.th}>Ingreso</th>
                      <th style={styles.th}>Ganancia</th>
                      <th style={styles.th}>Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentabilidad.slice(0, 10).map((prod, i) => {
                      const ingreso = parseInt(prod.cantidad_vendida || 0) * parseFloat(prod.precio_venta || 0);
                      const margenPct = prod.precio_venta > 0
                        ? ((prod.precio_venta - prod.precio_costo) / prod.precio_venta * 100).toFixed(1)
                        : 0;
                      return (
                        <tr key={i} style={styles.tr}>
                          <td style={styles.td}><strong>{prod.producto}</strong></td>
                          <td style={styles.td}>{prod.cantidad_vendida}</td>
                          <td style={styles.td}>{formatCurrency(ingreso)}</td>
                          <td style={{ ...styles.td, color: '#2e7d32', fontWeight: '600' }}>{formatCurrency(prod.ganancia_total)}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.badge,
                              background: parseFloat(margenPct) >= 20 ? '#e8f5e9' : '#fff3e0',
                              color: parseFloat(margenPct) >= 20 ? '#2e7d32' : '#e65100'
                            }}>
                              {margenPct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={styles.emptyState}>No hay datos de ventas este mes</div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  header: { marginBottom: '20px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  quickLinks: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '25px' },
  linkCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' },
  reportsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' },
  reportCard: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  reportTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#333' },
  summaryRow: { display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', flexWrap: 'wrap' },
  summaryItem: { textAlign: 'center', flex: 1, minWidth: '80px' },
  tableWrapper: { maxHeight: '300px', overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 15px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid #e9ecef', position: 'sticky', top: 0 },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '12px 15px', fontSize: '13px', color: '#495057' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px', color: '#6c757d', gap: '15px' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#6c757d' },
};

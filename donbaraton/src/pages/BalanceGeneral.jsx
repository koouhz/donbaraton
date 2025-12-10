// src/pages/BalanceGeneral.jsx
import { useState, useEffect } from 'react';
import { 
  Scale, TrendingUp, TrendingDown, Loader2,
  DollarSign, Package, Wallet, Calendar
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function BalanceGeneral() {
  const [loading, setLoading] = useState(true);
  const [rentabilidad, setRentabilidad] = useState([]);
  const [inventario, setInventario] = useState([]);

  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const finMes = hoy.toISOString().split('T')[0];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [rentRes, invRes] = await Promise.all([
        supabase.rpc('fn_reporte_rentabilidad', {
          p_fecha_inicio: inicioMes,
          p_fecha_fin: finMes
        }),
        supabase.rpc('fn_reporte_inventario_valorado')
      ]);

      if (rentRes.error) console.error(rentRes.error);
      if (invRes.error) console.error(invRes.error);

      setRentabilidad(rentRes.data || []);
      setInventario(invRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;

  // Cálculos
  const totalIngresos = rentabilidad.reduce((sum, p) => sum + parseFloat(p.ingreso_total || 0), 0);
  const totalCostos = rentabilidad.reduce((sum, p) => sum + parseFloat(p.costo_total || 0), 0);
  const gananciasBrutas = rentabilidad.reduce((sum, p) => sum + parseFloat(p.ganancia_bruta || 0), 0);
  const margenPromedio = totalIngresos > 0 ? ((gananciasBrutas / totalIngresos) * 100).toFixed(1) : 0;

  const valorInventario = inventario.reduce((sum, c) => sum + parseFloat(c.valor_costo_total || 0), 0);
  const valorVentaPotencial = inventario.reduce((sum, c) => sum + parseFloat(c.valor_venta_potencial || 0), 0);

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Scale size={28} style={{ marginRight: '12px' }} />
            Balance General
          </h1>
          <p style={styles.subtitle}>
            Resumen financiero del mes actual
          </p>
        </div>
        <div style={styles.periodoTag}>
          <Calendar size={16} />
          {new Date(inicioMes).toLocaleDateString('es-BO')} - {new Date(finMes).toLocaleDateString('es-BO')}
        </div>
      </header>

      {loading ? (
        <div style={styles.loadingState}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
          <p>Cargando balance...</p>
        </div>
      ) : (
        <>
          {/* Resumen Principal */}
          <div style={styles.mainGrid}>
            <div style={{...styles.bigCard, borderTop: '4px solid #2e7d32'}}>
              <TrendingUp size={36} style={{ color: '#2e7d32' }} />
              <div>
                <span style={styles.bigLabel}>Ingresos del Mes</span>
                <span style={{...styles.bigValue, color: '#2e7d32'}}>{formatCurrency(totalIngresos)}</span>
              </div>
            </div>
            <div style={{...styles.bigCard, borderTop: '4px solid #c62828'}}>
              <TrendingDown size={36} style={{ color: '#c62828' }} />
              <div>
                <span style={styles.bigLabel}>Costos del Mes</span>
                <span style={{...styles.bigValue, color: '#c62828'}}>{formatCurrency(totalCostos)}</span>
              </div>
            </div>
            <div style={{...styles.bigCard, borderTop: '4px solid #1a5d1a'}}>
              <DollarSign size={36} style={{ color: '#1a5d1a' }} />
              <div>
                <span style={styles.bigLabel}>Ganancia Bruta</span>
                <span style={{...styles.bigValue, color: '#1a5d1a'}}>{formatCurrency(gananciasBrutas)}</span>
                <span style={styles.margenTag}>{margenPromedio}% margen</span>
              </div>
            </div>
          </div>

          {/* Inventario */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Package size={20} />
              Valoración del Inventario
            </h2>
            <div style={styles.invGrid}>
              <div style={styles.invCard}>
                <Wallet size={24} style={{ color: '#1565c0' }} />
                <div>
                  <span style={styles.invLabel}>Valor a Costo</span>
                  <span style={styles.invValue}>{formatCurrency(valorInventario)}</span>
                </div>
              </div>
              <div style={styles.invCard}>
                <TrendingUp size={24} style={{ color: '#2e7d32' }} />
                <div>
                  <span style={styles.invLabel}>Valor Potencial de Venta</span>
                  <span style={{...styles.invValue, color: '#2e7d32'}}>{formatCurrency(valorVentaPotencial)}</span>
                </div>
              </div>
              <div style={styles.invCard}>
                <DollarSign size={24} style={{ color: '#1a5d1a' }} />
                <div>
                  <span style={styles.invLabel}>Ganancia Potencial</span>
                  <span style={{...styles.invValue, color: '#1a5d1a'}}>{formatCurrency(valorVentaPotencial - valorInventario)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalle por categoría */}
          {inventario.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Inventario por Categoría</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Categoría</th>
                    <th style={styles.th}>Productos</th>
                    <th style={styles.th}>Stock Total</th>
                    <th style={styles.th}>Valor Costo</th>
                    <th style={styles.th}>Valor Venta</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map((cat, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}><strong>{cat.categoria}</strong></td>
                      <td style={styles.td}>{cat.cantidad_productos}</td>
                      <td style={styles.td}>{cat.stock_total}</td>
                      <td style={styles.td}>{formatCurrency(cat.valor_costo_total)}</td>
                      <td style={{...styles.td, color: '#2e7d32', fontWeight: '600'}}>{formatCurrency(cat.valor_venta_potencial)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  periodoTag: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#f8f9fa', borderRadius: '8px', fontSize: '14px', color: '#6c757d' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px' },
  bigCard: { padding: '30px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  bigLabel: { display: 'block', fontSize: '14px', color: '#6c757d', marginBottom: '5px' },
  bigValue: { display: 'block', fontSize: '32px', fontWeight: '700' },
  margenTag: { display: 'inline-block', marginTop: '8px', padding: '4px 10px', background: '#e8f5e9', borderRadius: '20px', fontSize: '12px', color: '#2e7d32', fontWeight: '600' },
  section: { background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#333' },
  invGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' },
  invCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' },
  invLabel: { display: 'block', fontSize: '13px', color: '#6c757d' },
  invValue: { display: 'block', fontSize: '22px', fontWeight: '700', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 15px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '12px 15px', fontSize: '14px', color: '#495057' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px', color: '#6c757d', gap: '15px' },
};

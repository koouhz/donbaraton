// src/pages/CuentasPorPagar.jsx
import { useState, useEffect } from 'react';
import {
  Receipt, DollarSign, Loader2, Calendar,
  AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function CuentasPorPagar() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    setLoading(true);
    try {
      // Usar función fn_leer_cuentas_por_pagar
      const { data, error } = await supabase.rpc('fn_leer_cuentas_por_pagar');

      if (error) throw error;
      // Mapear campos de la función a la estructura esperada
      const cuentasTransformadas = (data || []).map(c => ({
        id: c.id,
        factura_nro: c.factura_nro,
        fecha_vencimiento: c.fecha_vencimiento,
        monto_total: c.monto_total,
        saldo_pendiente: c.saldo_pendiente,
        estado: c.estado,
        proveedores: { razon_social: c.proveedor }
      }));
      setCuentas(cuentasTransformadas);
    } catch (err) {
      console.error('Error:', err);
      setCuentas([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('es-BO');

  const getEstadoStyle = (estado, fechaVenc) => {
    if (estado === 'PAGADA') {
      return { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle size={14} /> };
    }
    const diasVencimiento = Math.ceil((new Date(fechaVenc) - new Date()) / (1000 * 60 * 60 * 24));
    if (diasVencimiento < 0) {
      return { bg: '#ffebee', color: '#c62828', icon: <AlertCircle size={14} /> };
    } else if (diasVencimiento <= 7) {
      return { bg: '#fff3e0', color: '#e65100', icon: <Clock size={14} /> };
    }
    return { bg: '#e3f2fd', color: '#1565c0', icon: <Calendar size={14} /> };
  };

  // Totales
  const totalPendiente = cuentas.filter(c => c.estado !== 'PAGADA').reduce((sum, c) => sum + parseFloat(c.saldo_pendiente || 0), 0);
  const vencidas = cuentas.filter(c => c.estado !== 'PAGADA' && new Date(c.fecha_vencimiento) < new Date()).length;

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Receipt size={28} style={{ marginRight: '12px' }} />
            Cuentas por Pagar
          </h1>
          <p style={styles.subtitle}>
            Gestión de deudas con proveedores
          </p>
        </div>
      </header>

      {/* Resumen */}
      <div style={styles.summaryCards}>
        <div style={styles.summaryCard}>
          <DollarSign size={28} style={{ color: '#c62828' }} />
          <div>
            <span style={{ ...styles.summaryValue, color: '#c62828' }}>{formatCurrency(totalPendiente)}</span>
            <span style={styles.summaryLabel}>Total Pendiente</span>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <Receipt size={28} style={{ color: '#1a5d1a' }} />
          <div>
            <span style={styles.summaryValue}>{cuentas.length}</span>
            <span style={styles.summaryLabel}>Total Cuentas</span>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <AlertCircle size={28} style={{ color: '#e65100' }} />
          <div>
            <span style={{ ...styles.summaryValue, color: '#e65100' }}>{vencidas}</span>
            <span style={styles.summaryLabel}>Vencidas</span>
          </div>
        </div>
      </div>

      <div style={styles.infoCard}>
        <AlertCircle size={18} />
        <p>Las cuentas por pagar se generan automáticamente al recepcionar órdenes de compra.</p>
      </div>

      {/* Tabla */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
          </div>
        ) : cuentas.length === 0 ? (
          <div style={styles.emptyState}>
            <Receipt size={48} style={{ color: '#ccc' }} />
            <p>No hay cuentas por pagar</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Proveedor</th>
                <th style={styles.th}>Factura</th>
                <th style={styles.th}>Vencimiento</th>
                <th style={styles.th}>Monto Total</th>
                <th style={styles.th}>Saldo Pendiente</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((cuenta, i) => {
                const estadoStyle = getEstadoStyle(cuenta.estado, cuenta.fecha_vencimiento);
                return (
                  <tr key={cuenta.id || i} style={styles.tr}>
                    <td style={styles.td}><strong>{cuenta.proveedores?.razon_social || 'N/A'}</strong></td>
                    <td style={styles.td}>{cuenta.factura_nro || '-'}</td>
                    <td style={styles.td}>{formatDate(cuenta.fecha_vencimiento)}</td>
                    <td style={styles.td}>{formatCurrency(cuenta.monto_total)}</td>
                    <td style={{ ...styles.td, fontWeight: '700', color: cuenta.saldo_pendiente > 0 ? '#c62828' : '#2e7d32' }}>
                      {formatCurrency(cuenta.saldo_pendiente)}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: estadoStyle.bg,
                        color: estadoStyle.color
                      }}>
                        {estadoStyle.icon}
                        {cuenta.estado}
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
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  summaryCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' },
  summaryCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  summaryValue: { display: 'block', fontSize: '24px', fontWeight: '700', color: '#1a5d1a' },
  summaryLabel: { fontSize: '13px', color: '#6c757d' },
  infoCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', background: '#e3f2fd', borderRadius: '10px', marginBottom: '20px', color: '#1565c0', fontSize: '14px' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '60px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
};

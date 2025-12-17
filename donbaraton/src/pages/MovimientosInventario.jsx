// src/pages/MovimientosInventario.jsx
import { useState, useEffect } from 'react';
import {
  History, ArrowUpCircle, ArrowDownCircle, Loader2,
  Calendar, Package, Filter
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function MovimientosInventario() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    setLoading(true);
    try {
      // Usar función fn_leer_movimientos_inventario
      const { data, error } = await supabase.rpc('fn_leer_movimientos_inventario');

      if (error) throw error;
      // Mapear campos de la función a la estructura esperada
      const movimientosTransformados = (data || []).map(m => ({
        id: m.id,
        fecha: m.fecha,
        tipo: m.tipo,
        cantidad: m.cantidad,
        documento: m.documento,
        motivo: m.motivo,
        productos: { nombre: m.producto }
      }));
      setMovimientos(movimientosTransformados);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar movimientos');
      setMovimientos([]);
    } finally {
      setLoading(false);
    }
  };

  const getTipoStyle = (tipo) => {
    const entradas = ['ENTRADA', 'AJUSTE+', 'DEVOLUCION_VENTA'];
    const salidas = ['SALIDA', 'AJUSTE-', 'VENTA', 'MERMA', 'DEVOLUCION_PROVEEDOR'];

    if (entradas.includes(tipo)) {
      return { bg: '#e8f5e9', color: '#2e7d32', icon: <ArrowUpCircle size={16} /> };
    }
    return { bg: '#ffebee', color: '#c62828', icon: <ArrowDownCircle size={16} /> };
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('es-BO');

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <History size={28} style={{ marginRight: '12px' }} />
            Movimientos de Inventario
          </h1>
          <p style={styles.subtitle}>
            Historial de entradas y salidas de stock (Kardex)
          </p>
        </div>
      </header>

      {/* Info */}
      <div style={styles.infoCard}>
        <Package size={20} />
        <p>
          Los movimientos se registran automáticamente al realizar ventas, recepciones de compra,
          devoluciones y ajustes de inventario.
        </p>
      </div>

      {/* Tabla */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando movimientos...</p>
          </div>
        ) : movimientos.length === 0 ? (
          <div style={styles.emptyState}>
            <History size={48} style={{ color: '#ccc' }} />
            <p>No hay movimientos registrados</p>
            <span style={{ color: '#999' }}>Los movimientos aparecerán aquí cuando se realicen ventas o compras</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Cantidad</th>
                <th style={styles.th}>Documento</th>
                <th style={styles.th}>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((mov, i) => {
                const tipoStyle = getTipoStyle(mov.tipo);
                return (
                  <tr key={mov.id || i} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} style={{ color: '#6c757d' }} />
                        {formatDate(mov.fecha)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <strong>{mov.productos?.nombre || 'Producto'}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: tipoStyle.bg,
                        color: tipoStyle.color
                      }}>
                        {tipoStyle.icon}
                        {mov.tipo}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        fontWeight: '700',
                        color: getTipoStyle(mov.tipo).color
                      }}>
                        {mov.tipo?.includes('+') || ['ENTRADA', 'DEVOLUCION_VENTA'].includes(mov.tipo) ? '+' : '-'}
                        {mov.cantidad}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <code style={styles.code}>{mov.documento || '-'}</code>
                    </td>
                    <td style={styles.td}>{mov.motivo || '-'}</td>
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
  infoCard: { display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '20px', background: '#e3f2fd', borderRadius: '12px', marginBottom: '20px', border: '1px solid #90caf9', color: '#1565c0' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  code: { background: '#f8f9fa', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px', textAlign: 'center' },
};

// src/pages/AlertasStock.jsx
import { useState, useEffect } from 'react';
import {
  AlertTriangle, AlertCircle, Clock, Package,
  Loader2, RefreshCw, ChevronRight, Calendar
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AlertasStock() {
  const navigate = useNavigate();
  const [alertasStock, setAlertasStock] = useState([]);
  const [alertasVencimiento, setAlertasVencimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock');

  useEffect(() => {
    cargarAlertas();
  }, []);

  const cargarAlertas = async () => {
    setLoading(true);
    try {
      // Consultar productos con bajo stock directamente con más detalles
      const [stockRes, vencRes] = await Promise.all([
        supabase
          .from('productos')
          .select(`
            id_producto,
            codigo_interno,
            nombre,
            marca,
            stock_actual,
            stock_minimo,
            stock_maximo,
            precio_venta,
            unidad_medida,
            categorias (nombre)
          `)
          .eq('estado', 'ACTIVO')
          .order('stock_actual', { ascending: true }),
        supabase.rpc('fn_alerta_vencimientos', { p_dias_anticipacion: 30 })
      ]);

      if (stockRes.error) {
        console.error('Error stock:', stockRes.error);
      } else {
        // Filtrar productos donde stock_actual <= stock_minimo
        const productosConBajoStock = (stockRes.data || [])
          .filter(p => p.stock_actual <= p.stock_minimo)
          .map(p => ({
            ...p,
            categoria: p.categorias?.nombre || 'Sin categoría',
            faltante: Math.max(0, p.stock_minimo - p.stock_actual),
            porcentaje_stock: p.stock_minimo > 0 ? Math.round((p.stock_actual / p.stock_minimo) * 100) : 0
          }));
        setAlertasStock(productosConBajoStock);
      }

      if (vencRes.error) {
        console.error('Error vencimientos:', vencRes.error);
      } else {
        setAlertasVencimiento(vencRes.data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  const getSemaforoColor = (estado) => {
    const colores = {
      ROJO: { bg: '#ffebee', color: '#c62828', border: '#ef9a9a' },
      AMARILLO: { bg: '#fff8e1', color: '#f57f17', border: '#ffe082' },
      VERDE: { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' }
    };
    return colores[estado] || colores.VERDE;
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <AlertTriangle size={28} style={{ marginRight: '12px', color: '#e65100' }} />
            Alertas de Stock
          </h1>
          <p style={styles.subtitle}>
            Monitoreo de productos con stock bajo y próximos a vencer
          </p>
        </div>
        <button style={styles.refreshButton} onClick={cargarAlertas} disabled={loading}>
          <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualizar
        </button>
      </header>

      {/* Resumen */}
      <div style={styles.summaryCards}>
        <div
          style={{
            ...styles.summaryCard,
            borderLeft: '4px solid #c62828',
            background: activeTab === 'stock' ? '#fff5f5' : 'white',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('stock')}
        >
          <AlertTriangle size={32} style={{ color: '#c62828' }} />
          <div>
            <span style={{ ...styles.summaryValue, color: '#c62828' }}>{alertasStock.length}</span>
            <span style={styles.summaryLabel}>Productos con Stock Bajo</span>
          </div>
          <ChevronRight size={20} style={{ color: '#ccc' }} />
        </div>
        <div
          style={{
            ...styles.summaryCard,
            borderLeft: '4px solid #e65100',
            background: activeTab === 'vencimiento' ? '#fff8e1' : 'white',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab('vencimiento')}
        >
          <Clock size={32} style={{ color: '#e65100' }} />
          <div>
            <span style={{ ...styles.summaryValue, color: '#e65100' }}>{alertasVencimiento.length}</span>
            <span style={styles.summaryLabel}>Próximos a Vencer (30 días)</span>
          </div>
          <ChevronRight size={20} style={{ color: '#ccc' }} />
        </div>
      </div>

      {/* Contenido por tabs */}
      {loading ? (
        <div style={styles.loadingState}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
          <p>Cargando alertas...</p>
        </div>
      ) : activeTab === 'stock' ? (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <AlertTriangle size={20} style={{ color: '#c62828' }} />
            Productos con Stock Bajo o Agotado
          </h2>

          {alertasStock.length === 0 ? (
            <div style={styles.emptyState}>
              <Package size={48} style={{ color: '#2e7d32' }} />
              <p style={{ color: '#2e7d32' }}>¡Excelente! No hay productos con stock bajo</p>
            </div>
          ) : (
            <div style={styles.alertsList}>
              {alertasStock.map((producto, index) => (
                <div
                  key={producto.id_producto || index}
                  style={{
                    ...styles.alertCard,
                    background: producto.stock_actual <= 0 ? '#fff5f5' : '#fffbf0',
                    borderLeft: `4px solid ${producto.stock_actual <= 0 ? '#c62828' : '#e65100'}`
                  }}
                >
                  {/* Icono de estado */}
                  <div style={{
                    ...styles.alertIcon,
                    background: producto.stock_actual <= 0 ? '#ffcdd2' : '#ffe0b2'
                  }}>
                    {producto.stock_actual <= 0 ? (
                      <AlertTriangle size={24} style={{ color: '#c62828' }} />
                    ) : (
                      <AlertCircle size={24} style={{ color: '#e65100' }} />
                    )}
                  </div>

                  {/* Información del producto */}
                  <div style={styles.alertContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <code style={{
                        background: '#e9ecef',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#495057'
                      }}>
                        {producto.codigo_interno}
                      </code>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: '600',
                        background: producto.stock_actual <= 0 ? '#c62828' : '#e65100',
                        color: 'white'
                      }}>
                        {producto.stock_actual <= 0 ? 'AGOTADO' : 'BAJO STOCK'}
                      </span>
                    </div>
                    <h3 style={styles.alertTitle}>{producto.nombre}</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {producto.marca && (
                        <span style={styles.productDetail}>
                          <strong>Marca:</strong> {producto.marca}
                        </span>
                      )}
                      <span style={styles.productDetail}>
                        <strong>Categoría:</strong> {producto.categoria}
                      </span>
                      <span style={styles.productDetail}>
                        <strong>Unidad:</strong> {producto.unidad_medida || 'UNIDAD'}
                      </span>
                      <span style={styles.productDetail}>
                        <strong>Precio:</strong> Bs {parseFloat(producto.precio_venta || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Estadísticas de stock */}
                  <div style={styles.alertStats}>
                    <div style={styles.alertStat}>
                      <span style={styles.alertStatLabel}>Stock Actual</span>
                      <span style={{
                        ...styles.alertStatValue,
                        color: producto.stock_actual <= 0 ? '#c62828' : '#e65100'
                      }}>
                        {producto.stock_actual}
                      </span>
                    </div>
                    <div style={styles.alertStat}>
                      <span style={styles.alertStatLabel}>Mínimo</span>
                      <span style={styles.alertStatValue}>{producto.stock_minimo}</span>
                    </div>
                    <div style={styles.alertStat}>
                      <span style={styles.alertStatLabel}>Faltante</span>
                      <span style={{ ...styles.alertStatValue, color: '#c62828' }}>
                        -{producto.faltante}
                      </span>
                    </div>
                    <div style={styles.alertStat}>
                      <span style={styles.alertStatLabel}>Estado</span>
                      {/* Barra de progreso */}
                      <div style={{
                        width: '60px',
                        height: '8px',
                        background: '#e9ecef',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginTop: '4px'
                      }}>
                        <div style={{
                          width: `${Math.min(producto.porcentaje_stock, 100)}%`,
                          height: '100%',
                          background: producto.stock_actual <= 0 ? '#c62828' : '#e65100',
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{ fontSize: '10px', color: '#6c757d' }}>
                        {producto.porcentaje_stock}%
                      </span>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <button
                    style={styles.orderButton}
                    onClick={() => navigate('/compras')}
                  >
                    Crear Orden
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Clock size={20} style={{ color: '#e65100' }} />
            Productos Próximos a Vencer
          </h2>

          {alertasVencimiento.length === 0 ? (
            <div style={styles.emptyState}>
              <Calendar size={48} style={{ color: '#2e7d32' }} />
              <p style={{ color: '#2e7d32' }}>No hay productos próximos a vencer</p>
            </div>
          ) : (
            <div style={styles.alertsList}>
              {alertasVencimiento.map((alerta, index) => {
                const semaforoStyle = getSemaforoColor(alerta.estado_alerta);
                return (
                  <div
                    key={index}
                    style={{
                      ...styles.alertCard,
                      background: semaforoStyle.bg,
                      borderColor: semaforoStyle.border
                    }}
                  >
                    <div style={{
                      ...styles.alertIcon,
                      background: semaforoStyle.color
                    }}>
                      <Clock size={24} style={{ color: 'white' }} />
                    </div>
                    <div style={styles.alertContent}>
                      <h3 style={styles.alertTitle}>{alerta.producto}</h3>
                      <p style={styles.alertProveedor}>
                        Lote: {alerta.lote || 'Sin lote'}
                      </p>
                    </div>
                    <div style={styles.alertStats}>
                      <div style={styles.alertStat}>
                        <span style={styles.alertStatLabel}>Vence</span>
                        <span style={styles.alertStatValue}>
                          {new Date(alerta.fecha_vencimiento).toLocaleDateString('es-BO')}
                        </span>
                      </div>
                      <div style={styles.alertStat}>
                        <span style={styles.alertStatLabel}>Días</span>
                        <span style={{
                          ...styles.alertStatValue,
                          color: semaforoStyle.color
                        }}>
                          {alerta.dias_restantes}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      ...styles.semaforoBadge,
                      background: semaforoStyle.color
                    }}>
                      {alerta.estado_alerta}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
  refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', color: '#495057' },
  summaryCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' },
  summaryCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s' },
  summaryValue: { fontSize: '36px', fontWeight: '700', display: 'block' },
  summaryLabel: { fontSize: '14px', color: '#6c757d' },
  section: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#333' },
  alertsList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  alertCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: '#fafafa', borderRadius: '12px', border: '1px solid #e9ecef', flexWrap: 'wrap' },
  alertIcon: { width: '50px', height: '50px', borderRadius: '12px', background: '#ffebee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertContent: { flex: 1, minWidth: '200px' },
  alertTitle: { margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' },
  alertProveedor: { margin: '5px 0 0 0', fontSize: '13px', color: '#6c757d' },
  alertStats: { display: 'flex', gap: '25px' },
  alertStat: { textAlign: 'center' },
  alertStatLabel: { display: 'block', fontSize: '11px', color: '#6c757d', textTransform: 'uppercase', marginBottom: '4px' },
  alertStatValue: { fontSize: '20px', fontWeight: '700', color: '#333' },
  orderButton: { padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  semaforoBadge: { padding: '8px 16px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', color: '#6c757d', gap: '15px', background: 'white', borderRadius: '16px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  productDetail: { fontSize: '12px', color: '#666', display: 'inline-block' },
};

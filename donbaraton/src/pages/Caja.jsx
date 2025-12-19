// src/pages/Caja.jsx
import { useState, useEffect } from 'react';
import {
  Wallet, ShoppingCart, TrendingUp, Clock,
  Loader2, DollarSign, CreditCard, QrCode, Banknote,
  Eye, X, Package, User, Receipt, Calendar
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

// Roles que pueden ver todas las ventas
const ROLES_VER_TODO = ['administrador', 'gerente', 'admin'];

export default function Caja() {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalHoy, setTotalHoy] = useState(0);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [detallesVenta, setDetallesVenta] = useState([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  // NOTA: PostgreSQL guarda timestamps en UTC, por lo que usamos fecha UTC
  // para que coincida con las ventas guardadas en la base de datos.
  // Después de las 20:00 hora Bolivia (-4), la fecha UTC ya es del día siguiente.
  const hoy = new Date().toISOString().split('T')[0];

  // Obtener información del usuario logueado
  const getUserInfo = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (e) {
      console.error('Error al obtener usuario:', e);
    }
    return null;
  };

  // Verificar si el usuario puede ver todas las ventas
  const puedeVerTodo = () => {
    const user = getUserInfo();
    if (!user) return false;

    // Obtener el rol del usuario (puede estar en diferentes propiedades)
    const rol = (user.rol || user.roles?.nombre || user.cargo || '').toLowerCase();
    return ROLES_VER_TODO.includes(rol);
  };

  useEffect(() => {
    const user = getUserInfo();
    setUserInfo(user);
    cargarVentasHoy();
  }, []);

  const cargarVentasHoy = async () => {
    setLoading(true);
    try {
      const user = getUserInfo();
      const verTodo = puedeVerTodo();

      // DEBUG: Ver qué datos tenemos del usuario
      console.log('=== DEBUG CAJA ===');
      console.log('Usuario completo:', user);
      console.log('Rol detectado:', user?.rol || user?.roles?.nombre || user?.cargo);
      console.log('¿Puede ver todo?:', verTodo);
      console.log('Usuario ID:', user?.usuario_id);

      // Si es cajero, filtrar por su ID de usuario
      const params = {
        p_fecha_inicio: hoy,
        p_fecha_fin: hoy,
        p_id_usuario: null // Por defecto null = ver todas
      };

      console.log('Fecha enviada (hoy):', hoy);

      // Si NO puede ver todo (es cajero), agregar filtro por usuario
      if (!verTodo && user?.usuario_id) {
        params.p_id_usuario = user.usuario_id;
        console.log('Filtrando ventas por usuario:', user.usuario_id);
      } else {
        console.log('Mostrando TODAS las ventas (rol admin/gerente)');
      }

      // Usar la nueva función que soporta filtro por usuario
      const { data, error } = await supabase.rpc('fn_leer_ventas_cajero', params);

      if (error) {
        console.error('Error RPC fn_leer_ventas_cajero:', error);
        throw error;
      }

      console.log('Ventas recibidas:', data?.length || 0);

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

  // Convertir hora UTC de la base de datos a hora local
  const formatTime = (date) => {
    if (!date) return '--:--';
    // Añadir 'Z' si no tiene para indicar que es UTC
    const utcDate = date.toString().includes('Z') ? date : date + 'Z';
    return new Date(utcDate).toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    if (!date) return '--/--/----';
    const utcDate = date.toString().includes('Z') ? date : date + 'Z';
    return new Date(utcDate).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const verDetalles = async (venta) => {
    setVentaSeleccionada(venta);
    setShowDetalleModal(true);
    setLoadingDetalles(true);

    try {
      const { data, error } = await supabase
        .from('detalle_ventas')
        .select(`
          *,
          productos (nombre, codigo_interno, marca)
        `)
        .eq('id_venta', venta.id);

      if (!error) {
        setDetallesVenta(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar detalles');
    } finally {
      setLoadingDetalles(false);
    }
  };

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
            {puedeVerTodo()
              ? 'Resumen de todas las operaciones del día'
              : `Mis ventas del día${userInfo?.nombres ? ` - ${userInfo.nombres}` : ''}`
            }
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
        <div style={{ ...styles.statCard, borderTop: '4px solid #1a5d1a' }}>
          <ShoppingCart size={32} style={{ color: '#1a5d1a' }} />
          <div>
            <span style={styles.statValue}>{ventas.length}</span>
            <span style={styles.statLabel}>Ventas Hoy</span>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #2e7d32' }}>
          <DollarSign size={32} style={{ color: '#2e7d32' }} />
          <div>
            <span style={{ ...styles.statValue, color: '#2e7d32' }}>{formatCurrency(totalHoy)}</span>
            <span style={styles.statLabel}>Total Recaudado</span>
          </div>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #1565c0' }}>
          <TrendingUp size={32} style={{ color: '#1565c0' }} />
          <div>
            <span style={{ ...styles.statValue, color: '#1565c0' }}>
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
                {/* Mostrar cajero solo para admin/gerente */}
                {puedeVerTodo() && (
                  <div style={styles.ventaCajero}>
                    <User size={14} style={{ marginRight: '4px' }} />
                    {venta.cajero || 'Sin asignar'}
                  </div>
                )}
                <div style={styles.ventaComprobante}>
                  {venta.comprobante}
                </div>
                <div style={styles.ventaTotal}>
                  {formatCurrency(venta.total)}
                </div>
                <button
                  style={styles.detalleButton}
                  onClick={() => verDetalles(venta)}
                >
                  <Eye size={16} />
                  Detalles
                </button>
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

      {/* Modal de Detalles de Venta */}
      {showDetalleModal && ventaSeleccionada && (
        <div style={styles.modalOverlay} onClick={() => setShowDetalleModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                <Receipt size={20} />
                Detalle de Venta
              </h3>
              <button style={styles.closeButton} onClick={() => setShowDetalleModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              {/* Info de la venta */}
              <div style={styles.ventaInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}><Receipt size={14} /> Ticket:</span>
                  <span style={styles.infoValue}>{ventaSeleccionada.id}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}><Calendar size={14} /> Fecha:</span>
                  <span style={styles.infoValue}>{formatDate(ventaSeleccionada.fecha)} - {formatTime(ventaSeleccionada.fecha)}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}><User size={14} /> Cliente:</span>
                  <span style={styles.infoValue}>{ventaSeleccionada.cliente || 'Cliente General'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Comprobante:</span>
                  <span style={styles.infoValue}>{ventaSeleccionada.comprobante}</span>
                </div>
              </div>

              {/* Productos */}
              <h4 style={styles.productosTitle}>
                <Package size={16} />
                Productos ({detallesVenta.length})
              </h4>

              {loadingDetalles ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
                </div>
              ) : (
                <table style={styles.detalleTable}>
                  <thead>
                    <tr>
                      <th style={styles.detalleTh}>Producto</th>
                      <th style={styles.detalleTh}>Cant.</th>
                      <th style={styles.detalleTh}>P. Unit.</th>
                      <th style={styles.detalleTh}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detallesVenta.map((det, i) => (
                      <tr key={i}>
                        <td style={styles.detalleTd}>
                          <strong>{det.productos?.nombre || 'Producto'}</strong>
                          <span style={{ display: 'block', fontSize: '11px', color: '#6c757d' }}>
                            {det.productos?.codigo_interno}
                          </span>
                        </td>
                        <td style={{ ...styles.detalleTd, textAlign: 'center' }}>{det.cantidad}</td>
                        <td style={styles.detalleTd}>{formatCurrency(det.precio_unitario)}</td>
                        <td style={{ ...styles.detalleTd, fontWeight: '600' }}>{formatCurrency(det.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Total */}
              <div style={styles.totalRow}>
                <span>TOTAL</span>
                <strong>{formatCurrency(ventaSeleccionada.total)}</strong>
              </div>
            </div>
          </div>
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
  ventaCard: { display: 'grid', gridTemplateColumns: '100px 1fr 130px 120px 100px auto', alignItems: 'center', gap: '15px', padding: '15px 20px', background: '#f8f9fa', borderRadius: '10px' },
  ventaTime: { display: 'flex', alignItems: 'center', gap: '8px', color: '#6c757d', fontSize: '14px' },
  ventaCliente: { fontWeight: '500', color: '#333' },
  ventaCajero: { display: 'flex', alignItems: 'center', fontSize: '13px', color: '#1565c0', background: '#e3f2fd', padding: '4px 10px', borderRadius: '6px', fontWeight: '500' },
  ventaComprobante: { fontSize: '13px', color: '#6c757d' },
  ventaTotal: { fontWeight: '700', color: '#1a5d1a', textAlign: 'right', fontSize: '16px' },
  detalleButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#e8f5e9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#1a5d1a', fontSize: '13px', fontWeight: '500' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  actionCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '25px', background: 'white', border: '2px solid #e9ecef', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px', fontWeight: '500', color: '#333' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '60px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },

  // Modal styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  modalTitle: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a5d1a', display: 'flex', alignItems: 'center', gap: '10px' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d' },
  modalBody: { padding: '25px', overflowY: 'auto', flex: 1 },
  ventaInfo: { background: '#f8f9fa', borderRadius: '10px', padding: '15px', marginBottom: '20px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef' },
  infoLabel: { display: 'flex', alignItems: 'center', gap: '8px', color: '#6c757d', fontSize: '14px' },
  infoValue: { fontWeight: '500', color: '#333', fontSize: '14px' },
  productosTitle: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#333' },
  detalleTable: { width: '100%', borderCollapse: 'collapse', marginBottom: '20px' },
  detalleTh: { padding: '10px 12px', textAlign: 'left', background: '#f8f9fa', fontSize: '12px', fontWeight: '600', color: '#333' },
  detalleTd: { padding: '10px 12px', borderBottom: '1px solid #e9ecef', fontSize: '13px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', borderRadius: '10px', color: 'white', fontSize: '18px', fontWeight: '700' },
};

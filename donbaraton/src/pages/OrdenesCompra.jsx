// src/pages/OrdenesCompra.jsx
import { useState, useEffect } from 'react';
import { 
  FileText, Plus, Eye, X, Save, Loader2, 
  Calendar, Search, Filter, Truck, Package,
  CheckCircle, Clock, XCircle, Trash2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function OrdenesCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ordenDetalle, setOrdenDetalle] = useState(null);
  const [detallesOrden, setDetallesOrden] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');
  
  // Form para nueva orden
  const [formData, setFormData] = useState({
    proveedor_id: '',
    fecha_entrega: '',
    items: []
  });
  const [itemTemp, setItemTemp] = useState({ producto_id: '', cantidad: '', precio: '' });

  const getUser = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try { 
        const parsed = JSON.parse(user);
        return { id: parsed.id || 1, username: parsed.username || 'admin' }; 
      } catch { return { id: 1, username: 'admin' }; }
    }
    return { id: 1, username: 'admin' };
  };

  useEffect(() => {
    cargarDatos();
  }, [filterEstado]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [ordRes, provRes, prodRes] = await Promise.all([
        supabase.rpc('fn_leer_ordenes_compra', { 
          p_estado: filterEstado || null,
          p_fecha_inicio: null,
          p_fecha_fin: null
        }),
        supabase.rpc('fn_leer_proveedores', { p_buscar_texto: null }),
        supabase.rpc('fn_leer_productos', { p_buscar: null, p_categoria_id: null })
      ]);

      if (ordRes.error) throw ordRes.error;
      if (provRes.error) throw provRes.error;
      if (prodRes.error) throw prodRes.error;

      setOrdenes(ordRes.data || []);
      setProveedores(provRes.data || []);
      setProductos(prodRes.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.proveedor_id) {
      toast.error('Seleccione un proveedor');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('Agregue al menos un producto');
      return;
    }

    setSaving(true);
    try {
      const user = getUser();
      const detallesJson = formData.items.map(item => ({
        producto_id: item.producto_id,
        cantidad: parseInt(item.cantidad),
        precio: parseFloat(item.precio)
      }));

      const { data, error } = await supabase.rpc('fn_crear_orden_compra', {
        p_proveedor_id: formData.proveedor_id,
        p_fecha_entrega: formData.fecha_entrega || null,
        p_detalles_json: detallesJson,
        p_usuario_id: user.id,
        p_usuario_nombre: user.username
      });

      if (error) {
        toast.error(error.message || 'Error al crear orden');
      } else {
        toast.success('Orden de compra creada');
        setShowModal(false);
        resetForm();
        cargarDatos();
      }
    } catch (err) {
      toast.error('Error al crear orden');
    } finally {
      setSaving(false);
    }
  };

  const handleAnular = async (ordenId) => {
    const motivo = window.prompt('Ingrese el motivo de anulación:');
    if (!motivo) return;

    try {
      const user = getUser();
      const { error } = await supabase.rpc('fn_anular_orden_compra', {
        p_orden_id: ordenId,
        p_motivo: motivo,
        p_usuario_auditoria: user.username
      });

      if (error) {
        if (error.message.includes('procesada')) {
          toast.error('No se puede anular una orden ya procesada');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Orden anulada');
        cargarDatos();
      }
    } catch (err) {
      toast.error('Error al anular');
    }
  };

  const verDetalle = async (orden) => {
    setOrdenDetalle(orden);
    try {
      const { data, error } = await supabase.rpc('fn_leer_detalle_orden', {
        p_orden_id: orden.id
      });
      if (error) throw error;
      setDetallesOrden(data || []);
      setShowDetalleModal(true);
    } catch (err) {
      toast.error('Error al cargar detalle');
    }
  };

  const agregarItem = () => {
    if (!itemTemp.producto_id || !itemTemp.cantidad || !itemTemp.precio) {
      toast.error('Complete todos los campos del producto');
      return;
    }
    const producto = productos.find(p => p.id === itemTemp.producto_id);
    setFormData({
      ...formData,
      items: [...formData.items, {
        ...itemTemp,
        nombre: producto?.nombre || ''
      }]
    });
    setItemTemp({ producto_id: '', cantidad: '', precio: '' });
  };

  const eliminarItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData({ proveedor_id: '', fecha_entrega: '', items: [] });
    setItemTemp({ producto_id: '', cantidad: '', precio: '' });
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      PENDIENTE: { bg: '#fff3e0', color: '#e65100', icon: <Clock size={14} /> },
      RECIBIDA: { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle size={14} /> },
      CANCELADA: { bg: '#ffebee', color: '#c62828', icon: <XCircle size={14} /> }
    };
    return estilos[estado] || estilos.PENDIENTE;
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('es-BO');

  const totalItems = formData.items.reduce((sum, item) => sum + (parseFloat(item.precio) * parseInt(item.cantidad)), 0);

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FileText size={28} style={{ marginRight: '12px' }} />
            Órdenes de Compra
          </h1>
          <p style={styles.subtitle}>
            Gestión de pedidos a proveedores • {ordenes.length} órdenes
          </p>
        </div>
        <button style={styles.primaryButton} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Nueva Orden
        </button>
      </header>

      {/* Filtros */}
      <div style={styles.toolbar}>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          style={styles.select}
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">🟠 Pendiente</option>
          <option value="RECIBIDA">🟢 Recibida</option>
          <option value="CANCELADA">🔴 Cancelada</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando órdenes...</p>
          </div>
        ) : ordenes.length === 0 ? (
          <div style={styles.emptyState}>
            <FileText size={48} style={{ color: '#ccc' }} />
            <p>No hay órdenes de compra</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Proveedor</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Estado</th>
                <th style={{...styles.th, textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => {
                const estadoStyle = getEstadoBadge(orden.estado);
                return (
                  <tr key={orden.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} style={{ color: '#6c757d' }} />
                        {formatDate(orden.fecha)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <strong>{orden.proveedor}</strong>
                    </td>
                    <td style={styles.td}>
                      <strong style={{ color: '#1a5d1a' }}>{formatCurrency(orden.total)}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: estadoStyle.bg,
                        color: estadoStyle.color
                      }}>
                        {estadoStyle.icon}
                        {orden.estado}
                      </span>
                    </td>
                    <td style={{...styles.td, textAlign: 'center'}}>
                      <div style={styles.actionButtons}>
                        <button style={styles.viewButton} onClick={() => verDetalle(orden)}>
                          <Eye size={16} />
                        </button>
                        {orden.estado === 'PENDIENTE' && (
                          <button style={styles.deleteButton} onClick={() => handleAnular(orden.id)}>
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nueva Orden */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nueva Orden de Compra</h2>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Proveedor y Fecha */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Proveedor *</label>
                  <select
                    value={formData.proveedor_id}
                    onChange={e => setFormData({...formData, proveedor_id: e.target.value})}
                    style={styles.input}
                  >
                    <option value="">Seleccione...</option>
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.razon_social}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Fecha de Entrega</label>
                  <input
                    type="date"
                    value={formData.fecha_entrega}
                    onChange={e => setFormData({...formData, fecha_entrega: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Agregar productos */}
              <div style={styles.addItemSection}>
                <h4 style={styles.sectionTitle}>Agregar Productos</h4>
                <div style={styles.formRow}>
                  <div style={{...styles.formGroup, flex: 2}}>
                    <select
                      value={itemTemp.producto_id}
                      onChange={e => setItemTemp({...itemTemp, producto_id: e.target.value})}
                      style={styles.input}
                    >
                      <option value="">Seleccionar producto...</option>
                      {productos.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} ({p.codigo_interno})</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <input
                      type="number"
                      placeholder="Cantidad"
                      value={itemTemp.cantidad}
                      onChange={e => setItemTemp({...itemTemp, cantidad: e.target.value})}
                      style={styles.input}
                      min="1"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <input
                      type="number"
                      placeholder="Precio Unitario"
                      value={itemTemp.precio}
                      onChange={e => setItemTemp({...itemTemp, precio: e.target.value})}
                      style={styles.input}
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <button style={styles.addItemBtn} onClick={agregarItem}>
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* Lista de items */}
              {formData.items.length > 0 && (
                <div style={styles.itemsList}>
                  <h4 style={styles.sectionTitle}>Productos en la Orden</h4>
                  {formData.items.map((item, index) => (
                    <div key={index} style={styles.itemRow}>
                      <span style={styles.itemName}>{item.nombre}</span>
                      <span>{item.cantidad} x {formatCurrency(item.precio)}</span>
                      <strong>{formatCurrency(parseFloat(item.precio) * parseInt(item.cantidad))}</strong>
                      <button 
                        style={styles.removeItemBtn}
                        onClick={() => eliminarItem(index)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <div style={styles.totalRow}>
                    <span>TOTAL:</span>
                    <strong>{formatCurrency(totalItems)}</strong>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button style={styles.saveButton} onClick={handleCreate} disabled={saving}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                Crear Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Detalle */}
      {showDetalleModal && ordenDetalle && (
        <div style={styles.modalOverlay} onClick={() => setShowDetalleModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Detalle de Orden</h2>
              <button style={styles.closeButton} onClick={() => setShowDetalleModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.detalleInfo}>
                <p><strong>Proveedor:</strong> {ordenDetalle.proveedor}</p>
                <p><strong>Fecha:</strong> {formatDate(ordenDetalle.fecha)}</p>
                <p><strong>Estado:</strong> {ordenDetalle.estado}</p>
                <p><strong>Total:</strong> {formatCurrency(ordenDetalle.total)}</p>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Producto</th>
                    <th style={styles.th}>Cantidad</th>
                    <th style={styles.th}>Precio Unit.</th>
                    <th style={styles.th}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detallesOrden.map((det, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}>{det.producto}</td>
                      <td style={styles.td}>{det.cantidad}</td>
                      <td style={styles.td}>{formatCurrency(det.precio)}</td>
                      <td style={styles.td}><strong>{formatCurrency(det.subtotal)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px' },
  select: { padding: '10px 15px', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', background: 'white', minWidth: '180px' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  actionButtons: { display: 'flex', gap: '8px', justifyContent: 'center' },
  viewButton: { padding: '8px', background: '#e3f2fd', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#1976d2' },
  deleteButton: { padding: '8px', background: '#ffebee', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#d32f2f' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d' },
  modalBody: { padding: '25px', overflowY: 'auto', flex: 1 },
  formRow: { display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap', alignItems: 'flex-end' },
  formGroup: { flex: 1, minWidth: '150px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1a5d1a' },
  input: { width: '100%', padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' },
  addItemSection: { background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px' },
  sectionTitle: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#333' },
  addItemBtn: { padding: '12px 16px', background: '#1a5d1a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' },
  itemsList: { background: '#f8f9fa', padding: '20px', borderRadius: '12px' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: 'white', borderRadius: '8px', marginBottom: '8px' },
  itemName: { flex: 1, fontWeight: '500' },
  removeItemBtn: { padding: '6px', background: '#ffebee', border: 'none', borderRadius: '6px', color: '#c62828', cursor: 'pointer' },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '15px', borderTop: '2px solid #e9ecef', marginTop: '10px', fontSize: '18px' },
  detalleInfo: { marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  cancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};

// src/pages/Devoluciones.jsx
import { useState, useEffect } from 'react';
import { 
  RotateCcw, Plus, Eye, X, Save, Loader2,
  Package, AlertTriangle, Calendar, Search, FileText
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Devoluciones() {
  const [devoluciones, setDevoluciones] = useState([]);
  const [recepciones, setRecepciones] = useState([]);
  const [productosRecepcion, setProductosRecepcion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    id_recepcion: '',
    id_producto: '',
    motivo: '',
    cantidad: '',
    observaciones: ''
  });

  const getUsername = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.username || 'admin';
      }
    } catch (e) {}
    return 'admin';
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar devoluciones usando SP
      const devRes = await supabase.rpc('fn_leer_devoluciones_proveedor');
      if (!devRes.error) {
        setDevoluciones(devRes.data || []);
      }
      
      // Cargar recepciones para el modal
      const recRes = await supabase.rpc('fn_leer_recepciones_para_devolucion');
      if (!recRes.error) {
        setRecepciones(recRes.data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cargarProductosRecepcion = async (idRecepcion) => {
    if (!idRecepcion) {
      setProductosRecepcion([]);
      return;
    }
    
    const { data, error } = await supabase.rpc('fn_leer_detalle_recepcion', {
      p_id_recepcion: idRecepcion
    });
    
    if (!error) {
      setProductosRecepcion(data || []);
    }
  };

  const handleRecepcionChange = (e) => {
    const id = e.target.value;
    setFormData({ ...formData, id_recepcion: id, id_producto: '' });
    cargarProductosRecepcion(id);
  };

  const resetForm = () => {
    setFormData({
      id_recepcion: '',
      id_producto: '',
      motivo: '',
      cantidad: '',
      observaciones: ''
    });
    setProductosRecepcion([]);
  };

  const handleCreate = async () => {
    // Validaciones frontend
    if (!formData.id_recepcion) {
      toast.error('Seleccione una recepción');
      return;
    }
    if (!formData.id_producto) {
      toast.error('Seleccione un producto');
      return;
    }
    if (!formData.motivo) {
      toast.error('Seleccione un motivo de devolución');
      return;
    }
    const cantidad = parseInt(formData.cantidad);
    if (!cantidad || cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    
    // Validar que no exceda cantidad disponible (recibida - ya devuelta)
    const productoSel = productosRecepcion.find(p => p.id_producto === formData.id_producto);
    if (productoSel && cantidad > productoSel.cantidad_disponible) {
      toast.error(`Solo puedes devolver ${productoSel.cantidad_disponible} unidades (Recibido: ${productoSel.cantidad_recibida}, Ya devuelto: ${productoSel.cantidad_devuelta})`);
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_crear_devolucion_proveedor_v2', {
        p_id_recepcion: formData.id_recepcion,
        p_id_producto: formData.id_producto,
        p_motivo: formData.motivo,
        p_cantidad: cantidad,
        p_observaciones: formData.observaciones || null,
        p_username: getUsername()
      });

      if (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Error al crear devolución');
      } else {
        toast.success(`Devolución ${data} creada exitosamente`);
        setShowModal(false);
        resetForm();
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al crear devolución');
    } finally {
      setSaving(false);
    }
  };

  const getMotivoStyle = (motivo) => {
    const estilos = {
      DAÑO: { bg: '#ffebee', color: '#c62828', icon: <AlertTriangle size={14} /> },
      VENCIDO: { bg: '#fff3e0', color: '#e65100', icon: <Calendar size={14} /> },
      SOBRANTE: { bg: '#e3f2fd', color: '#1565c0', icon: <Package size={14} /> },
      OTRO: { bg: '#f5f5f5', color: '#616161', icon: <FileText size={14} /> }
    };
    return estilos[motivo] || estilos.OTRO;
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('es-BO');

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <RotateCcw size={28} style={{ marginRight: '12px' }} />
            Devoluciones a Proveedor
          </h1>
          <p style={styles.subtitle}>
            Gestión de devoluciones de mercadería • {devoluciones.length} registros
          </p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Nueva Devolución
        </button>
      </header>

      {/* Información */}
      <div style={styles.infoCard}>
        <AlertTriangle size={20} style={{ color: '#e65100' }} />
        <p>
          Registre devoluciones cuando detecte mercadería dañada, vencida o defectuosa. 
          El stock se ajusta automáticamente.
        </p>
      </div>

      {/* Tabla */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando devoluciones...</p>
          </div>
        ) : devoluciones.length === 0 ? (
          <div style={styles.emptyState}>
            <RotateCcw size={48} style={{ color: '#ccc' }} />
            <p>No hay devoluciones registradas</p>
            <span style={{ color: '#999' }}>Haga clic en "Nueva Devolución" para registrar una</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Cantidad</th>
                <th style={styles.th}>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {devoluciones.map((dev, i) => {
                const motivoStyle = getMotivoStyle(dev.motivo);
                return (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} style={{ color: '#6c757d' }} />
                        {formatDate(dev.fecha)}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <strong>{dev.producto}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.cantidad}>{dev.cantidad}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: motivoStyle.bg,
                        color: motivoStyle.color
                      }}>
                        {motivoStyle.icon}
                        {dev.motivo}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nueva Devolución */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <RotateCcw size={22} style={{ marginRight: '10px' }} />
                Nueva Devolución a Proveedor
              </h2>
              <button style={styles.btnClose} onClick={() => { setShowModal(false); resetForm(); }}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Paso 1: Seleccionar Recepción */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Search size={16} />
                  Buscar Ingreso (Recepción) *
                </label>
                <select
                  style={styles.select}
                  value={formData.id_recepcion}
                  onChange={handleRecepcionChange}
                >
                  <option value="">-- Seleccione una recepción --</option>
                  {recepciones.map(r => (
                    <option key={r.id_recepcion} value={r.id_recepcion}>
                      {r.id_recepcion} | {r.proveedor} | Lote: {r.lote} | {r.fecha_ingreso}
                    </option>
                  ))}
                </select>
              </div>

              {/* Paso 2: Seleccionar Producto */}
              {formData.id_recepcion && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Package size={16} />
                    Seleccionar Producto *
                  </label>
                  <select
                    style={styles.select}
                    value={formData.id_producto}
                    onChange={(e) => setFormData({ ...formData, id_producto: e.target.value })}
                  >
                    <option value="">-- Seleccione un producto --</option>
                    {productosRecepcion.map(p => (
                      <option key={p.id_producto} value={p.id_producto} disabled={p.cantidad_disponible <= 0}>
                        {p.nombre} | Recibido: {p.cantidad_recibida} | Devuelto: {p.cantidad_devuelta} | Disponible: {p.cantidad_disponible}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Paso 3: Motivo */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <AlertTriangle size={16} />
                  Motivo de Devolución *
                </label>
                <select
                  style={styles.select}
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                >
                  <option value="">-- Seleccione motivo --</option>
                  <option value="DAÑO">DAÑO - Producto dañado</option>
                  <option value="VENCIDO">VENCIDO - Producto vencido</option>
                  <option value="SOBRANTE">SOBRANTE - Exceso de inventario</option>
                  <option value="OTRO">OTRO - Otro motivo</option>
                </select>
              </div>

              {/* Paso 4: Cantidad */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Cantidad a Devolver *</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Ej: 10"
                  min="1"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                />
              </div>

              {/* Paso 5: Observaciones */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Observaciones</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Detalles adicionales sobre la devolución..."
                  rows={3}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.btnSecondary} 
                onClick={() => { setShowModal(false); resetForm(); }}
              >
                Cancelar
              </button>
              <button 
                style={styles.btnPrimary} 
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                {saving ? 'Guardando...' : 'Confirmar Devolución'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e7d32)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnSecondary: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  btnClose: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#999', padding: '5px' },
  infoCard: { display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '20px', background: '#fff3e0', borderRadius: '12px', marginBottom: '20px', border: '1px solid #ffcc80' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  cantidad: { padding: '4px 12px', background: '#f8f9fa', borderRadius: '20px', fontWeight: '600' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px', textAlign: 'center' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '16px', width: '90%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  modalBody: { padding: '25px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '500', color: '#333', fontSize: '14px' },
  input: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: 'white' },
  textarea: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }
};

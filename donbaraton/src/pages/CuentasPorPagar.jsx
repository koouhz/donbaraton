// src/pages/CuentasPorPagar.jsx
import { useState, useEffect } from 'react';
import {
  Receipt, DollarSign, Loader2, Calendar,
  AlertCircle, CheckCircle, Clock, CreditCard, X, Save, Upload, FileText
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function CuentasPorPagar() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
  const [saving, setSaving] = useState(false);
  const [archivoComprobante, setArchivoComprobante] = useState(null);
  const [uploading, setUploading] = useState(false);
  // Helper para fecha local en lugar de toISOString (evita problemas timezone)
  const getLocalDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [formPago, setFormPago] = useState({
    monto_pago: '',
    fecha_pago: getLocalDateStr(),
    metodo_pago: 'TRANSFERENCIA',
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
    cargarCuentas();
  }, []);

  const cargarCuentas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_leer_cuentas_por_pagar');

      if (error) throw error;
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

  const abrirModalPago = (cuenta) => {
    setCuentaSeleccionada(cuenta);
    setFormPago({
      monto_pago: cuenta.saldo_pendiente, // Pre-llenar con saldo total
      fecha_pago: getLocalDateStr(),
      metodo_pago: 'TRANSFERENCIA',
      observaciones: ''
    });
    setShowPagoModal(true);
  };

  const cerrarModalPago = () => {
    setShowPagoModal(false);
    setCuentaSeleccionada(null);
    setArchivoComprobante(null);
    setFormPago({
      monto_pago: '',
      fecha_pago: getLocalDateStr(),
      metodo_pago: 'TRANSFERENCIA',
      observaciones: ''
    });
  };

  // Subir comprobante a Supabase Storage
  const subirComprobante = async (archivo) => {
    if (!archivo) return null;
    
    const fileExt = archivo.name.split('.').pop();
    const fileName = `comprobante_${cuentaSeleccionada.id}_${Date.now()}.${fileExt}`;
    const filePath = `comprobantes/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('pagos')
      .upload(filePath, archivo);
    
    if (uploadError) {
      console.error('Error subiendo archivo:', uploadError);
      throw new Error('Error al subir el comprobante');
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('pagos')
      .getPublicUrl(filePath);
    
    return publicUrl;
  };

  const registrarPago = async () => {
    // Validaciones
    if (!formPago.monto_pago || parseFloat(formPago.monto_pago) <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }

    if (parseFloat(formPago.monto_pago) > parseFloat(cuentaSeleccionada.saldo_pendiente)) {
      toast.error('El monto no puede ser mayor al saldo pendiente');
      return;
    }

    if (!formPago.fecha_pago) {
      toast.error('Seleccione una fecha de pago');
      return;
    }

    setSaving(true);
    try {
      // Subir comprobante si existe
      let comprobanteUrl = null;
      if (archivoComprobante) {
        setUploading(true);
        try {
          comprobanteUrl = await subirComprobante(archivoComprobante);
        } catch (uploadErr) {
          toast.error('Error al subir el comprobante');
          setSaving(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const { data, error } = await supabase.rpc('fn_registrar_pago_cuenta', {
        p_id_cuenta: cuentaSeleccionada.id,
        p_monto_pago: parseFloat(formPago.monto_pago),
        p_fecha_pago: formPago.fecha_pago,
        p_metodo_pago: formPago.metodo_pago,
        p_observaciones: formPago.observaciones || null,
        p_username: getUsername(),
        p_comprobante_url: comprobanteUrl
      });

      if (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Error al registrar el pago');
      } else {
        toast.success(`Pago ${data} registrado exitosamente`);
        cerrarModalPago();
        cargarCuentas(); // Recargar cuentas
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al procesar el pago');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('es-BO');

  const getEstadoStyle = (estado, fechaVenc) => {
    if (estado === 'PAGADO') {
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
                <th style={styles.th}>Acciones</th>
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
                    <td style={styles.td}>
                      {cuenta.estado !== 'PAGADO' && (
                        <button
                          style={styles.btnPagar}
                          onClick={() => abrirModalPago(cuenta)}
                          title="Registrar pago"
                        >
                          <CreditCard size={16} />
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Registrar Pago */}
      {showPagoModal && cuentaSeleccionada && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <CreditCard size={22} style={{ marginRight: '10px' }} />
                Registrar Pago
              </h2>
              <button style={styles.btnClose} onClick={cerrarModalPago}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Info de la cuenta */}
              <div style={styles.cuentaInfo}>
                <div style={styles.cuentaInfoRow}>
                  <span style={styles.cuentaInfoLabel}>Proveedor:</span>
                  <strong>{cuentaSeleccionada.proveedores?.razon_social}</strong>
                </div>
                <div style={styles.cuentaInfoRow}>
                  <span style={styles.cuentaInfoLabel}>Factura:</span>
                  <strong>{cuentaSeleccionada.factura_nro}</strong>
                </div>
                <div style={styles.cuentaInfoRow}>
                  <span style={styles.cuentaInfoLabel}>Saldo Pendiente:</span>
                  <strong style={{ color: '#c62828', fontSize: '18px' }}>
                    {formatCurrency(cuentaSeleccionada.saldo_pendiente)}
                  </strong>
                </div>
              </div>

              {/* Formulario de pago */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <DollarSign size={16} />
                  Monto a Pagar *
                </label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Ej: 500.00"
                  min="0"
                  max={cuentaSeleccionada.saldo_pendiente}
                  step="0.01"
                  value={formPago.monto_pago}
                  onChange={(e) => setFormPago({ ...formPago, monto_pago: e.target.value })}
                />
                <span style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px', display: 'block' }}>
                  Máximo: {formatCurrency(cuentaSeleccionada.saldo_pendiente)}
                </span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Calendar size={16} />
                  Fecha de Pago *
                </label>
                <input
                  type="date"
                  style={styles.input}
                  value={formPago.fecha_pago}
                  onChange={(e) => setFormPago({ ...formPago, fecha_pago: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <CreditCard size={16} />
                  Método de Pago *
                </label>
                <select
                  style={styles.select}
                  value={formPago.metodo_pago}
                  onChange={(e) => setFormPago({ ...formPago, metodo_pago: e.target.value })}
                >
                  <option value="EFECTIVO">EFECTIVO</option>
                  <option value="TRANSFERENCIA">TRANSFERENCIA BANCARIA</option>
                  <option value="CHEQUE">CHEQUE</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Observaciones</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Detalles adicionales del pago..."
                  rows={3}
                  value={formPago.observaciones}
                  onChange={(e) => setFormPago({ ...formPago, observaciones: e.target.value })}
                />
              </div>

              {/* Adjuntar Comprobante */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <Upload size={16} />
                  Adjuntar Comprobante
                </label>
                <div style={styles.uploadContainer}>
                  <input
                    type="file"
                    id="comprobante-file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => setArchivoComprobante(e.target.files[0])}
                  />
                  <label htmlFor="comprobante-file" style={styles.uploadButton}>
                    <Upload size={18} />
                    {archivoComprobante ? 'Cambiar archivo' : 'Seleccionar archivo'}
                  </label>
                  {archivoComprobante && (
                    <div style={styles.fileInfo}>
                      <FileText size={16} />
                      <span style={styles.fileName}>{archivoComprobante.name}</span>
                      <button 
                        style={styles.removeFileBtn}
                        onClick={() => setArchivoComprobante(null)}
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px', display: 'block' }}>
                  Formatos: JPG, PNG, PDF (máx. 5MB)
                </span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={cerrarModalPago}>
                Cancelar
              </button>
              <button style={styles.btnPrimary} onClick={registrarPago} disabled={saving}>
                {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                {saving ? 'Guardando...' : 'Confirmar Pago'}
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
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  btnPagar: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #1a5d1a, #2e7d32)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '60px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  
  // Modal styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '16px', width: '90%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  modalBody: { padding: '25px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  btnClose: { background: 'transparent', border: 'none', cursor: 'pointer', color: '#999', padding: '5px' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e7d32)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnSecondary: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  
  // Info cuenta
  cuentaInfo: { padding: '20px', background: '#f8f9fa', borderRadius: '10px', marginBottom: '20px', border: '1px solid #e9ecef' },
  cuentaInfoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  cuentaInfoLabel: { fontSize: '14px', color: '#6c757d' },
  
  // Form styles
  formGroup: { marginBottom: '20px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '500', color: '#333', fontSize: '14px' },
  input: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: 'white' },
  textarea: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' },
  
  // Upload styles
  uploadContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  uploadButton: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#f0f0f0', border: '2px dashed #ccc', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#666', transition: 'all 0.2s' },
  fileInfo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: '#e8f5e9', borderRadius: '8px', color: '#2e7d32' },
  fileName: { flex: 1, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  removeFileBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', background: '#ffebee', border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#c62828' }
};

// src/pages/CierreCaja.jsx
import { useState, useEffect } from 'react';
import { 
  Calculator, DollarSign, Loader2, X, Save,
  CheckCircle, AlertTriangle, Clock, Eye, FileText
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function CierreCaja() {
  const [cierres, setCierres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totalSistema, setTotalSistema] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [efectivoFisico, setEfectivoFisico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [filterFecha, setFilterFecha] = useState('');

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
  }, [filterFecha]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const user = getUser();
      
      // Cargar cierres y total del sistema
      const [cierresRes, sistemaRes] = await Promise.all([
        supabase.rpc('fn_leer_cierres_caja', { 
          p_fecha: filterFecha || null 
        }),
        supabase.rpc('fn_calcular_sistema_caja', { 
          p_usuario_id: user.id 
        })
      ]);

      if (cierresRes.error) console.error('Error cierres:', cierresRes.error);
      if (sistemaRes.error) console.error('Error sistema:', sistemaRes.error);

      setCierres(cierresRes.data || []);
      setTotalSistema(sistemaRes.data || 0);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCierre = async () => {
    if (!efectivoFisico) {
      toast.error('Ingrese el efectivo físico contado');
      return;
    }

    setSaving(true);
    try {
      const user = getUser();
      const { data, error } = await supabase.rpc('fn_crear_cierre_caja', {
        p_usuario_id: user.id,
        p_efectivo_fisico: parseFloat(efectivoFisico),
        p_observaciones: observaciones.trim() || null,
        p_usuario_auditoria: user.username
      });

      if (error) {
        toast.error(error.message || 'Error al crear cierre');
      } else {
        const diferencia = parseFloat(efectivoFisico) - totalSistema;
        if (diferencia !== 0) {
          toast(
            `Cierre registrado con diferencia de ${diferencia >= 0 ? '+' : ''}${diferencia.toFixed(2)} Bs`,
            { icon: diferencia >= 0 ? '📈' : '📉', duration: 5000 }
          );
        } else {
          toast.success('¡Cierre de caja perfecto! Sin diferencias');
        }
        setShowModal(false);
        setEfectivoFisico('');
        setObservaciones('');
        cargarDatos();
      }
    } catch (err) {
      toast.error('Error al procesar cierre');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;
  const formatTime = (time) => time?.substring(0, 5) || '--:--';

  const diferencia = parseFloat(efectivoFisico || 0) - totalSistema;

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Calculator size={28} style={{ marginRight: '12px' }} />
            Cierre de Caja
          </h1>
          <p style={styles.subtitle}>
            Cuadre de efectivo diario
          </p>
        </div>
        <button style={styles.primaryButton} onClick={() => setShowModal(true)}>
          <DollarSign size={18} />
          Nuevo Cierre
        </button>
      </header>

      {/* Resumen del día */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryItem}>
          <Clock size={24} style={{ color: '#6c757d' }} />
          <div>
            <span style={styles.summaryLabel}>Fecha</span>
            <span style={styles.summaryValue}>{new Date().toLocaleDateString('es-BO')}</span>
          </div>
        </div>
        <div style={styles.summaryItem}>
          <DollarSign size={24} style={{ color: '#1a5d1a' }} />
          <div>
            <span style={styles.summaryLabel}>Total en Sistema</span>
            <span style={{...styles.summaryValue, color: '#1a5d1a', fontSize: '24px'}}>
              {formatCurrency(totalSistema)}
            </span>
          </div>
        </div>
      </div>

      {/* Historial de cierres */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Historial de Cierres</h2>
          <input
            type="date"
            value={filterFecha}
            onChange={e => setFilterFecha(e.target.value)}
            style={styles.dateInput}
          />
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
          </div>
        ) : cierres.length === 0 ? (
          <div style={styles.emptyState}>
            <FileText size={48} style={{ color: '#ccc' }} />
            <p>No hay cierres de caja registrados</p>
          </div>
        ) : (
          <div style={styles.cierresList}>
            {cierres.map((cierre, i) => (
              <div key={cierre.id || i} style={styles.cierreCard}>
                <div style={styles.cierreInfo}>
                  <div style={styles.cierreTime}>
                    <Clock size={16} />
                    {formatTime(cierre.hora)}
                  </div>
                  <span style={styles.cierreUsuario}>Usuario #{cierre.usuario}</span>
                </div>
                <div style={styles.cierreMontos}>
                  <div style={styles.montoItem}>
                    <span>Efectivo</span>
                    <strong>{formatCurrency(cierre.efectivo)}</strong>
                  </div>
                  <div style={{
                    ...styles.montoItem,
                    color: cierre.diferencia === 0 ? '#2e7d32' : 
                           cierre.diferencia > 0 ? '#1565c0' : '#c62828'
                  }}>
                    <span>Diferencia</span>
                    <strong>
                      {cierre.diferencia >= 0 ? '+' : ''}{formatCurrency(cierre.diferencia)}
                    </strong>
                  </div>
                </div>
                {cierre.diferencia === 0 ? (
                  <CheckCircle size={24} style={{ color: '#2e7d32' }} />
                ) : (
                  <AlertTriangle size={24} style={{ color: cierre.diferencia > 0 ? '#1565c0' : '#c62828' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de nuevo cierre */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nuevo Cierre de Caja</h2>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.sistemaBox}>
                <span>Total según sistema</span>
                <span style={styles.sistemaValue}>{formatCurrency(totalSistema)}</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Efectivo Físico Contado (Bs) *</label>
                <input
                  type="number"
                  value={efectivoFisico}
                  onChange={e => setEfectivoFisico(e.target.value)}
                  style={styles.montoInput}
                  placeholder="0.00"
                  step="0.5"
                  min="0"
                  autoFocus
                />
              </div>

              {efectivoFisico && (
                <div style={{
                  ...styles.diferenciaBox,
                  background: diferencia === 0 ? '#e8f5e9' : 
                             diferencia > 0 ? '#e3f2fd' : '#ffebee',
                  borderColor: diferencia === 0 ? '#a5d6a7' : 
                               diferencia > 0 ? '#90caf9' : '#ef9a9a'
                }}>
                  <div style={styles.diferenciaLabel}>
                    {diferencia === 0 ? (
                      <><CheckCircle size={20} /> Cuadre Perfecto</>
                    ) : diferencia > 0 ? (
                      <><AlertTriangle size={20} /> Sobrante</>
                    ) : (
                      <><AlertTriangle size={20} /> Faltante</>
                    )}
                  </div>
                  <span style={{
                    ...styles.diferenciaValue,
                    color: diferencia === 0 ? '#2e7d32' : 
                           diferencia > 0 ? '#1565c0' : '#c62828'
                  }}>
                    {diferencia >= 0 ? '+' : ''}{formatCurrency(diferencia)}
                  </span>
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Observaciones</label>
                <textarea
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  style={styles.textarea}
                  placeholder="Notas adicionales sobre el cierre..."
                  rows={3}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button style={styles.saveButton} onClick={handleCierre} disabled={saving || !efectivoFisico}>
                {saving ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</>
                ) : (
                  <><Save size={16} /> Registrar Cierre</>
                )}
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
  container: { padding: '20px', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  summaryCard: { display: 'flex', gap: '30px', padding: '25px', background: 'white', borderRadius: '16px', marginBottom: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', flexWrap: 'wrap' },
  summaryItem: { display: 'flex', alignItems: 'center', gap: '15px' },
  summaryLabel: { display: 'block', fontSize: '13px', color: '#6c757d' },
  summaryValue: { display: 'block', fontSize: '18px', fontWeight: '600', color: '#333' },
  section: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' },
  dateInput: { padding: '8px 12px', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px' },
  cierresList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  cierreCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' },
  cierreInfo: { flex: 1 },
  cierreTime: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '16px', color: '#333' },
  cierreUsuario: { display: 'block', fontSize: '13px', color: '#6c757d', marginTop: '4px' },
  cierreMontos: { display: 'flex', gap: '25px' },
  montoItem: { textAlign: 'center' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '60px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d' },
  modalBody: { padding: '25px' },
  sistemaBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '12px', marginBottom: '20px' },
  sistemaValue: { fontSize: '28px', fontWeight: '700', color: '#1a5d1a' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' },
  montoInput: { width: '100%', padding: '16px', fontSize: '24px', textAlign: 'center', border: '2px solid #e9ecef', borderRadius: '12px', boxSizing: 'border-box' },
  diferenciaBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderRadius: '12px', marginBottom: '20px', border: '2px solid' },
  diferenciaLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' },
  diferenciaValue: { fontSize: '24px', fontWeight: '700' },
  textarea: { width: '100%', padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  cancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};

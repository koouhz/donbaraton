// src/pages/CierreCaja.jsx
import { useState, useEffect } from 'react';
import {
  Calculator, DollarSign, Loader2, X, Save,
  CheckCircle, AlertTriangle, Clock, FileText, CreditCard, Smartphone,
  Wallet, Calendar
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function CierreCaja() {
  const [cierres, setCierres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumenCaja, setResumenCaja] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [efectivoFisico, setEfectivoFisico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [filterFecha, setFilterFecha] = useState('');

  const getUser = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return { id: parsed.usuario_id || 1, username: parsed.username || 'admin' };
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
      // Cargar cierres con filtro de fecha y resumen de caja del día
      const [cierresRes, resumenRes] = await Promise.all([
        supabase.rpc('fn_leer_cierres_caja', {
          p_fecha: filterFecha || null
        }),
        supabase.rpc('fn_resumen_caja', {
          p_fecha: new Date().toISOString().split('T')[0]
        })
      ]);

      if (cierresRes.error) console.error('Error cierres:', cierresRes.error);
      if (resumenRes.error) console.error('Error resumen:', resumenRes.error);

      setCierres(cierresRes.data || []);
      setResumenCaja(resumenRes.data?.[0] || null);
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
      const efectivoNum = parseFloat(efectivoFisico);
      const totalSistema = resumenCaja?.total_efectivo || 0;
      const diferencia = efectivoNum - totalSistema;

      // Obtener hora y fecha del dispositivo
      const ahora = new Date();
      const horaLocal = ahora.toTimeString().split(' ')[0]; // "HH:mm:ss"
      const fechaLocal = ahora.toISOString().split('T')[0]; // "YYYY-MM-DD"

      const { data, error } = await supabase.rpc('fn_registrar_cierre_caja', {
        p_id_usuario: user.id,
        p_fecha: fechaLocal,
        p_hora_cierre: horaLocal,
        p_total_efectivo: efectivoNum,
        p_diferencia: diferencia,
        p_observaciones: observaciones.trim() || null
      });

      if (error) {
        toast.error(error.message || 'Error al crear cierre');
      } else {
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

  const formatFechaHora = (fecha, hora) => {
    if (!fecha) return '--';
    const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
    const fechaFormateada = new Date(fecha).toLocaleDateString('es-BO', opciones);
    const horaFormateada = hora?.substring(0, 5) || '';
    return horaFormateada ? `${fechaFormateada} - ${horaFormateada}` : fechaFormateada;
  };

  const efectivoSistema = resumenCaja?.total_efectivo || 0;
  const diferencia = parseFloat(efectivoFisico || 0) - efectivoSistema;

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
            Cuadre de efectivo diario - {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button style={styles.primaryButton} onClick={() => setShowModal(true)}>
          <DollarSign size={18} />
          Nuevo Cierre
        </button>
      </header>

      {/* Resumen del día con desglose */}
      <div style={styles.summarySection}>
        <h2 style={styles.sectionTitle}>💰 Resumen del Día</h2>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}><FileText size={24} /></div>
            <div>
              <span style={styles.cardLabel}>Total Ventas</span>
              <span style={styles.cardValue}>{resumenCaja?.total_ventas || 0}</span>
            </div>
          </div>

          <div style={{ ...styles.summaryCard, ...styles.cardHighlight }}>
            <div style={{ ...styles.cardIcon, background: '#e8f5e9' }}><Wallet size={24} color="#1a5d1a" /></div>
            <div>
              <span style={styles.cardLabel}>Efectivo</span>
              <span style={{ ...styles.cardValue, color: '#1a5d1a', fontSize: '22px' }}>{formatCurrency(resumenCaja?.total_efectivo)}</span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{ ...styles.cardIcon, background: '#e3f2fd' }}><CreditCard size={24} color="#1565c0" /></div>
            <div>
              <span style={styles.cardLabel}>Tarjeta</span>
              <span style={styles.cardValue}>{formatCurrency(resumenCaja?.total_tarjeta)}</span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{ ...styles.cardIcon, background: '#fff3e0' }}><Smartphone size={24} color="#e65100" /></div>
            <div>
              <span style={styles.cardLabel}>QR</span>
              <span style={styles.cardValue}>{formatCurrency(resumenCaja?.total_qr)}</span>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{ ...styles.cardIcon, background: '#f3e5f5' }}><DollarSign size={24} color="#7b1fa2" /></div>
            <div>
              <span style={styles.cardLabel}>Total Recaudado</span>
              <span style={{ ...styles.cardValue, fontWeight: '700' }}>{formatCurrency(resumenCaja?.total_recaudado)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de cierres */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitleAlt}>📋 Historial de Cierres</h2>
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
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Fecha y Hora</th>
                  <th style={styles.th}>Usuario</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Efectivo</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Diferencia</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Estado</th>
                  <th style={styles.th}>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {cierres.map((cierre, i) => (
                  <tr key={cierre.id || i} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.fechaCell}>
                        <Calendar size={16} style={{ color: '#6c757d' }} />
                        <span style={styles.fechaText}>{formatFechaHora(cierre.fecha, cierre.hora)}</span>
                      </div>
                    </td>
                    <td style={styles.td}>{cierre.usuario || 'Usuario'}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>
                      {formatCurrency(cierre.efectivo)}
                    </td>
                    <td style={{
                      ...styles.td,
                      textAlign: 'right',
                      fontWeight: '600',
                      color: cierre.diferencia === 0 ? '#2e7d32' :
                        cierre.diferencia > 0 ? '#1565c0' : '#c62828'
                    }}>
                      {cierre.diferencia >= 0 ? '+' : ''}{formatCurrency(cierre.diferencia)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {cierre.diferencia === 0 ? (
                        <span style={styles.badgeSuccess}><CheckCircle size={14} /> Cuadrado</span>
                      ) : cierre.diferencia > 0 ? (
                        <span style={styles.badgeInfo}><AlertTriangle size={14} /> Sobrante</span>
                      ) : (
                        <span style={styles.badgeDanger}><AlertTriangle size={14} /> Faltante</span>
                      )}
                    </td>
                    <td style={{ ...styles.td, color: '#6c757d', fontSize: '13px' }}>
                      {cierre.observaciones || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              {/* Resumen claro del sistema */}
              <div style={styles.sistemaBox}>
                <div>
                  <span style={styles.sistemaLabel}>Efectivo según ventas del día</span>
                  <p style={styles.sistemaHint}>(Solo pagos en efectivo)</p>
                </div>
                <span style={styles.sistemaValue}>{formatCurrency(efectivoSistema)}</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>¿Cuánto efectivo hay en caja? (Bs)</label>
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
                      <><CheckCircle size={20} color="#2e7d32" /> <span style={{ color: '#2e7d32' }}>¡Cuadre Perfecto!</span></>
                    ) : diferencia > 0 ? (
                      <><AlertTriangle size={20} color="#1565c0" /> <span style={{ color: '#1565c0' }}>Hay un sobrante</span></>
                    ) : (
                      <><AlertTriangle size={20} color="#c62828" /> <span style={{ color: '#c62828' }}>Hay un faltante</span></>
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
                <label style={styles.label}>Observaciones (opcional)</label>
                <textarea
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  style={styles.textarea}
                  placeholder="Ej: Faltante debido a error en cambio..."
                  rows={2}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button style={styles.saveButton} onClick={handleCierre} disabled={saving || !efectivoFisico}>
                {saving ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
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
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,93,26,0.3)' },

  // Resumen Section
  summarySection: { marginBottom: '25px' },
  sectionTitle: { margin: '0 0 15px 0', fontSize: '18px', fontWeight: '600', color: '#333' },
  sectionTitleAlt: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' },
  summaryCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '18px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  cardHighlight: { border: '2px solid #a5d6a7' },
  cardIcon: { padding: '10px', background: '#f8f9fa', borderRadius: '10px' },
  cardLabel: { display: 'block', fontSize: '13px', color: '#6c757d', marginBottom: '2px' },
  cardValue: { display: 'block', fontSize: '18px', fontWeight: '600', color: '#333' },

  // Section
  section: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },

  // Filters
  filterGroup: { display: 'flex', gap: '15px', alignItems: 'flex-end' },
  dateField: { display: 'flex', flexDirection: 'column', gap: '4px' },
  dateLabel: { fontSize: '12px', color: '#6c757d' },
  dateInput: { padding: '8px 12px', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px' },

  // Table
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 15px', background: '#f8f9fa', borderBottom: '2px solid #e9ecef', fontSize: '13px', fontWeight: '600', color: '#6c757d', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 15px', fontSize: '14px', verticalAlign: 'middle' },
  fechaCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  fechaText: { fontWeight: '500' },

  // Badges
  badgeSuccess: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  badgeInfo: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#e3f2fd', color: '#1565c0', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  badgeDanger: { display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#ffebee', color: '#c62828', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },

  // Loading & Empty
  loadingState: { display: 'flex', justifyContent: 'center', padding: '60px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },

  // Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '480px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)', borderRadius: '16px 16px 0 0' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: '5px' },
  modalBody: { padding: '25px' },
  sistemaBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e9ecef' },
  sistemaLabel: { fontSize: '14px', fontWeight: '500', color: '#333' },
  sistemaHint: { margin: '4px 0 0 0', fontSize: '12px', color: '#6c757d' },
  sistemaValue: { fontSize: '28px', fontWeight: '700', color: '#1a5d1a' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' },
  montoInput: { width: '100%', padding: '16px', fontSize: '24px', textAlign: 'center', border: '2px solid #e9ecef', borderRadius: '12px', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  diferenciaBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderRadius: '12px', marginBottom: '20px', border: '2px solid' },
  diferenciaLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' },
  diferenciaValue: { fontSize: '24px', fontWeight: '700' },
  textarea: { width: '100%', padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa', borderRadius: '0 0 16px 16px' },
  cancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};

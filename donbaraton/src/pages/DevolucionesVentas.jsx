// src/pages/DevolucionesVentas.jsx
import { useState, useEffect, useRef } from 'react';
import {
    RotateCcw, Search, X, Loader2, CheckCircle, AlertCircle,
    Package, Calendar, User, Receipt, Banknote, CreditCard, FileText
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function DevolucionesVentas() {
    const [devoluciones, setDevoluciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchTicket, setSearchTicket] = useState('');
    const [ventaEncontrada, setVentaEncontrada] = useState(null);
    const [detallesVenta, setDetallesVenta] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [formData, setFormData] = useState({
        motivo: '',
        forma_reembolso: 'EFECTIVO',
        observaciones: ''
    });

    const searchRef = useRef(null);

    const getUsername = () => {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const parsed = JSON.parse(user);
                return parsed.username || 'admin';
            }
        } catch (e) { }
        return 'admin';
    };

    useEffect(() => {
        cargarDevoluciones();
    }, []);

    const cargarDevoluciones = async () => {
        setLoading(true);
        try {
            // Cargar historial de devoluciones
            const { data, error } = await supabase
                .from('devoluciones_ventas')
                .select(`
          *,
          ventas (id_venta, total, fecha_hora, tipo_comprobante),
          usuarios (username)
        `)
                .order('fecha', { ascending: false })
                .limit(50);

            if (!error) {
                setDevoluciones(data || []);
            }
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Buscar venta por ID
    const buscarVenta = async () => {
        if (!searchTicket.trim()) {
            toast.error('Ingrese el número de ticket');
            return;
        }

        setBuscando(true);
        setVentaEncontrada(null);
        setDetallesVenta([]);

        try {
            // Buscar la venta
            const { data: venta, error: ventaError } = await supabase
                .from('ventas')
                .select(`
          *,
          clientes (nombre_completo:nombres, ci_nit),
          usuarios (username)
        `)
                .eq('id_venta', searchTicket.trim().toUpperCase())
                .single();

            if (ventaError || !venta) {
                toast.error('Venta no encontrada');
                return;
            }

            if (venta.estado === 'ANULADO') {
                toast.error('Esta venta ya fue anulada/devuelta');
                return;
            }

            // Buscar detalles de la venta
            const { data: detalles, error: detallesError } = await supabase
                .from('detalle_ventas')
                .select(`
          *,
          productos (nombre, codigo_interno)
        `)
                .eq('id_venta', venta.id_venta);

            if (!detallesError) {
                setVentaEncontrada(venta);
                setDetallesVenta(detalles || []);
                toast.success('Venta encontrada');
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error al buscar la venta');
        } finally {
            setBuscando(false);
        }
    };

    // Manejar Enter en búsqueda
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarVenta();
        }
    };

    // Procesar devolución
    const procesarDevolucion = async () => {
        if (!ventaEncontrada) {
            toast.error('No hay venta seleccionada');
            return;
        }

        if (!formData.motivo) {
            toast.error('Seleccione un motivo de devolución');
            return;
        }

        setProcessing(true);
        try {
            const { data, error } = await supabase.rpc('fn_devolucion_venta', {
                p_id_venta: ventaEncontrada.id_venta,
                p_motivo: formData.motivo + (formData.observaciones ? ` - ${formData.observaciones}` : ''),
                p_forma_reembolso: formData.forma_reembolso,
                p_username: getUsername()
            });

            if (error) {
                console.error('Error:', error);
                toast.error(error.message || 'Error al procesar devolución');
            } else {
                toast.success(`Devolución ${data} procesada exitosamente`);
                toast(`Reembolso: Bs ${ventaEncontrada.total?.toFixed(2)} en ${formData.forma_reembolso}`, {
                    icon: '💰',
                    duration: 5000
                });

                // Limpiar
                setShowConfirmModal(false);
                setVentaEncontrada(null);
                setDetallesVenta([]);
                setSearchTicket('');
                setFormData({ motivo: '', forma_reembolso: 'EFECTIVO', observaciones: '' });
                cargarDevoluciones();
                searchRef.current?.focus();
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error al procesar devolución');
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;
    const formatDate = (date) => new Date(date).toLocaleString('es-BO');

    const getMotivoIcon = (motivo) => {
        if (motivo?.includes('DEFECTO')) return <AlertCircle size={14} />;
        if (motivo?.includes('CAMBIO')) return <RotateCcw size={14} />;
        return <FileText size={14} />;
    };

    return (
        <div style={styles.container}>
            <Toaster position="top-center" />

            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        <RotateCcw size={28} style={{ marginRight: '12px' }} />
                        Devoluciones de Ventas
                    </h1>
                    <p style={styles.subtitle}>
                        Procesar devoluciones y reembolsos a clientes
                    </p>
                </div>
            </header>

            {/* Buscador de Ticket */}
            <div style={styles.searchSection}>
                <h3 style={styles.sectionTitle}>
                    <Search size={20} />
                    Buscar Venta por Número de Ticket
                </h3>
                <div style={styles.searchRow}>
                    <div style={styles.searchBox}>
                        <Receipt size={20} style={{ color: '#1a5d1a' }} />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Ingrese el ID de venta (ej: VENT-001)"
                            value={searchTicket}
                            onChange={(e) => setSearchTicket(e.target.value.toUpperCase())}
                            onKeyDown={handleSearchKeyDown}
                            style={styles.searchInput}
                        />
                        {searchTicket && (
                            <button onClick={() => { setSearchTicket(''); setVentaEncontrada(null); }} style={styles.clearBtn}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button
                        style={styles.btnSearch}
                        onClick={buscarVenta}
                        disabled={buscando}
                    >
                        {buscando ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
                        Buscar
                    </button>
                </div>
            </div>

            {/* Venta Encontrada */}
            {ventaEncontrada && (
                <div style={styles.ventaCard}>
                    <div style={styles.ventaHeader}>
                        <div>
                            <h3 style={styles.ventaId}>{ventaEncontrada.id_venta}</h3>
                            <span style={styles.ventaFecha}>
                                <Calendar size={14} /> {formatDate(ventaEncontrada.fecha_hora)}
                            </span>
                        </div>
                        <div style={styles.ventaTotal}>
                            <span>Total a Devolver</span>
                            <strong>{formatCurrency(ventaEncontrada.total)}</strong>
                        </div>
                    </div>

                    {/* Info del cliente */}
                    <div style={styles.clienteInfo}>
                        <User size={16} />
                        <span>Cliente: {ventaEncontrada.clientes?.nombre_completo || 'N/A'}</span>
                        <span style={styles.ciNit}>CI/NIT: {ventaEncontrada.clientes?.ci_nit || 'N/A'}</span>
                    </div>

                    {/* Detalles de productos */}
                    <div style={styles.detallesContainer}>
                        <h4 style={styles.detallesTitle}>
                            <Package size={16} />
                            Productos a Devolver ({detallesVenta.length})
                        </h4>
                        <table style={styles.detallesTable}>
                            <thead>
                                <tr>
                                    <th style={styles.detalleTh}>Producto</th>
                                    <th style={styles.detalleTh}>Cantidad</th>
                                    <th style={styles.detalleTh}>Precio Unit.</th>
                                    <th style={styles.detalleTh}>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detallesVenta.map((det, i) => (
                                    <tr key={i}>
                                        <td style={styles.detalleTd}>
                                            <strong>{det.productos?.nombre}</strong>
                                            <span style={styles.codigo}>{det.productos?.codigo_interno}</span>
                                        </td>
                                        <td style={styles.detalleTd}>{det.cantidad}</td>
                                        <td style={styles.detalleTd}>{formatCurrency(det.precio_unitario)}</td>
                                        <td style={styles.detalleTd}>{formatCurrency(det.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Formulario de devolución */}
                    <div style={styles.devolucionForm}>
                        <div style={styles.formRow}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Motivo de Devolución *</label>
                                <select
                                    style={styles.select}
                                    value={formData.motivo}
                                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                                >
                                    <option value="">-- Seleccione motivo --</option>
                                    <option value="PRODUCTO_DEFECTUOSO">Producto defectuoso</option>
                                    <option value="CAMBIO_PRODUCTO">Cambio de producto</option>
                                    <option value="CLIENTE_INSATISFECHO">Cliente insatisfecho</option>
                                    <option value="ERROR_VENTA">Error en la venta</option>
                                    <option value="OTRO">Otro motivo</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Forma de Reembolso *</label>
                                <div style={styles.reembolsoOptions}>
                                    <button
                                        style={{
                                            ...styles.reembolsoBtn,
                                            ...(formData.forma_reembolso === 'EFECTIVO' ? styles.reembolsoBtnActive : {})
                                        }}
                                        onClick={() => setFormData({ ...formData, forma_reembolso: 'EFECTIVO' })}
                                    >
                                        <Banknote size={18} />
                                        Efectivo
                                    </button>
                                    <button
                                        style={{
                                            ...styles.reembolsoBtn,
                                            ...(formData.forma_reembolso === 'NOTA_CREDITO' ? styles.reembolsoBtnActive : {})
                                        }}
                                        onClick={() => setFormData({ ...formData, forma_reembolso: 'NOTA_CREDITO' })}
                                    >
                                        <Receipt size={18} />
                                        Nota Crédito
                                    </button>
                                    <button
                                        style={{
                                            ...styles.reembolsoBtn,
                                            ...(formData.forma_reembolso === 'MISMA_TARJETA' ? styles.reembolsoBtnActive : {})
                                        }}
                                        onClick={() => setFormData({ ...formData, forma_reembolso: 'MISMA_TARJETA' })}
                                    >
                                        <CreditCard size={18} />
                                        Misma Tarjeta
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Observaciones (Opcional)</label>
                            <textarea
                                style={styles.textarea}
                                placeholder="Detalles adicionales sobre la devolución..."
                                value={formData.observaciones}
                                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <button
                            style={styles.btnProcesar}
                            onClick={() => setShowConfirmModal(true)}
                            disabled={!formData.motivo}
                        >
                            <RotateCcw size={18} />
                            Procesar Devolución - {formatCurrency(ventaEncontrada.total)}
                        </button>
                    </div>
                </div>
            )}

            {/* Historial de Devoluciones */}
            <div style={styles.historialSection}>
                <h3 style={styles.sectionTitle}>
                    <FileText size={20} />
                    Historial de Devoluciones
                </h3>
                <div style={styles.tableContainer}>
                    {loading ? (
                        <div style={styles.loadingState}>
                            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
                            <p>Cargando historial...</p>
                        </div>
                    ) : devoluciones.length === 0 ? (
                        <div style={styles.emptyState}>
                            <RotateCcw size={40} style={{ color: '#ccc' }} />
                            <p>No hay devoluciones registradas</p>
                        </div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Venta Original</th>
                                    <th style={styles.th}>Fecha</th>
                                    <th style={styles.th}>Motivo</th>
                                    <th style={styles.th}>Reembolso</th>
                                    <th style={styles.th}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devoluciones.map((dev, i) => (
                                    <tr key={i} style={styles.tr}>
                                        <td style={styles.td}>
                                            <strong>{dev.id_venta}</strong>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.fecha}>
                                                <Calendar size={12} />
                                                {new Date(dev.fecha).toLocaleDateString('es-BO')}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.motivoBadge}>
                                                {getMotivoIcon(dev.motivo)}
                                                {dev.motivo?.substring(0, 30)}...
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.reembolsoBadge}>{dev.forma_reembolso}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <strong style={{ color: '#c62828' }}>
                                                {formatCurrency(dev.ventas?.total)}
                                            </strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal de Confirmación */}
            {showConfirmModal && ventaEncontrada && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3>Confirmar Devolución</h3>
                            <button style={styles.closeBtn} onClick={() => setShowConfirmModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={styles.confirmInfo}>
                                <AlertCircle size={48} style={{ color: '#e65100' }} />
                                <p>¿Está seguro de procesar esta devolución?</p>
                                <div style={styles.confirmDetails}>
                                    <div><strong>Venta:</strong> {ventaEncontrada.id_venta}</div>
                                    <div><strong>Total a devolver:</strong> {formatCurrency(ventaEncontrada.total)}</div>
                                    <div><strong>Forma de reembolso:</strong> {formData.forma_reembolso}</div>
                                    <div><strong>Productos:</strong> {detallesVenta.length} items</div>
                                </div>
                                <p style={styles.warningText}>
                                    ⚠️ Esta acción anulará la venta y devolverá los productos al inventario automáticamente.
                                </p>
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button style={styles.btnCancel} onClick={() => setShowConfirmModal(false)}>
                                Cancelar
                            </button>
                            <button
                                style={styles.btnConfirm}
                                onClick={procesarDevolucion}
                                disabled={processing}
                            >
                                {processing ? (
                                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</>
                                ) : (
                                    <><CheckCircle size={16} /> Confirmar Devolución</>
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
    header: { marginBottom: '25px' },
    title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
    subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },

    // Search Section
    searchSection: { background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
    sectionTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#333' },
    searchRow: { display: 'flex', gap: '15px', alignItems: 'center' },
    searchBox: { flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', background: '#f8f9fa', border: '2px solid #e9ecef', borderRadius: '12px' },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '16px', background: 'transparent', fontWeight: '500' },
    clearBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#999' },
    btnSearch: { display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 25px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' },

    // Venta Card
    ventaCard: { background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '2px solid #e8f5e9' },
    ventaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e9ecef' },
    ventaId: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#1a5d1a' },
    ventaFecha: { display: 'flex', alignItems: 'center', gap: '6px', color: '#6c757d', fontSize: '14px', marginTop: '5px' },
    ventaTotal: { textAlign: 'right' },
    clienteInfo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#f8f9fa', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' },
    ciNit: { color: '#6c757d', marginLeft: 'auto' },

    // Detalles
    detallesContainer: { marginBottom: '25px' },
    detallesTitle: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' },
    detallesTable: { width: '100%', borderCollapse: 'collapse' },
    detalleTh: { padding: '12px 15px', textAlign: 'left', background: '#f8f9fa', fontSize: '13px', fontWeight: '600', color: '#333' },
    detalleTd: { padding: '12px 15px', borderBottom: '1px solid #e9ecef', fontSize: '14px' },
    codigo: { display: 'block', fontSize: '12px', color: '#6c757d' },

    // Form
    devolucionForm: { background: '#f8f9fa', borderRadius: '12px', padding: '20px' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#333' },
    select: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: 'white' },
    textarea: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' },
    reembolsoOptions: { display: 'flex', gap: '10px' },
    reembolsoBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '15px', border: '2px solid #e9ecef', borderRadius: '10px', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#6c757d' },
    reembolsoBtnActive: { borderColor: '#1a5d1a', background: '#e8f5e9', color: '#1a5d1a' },
    btnProcesar: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #c62828, #e53935)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },

    // Historial
    historialSection: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
    tableContainer: { overflow: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
    th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
    tr: { borderBottom: '1px solid #e9ecef' },
    td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
    fecha: { display: 'flex', alignItems: 'center', gap: '5px', color: '#6c757d' },
    motivoBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: '#f5f5f5', borderRadius: '6px', fontSize: '12px' },
    reembolsoBadge: { padding: '4px 10px', background: '#e3f2fd', color: '#1565c0', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
    loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', color: '#6c757d', gap: '10px' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', color: '#6c757d', gap: '10px' },

    // Modal
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'white', borderRadius: '16px', width: '90%', maxWidth: '450px', overflow: 'hidden' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#999' },
    modalBody: { padding: '30px 25px' },
    confirmInfo: { textAlign: 'center' },
    confirmDetails: { textAlign: 'left', background: '#f8f9fa', padding: '15px', borderRadius: '10px', margin: '20px 0', fontSize: '14px', lineHeight: '2' },
    warningText: { color: '#e65100', fontSize: '13px', marginTop: '15px' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', background: '#f8f9fa' },
    btnCancel: { padding: '12px 20px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
    btnConfirm: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #c62828, #e53935)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
};

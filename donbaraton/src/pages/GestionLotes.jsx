// src/pages/GestionLotes.jsx
// Módulo para gestionar lotes y fechas de vencimiento de productos
import { useState, useEffect } from 'react';
import {
    Package, Search, X, Loader2, RefreshCw, Calendar,
    Trash2, Edit3, CheckCircle, AlertTriangle, Clock,
    Filter, AlertCircle, Archive
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function GestionLotes() {
    const [lotes, setLotes] = useState([]);
    const [movimientosVencidos, setMovimientosVencidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [tabActiva, setTabActiva] = useState('lotes'); // 'lotes' o 'movimientos'
    const [editandoLote, setEditandoLote] = useState(null);
    const [nuevaFecha, setNuevaFecha] = useState('');

    useEffect(() => {
        cargarDatos();
    }, [filtroEstado]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Cargar lotes
            let queryLotes = supabase
                .from('lotes')
                .select(`
                    *,
                    productos (nombre, codigo_interno)
                `)
                .order('fecha_vencimiento', { ascending: true });

            if (filtroEstado) {
                queryLotes = queryLotes.eq('estado', filtroEstado);
            }

            const { data: lotesData, error: lotesError } = await queryLotes;
            if (lotesError) throw lotesError;
            setLotes(lotesData || []);

            // Cargar movimientos con fecha de vencimiento
            const { data: movData, error: movError } = await supabase
                .from('movimientos_inventario')
                .select(`
                    id_movimiento,
                    id_producto,
                    tipo,
                    cantidad,
                    lote,
                    fecha_vencimiento,
                    fecha_hora,
                    productos (nombre, codigo_interno)
                `)
                .not('fecha_vencimiento', 'is', null)
                .order('fecha_vencimiento', { ascending: true })
                .limit(100);

            if (movError) throw movError;
            setMovimientosVencidos(movData || []);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Estadísticas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const stats = {
        total: lotes.length,
        activos: lotes.filter(l => l.estado === 'ACTIVO').length,
        vencidos: lotes.filter(l => {
            const fechaVenc = new Date(l.fecha_vencimiento);
            return fechaVenc < hoy || l.estado === 'VENCIDO';
        }).length,
        proximos: lotes.filter(l => {
            const fechaVenc = new Date(l.fecha_vencimiento);
            const en7Dias = new Date();
            en7Dias.setDate(en7Dias.getDate() + 7);
            return fechaVenc >= hoy && fechaVenc <= en7Dias && l.estado === 'ACTIVO';
        }).length,
        movVencidos: movimientosVencidos.filter(m => new Date(m.fecha_vencimiento) < hoy).length
    };

    // Filtrar lotes por búsqueda
    const lotesFiltrados = lotes.filter(l =>
        !busqueda ||
        l.productos?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.productos?.codigo_interno?.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.lote?.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Filtrar movimientos por búsqueda
    const movimientosFiltrados = movimientosVencidos.filter(m =>
        !busqueda ||
        m.productos?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.lote?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const getEstadoColor = (lote) => {
        const fechaVenc = new Date(lote.fecha_vencimiento);
        if (fechaVenc < hoy || lote.estado === 'VENCIDO') {
            return { bg: '#ffebee', color: '#c62828', icon: <AlertCircle size={14} />, texto: 'VENCIDO' };
        }
        const en7Dias = new Date();
        en7Dias.setDate(en7Dias.getDate() + 7);
        if (fechaVenc <= en7Dias) {
            return { bg: '#fff8e1', color: '#f57f17', icon: <Clock size={14} />, texto: 'PRÓXIMO' };
        }
        if (lote.estado === 'AGOTADO') {
            return { bg: '#f5f5f5', color: '#666', icon: <Archive size={14} />, texto: 'AGOTADO' };
        }
        return { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle size={14} />, texto: 'ACTIVO' };
    };

    const formatFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-BO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const diasHastaVencimiento = (fecha) => {
        if (!fecha) return null;
        const fechaVenc = new Date(fecha);
        const diffTime = fechaVenc - hoy;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Eliminar lote
    const eliminarLote = async (idLote) => {
        if (!window.confirm('¿Está seguro de eliminar este lote? Esta acción no se puede deshacer.')) return;

        try {
            const { error } = await supabase
                .from('lotes')
                .delete()
                .eq('id_lote', idLote);

            if (error) throw error;
            toast.success('Lote eliminado correctamente');
            cargarDatos();
        } catch (error) {
            console.error('Error al eliminar lote:', error);
            toast.error('Error al eliminar lote');
        }
    };

    // Marcar lote como vencido/agotado
    const cambiarEstadoLote = async (idLote, nuevoEstado) => {
        try {
            const { error } = await supabase
                .from('lotes')
                .update({ estado: nuevoEstado })
                .eq('id_lote', idLote);

            if (error) throw error;
            toast.success(`Lote marcado como ${nuevoEstado}`);
            cargarDatos();
        } catch (error) {
            console.error('Error al actualizar lote:', error);
            toast.error('Error al actualizar lote');
        }
    };

    // Actualizar fecha de vencimiento
    const actualizarFechaVencimiento = async (idLote) => {
        if (!nuevaFecha) {
            toast.error('Seleccione una fecha');
            return;
        }

        try {
            const { error } = await supabase
                .from('lotes')
                .update({ fecha_vencimiento: nuevaFecha })
                .eq('id_lote', idLote);

            if (error) throw error;
            toast.success('Fecha de vencimiento actualizada');
            setEditandoLote(null);
            setNuevaFecha('');
            cargarDatos();
        } catch (error) {
            console.error('Error al actualizar fecha:', error);
            toast.error('Error al actualizar fecha');
        }
    };

    // Eliminar movimiento con vencimiento
    const eliminarMovimiento = async (idMovimiento) => {
        if (!window.confirm('¿Eliminar este registro de vencimiento? Esto desbloqueará la venta del producto.')) return;

        try {
            // Actualizar el movimiento para quitar la fecha de vencimiento
            const { error } = await supabase
                .from('movimientos_inventario')
                .update({ fecha_vencimiento: null })
                .eq('id_movimiento', idMovimiento);

            if (error) throw error;
            toast.success('Registro de vencimiento eliminado');
            cargarDatos();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al eliminar registro');
        }
    };

    return (
        <div style={styles.container}>
            <Toaster position="top-right" />

            {/* Header */}
            <div style={styles.header}>
                <h2 style={styles.title}>
                    <Calendar size={28} color="#1a5d1a" />
                    Gestión de Lotes y Vencimientos
                </h2>
                <button style={styles.refreshButton} onClick={cargarDatos}>
                    <RefreshCw size={18} />
                    Actualizar
                </button>
            </div>

            {/* Estadísticas */}
            <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #1a5d1a' }}>
                    <span style={styles.statValue}>{stats.total}</span>
                    <span style={styles.statLabel}>Total Lotes</span>
                </div>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #2e7d32' }}>
                    <span style={styles.statValue}>{stats.activos}</span>
                    <span style={styles.statLabel}>Activos</span>
                </div>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #f57f17' }}>
                    <span style={styles.statValue}>{stats.proximos}</span>
                    <span style={styles.statLabel}>Próximos a Vencer</span>
                </div>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #c62828' }}>
                    <span style={styles.statValue}>{stats.vencidos}</span>
                    <span style={styles.statLabel}>Vencidos</span>
                </div>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #e65100' }}>
                    <span style={styles.statValue}>{stats.movVencidos}</span>
                    <span style={styles.statLabel}>Mov. Bloqueantes</span>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button
                    style={{ ...styles.tab, ...(tabActiva === 'lotes' ? styles.tabActive : {}) }}
                    onClick={() => setTabActiva('lotes')}
                >
                    <Package size={16} />
                    Lotes ({lotes.length})
                </button>
                <button
                    style={{ ...styles.tab, ...(tabActiva === 'movimientos' ? styles.tabActive : {}) }}
                    onClick={() => setTabActiva('movimientos')}
                >
                    <AlertTriangle size={16} />
                    Movimientos con Vencimiento ({movimientosVencidos.length})
                    {stats.movVencidos > 0 && (
                        <span style={styles.badge}>{stats.movVencidos}</span>
                    )}
                </button>
            </div>

            {/* Filtros */}
            <div style={styles.filtersSection}>
                <div style={styles.searchBox}>
                    <Search size={18} color="#999" />
                    <input
                        type="text"
                        placeholder="Buscar producto o lote..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={styles.searchInput}
                    />
                    {busqueda && (
                        <button style={styles.clearButton} onClick={() => setBusqueda('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>
                {tabActiva === 'lotes' && (
                    <select
                        style={styles.select}
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="ACTIVO">Activos</option>
                        <option value="VENCIDO">Vencidos</option>
                        <option value="AGOTADO">Agotados</option>
                    </select>
                )}
            </div>

            {/* Contenido */}
            {loading ? (
                <div style={styles.loadingState}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Cargando lotes...</span>
                </div>
            ) : tabActiva === 'lotes' ? (
                // TABLA DE LOTES
                lotesFiltrados.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Package size={60} color="#ccc" />
                        <h3>No hay lotes</h3>
                        <p>No se encontraron lotes con los filtros seleccionados</p>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Producto</th>
                                    <th style={styles.th}>Lote</th>
                                    <th style={styles.th}>Vencimiento</th>
                                    <th style={styles.th}>Días</th>
                                    <th style={styles.th}>Cantidad</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lotesFiltrados.map((lote) => {
                                    const estadoInfo = getEstadoColor(lote);
                                    const dias = diasHastaVencimiento(lote.fecha_vencimiento);

                                    return (
                                        <tr key={lote.id_lote} style={styles.tr}>
                                            <td style={styles.td}>
                                                <strong>{lote.productos?.nombre || 'N/A'}</strong>
                                                <br />
                                                <small style={{ color: '#6c757d' }}>{lote.productos?.codigo_interno}</small>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.loteCode}>{lote.lote}</span>
                                            </td>
                                            <td style={styles.td}>
                                                {editandoLote === lote.id_lote ? (
                                                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                                        <input
                                                            type="date"
                                                            value={nuevaFecha}
                                                            onChange={(e) => setNuevaFecha(e.target.value)}
                                                            style={styles.dateInput}
                                                        />
                                                        <button
                                                            style={styles.btnSaveSmall}
                                                            onClick={() => actualizarFechaVencimiento(lote.id_lote)}
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                        <button
                                                            style={styles.btnCancelSmall}
                                                            onClick={() => { setEditandoLote(null); setNuevaFecha(''); }}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    formatFecha(lote.fecha_vencimiento)
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    fontWeight: '700',
                                                    color: dias < 0 ? '#c62828' : dias <= 7 ? '#f57f17' : '#2e7d32'
                                                }}>
                                                    {dias !== null ? (dias < 0 ? `${Math.abs(dias)}d vencido` : `${dias}d`) : '-'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.cantidad}>{lote.cantidad}</span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.estadoBadge,
                                                    background: estadoInfo.bg,
                                                    color: estadoInfo.color
                                                }}>
                                                    {estadoInfo.icon}
                                                    {estadoInfo.texto}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actionButtons}>
                                                    <button
                                                        style={styles.btnEdit}
                                                        onClick={() => {
                                                            setEditandoLote(lote.id_lote);
                                                            setNuevaFecha(lote.fecha_vencimiento);
                                                        }}
                                                        title="Editar fecha"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    {lote.estado !== 'VENCIDO' && (
                                                        <button
                                                            style={styles.btnVencer}
                                                            onClick={() => cambiarEstadoLote(lote.id_lote, 'VENCIDO')}
                                                            title="Marcar como vencido"
                                                        >
                                                            <AlertCircle size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        style={styles.btnDelete}
                                                        onClick={() => eliminarLote(lote.id_lote)}
                                                        title="Eliminar lote"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                // TABLA DE MOVIMIENTOS CON VENCIMIENTO
                movimientosFiltrados.length === 0 ? (
                    <div style={styles.emptyState}>
                        <CheckCircle size={60} color="#2e7d32" />
                        <h3>Sin registros bloqueantes</h3>
                        <p>No hay movimientos con fechas de vencimiento que bloqueen ventas</p>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <div style={styles.infoBox}>
                            <AlertTriangle size={18} color="#e65100" />
                            <span>
                                Estos registros en <strong>movimientos_inventario</strong> contienen fechas de vencimiento que pueden bloquear ventas.
                                Elimina los registros vencidos para desbloquear los productos.
                            </span>
                        </div>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Producto</th>
                                    <th style={styles.th}>Tipo</th>
                                    <th style={styles.th}>Lote</th>
                                    <th style={styles.th}>Vencimiento</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Cantidad</th>
                                    <th style={styles.th}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientosFiltrados.map((mov) => {
                                    const fechaVenc = new Date(mov.fecha_vencimiento);
                                    const vencido = fechaVenc < hoy;

                                    return (
                                        <tr key={mov.id_movimiento} style={{
                                            ...styles.tr,
                                            background: vencido ? '#fff8f8' : 'transparent'
                                        }}>
                                            <td style={styles.td}>
                                                <strong>{mov.productos?.nombre || 'N/A'}</strong>
                                                <br />
                                                <small style={{ color: '#6c757d' }}>{mov.productos?.codigo_interno}</small>
                                            </td>
                                            <td style={styles.td}>{mov.tipo}</td>
                                            <td style={styles.td}>
                                                <span style={styles.loteCode}>{mov.lote || '-'}</span>
                                            </td>
                                            <td style={styles.td}>
                                                {formatFecha(mov.fecha_vencimiento)}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.estadoBadge,
                                                    background: vencido ? '#ffebee' : '#fff8e1',
                                                    color: vencido ? '#c62828' : '#f57f17'
                                                }}>
                                                    {vencido ? <AlertCircle size={14} /> : <Clock size={14} />}
                                                    {vencido ? 'VENCIDO' : 'ACTIVO'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>{mov.cantidad}</td>
                                            <td style={styles.td}>
                                                <button
                                                    style={styles.btnDeleteRed}
                                                    onClick={() => eliminarMovimiento(mov.id_movimiento)}
                                                    title="Eliminar registro de vencimiento"
                                                >
                                                    <Trash2 size={14} />
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

// ============== ESTILOS ==============
const styles = {
    container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
    title: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: '700', color: '#333', margin: 0 },
    refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#f5f5f5', color: '#333', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },

    // Stats
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '20px' },
    statCard: { background: 'white', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    statValue: { fontSize: '28px', fontWeight: '700', color: '#333', display: 'block' },
    statLabel: { fontSize: '12px', color: '#6c757d', marginTop: '5px', display: 'block' },

    // Tabs
    tabs: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
    tab: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#f5f5f5', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', color: '#666' },
    tabActive: { background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white' },
    badge: { background: '#c62828', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700', marginLeft: '5px' },

    // Filters
    filtersSection: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', borderRadius: '10px', border: '1px solid #e9ecef', flex: '1', minWidth: '250px' },
    searchInput: { border: 'none', outline: 'none', fontSize: '14px', flex: 1 },
    clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
    select: { padding: '10px 15px', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', background: 'white', minWidth: '160px' },

    // Table
    tableContainer: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '14px 16px', textAlign: 'left', background: '#f8f9fa', color: '#495057', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid #e9ecef' },
    tr: { borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#333' },

    // Elements
    loteCode: { fontFamily: 'monospace', background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' },
    cantidad: { fontWeight: '700', fontSize: '16px', color: '#1a5d1a' },
    estadoBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
    dateInput: { padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' },

    // Action Buttons
    actionButtons: { display: 'flex', gap: '6px' },
    btnEdit: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnVencer: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: '#fff8e1', color: '#f57f17', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnDelete: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    btnDeleteRed: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
    btnSaveSmall: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', background: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    btnCancelSmall: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', cursor: 'pointer' },

    // Info Box
    infoBox: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', background: '#fff8e1', borderBottom: '1px solid #ffe082', fontSize: '13px', color: '#5d4037' },

    // States
    loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', color: '#6c757d', textAlign: 'center' }
};

// src/pages/StockNoVendible.jsx
// Componente para gestionar productos dañados y vencidos provenientes de devoluciones
import { useState, useEffect } from 'react';
import {
    AlertTriangle, Package, Search, X, Loader2, RefreshCw,
    Trash2, CheckCircle, Clock, Filter, Calendar, FileText
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function StockNoVendible() {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroMotivo, setFiltroMotivo] = useState('');
    const [busqueda, setBusqueda] = useState('');

    // Cargar datos al montar
    useEffect(() => {
        cargarDatos();
    }, [filtroEstado, filtroMotivo]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('fn_leer_stock_no_vendible', {
                p_estado: filtroEstado || null,
                p_motivo: filtroMotivo || null
            });

            if (error) throw error;
            setRegistros(data || []);
        } catch (error) {
            console.error('Error al cargar stock no vendible:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const actualizarEstado = async (idRegistro, nuevoEstado) => {
        try {
            const { error } = await supabase.rpc('fn_actualizar_stock_no_vendible', {
                p_id_registro: idRegistro,
                p_nuevo_estado: nuevoEstado,
                p_username: localStorage.getItem('username') || 'admin'
            });

            if (error) throw error;

            toast.success(`Estado actualizado a: ${nuevoEstado}`);
            cargarDatos();
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            toast.error('Error al actualizar estado');
        }
    };

    const getMotivoBadge = (motivo) => {
        if (motivo === 'DAÑADO') {
            return {
                background: '#ffebee',
                color: '#c62828',
                icon: <AlertTriangle size={14} />
            };
        }
        return {
            background: '#fff3e0',
            color: '#ef6c00',
            icon: <Calendar size={14} />
        };
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'PENDIENTE':
                return { background: '#fff8e1', color: '#f57f17', icon: <Clock size={14} /> };
            case 'DESCARTADO':
                return { background: '#ffebee', color: '#c62828', icon: <Trash2 size={14} /> };
            case 'RECUPERADO':
                return { background: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle size={14} /> };
            default:
                return { background: '#f5f5f5', color: '#666' };
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-BO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Filtrar por búsqueda
    const registrosFiltrados = registros.filter(r =>
        !busqueda ||
        r.producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.codigo_interno?.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Estadísticas
    const stats = {
        total: registros.length,
        danados: registros.filter(r => r.motivo === 'DAÑADO').length,
        vencidos: registros.filter(r => r.motivo === 'VENCIDO').length,
        pendientes: registros.filter(r => r.estado === 'PENDIENTE').length
    };

    return (
        <div style={styles.container}>
            <Toaster position="top-right" />

            {/* Header */}
            <div style={styles.header}>
                <h2 style={styles.title}>
                    <AlertTriangle size={28} color="#ef6c00" />
                    Stock No Vendible
                </h2>
                <button style={styles.refreshButton} onClick={cargarDatos}>
                    <RefreshCw size={18} />
                    Actualizar
                </button>
            </div>

            {/* Estadísticas */}
            <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #ef6c00' }}>
                    <span style={styles.statValue}>{stats.total}</span>
                    <span style={styles.statLabel}>Total Registros</span>
                </div>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #c62828' }}>
                    <span style={styles.statValue}>{stats.danados}</span>
                    <span style={styles.statLabel}>Dañados</span>
                </div>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #f57f17' }}>
                    <span style={styles.statValue}>{stats.vencidos}</span>
                    <span style={styles.statLabel}>Vencidos</span>
                </div>
                <div style={{ ...styles.statCard, borderLeft: '4px solid #1976d2' }}>
                    <span style={styles.statValue}>{stats.pendientes}</span>
                    <span style={styles.statLabel}>Pendientes</span>
                </div>
            </div>

            {/* Filtros */}
            <div style={styles.filtersSection}>
                <div style={styles.searchBox}>
                    <Search size={18} color="#999" />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
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
                <select
                    style={styles.select}
                    value={filtroMotivo}
                    onChange={(e) => setFiltroMotivo(e.target.value)}
                >
                    <option value="">Todos los motivos</option>
                    <option value="DAÑADO">Dañados</option>
                    <option value="VENCIDO">Vencidos</option>
                </select>
                <select
                    style={styles.select}
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    <option value="PENDIENTE">Pendientes</option>
                    <option value="DESCARTADO">Descartados</option>
                    <option value="RECUPERADO">Recuperados</option>
                </select>
            </div>

            {/* Tabla */}
            {loading ? (
                <div style={styles.loadingState}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Cargando stock no vendible...</span>
                </div>
            ) : registrosFiltrados.length === 0 ? (
                <div style={styles.emptyState}>
                    <Package size={60} color="#ccc" />
                    <h3>No hay registros</h3>
                    <p>No se encontraron productos en stock no vendible</p>
                </div>
            ) : (
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Producto</th>
                                <th style={styles.th}>Código</th>
                                <th style={styles.th}>Cantidad</th>
                                <th style={styles.th}>Motivo</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Fecha</th>
                                <th style={styles.th}>Devolución</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrosFiltrados.map((registro) => {
                                const motivoStyle = getMotivoBadge(registro.motivo);
                                const estadoStyle = getEstadoBadge(registro.estado);

                                return (
                                    <tr key={registro.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <strong>{registro.producto}</strong>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.codigo}>{registro.codigo_interno}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.cantidad}>{registro.cantidad}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                background: motivoStyle.background,
                                                color: motivoStyle.color
                                            }}>
                                                {motivoStyle.icon}
                                                {registro.motivo}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.badge,
                                                background: estadoStyle.background,
                                                color: estadoStyle.color
                                            }}>
                                                {estadoStyle.icon}
                                                {registro.estado}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <small>{formatFecha(registro.fecha)}</small>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.devolucionRef}>
                                                <FileText size={14} />
                                                {registro.devolucion_origen || '-'}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {registro.estado === 'PENDIENTE' && (
                                                <div style={styles.actionButtons}>
                                                    <button
                                                        style={styles.btnDescartar}
                                                        onClick={() => actualizarEstado(registro.id, 'DESCARTADO')}
                                                        title="Marcar como descartado"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <button
                                                        style={styles.btnRecuperar}
                                                        onClick={() => actualizarEstado(registro.id, 'RECUPERADO')}
                                                        title="Marcar como recuperado"
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
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
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '15px', marginBottom: '20px' },
    statCard: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    statValue: { fontSize: '28px', fontWeight: '700', color: '#333', display: 'block' },
    statLabel: { fontSize: '13px', color: '#6c757d', marginTop: '5px', display: 'block' },

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

    // Badges y elementos
    badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
    codigo: { fontFamily: 'monospace', background: '#f5f5f5', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' },
    cantidad: { fontWeight: '700', fontSize: '16px', color: '#ef6c00' },
    devolucionRef: { display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '12px' },

    // Botones de acción
    actionButtons: { display: 'flex', gap: '8px' },
    btnDescartar: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    btnRecuperar: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#e8f5e9', color: '#2e7d32', border: 'none', borderRadius: '8px', cursor: 'pointer' },

    // Estados
    loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', color: '#6c757d', textAlign: 'center' }
};

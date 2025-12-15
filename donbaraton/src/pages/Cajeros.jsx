// src/pages/Cajeros.jsx
import { useState, useEffect } from 'react';
import {
    UserCheck, Plus, Search,
    X, Save, Loader2, AlertCircle, Users,
    RefreshCw, XCircle
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Cajeros() {
    const [cajeros, setCajeros] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id_usuario: ''
    });

    const getUsername = () => {
        const user = localStorage.getItem('user');
        if (user) {
            try { return JSON.parse(user).username || 'admin'; }
            catch { return 'admin'; }
        }
        return 'admin';
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Usar la función RPC para listar cajeros (solo activos)
            const { data: cajerosData, error: cajerosError } = await supabase
                .rpc('fn_listar_cajeros');

            if (cajerosError) {
                console.error('Error cajeros:', cajerosError);
                throw cajerosError;
            }

            // Filtrar solo cajeros activos (el estado es solo para borrado lógico)
            const cajerosActivos = (cajerosData || []).filter(c => c.estado === 'ACTIVO');

            // Cargar usuarios disponibles (que no son cajeros aún)
            const { data: usuariosData, error: usuariosError } = await supabase
                .rpc('fn_listar_usuarios');

            if (usuariosError) {
                console.error('Error usuarios:', usuariosError);
            }

            // Filtrar usuarios activos que no son cajeros
            const cajeroUsernames = cajerosActivos.map(c => c.username);
            const usuariosDisponibles = (usuariosData || []).filter(
                u => u.estado === 'ACTIVO' && !cajeroUsernames.includes(u.username)
            );

            setCajeros(cajerosActivos);
            setUsuarios(usuariosDisponibles);
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.id_usuario) {
            toast.error('Seleccione un usuario');
            return;
        }

        setSaving(true);
        try {
            // Usar la función RPC para crear cajero
            const { data, error } = await supabase.rpc('fn_crear_cajero', {
                p_id_usuario: formData.id_usuario,
                p_usuario_auditoria: getUsername()
            });

            if (error) {
                if (error.message.includes('ya está registrado')) {
                    toast.error('Este usuario ya es cajero');
                } else {
                    toast.error(error.message || 'Error al crear cajero');
                }
            } else {
                toast.success('Cajero registrado exitosamente');
                setShowModal(false);
                resetForm();
                cargarDatos();
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error al crear cajero');
        } finally {
            setSaving(false);
        }
    };

    const handleDesactivar = async (cajero) => {
        if (!window.confirm(`¿Eliminar al cajero "${cajero.nombre_completo || cajero.username}"?\n\nEl cajero ya no podrá realizar operaciones de caja.`)) {
            return;
        }

        try {
            // Usar la función RPC para desactivar cajero (borrado lógico)
            const { error } = await supabase.rpc('fn_desactivar_cajero', {
                p_id_cajero: cajero.id_cajero,
                p_usuario_auditoria: getUsername()
            });

            if (error) {
                toast.error(error.message || 'Error al eliminar cajero');
            } else {
                toast.success('Cajero eliminado');
                cargarDatos();
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error al eliminar cajero');
        }
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ id_usuario: '' });
    };

    // Filtrar cajeros por búsqueda
    const cajerosFiltrados = cajeros.filter(cajero => {
        const nombre = (cajero.nombre_completo || '').toLowerCase();
        const username = (cajero.username || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return nombre.includes(term) || username.includes(term);
    });

    return (
        <div style={styles.container}>
            <Toaster position="top-right" />

            <header style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        <UserCheck size={28} style={{ marginRight: '12px' }} />
                        Gestión de Cajeros
                    </h1>
                    <p style={styles.subtitle}>
                        Administración de cajeros del sistema • {cajeros.length} cajeros activos
                    </p>
                </div>
                <div style={styles.headerActions}>
                    <button style={styles.refreshButton} onClick={cargarDatos} disabled={loading}>
                        <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    </button>
                    <button style={styles.primaryButton} onClick={openCreateModal}>
                        <Plus size={18} />
                        Nuevo Cajero
                    </button>
                </div>
            </header>

            {/* Estadísticas */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <Users size={28} style={{ color: '#1a5d1a' }} />
                    <div>
                        <span style={styles.statValue}>{cajeros.length}</span>
                        <span style={styles.statLabel}>Total Cajeros</span>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <UserCheck size={28} style={{ color: '#1565c0' }} />
                    <div>
                        <span style={{ ...styles.statValue, color: '#1565c0' }}>{usuarios.length}</span>
                        <span style={styles.statLabel}>Usuarios Disponibles</span>
                    </div>
                </div>
            </div>

            {/* Buscador */}
            <div style={styles.toolbar}>
                <div style={styles.searchBox}>
                    <Search size={18} style={{ color: '#6c757d' }} />
                    <input
                        type="text"
                        placeholder="Buscar cajero..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} style={styles.clearButton}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Info */}
            <div style={styles.infoCard}>
                <AlertCircle size={18} />
                <p>Los cajeros son usuarios habilitados para realizar operaciones de caja y ventas.</p>
            </div>

            {/* Tabla */}
            <div style={styles.tableContainer}>
                {loading ? (
                    <div style={styles.loadingState}>
                        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
                        <p>Cargando cajeros...</p>
                    </div>
                ) : cajerosFiltrados.length === 0 ? (
                    <div style={styles.emptyState}>
                        <UserCheck size={48} style={{ color: '#ccc' }} />
                        <p>{searchTerm ? 'No se encontraron cajeros' : 'No hay cajeros registrados'}</p>
                        <button style={styles.primaryButton} onClick={openCreateModal}>
                            <Plus size={18} /> Agregar primer cajero
                        </button>
                    </div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID Cajero</th>
                                <th style={styles.th}>Nombre</th>
                                <th style={styles.th}>Usuario</th>
                                <th style={{ ...styles.th, textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cajerosFiltrados.map((cajero) => (
                                <tr key={cajero.id_cajero} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={styles.avatar}>
                                                <UserCheck size={18} />
                                            </div>
                                            <span style={{ fontWeight: '500', color: '#1a5d1a' }}>{cajero.id_cajero}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <strong>{cajero.nombre_completo || '-'}</strong>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={styles.usernameBadge}>
                                            @{cajero.username || '-'}
                                        </span>
                                    </td>
                                    <td style={{ ...styles.td, textAlign: 'center' }}>
                                        <button
                                            style={styles.deleteButton}
                                            onClick={() => handleDesactivar(cajero)}
                                            title="Eliminar cajero"
                                        >
                                            <XCircle size={16} /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                <Plus size={20} style={{ marginRight: '10px' }} />
                                Nuevo Cajero
                            </h2>
                            <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            {usuarios.length === 0 ? (
                                <div style={styles.noUsersMessage}>
                                    <AlertCircle size={40} style={{ color: '#f57c00', marginBottom: '15px' }} />
                                    <p style={{ margin: 0, fontWeight: '600', color: '#333' }}>No hay usuarios disponibles</p>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
                                        Todos los usuarios activos ya están registrados como cajeros.
                                    </p>
                                </div>
                            ) : (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Seleccionar Usuario *</label>
                                    <select
                                        value={formData.id_usuario}
                                        onChange={e => setFormData({ ...formData, id_usuario: e.target.value })}
                                        style={styles.input}
                                    >
                                        <option value="">-- Seleccione un usuario --</option>
                                        {usuarios.map(u => (
                                            <option key={u.id_usuario} value={u.id_usuario}>
                                                {u.empleado_nombre ? `${u.empleado_nombre} (@${u.username})` : u.username}
                                            </option>
                                        ))}
                                    </select>
                                    <p style={styles.helpText}>
                                        El usuario seleccionado será habilitado para realizar operaciones de caja.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div style={styles.modalFooter}>
                            <button style={styles.cancelButton} onClick={() => setShowModal(false)} disabled={saving}>
                                Cancelar
                            </button>
                            {usuarios.length > 0 && (
                                <button style={styles.saveButton} onClick={handleCreate} disabled={saving || !formData.id_usuario}>
                                    {saving ? (
                                        <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
                                    ) : (
                                        <><Save size={16} /> Registrar Cajero</>
                                    )}
                                </button>
                            )}
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
    headerActions: { display: 'flex', gap: '12px', alignItems: 'center' },
    refreshButton: { padding: '10px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' },
    statCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
    statValue: { display: 'block', fontSize: '28px', fontWeight: '700', color: '#1a5d1a' },
    statLabel: { fontSize: '13px', color: '#6c757d' },
    toolbar: { marginBottom: '15px' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', flex: 1, maxWidth: '350px' },
    searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
    clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
    infoCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', background: '#fff3e0', borderRadius: '10px', marginBottom: '20px', color: '#e65100', fontSize: '14px' },
    tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: '600px' },
    th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
    tr: { borderBottom: '1px solid #e9ecef' },
    td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
    usernameBadge: { padding: '4px 10px', background: '#e8f5e9', borderRadius: '6px', color: '#1a5d1a', fontSize: '13px', fontWeight: '500' },
    deleteButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#ffebee', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#d32f2f', fontSize: '13px', fontWeight: '500' },
    loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
    modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
    modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
    closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d' },
    modalBody: { padding: '25px', overflowY: 'auto', flex: 1 },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1a5d1a' },
    input: { width: '100%', padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' },
    helpText: { marginTop: '8px', fontSize: '12px', color: '#6c757d' },
    noUsersMessage: { textAlign: 'center', padding: '30px 20px' },
    modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
    cancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
    saveButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};

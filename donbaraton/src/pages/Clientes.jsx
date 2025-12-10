// src/pages/Clientes.jsx
import { useState, useEffect } from 'react';
import { 
  Building, Plus, Edit, Trash2, Search, 
  X, Save, Loader2, Phone, Mail, MapPin, User
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    ci_nit: '',
    telefono: '',
    email: '',
    direccion: ''
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
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_leer_clientes', {
        p_buscar: searchTerm || null
      });
      
      if (error) {
        console.error('Error:', error);
        toast.error('Error al cargar clientes');
      } else {
        setClientes(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarClientes();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreate = async () => {
    if (!formData.nombres.trim() || !formData.ci_nit.trim()) {
      toast.error('Nombre y CI/NIT son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_crear_cliente', {
        p_nombres: formData.nombres.trim(),
        p_apellido_paterno: formData.apellido_paterno.trim() || null,
        p_apellido_materno: formData.apellido_materno.trim() || null,
        p_ci_nit: formData.ci_nit.trim(),
        p_telefono: formData.telefono.trim() || null,
        p_email: formData.email.trim() || null,
        p_direccion: formData.direccion.trim() || null,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        if (error.message.includes('ya existe')) {
          toast.error('El CI/NIT ya está registrado');
        } else {
          toast.error(error.message || 'Error al crear cliente');
        }
      } else {
        toast.success('Cliente creado exitosamente');
        setShowModal(false);
        resetForm();
        cargarClientes();
      }
    } catch (err) {
      toast.error('Error al crear cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.rpc('fn_actualizar_cliente', {
        p_id: editingItem.id,
        p_telefono: formData.telefono.trim() || null,
        p_email: formData.email.trim() || null,
        p_direccion: formData.direccion.trim() || null,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al actualizar');
      } else {
        toast.success('Cliente actualizado exitosamente');
        setShowModal(false);
        resetForm();
        cargarClientes();
      }
    } catch (err) {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el cliente "${nombre}"?`)) return;

    try {
      const { error } = await supabase.rpc('fn_eliminar_cliente', {
        p_id: id,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al eliminar');
      } else {
        toast.success('Cliente eliminado');
        cargarClientes();
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const openEditModal = (cliente) => {
    setEditingItem(cliente);
    setFormData({
      nombres: cliente.nombres || '',
      apellido_paterno: cliente.apellido_paterno || '',
      apellido_materno: cliente.apellido_materno || '',
      ci_nit: cliente.ci_nit || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      direccion: cliente.direccion || ''
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombres: '', apellido_paterno: '', apellido_materno: '',
      ci_nit: '', telefono: '', email: '', direccion: ''
    });
    setEditingItem(null);
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Building size={28} style={{ marginRight: '12px' }} />
            Clientes
          </h1>
          <p style={styles.subtitle}>
            Gestión de clientes • {clientes.length} registros
          </p>
        </div>
        <button style={styles.primaryButton} onClick={openCreateModal}>
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </header>

      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o CI/NIT..."
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

      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando clientes...</p>
          </div>
        ) : clientes.length === 0 ? (
          <div style={styles.emptyState}>
            <Building size={48} style={{ color: '#ccc' }} />
            <p>{searchTerm ? 'No se encontraron resultados' : 'No hay clientes registrados'}</p>
            {!searchTerm && (
              <button style={styles.primaryButton} onClick={openCreateModal}>
                <Plus size={18} /> Crear primer cliente
              </button>
            )}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre Completo</th>
                <th style={styles.th}>CI/NIT</th>
                <th style={styles.th}>Teléfono</th>
                <th style={styles.th}>Email</th>
                <th style={{...styles.th, textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={styles.avatar}>
                        <User size={16} />
                      </div>
                      <strong>{cliente.nombre_completo}</strong>
                    </div>
                  </td>
                  <td style={styles.td}>{cliente.ci_nit}</td>
                  <td style={styles.td}>
                    {cliente.telefono ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Phone size={14} /> {cliente.telefono}
                      </span>
                    ) : <span style={{color: '#999'}}>-</span>}
                  </td>
                  <td style={styles.td}>
                    {cliente.email ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Mail size={14} /> {cliente.email}
                      </span>
                    ) : <span style={{color: '#999'}}>-</span>}
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <div style={styles.actionButtons}>
                      <button style={styles.editButton} onClick={() => openEditModal(cliente)}>
                        <Edit size={16} />
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleDelete(cliente.id, cliente.nombre_completo)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
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
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingItem ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombres *</label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                    style={styles.input}
                    placeholder="Nombres"
                    disabled={!!editingItem}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Apellido Paterno</label>
                  <input
                    type="text"
                    value={formData.apellido_paterno}
                    onChange={(e) => setFormData({...formData, apellido_paterno: e.target.value})}
                    style={styles.input}
                    placeholder="Apellido Paterno"
                    disabled={!!editingItem}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Apellido Materno</label>
                  <input
                    type="text"
                    value={formData.apellido_materno}
                    onChange={(e) => setFormData({...formData, apellido_materno: e.target.value})}
                    style={styles.input}
                    placeholder="Apellido Materno"
                    disabled={!!editingItem}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>CI/NIT *</label>
                  <input
                    type="text"
                    value={formData.ci_nit}
                    onChange={(e) => setFormData({...formData, ci_nit: e.target.value})}
                    style={styles.input}
                    placeholder="Carnet o NIT"
                    disabled={!!editingItem}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    style={styles.input}
                    placeholder="Número de teléfono"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  style={styles.input}
                  placeholder="Dirección del cliente"
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button style={styles.saveButton} onClick={editingItem ? handleUpdate : handleCreate} disabled={saving}>
                {saving ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
                ) : (
                  <><Save size={16} /> {editingItem ? 'Actualizar' : 'Crear'}</>
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
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 93, 26, 0.3)' },
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', flex: 1, maxWidth: '400px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  actionButtons: { display: 'flex', gap: '8px', justifyContent: 'center' },
  editButton: { padding: '8px', background: '#e3f2fd', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#1976d2' },
  deleteButton: { padding: '8px', background: '#ffebee', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#d32f2f' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: '5px', borderRadius: '5px' },
  modalBody: { padding: '25px' },
  formRow: { display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' },
  formGroup: { flex: 1, minWidth: '200px', marginBottom: '15px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1a5d1a' },
  input: { width: '100%', padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  cancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};

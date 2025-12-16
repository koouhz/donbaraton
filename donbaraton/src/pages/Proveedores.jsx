// src/pages/Proveedores.jsx
import { useState, useEffect } from 'react';
import {
  Truck, Plus, Edit, Trash2, Search,
  X, Save, Loader2, Phone, Mail, MapPin, Building
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    razon_social: '',
    nit_ci: '',
    telefono: '',
    celular: '',
    email: '',
    direccion: '',
    nombre_contacto: '',
    plazo_credito: 30
  });

  const getUsername = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try { return JSON.parse(user).usuario_id || 'USR-001'; }
      catch { return 'USR-001'; }
    }
    return 'USR-001';
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_leer_proveedores', {
        p_buscar_texto: searchTerm || null
      });

      if (error) {
        console.error('Error:', error);
        toast.error('Error al cargar proveedores');
      } else {
        setProveedores(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Buscar cuando cambia el término
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarProveedores();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreate = async () => {
    if (!formData.razon_social.trim() || !formData.nit_ci.trim()) {
      toast.error('Razón social y NIT/CI son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_crear_proveedor', {
        p_razon_social: formData.razon_social.trim(),
        p_nit_ci: formData.nit_ci.trim(),
        p_telefono: formData.telefono.trim() || null,
        p_celular_contacto: formData.celular.trim() || null,
        p_email: formData.email.trim() || null,
        p_direccion: formData.direccion.trim() || null,
        p_nombre_contacto: formData.nombre_contacto.trim() || null,
        p_plazo_credito: parseInt(formData.plazo_credito) || 30,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        if (error.message.includes('ya existe')) {
          toast.error('El NIT/CI ya está registrado');
        } else {
          toast.error(error.message || 'Error al crear proveedor');
        }
      } else {
        toast.success('Proveedor creado exitosamente');
        setShowModal(false);
        resetForm();
        cargarProveedores();
      }
    } catch (err) {
      toast.error('Error al crear proveedor');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.razon_social.trim()) {
      toast.error('La razón social es obligatoria');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc('fn_actualizar_proveedor', {
        p_id_proveedor: editingItem.id,
        p_razon_social: formData.razon_social.trim(),
        p_nit_ci: formData.nit_ci.trim(),
        p_telefono: formData.telefono.trim() || null,
        p_celular_contacto: formData.celular.trim() || null,
        p_email: formData.email.trim() || null,
        p_direccion: formData.direccion.trim() || null,
        p_nombre_contacto: formData.nombre_contacto.trim() || null,
        p_plazo_credito: parseInt(formData.plazo_credito) || 30,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al actualizar');
      } else {
        toast.success('Proveedor actualizado exitosamente');
        setShowModal(false);
        resetForm();
        cargarProveedores();
      }
    } catch (err) {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar el proveedor "${nombre}"?`)) return;

    try {
      const { error } = await supabase.rpc('fn_eliminar_proveedor', {
        p_id_proveedor: id,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al eliminar');
      } else {
        toast.success('Proveedor eliminado');
        cargarProveedores();
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const openEditModal = (proveedor) => {
    setEditingItem(proveedor);
    setFormData({
      razon_social: proveedor.razon_social || '',
      nit_ci: proveedor.nit_ci || '',
      telefono: proveedor.telefono || '',
      celular: '',
      email: proveedor.email || '',
      direccion: '',
      nombre_contacto: proveedor.nombre_contacto || '',
      plazo_credito: 30
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
      razon_social: '', nit_ci: '', telefono: '', celular: '',
      email: '', direccion: '', nombre_contacto: '', plazo_credito: 30
    });
    setEditingItem(null);
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Truck size={28} style={{ marginRight: '12px' }} />
            Proveedores
          </h1>
          <p style={styles.subtitle}>
            Gestión de proveedores • {proveedores.length} registros
          </p>
        </div>
        <button style={styles.primaryButton} onClick={openCreateModal}>
          <Plus size={18} />
          Nuevo Proveedor
        </button>
      </header>

      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o NIT..."
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
            <p>Cargando proveedores...</p>
          </div>
        ) : proveedores.length === 0 ? (
          <div style={styles.emptyState}>
            <Truck size={48} style={{ color: '#ccc' }} />
            <p>{searchTerm ? 'No se encontraron resultados' : 'No hay proveedores registrados'}</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Razón Social</th>
                <th style={styles.th}>NIT/CI</th>
                <th style={styles.th}>Contacto</th>
                <th style={styles.th}>Teléfono</th>
                <th style={styles.th}>Email</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((prov) => (
                <tr key={prov.id} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{prov.razon_social}</strong>
                  </td>
                  <td style={styles.td}>{prov.nit_ci}</td>
                  <td style={styles.td}>{prov.nombre_contacto || '-'}</td>
                  <td style={styles.td}>
                    {prov.telefono ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Phone size={14} /> {prov.telefono}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={styles.td}>
                    {prov.email ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Mail size={14} /> {prov.email}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <div style={styles.actionButtons}>
                      <button style={styles.editButton} onClick={() => openEditModal(prov)}>
                        <Edit size={16} />
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleDelete(prov.id, prov.razon_social)}>
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
                {editingItem ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Razón Social *</label>
                  <input
                    type="text"
                    value={formData.razon_social}
                    onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                    style={styles.input}
                    placeholder="Nombre de la empresa"
                    disabled={!!editingItem}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>NIT/CI *</label>
                  <input
                    type="text"
                    value={formData.nit_ci}
                    onChange={(e) => setFormData({ ...formData, nit_ci: e.target.value })}
                    style={styles.input}
                    placeholder="NIT o Carnet"
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
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    style={styles.input}
                    placeholder="Teléfono fijo"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Celular</label>
                  <input
                    type="tel"
                    value={formData.celular}
                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                    style={styles.input}
                    placeholder="Celular de contacto"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                    placeholder="correo@empresa.com"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nombre de Contacto</label>
                  <input
                    type="text"
                    value={formData.nombre_contacto}
                    onChange={(e) => setFormData({ ...formData, nombre_contacto: e.target.value })}
                    style={styles.input}
                    placeholder="Nombre del contacto"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 2 }}>
                  <label style={styles.label}>Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    style={styles.input}
                    placeholder="Dirección del proveedor"
                  />
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Plazo Crédito (días)</label>
                  <input
                    type="number"
                    value={formData.plazo_credito}
                    onChange={(e) => setFormData({ ...formData, plazo_credito: e.target.value })}
                    style={styles.input}
                    min="0"
                  />
                </div>
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
  container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 93, 26, 0.3)' },
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', flex: 1, maxWidth: '400px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  actionButtons: { display: 'flex', gap: '8px', justifyContent: 'center' },
  editButton: { padding: '8px', background: '#e3f2fd', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#1976d2' },
  deleteButton: { padding: '8px', background: '#ffebee', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#d32f2f' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '700px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: '5px', borderRadius: '5px' },
  modalBody: { padding: '25px' },
  formRow: { display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' },
  formGroup: { flex: 1, minWidth: '200px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1a5d1a' },
  input: { width: '100%', padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  cancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};

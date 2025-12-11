// src/pages/Categorias.jsx
import { useState, useEffect } from 'react';
import { 
  ClipboardList, Plus, Edit, Trash2, Search, 
  X, Save, AlertCircle, CheckCircle, Loader2 
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Categorias() {
  // Estados
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  // Obtener ID de usuario actual del localStorage (para auditoría)
  const getUsername = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        // Retornar usuario_id (USR-001) para auditoría correcta
        return JSON.parse(user).usuario_id || 'USR-001';
      } catch {
        return 'USR-001';
      }
    }
    return 'USR-001';
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias();
  }, []);

  // Función para cargar categorías usando SP
  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_listar_categorias');
      
      if (error) {
        console.error('Error al cargar categorías:', error);
        toast.error('Error al cargar categorías');
      } else {
        setCategorias(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear categoría usando SP
  const handleCreate = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_crear_categoria', {
        p_nombre: formData.nombre.trim(),
        p_descripcion: formData.descripcion.trim() || null,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        console.error('Error al crear:', error);
        toast.error(error.message || 'Error al crear categoría');
      } else {
        toast.success('Categoría creada exitosamente');
        setShowModal(false);
        resetForm();
        cargarCategorias();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al crear categoría');
    } finally {
      setSaving(false);
    }
  };

  // Función para actualizar categoría usando SP
  const handleUpdate = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_editar_categoria', {
        p_id_categoria: editingItem.id_categoria || editingItem.id, 
        p_nombre: formData.nombre.trim(),
        p_descripcion: formData.descripcion.trim() || null,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        console.error('Error al actualizar:', error);
        toast.error(error.message || 'Error al actualizar categoría');
      } else {
        toast.success('Categoría actualizada exitosamente');
        setShowModal(false);
        resetForm();
        cargarCategorias();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al actualizar categoría');
    } finally {
      setSaving(false);
    }
  };

  // Función para eliminar categoría usando SP
  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('fn_desactivar_categoria', {
        p_id_categoria: id,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        console.error('Error al eliminar:', error);
        if (error.message.includes('productos asociados')) {
          toast.error('No se puede eliminar: tiene productos asociados');
        } else {
          toast.error(error.message || 'Error al eliminar categoría');
        }
      } else {
        toast.success('Categoría eliminada exitosamente');
        cargarCategorias();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al eliminar categoría');
    }
  };

  // Abrir modal para editar
  const openEditModal = (categoria) => {
    setEditingItem(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || ''
    });
    setShowModal(true);
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditingItem(null);
  };

  // Filtrar categorías por búsqueda
  const categoriasFiltradas = categorias.filter(cat =>
    cat.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.descripcion && cat.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <ClipboardList size={28} style={{ marginRight: '12px' }} />
            Categorías
          </h1>
          <p style={styles.subtitle}>
            Gestión de categorías de productos • {categorias.length} categorías
          </p>
        </div>
        <button style={styles.primaryButton} onClick={openCreateModal}>
          <Plus size={18} />
          Nueva Categoría
        </button>
      </header>

      {/* Barra de búsqueda */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={styles.clearButton}
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button 
          style={styles.refreshButton} 
          onClick={cargarCategorias}
          disabled={loading}
        >
          <Loader2 
            size={16} 
            style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} 
          />
          Actualizar
        </button>
      </div>

      {/* Tabla de categorías */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando categorías...</p>
          </div>
        ) : categoriasFiltradas.length === 0 ? (
          <div style={styles.emptyState}>
            <ClipboardList size={48} style={{ color: '#ccc' }} />
            <p>{searchTerm ? 'No se encontraron resultados' : 'No hay categorías registradas'}</p>
            {!searchTerm && (
              <button style={styles.primaryButton} onClick={openCreateModal}>
                <Plus size={18} />
                Crear primera categoría
              </button>
            )}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Descripción</th>
                <th style={{...styles.th, textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.map((cat) => (
                <tr key={cat.id_categoria} style={styles.tr}>
                  <td style={styles.td}>{cat.id_categoria}</td>
                  <td style={styles.td}>
                    <strong>{cat.nombre}</strong>
                  </td>
                  <td style={styles.td}>
                    {cat.descripcion || <span style={{color: '#999'}}>Sin descripción</span>}
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.editButton}
                        onClick={() => openEditModal(cat)}
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDelete(cat.id_categoria, cat.nombre)}
                        title="Eliminar"
                      >
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

      {/* Modal para Crear/Editar */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingItem ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <button 
                style={styles.closeButton} 
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  style={styles.input}
                  placeholder="Nombre de la categoría"
                  autoFocus
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  style={styles.textarea}
                  placeholder="Descripción opcional"
                  rows={3}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.cancelButton} 
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                style={styles.saveButton} 
                onClick={editingItem ? handleUpdate : handleCreate}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingItem ? 'Actualizar' : 'Crear'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos de animación */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Estilos
const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a5d1a',
    display: 'flex',
    alignItems: 'center',
  },
  subtitle: {
    margin: '8px 0 0 0',
    color: '#6c757d',
    fontSize: '14px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(26, 93, 26, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  toolbar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 15px',
    background: 'white',
    border: '1px solid #e9ecef',
    borderRadius: '10px',
    flex: 1,
    maxWidth: '400px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    width: '100%',
    background: 'transparent',
  },
  clearButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    padding: '2px',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'white',
    border: '1px solid #e9ecef',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#495057',
    cursor: 'pointer',
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '15px 20px',
    textAlign: 'left',
    background: '#f8f9fa',
    color: '#1a5d1a',
    fontWeight: '600',
    fontSize: '14px',
    borderBottom: '2px solid #e9ecef',
  },
  tr: {
    borderBottom: '1px solid #e9ecef',
    transition: 'background 0.2s',
  },
  td: {
    padding: '15px 20px',
    fontSize: '14px',
    color: '#495057',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  editButton: {
    padding: '8px',
    background: '#e3f2fd',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#1976d2',
    transition: 'background 0.2s',
  },
  deleteButton: {
    padding: '8px',
    background: '#ffebee',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#d32f2f',
    transition: 'background 0.2s',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#6c757d',
    gap: '15px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#6c757d',
    gap: '15px',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid #e9ecef',
    background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a5d1a',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6c757d',
    padding: '5px',
    borderRadius: '5px',
  },
  modalBody: {
    padding: '25px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1a5d1a',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'border-color 0.2s',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    fontSize: '14px',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px 25px',
    borderTop: '1px solid #e9ecef',
    background: '#f8f9fa',
  },
  cancelButton: {
    padding: '10px 20px',
    background: 'white',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#6c757d',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

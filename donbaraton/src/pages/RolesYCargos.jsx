// src/pages/RolesYCargos.jsx
import { useState, useEffect } from 'react';
import {
  Shield, UserCheck, Users, Plus, Edit, Trash2, Search,
  X, Save, Loader2, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function RolesYCargos() {
  // Estados principales
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para modales
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Estados para formularios
  const [editingItem, setEditingItem] = useState(null);
  const [roleForm, setRoleForm] = useState({ nombre: '', descripcion: '' });
  const [cargoForm, setCargoForm] = useState({ nombre: '', descripcion: '' });
  const [assignForm, setAssignForm] = useState({ id_usuario: '', id_rol: '' });

  // Obtener usuario actual del localStorage
  const getUsername = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).username || 'admin';
      } catch {
        return 'admin';
      }
    }
    return 'admin';
  };

  // Cargar datos al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cargar todos los datos
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [rolesRes, cargosRes, usuariosRes] = await Promise.all([
        supabase.rpc('fn_leer_roles'),
        supabase.rpc('fn_leer_cargos'),
        supabase.rpc('fn_leer_usuarios', { p_buscar: null })
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (cargosRes.error) throw cargosRes.error;
      if (usuariosRes.error) throw usuariosRes.error;

      setRoles(rolesRes.data || []);
      setCargos(cargosRes.data || []);
      setUsuarios(usuariosRes.data || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Regex para nombres de Roles y Cargos (Letras, números, espacios)
  const REGEX_ALFANUM = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s-]+$/;

  // ============== ROLES ==============
  const handleCreateRole = async () => {
    if (!roleForm.nombre.trim()) {
      toast.error('El nombre del rol es obligatorio');
      return;
    }
    if (!REGEX_ALFANUM.test(roleForm.nombre.trim())) {
      toast.error('El nombre del rol contiene caracteres inválidos');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_crear_rol', {
        p_nombre: roleForm.nombre.trim(),
        p_descripcion: roleForm.descripcion.trim() || null,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al crear rol');
      } else {
        toast.success('Rol creado exitosamente');
        setShowRoleModal(false);
        resetRoleForm();
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al crear rol');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!roleForm.nombre.trim()) {
      toast.error('El nombre del rol es obligatorio');
      return;
    }
    if (!REGEX_ALFANUM.test(roleForm.nombre.trim())) {
      toast.error('El nombre del rol contiene caracteres inválidos');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_actualizar_rol', {
        p_id: editingItem.id,
        p_nombre: roleForm.nombre.trim(),
        p_descripcion: roleForm.descripcion.trim() || null,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al actualizar rol');
      } else {
        toast.success('Rol actualizado exitosamente');
        setShowRoleModal(false);
        resetRoleForm();
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al actualizar rol');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el rol "${nombre}"?`)) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('fn_eliminar_rol', {
        p_id: id,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al eliminar rol');
      } else {
        toast.success('Rol eliminado exitosamente');
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al eliminar rol');
    }
  };

  const openEditRoleModal = (role) => {
    setEditingItem(role);
    setRoleForm({
      nombre: role.nombre,
      descripcion: role.descripcion || ''
    });
    setShowRoleModal(true);
  };

  const openCreateRoleModal = () => {
    setEditingItem(null);
    resetRoleForm();
    setShowRoleModal(true);
  };

  const resetRoleForm = () => {
    setRoleForm({ nombre: '', descripcion: '' });
    setEditingItem(null);
  };

  // ============== CARGOS ==============
  const handleCreateCargo = async () => {
    if (!cargoForm.nombre.trim()) {
      toast.error('El nombre del cargo es obligatorio');
      return;
    }
    if (!REGEX_ALFANUM.test(cargoForm.nombre.trim())) {
      toast.error('El nombre del cargo contiene caracteres inválidos');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_crear_cargo', {
        p_nombre: cargoForm.nombre.trim(),
        p_descripcion: cargoForm.descripcion.trim() || null,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al crear cargo');
      } else {
        toast.success('Cargo creado exitosamente');
        setShowCargoModal(false);
        resetCargoForm();
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al crear cargo');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCargo = async () => {
    if (!cargoForm.nombre.trim()) {
      toast.error('El nombre del cargo es obligatorio');
      return;
    }
    if (!REGEX_ALFANUM.test(cargoForm.nombre.trim())) {
      toast.error('El nombre del cargo contiene caracteres inválidos');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_actualizar_cargo', {
        p_id: editingItem.id,
        p_nombre: cargoForm.nombre.trim(),
        p_descripcion: cargoForm.descripcion.trim() || null,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al actualizar cargo');
      } else {
        toast.success('Cargo actualizado exitosamente');
        setShowCargoModal(false);
        resetCargoForm();
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al actualizar cargo');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCargo = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el cargo "${nombre}"?`)) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('fn_eliminar_cargo', {
        p_id: id,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al eliminar cargo');
      } else {
        toast.success('Cargo eliminado exitosamente');
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al eliminar cargo');
    }
  };

  const openEditCargoModal = (cargo) => {
    setEditingItem(cargo);
    setCargoForm({
      nombre: cargo.nombre,
      descripcion: cargo.descripcion || ''
    });
    setShowCargoModal(true);
  };

  const openCreateCargoModal = () => {
    setEditingItem(null);
    resetCargoForm();
    setShowCargoModal(true);
  };

  const resetCargoForm = () => {
    setCargoForm({ nombre: '', descripcion: '' });
    setEditingItem(null);
  };

  // ============== ASIGNACIONES ==============
  const handleAssignRole = async () => {
    if (!assignForm.id_usuario || !assignForm.id_rol) {
      toast.error('Selecciona un usuario y un rol');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_actualizar_usuario', {
        p_id: parseInt(assignForm.id_usuario),
        p_rol_id: parseInt(assignForm.id_rol),
        p_password_hash: null,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al asignar rol');
      } else {
        toast.success('Rol asignado exitosamente');
        setShowAssignModal(false);
        setAssignForm({ id_usuario: '', id_rol: '' });
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al asignar rol');
    } finally {
      setSaving(false);
    }
  };

  const openAssignModal = (usuario = null) => {
    if (usuario) {
      setAssignForm({
        id_usuario: usuario.id.toString(),
        id_rol: ''
      });
    } else {
      setAssignForm({ id_usuario: '', id_rol: '' });
    }
    setShowAssignModal(true);
  };

  // Filtrar datos por búsqueda
  const filteredRoles = roles.filter(r =>
    r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCargos = cargos.filter(c =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsuarios = usuarios.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.empleado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.rol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Shield size={28} style={{ marginRight: '12px' }} />
            Roles y Cargos
          </h1>
          <p style={styles.subtitle}>
            Gestión de roles de acceso y cargos laborales
          </p>
        </div>
        <button style={styles.refreshButton} onClick={cargarDatos} disabled={loading}>
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualizar
        </button>
      </header>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <button
          style={activeTab === 'roles' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('roles')}
        >
          <Shield size={18} />
          Roles
          <span style={styles.badge}>{roles.length}</span>
        </button>
        <button
          style={activeTab === 'cargos' ? styles.tabActiveGreen : styles.tab}
          onClick={() => setActiveTab('cargos')}
        >
          <UserCheck size={18} />
          Cargos
          <span style={styles.badgeGreen}>{cargos.length}</span>
        </button>
        <button
          style={activeTab === 'asignaciones' ? styles.tabActivePurple : styles.tab}
          onClick={() => setActiveTab('asignaciones')}
        >
          <Users size={18} />
          Asignaciones
          <span style={styles.badgePurple}>{usuarios.length}</span>
        </button>
      </div>

      {/* Barra de herramientas */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Buscar..."
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
        <div style={styles.toolbarActions}>
          {activeTab === 'asignaciones' && (
            <button style={styles.secondaryButton} onClick={() => openAssignModal()}>
              <Users size={16} />
              Asignar Rol
            </button>
          )}
          {activeTab === 'roles' && (
            <button style={styles.primaryButton} onClick={openCreateRoleModal}>
              <Plus size={18} />
              Nuevo Rol
            </button>
          )}
          {activeTab === 'cargos' && (
            <button style={styles.primaryButtonGreen} onClick={openCreateCargoModal}>
              <Plus size={18} />
              Nuevo Cargo
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* TABLA DE ROLES */}
            {activeTab === 'roles' && (
              filteredRoles.length === 0 ? (
                <div style={styles.emptyState}>
                  <Shield size={48} style={{ color: '#ccc' }} />
                  <p>{searchTerm ? 'No se encontraron resultados' : 'No hay roles registrados'}</p>
                  {!searchTerm && (
                    <button style={styles.primaryButton} onClick={openCreateRoleModal}>
                      <Plus size={18} /> Crear primer rol
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
                      <th style={{ ...styles.th, textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.map((role) => (
                      <tr key={role.id} style={styles.tr}>
                        <td style={styles.td}>{role.id}</td>
                        <td style={styles.td}>
                          <div style={styles.nameCell}>
                            <Shield size={16} style={{ color: '#1a5d1a' }} />
                            <strong>{role.nombre}</strong>
                          </div>
                        </td>
                        <td style={styles.td}>
                          {role.descripcion || <span style={{ color: '#999' }}>Sin descripción</span>}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={styles.actionButtons}>
                            <button style={styles.editButton} onClick={() => openEditRoleModal(role)} title="Editar">
                              <Edit size={16} />
                            </button>
                            <button style={styles.deleteButton} onClick={() => handleDeleteRole(role.id, role.nombre)} title="Eliminar">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* TABLA DE CARGOS */}
            {activeTab === 'cargos' && (
              filteredCargos.length === 0 ? (
                <div style={styles.emptyState}>
                  <UserCheck size={48} style={{ color: '#ccc' }} />
                  <p>{searchTerm ? 'No se encontraron resultados' : 'No hay cargos registrados'}</p>
                  {!searchTerm && (
                    <button style={styles.primaryButtonGreen} onClick={openCreateCargoModal}>
                      <Plus size={18} /> Crear primer cargo
                    </button>
                  )}
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thGreen}>ID</th>
                      <th style={styles.thGreen}>Nombre</th>
                      <th style={styles.thGreen}>Descripción</th>
                      <th style={{ ...styles.thGreen, textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCargos.map((cargo) => (
                      <tr key={cargo.id} style={styles.tr}>
                        <td style={styles.td}>{cargo.id}</td>
                        <td style={styles.td}>
                          <div style={styles.nameCell}>
                            <UserCheck size={16} style={{ color: '#2e7d32' }} />
                            <strong>{cargo.nombre}</strong>
                          </div>
                        </td>
                        <td style={styles.td}>
                          {cargo.descripcion || <span style={{ color: '#999' }}>Sin descripción</span>}
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <div style={styles.actionButtons}>
                            <button style={styles.editButton} onClick={() => openEditCargoModal(cargo)} title="Editar">
                              <Edit size={16} />
                            </button>
                            <button style={styles.deleteButton} onClick={() => handleDeleteCargo(cargo.id, cargo.nombre)} title="Eliminar">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* TABLA DE ASIGNACIONES */}
            {activeTab === 'asignaciones' && (
              filteredUsuarios.length === 0 ? (
                <div style={styles.emptyState}>
                  <Users size={48} style={{ color: '#ccc' }} />
                  <p>{searchTerm ? 'No se encontraron resultados' : 'No hay usuarios registrados'}</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thPurple}>ID</th>
                      <th style={styles.thPurple}>Usuario</th>
                      <th style={styles.thPurple}>Empleado</th>
                      <th style={styles.thPurple}>Rol Actual</th>
                      <th style={styles.thPurple}>Estado</th>
                      <th style={{ ...styles.thPurple, textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsuarios.map((user) => (
                      <tr key={user.id} style={styles.tr}>
                        <td style={styles.td}>{user.id}</td>
                        <td style={styles.td}>
                          <strong>{user.username}</strong>
                        </td>
                        <td style={styles.td}>
                          {user.empleado || <span style={{ color: '#999' }}>Sin empleado</span>}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.roleBadge}>
                            {user.rol || 'Sin rol'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={user.estado === 'ACTIVO' ? styles.statusActive : styles.statusInactive}>
                            {user.estado}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button style={styles.assignButton} onClick={() => openAssignModal(user)} title="Cambiar Rol">
                            <Edit size={16} />
                            Cambiar Rol
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </>
        )}
      </div>

      {/* Modal para Roles */}
      {showRoleModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRoleModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingItem ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <button style={styles.closeButton} onClick={() => setShowRoleModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre del Rol *</label>
                <input
                  type="text"
                  value={roleForm.nombre}
                  onChange={(e) => setRoleForm({ ...roleForm, nombre: e.target.value })}
                  style={styles.input}
                  placeholder="Ej: Administrador, Cajero, etc."
                  autoFocus
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Descripción</label>
                <textarea
                  value={roleForm.descripcion}
                  onChange={(e) => setRoleForm({ ...roleForm, descripcion: e.target.value })}
                  style={styles.textarea}
                  placeholder="Descripción opcional del rol"
                  rows={3}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowRoleModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button
                style={styles.saveButton}
                onClick={editingItem ? handleUpdateRole : handleCreateRole}
                disabled={saving}
              >
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

      {/* Modal para Cargos */}
      {showCargoModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCargoModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeaderGreen}>
              <h2 style={styles.modalTitle}>
                {editingItem ? 'Editar Cargo' : 'Nuevo Cargo'}
              </h2>
              <button style={styles.closeButton} onClick={() => setShowCargoModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.labelGreen}>Nombre del Cargo *</label>
                <input
                  type="text"
                  value={cargoForm.nombre}
                  onChange={(e) => setCargoForm({ ...cargoForm, nombre: e.target.value })}
                  style={styles.input}
                  placeholder="Ej: Gerente, Supervisor, etc."
                  autoFocus
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelGreen}>Descripción</label>
                <textarea
                  value={cargoForm.descripcion}
                  onChange={(e) => setCargoForm({ ...cargoForm, descripcion: e.target.value })}
                  style={styles.textarea}
                  placeholder="Descripción opcional del cargo"
                  rows={3}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowCargoModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button
                style={styles.saveButtonGreen}
                onClick={editingItem ? handleUpdateCargo : handleCreateCargo}
                disabled={saving}
              >
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

      {/* Modal para Asignar Rol */}
      {showAssignModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeaderPurple}>
              <h2 style={styles.modalTitle}>Asignar Rol a Usuario</h2>
              <button style={styles.closeButton} onClick={() => setShowAssignModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.labelPurple}>Usuario *</label>
                <select
                  value={assignForm.id_usuario}
                  onChange={(e) => setAssignForm({ ...assignForm, id_usuario: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Seleccione un usuario...</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} - {u.empleado || 'Sin empleado'}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.labelPurple}>Rol a Asignar *</label>
                <select
                  value={assignForm.id_rol}
                  onChange={(e) => setAssignForm({ ...assignForm, id_rol: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Seleccione un rol...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowAssignModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button
                style={styles.saveButtonPurple}
                onClick={handleAssignRole}
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
                ) : (
                  <><Save size={16} /> Asignar Rol</>
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

// ============== ESTILOS ==============
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
  // Tabs
  tabContainer: {
    display: 'flex',
    gap: '5px',
    marginBottom: '20px',
    borderBottom: '2px solid #e9ecef',
    paddingBottom: '0',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6c757d',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#e8f5e9',
    border: 'none',
    borderBottom: '3px solid #1a5d1a',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a5d1a',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
  },
  tabActiveGreen: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#e8f5e9',
    border: 'none',
    borderBottom: '3px solid #2e7d32',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2e7d32',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
  },
  tabActivePurple: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#f3e5f5',
    border: 'none',
    borderBottom: '3px solid #7b1fa2',
    fontSize: '14px',
    fontWeight: '600',
    color: '#7b1fa2',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
  },
  badge: {
    background: '#1a5d1a',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeGreen: {
    background: '#2e7d32',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgePurple: {
    background: '#7b1fa2',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  // Toolbar
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  toolbarActions: {
    display: 'flex',
    gap: '10px',
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
  },
  primaryButtonGreen: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #7b1fa2, #ab47bc)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(123, 31, 162, 0.3)',
  },
  // Table
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
  thGreen: {
    padding: '15px 20px',
    textAlign: 'left',
    background: '#e8f5e9',
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: '14px',
    borderBottom: '2px solid #c8e6c9',
  },
  thPurple: {
    padding: '15px 20px',
    textAlign: 'left',
    background: '#f3e5f5',
    color: '#7b1fa2',
    fontWeight: '600',
    fontSize: '14px',
    borderBottom: '2px solid #e1bee7',
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
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
  assignButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#f3e5f5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#7b1fa2',
    fontSize: '13px',
    fontWeight: '500',
  },
  roleBadge: {
    background: '#e3f2fd',
    color: '#1565c0',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusActive: {
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusInactive: {
    background: '#ffebee',
    color: '#c62828',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
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
  // Modal
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
  modalHeaderGreen: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid #c8e6c9',
    background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)',
  },
  modalHeaderPurple: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid #e1bee7',
    background: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
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
  labelGreen: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2e7d32',
  },
  labelPurple: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#7b1fa2',
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
  saveButtonGreen: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  saveButtonPurple: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #7b1fa2, #ab47bc)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};
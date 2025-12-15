import { useState, useEffect } from 'react';
import {
  Users, Plus, Edit, Trash2, Search,
  X, Save, Loader2, Phone, Mail, Briefcase, User, Check, AlertCircle
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { hashPassword } from './Login';

export default function Personal() {
  const [empleados, setEmpleados] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCargo, setFiltroCargo] = useState(''); // Nuevo estado para filtro
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    ci: '',
    nombres: '',
    paterno: '',
    materno: '',
    fecha_nac: '',
    sexo: 'M',
    telefono: '',
    email: '',
    cargo_id: '',
    salario: '',
    username: '',
    password: ''
  });

  // Regex de validación
  const REGEX_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/;
  const REGEX_CI = /^[0-9A-Z-]{7,12}$/i;
  const REGEX_TELEFONO = /^\d{8}$/;
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Requisitos de contraseña
  const PASS_REQ = [
    { id: 'min', label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
    { id: 'upper', label: 'Una mayúscula', test: (p) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'Una minúscula', test: (p) => /[a-z]/.test(p) },
    { id: 'num', label: 'Un número', test: (p) => /\d/.test(p) },
    { id: 'sym', label: 'Un símbolo (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) }
  ];

  const validarDatosPersonales = () => {
    if (!formData.ci.trim() || !REGEX_CI.test(formData.ci.trim())) {
      toast.error('CI inválido (7-12 caracteres alfanuméricos)');
      return false;
    }
    if (!formData.nombres.trim() || !REGEX_NOMBRE.test(formData.nombres.trim())) {
      toast.error('El nombre es obligatorio y solo letras');
      return false;
    }
    if (!formData.paterno.trim() || !REGEX_NOMBRE.test(formData.paterno.trim())) {
      toast.error('El apellido paterno es obligatorio y solo letras');
      return false;
    }
    if (formData.materno && !REGEX_NOMBRE.test(formData.materno.trim())) {
      toast.error('El apellido materno solo puede contener letras');
      return false;
    }
    if (formData.telefono && !REGEX_TELEFONO.test(formData.telefono.trim())) {
      toast.error('El teléfono debe tener 8 dígitos');
      return false;
    }
    if (formData.email && !REGEX_EMAIL.test(formData.email.trim())) {
      toast.error('Email inválido');
      return false;
    }
    if (!formData.cargo_id) {
      toast.error('Seleccione un cargo');
      return false;
    }
    return true;
  };

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
      const [empRes, carRes] = await Promise.all([
        supabase.rpc('fn_leer_empleados', { p_buscar: searchTerm || null }),
        supabase.rpc('fn_leer_cargos')
      ]);

      if (empRes.error) throw empRes.error;
      if (carRes.error) throw carRes.error;

      // Ordenar por ID descendente
      const sortedEmps = (empRes.data || []).sort((a, b) => b.id_empleado - a.id_empleado);
      setEmpleados(sortedEmps);
      setCargos(carRes.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => cargarEmpleados(), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const cargarEmpleados = async () => {
    try {
      const { data, error } = await supabase.rpc('fn_leer_empleados', {
        p_buscar: searchTerm || null
      });
      if (error) throw error;
      if (error) throw error;
      // Ordenar por ID descendente
      const sortedData = (data || []).sort((a, b) => b.id_empleado - a.id_empleado);
      setEmpleados(sortedData);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleCreate = async () => {
    if (!validarDatosPersonales()) return;

    // Validar usuario y contraseña para creación
    if (!formData.username.trim() || formData.username.length < 5) {
      toast.error('El usuario debe tener al menos 5 caracteres');
      return;
    }

    // Validar todos los requisitos de contraseña
    const pass = formData.password;
    const passValid = PASS_REQ.every(r => r.test(pass));
    if (!passValid) {
      toast.error('La contraseña no cumple con todos los requisitos de seguridad');
      return;
    }
    if (!formData.cargo_id) {
      toast.error('Seleccione un cargo');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_crear_empleado', {
        p_ci: formData.ci.trim(),
        p_nombres: formData.nombres.trim(),
        p_apellido_paterno: formData.paterno.trim(),
        p_apellido_materno: formData.materno ? formData.materno.trim() : null,
        p_fecha_nacimiento: formData.fecha_nac || null,
        p_sexo: formData.sexo,
        p_telefono: formData.telefono ? formData.telefono.trim() : null,
        p_email: formData.email ? formData.email.trim() : null,
        p_id_cargo: formData.cargo_id, // Cambiado de p_cargo_id a p_id_cargo para coincidir con la DB si fuera necesario, o mantener consistencia con update
        p_salario: parseFloat(formData.salario) || 0,
        p_usuario_auditoria: getUsername(),
        p_username: formData.username ? formData.username.trim() : null,
        p_password_hash: formData.password ? await hashPassword(formData.password) : null
      });

      if (error) {
        if (error.message.includes('ya existe')) {
          toast.error('Ya existe un empleado con ese CI');
        } else {
          toast.error(error.message || 'Error al crear empleado');
        }
      } else {
        toast.success('Empleado registrado exitosamente');
        setShowModal(false);
        resetForm();
        cargarDatos();
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al crear empleado');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    // Para update solo validamos lo que se edita (telef, email, cargo, salario)
    // Pero validamos formato si existen
    if (formData.telefono && !REGEX_TELEFONO.test(formData.telefono.trim())) {
      toast.error('El teléfono debe tener 8 dígitos');
      return;
    }
    if (formData.email && !REGEX_EMAIL.test(formData.email.trim())) {
      toast.error('Email inválido');
      return;
    }
    if (!formData.cargo_id) {
      toast.error('Seleccione un cargo');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc('fn_actualizar_empleado', {
        p_id: editingItem.id_empleado,
        p_telefono: formData.telefono ? formData.telefono.trim() : null,
        p_email: formData.email ? formData.email.trim() : null,
        p_id_cargo: formData.cargo_id,
        p_salario: parseFloat(formData.salario) || 0,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al actualizar');
      } else {
        toast.success('Empleado actualizado');
        setShowModal(false);
        resetForm();
        cargarDatos();
      }
    } catch (err) {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Dar de baja a "${nombre}"?`)) return;

    try {
      const { error } = await supabase.rpc('fn_desactivar_empleado', {
        p_id_empleado: id,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al eliminar');
      } else {
        toast.success('Empleado dado de baja');
        cargarDatos();
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const openEditModal = (empleado) => {
    console.log("Editando:", empleado);
    setEditingItem(empleado);

    setFormData({
      ci: empleado.ci || '',
      nombres: empleado.nombres || '',
      paterno: empleado.apellido_paterno || '',
      materno: empleado.apellido_materno || '',
      fecha_nac: empleado.fecha_nacimiento || '',
      sexo: empleado.sexo || 'M',
      telefono: empleado.telefono || '',
      email: empleado.email || '',
      cargo_id: empleado.id_cargo || '',
      salario: empleado.salario || '',
      username: '', // No editamos usuario/pass aquí por seguridad simple
      password: ''
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
      ci: '', nombres: '', paterno: '', materno: '',
      fecha_nac: '', sexo: 'M', telefono: '', email: '',
      cargo_id: '', salario: '', username: '', password: ''
    });
    setEditingItem(null);
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      ACTIVO: { bg: '#e8f5e9', color: '#2e7d32' },
      INACTIVO: { bg: '#ffebee', color: '#c62828' },
      LICENCIA: { bg: '#fff3e0', color: '#e65100' }
    };
    return estilos[estado] || estilos.ACTIVO;
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Users size={28} style={{ marginRight: '12px' }} />
            Personal
          </h1>
          <p style={styles.subtitle}>
            Gestión de empleados • {empleados.length} registros
          </p>
        </div>
        <button style={styles.primaryButton} onClick={openCreateModal}>
          <Plus size={18} />
          Nuevo Empleado
        </button>
      </header>

      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o CI..."
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

        {/* Filtro de Cargo */}
        <select
          value={filtroCargo}
          onChange={(e) => setFiltroCargo(e.target.value)}
          style={styles.selectFilter}
        >
          <option value="">Todos los Cargos</option>
          {cargos.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando personal...</p>
          </div>
        ) : empleados.length === 0 ? (
          <div style={styles.emptyState}>
            <Users size={48} style={{ color: '#ccc' }} />
            <p>{searchTerm ? 'No se encontraron resultados' : 'No hay empleados registrados'}</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Empleado</th>
                <th style={styles.th}>CI</th>
                <th style={styles.th}>Contacto</th>
                <th style={styles.th}>Cargo</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados
                .filter(emp => !filtroCargo || emp.id_cargo == filtroCargo)
                .map((emp) => {
                  const estadoStyle = getEstadoBadge(emp.estado);
                  return (
                    <tr key={emp.id_empleado} style={styles.tr}>
                      <td style={{ ...styles.td, whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={styles.avatar}>
                            <User size={18} />
                          </div>
                          <div>
                            <strong>{`${emp.nombres} ${emp.apellido_paterno || ''} ${emp.apellido_materno || ''}`.trim()}</strong>
                            {emp.email && <div style={{ fontSize: '12px', color: '#666' }}>{emp.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>{emp.ci}</td>
                      <td style={styles.td}>
                        {emp.telefono && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={12} color="#666" /> {emp.telefono}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Briefcase size={14} style={{ color: '#6c757d' }} />
                          {emp.cargo || '-'}
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={styles.actionButtons}>
                          <button style={styles.editButton} onClick={() => openEditModal(emp)}>
                            <Edit size={16} />
                          </button>
                          <button style={styles.deleteButton} onClick={() => handleDelete(emp.id_empleado, emp.nombres)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                {editingItem ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h2>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {!editingItem && (
                <>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>CI *</label>
                      <input
                        type="text"
                        value={formData.ci}
                        onChange={e => setFormData({ ...formData, ci: e.target.value })}
                        style={styles.input}
                        placeholder="Carnet de identidad"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Fecha Nacimiento</label>
                      <input
                        type="date"
                        value={formData.fecha_nac}
                        onChange={e => setFormData({ ...formData, fecha_nac: e.target.value })}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nombres *</label>
                      <input
                        type="text"
                        value={formData.nombres}
                        onChange={e => setFormData({ ...formData, nombres: e.target.value })}
                        style={styles.input}
                        placeholder="Nombres"
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Usuario (Sistema)</label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        style={styles.input}
                        placeholder="Nombre de usuario"
                        autoComplete="off"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Contraseña</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        style={styles.input}
                        placeholder="Contraseña segura"
                        autoComplete="new-password"
                      />
                      {/* Indicador de fortaleza */}
                      <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        {PASS_REQ.map(req => {
                          const isValid = req.test(formData.password);
                          return (
                            <div key={req.id} style={{
                              display: 'flex', alignItems: 'center', gap: '5px',
                              fontSize: '11px', color: isValid ? '#2e7d32' : '#999'
                            }}>
                              {isValid ? <Check size={12} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid #ccc' }} />}
                              {req.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Apellido Paterno *</label>
                      <input
                        type="text"
                        value={formData.paterno}
                        onChange={e => setFormData({ ...formData, paterno: e.target.value })}
                        style={styles.input}
                        placeholder="Apellido paterno"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Apellido Materno</label>
                      <input
                        type="text"
                        value={formData.materno}
                        onChange={e => setFormData({ ...formData, materno: e.target.value })}
                        style={styles.input}
                        placeholder="Apellido materno"
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Sexo</label>
                      <select
                        value={formData.sexo}
                        onChange={e => setFormData({ ...formData, sexo: e.target.value })}
                        style={styles.input}
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    style={styles.input}
                    placeholder="Número de teléfono"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={styles.input}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cargo *</label>
                  <select
                    value={formData.cargo_id}
                    onChange={e => setFormData({ ...formData, cargo_id: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Seleccione...</option>
                    {cargos.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Salario (Bs)</label>
                  <input
                    type="number"
                    value={formData.salario}
                    onChange={e => setFormData({ ...formData, salario: e.target.value })}
                    style={styles.input}
                    placeholder="0.00"
                    step="0.01"
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
                  <><Save size={16} /> {editingItem ? 'Actualizar' : 'Registrar'}</>
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
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', flex: 1, maxWidth: '400px' },
  selectFilter: { padding: '10px 15px', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none', minWidth: '180px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 },
  badge: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  actionButtons: { display: 'flex', gap: '8px', justifyContent: 'center' },
  editButton: { padding: '8px', background: '#e3f2fd', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#1976d2' },
  deleteButton: { padding: '8px', background: '#ffebee', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#d32f2f' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d' },
  modalBody: { padding: '25px', overflowY: 'auto', flex: 1 },
  formRow: { display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' },
  formGroup: { flex: 1, minWidth: '200px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1a5d1a' },
  input: { width: '100%', padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  cancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};

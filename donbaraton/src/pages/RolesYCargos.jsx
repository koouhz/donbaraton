import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Users, Shield, 
  Filter, Download, Search, RefreshCw,
  UserCheck, Eye, EyeOff, Save, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const RolesYCargos = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para modales
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCargoModal, setShowCargoModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  
  // Estados para formularios
  const [roleForm, setRoleForm] = useState({
    nombre_rol: '',
    descripcion: '',
    permisos: {
      productos: { ver: false, crear: false, editar: false, eliminar: false },
      ventas: { ver: false, crear: false, editar: false, eliminar: false },
      compras: { ver: false, crear: false, editar: false, eliminar: false },
      inventario: { ver: false, crear: false, editar: false, eliminar: false },
      clientes: { ver: false, crear: false, editar: false, eliminar: false },
      rrhh: { ver: false, crear: false, editar: false, eliminar: false },
      reportes: { ver: false, crear: false, editar: false, eliminar: false },
      seguridad: { ver: false, crear: false, editar: false, eliminar: false }
    }
  });
  
  const [cargoForm, setCargoForm] = useState({
    nombre_cargo: '',
    departamento: '',
    id_rol_default: '',
    descripcion: ''
  });
  
  const [assignForm, setAssignForm] = useState({
    id_usuario: '',
    id_rol: ''
  });
  
  const [editingId, setEditingId] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Cargar roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('nombre_rol');
      
      if (rolesError) throw rolesError;
      setRoles(rolesData || []);
      
      // Cargar cargos con su rol asociado
      const { data: cargosData, error: cargosError } = await supabase
        .from('cargos')
        .select(`
          *,
          roles:roles(id_rol, nombre_rol)
        `)
        .order('nombre_cargo');
      
      if (cargosError) throw cargosError;
      setCargos(cargosData || []);
      
      // Cargar usuarios con su rol
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select(`
          *,
          empleados:empleados(nombres, apellido_paterno, apellido_materno),
          roles:roles(nombre_rol)
        `)
        .eq('activo', true);
      
      if (usuariosError) throw usuariosError;
      setUsuarios(usuariosData || []);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar rol
  const handleSaveRole = async () => {
    if (!roleForm.nombre_rol.trim()) {
      toast.error('El nombre del rol es obligatorio');
      return;
    }
    
    setLoading(true);
    try {
      let result;
      
      if (editingId) {
        // Actualizar rol existente
        result = await supabase
          .from('roles')
          .update({
            nombre_rol: roleForm.nombre_rol,
            descripcion: roleForm.descripcion,
            permisos: roleForm.permisos
          })
          .eq('id_rol', editingId);
      } else {
        // Crear nuevo rol
        result = await supabase
          .from('roles')
          .insert([{
            nombre_rol: roleForm.nombre_rol,
            descripcion: roleForm.descripcion,
            permisos: roleForm.permisos
          }]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(editingId ? 'Rol actualizado correctamente' : 'Rol creado correctamente');
      setShowRoleModal(false);
      resetForms();
      fetchData();
      
    } catch (error) {
      console.error('Error guardando rol:', error);
      toast.error('Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar cargo
  const handleSaveCargo = async () => {
    if (!cargoForm.nombre_cargo.trim()) {
      toast.error('El nombre del cargo es obligatorio');
      return;
    }
    
    setLoading(true);
    try {
      let result;
      
      if (editingId) {
        // Actualizar cargo existente
        result = await supabase
          .from('cargos')
          .update({
            nombre_cargo: cargoForm.nombre_cargo,
            departamento: cargoForm.departamento,
            id_rol_default: cargoForm.id_rol_default || null,
            descripcion: cargoForm.descripcion
          })
          .eq('id_cargo', editingId);
      } else {
        // Crear nuevo cargo
        result = await supabase
          .from('cargos')
          .insert([{
            nombre_cargo: cargoForm.nombre_cargo,
            departamento: cargoForm.departamento,
            id_rol_default: cargoForm.id_rol_default || null,
            descripcion: cargoForm.descripcion
          }]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(editingId ? 'Cargo actualizado correctamente' : 'Cargo creado correctamente');
      setShowCargoModal(false);
      resetForms();
      fetchData();
      
    } catch (error) {
      console.error('Error guardando cargo:', error);
      toast.error('Error al guardar el cargo');
    } finally {
      setLoading(false);
    }
  };

  // Función para asignar rol a usuario
  const handleAssignRole = async () => {
    if (!assignForm.id_usuario || !assignForm.id_rol) {
      toast.error('Seleccione un usuario y un rol');
      return;
    }
    
    setLoading(true);
    try {
      const result = await supabase
        .from('usuarios')
        .update({ id_rol: assignForm.id_rol })
        .eq('id_usuario', assignForm.id_usuario);
      
      if (result.error) throw result.error;
      
      // Registrar en auditoría
      await supabase
        .from('auditoria')
        .insert([{
          usuario: 'admin_sistema',
          accion: 'ASIGNAR_ROL',
          modulo: 'Seguridad',
          detalles: `Usuario ${assignForm.id_usuario} asignado a rol ${assignForm.id_rol}`
        }]);
      
      toast.success('Rol asignado correctamente');
      setShowAssignModal(false);
      resetForms();
      fetchData();
      
    } catch (error) {
      console.error('Error asignando rol:', error);
      toast.error('Error al asignar el rol');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar rol (lógico)
  const handleDeleteRole = async (id) => {
    if (!window.confirm('¿Está seguro de desactivar este rol?')) return;
    
    setLoading(true);
    try {
      const result = await supabase
        .from('roles')
        .update({ activo: false })
        .eq('id_rol', id);
      
      if (result.error) throw result.error;
      
      toast.success('Rol desactivado correctamente');
      fetchData();
      
    } catch (error) {
      console.error('Error eliminando rol:', error);
      toast.error('Error al desactivar el rol');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar cargo (lógico)
  const handleDeleteCargo = async (id) => {
    if (!window.confirm('¿Está seguro de desactivar este cargo?')) return;
    
    setLoading(true);
    try {
      const result = await supabase
        .from('cargos')
        .update({ activo: false })
        .eq('id_cargo', id);
      
      if (result.error) throw result.error;
      
      toast.success('Cargo desactivado correctamente');
      fetchData();
      
    } catch (error) {
      console.error('Error eliminando cargo:', error);
      toast.error('Error al desactivar el cargo');
    } finally {
      setLoading(false);
    }
  };

  // Función para editar rol
  const handleEditRole = (role) => {
    setRoleForm({
      nombre_rol: role.nombre_rol,
      descripcion: role.descripcion || '',
      permisos: role.permisos || {
        productos: { ver: false, crear: false, editar: false, eliminar: false },
        ventas: { ver: false, crear: false, editar: false, eliminar: false },
        compras: { ver: false, crear: false, editar: false, eliminar: false },
        inventario: { ver: false, crear: false, editar: false, eliminar: false },
        clientes: { ver: false, crear: false, editar: false, eliminar: false },
        rrhh: { ver: false, crear: false, editar: false, eliminar: false },
        reportes: { ver: false, crear: false, editar: false, eliminar: false },
        seguridad: { ver: false, crear: false, editar: false, eliminar: false }
      }
    });
    setEditingId(role.id_rol);
    setShowRoleModal(true);
  };

  // Función para editar cargo
  const handleEditCargo = (cargo) => {
    setCargoForm({
      nombre_cargo: cargo.nombre_cargo,
      departamento: cargo.departamento || '',
      id_rol_default: cargo.id_rol_default || '',
      descripcion: cargo.descripcion || ''
    });
    setEditingId(cargo.id_cargo);
    setShowCargoModal(true);
  };

  // Resetear formularios
  const resetForms = () => {
    setRoleForm({
      nombre_rol: '',
      descripcion: '',
      permisos: {
        productos: { ver: false, crear: false, editar: false, eliminar: false },
        ventas: { ver: false, crear: false, editar: false, eliminar: false },
        compras: { ver: false, crear: false, editar: false, eliminar: false },
        inventario: { ver: false, crear: false, editar: false, eliminar: false },
        clientes: { ver: false, crear: false, editar: false, eliminar: false },
        rrhh: { ver: false, crear: false, editar: false, eliminar: false },
        reportes: { ver: false, crear: false, editar: false, eliminar: false },
        seguridad: { ver: false, crear: false, editar: false, eliminar: false }
      }
    });
    setCargoForm({
      nombre_cargo: '',
      departamento: '',
      id_rol_default: '',
      descripcion: ''
    });
    setAssignForm({
      id_usuario: '',
      id_rol: ''
    });
    setEditingId(null);
  };

  // Función para exportar datos
  const handleExport = () => {
    const data = activeTab === 'roles' ? roles : cargos;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Datos exportados correctamente');
  };

  // Filtrar datos por término de búsqueda
  const filteredData = () => {
    const data = activeTab === 'roles' ? roles : cargos;
    if (!searchTerm) return data;
    
    return data.filter(item => {
      const search = searchTerm.toLowerCase();
      return (
        item.nombre_rol?.toLowerCase().includes(search) ||
        item.nombre_cargo?.toLowerCase().includes(search) ||
        item.descripcion?.toLowerCase().includes(search) ||
        item.departamento?.toLowerCase().includes(search)
      );
    });
  };

  // Renderizar tabla de roles
  const renderRolesTable = () => (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nombre del Rol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Descripción</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Usuarios Asignados</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData().map((role) => {
            const usuariosAsignados = usuarios.filter(u => u.id_rol === role.id_rol).length;
            return (
              <tr key={role.id_rol} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{role.id_rol}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="font-semibold text-gray-900">{role.nombre_rol}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{role.descripcion || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{usuariosAsignados}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {role.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                    {role.activo && (
                      <button
                        onClick={() => handleDeleteRole(role.id_rol)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Renderizar tabla de cargos
  const renderCargosTable = () => (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-green-500 to-green-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nombre del Cargo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Departamento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Rol por Defecto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Empleados</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData().map((cargo) => {
            const empleadosCount = 0; // Aquí deberías calcular el número de empleados con este cargo
            return (
              <tr key={cargo.id_cargo} className="hover:bg-green-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{cargo.id_cargo}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserCheck className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-semibold text-gray-900">{cargo.nombre_cargo}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cargo.departamento || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-700">
                    {cargo.roles?.nombre_rol || 'No asignado'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{empleadosCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cargo.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {cargo.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCargo(cargo)}
                      className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                    {cargo.activo && (
                      <button
                        onClick={() => handleDeleteCargo(cargo.id_cargo)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Roles y Cargos</h1>
            <p className="text-gray-600 mt-2">Administre los roles de acceso y cargos del personal</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-6 py-3 font-medium text-sm transition-colors flex items-center ${activeTab === 'roles' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <Shield className="h-5 w-5 mr-2" />
            Roles de Acceso
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
              {roles.filter(r => r.activo).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('cargos')}
            className={`px-6 py-3 font-medium text-sm transition-colors flex items-center ${activeTab === 'cargos' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <UserCheck className="h-5 w-5 mr-2" />
            Cargos Laborales
            <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
              {cargos.filter(c => c.activo).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('asignaciones')}
            className={`px-6 py-3 font-medium text-sm transition-colors flex items-center ${activeTab === 'asignaciones' ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            <Users className="h-5 w-5 mr-2" />
            Asignaciones
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
              {usuarios.length}
            </span>
          </button>
        </div>

        {/* Barra de búsqueda y acciones */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Asignar Rol
            </button>
            {activeTab === 'roles' ? (
              <button
                onClick={() => {
                  resetForms();
                  setShowRoleModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Rol
              </button>
            ) : (
              <button
                onClick={() => {
                  resetForms();
                  setShowCargoModal(true);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cargo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'roles' && renderRolesTable()}
            {activeTab === 'cargos' && renderCargosTable()}
            {activeTab === 'asignaciones' && (
              <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-purple-500 to-purple-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Empleado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Rol Actual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Último Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usuarios.map((user) => (
                      <tr key={user.id_usuario} className="hover:bg-purple-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {user.empleados 
                            ? `${user.empleados.nombres} ${user.empleados.apellido_paterno}`
                            : 'Sin empleado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.roles?.nombre_rol || 'Sin rol'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {user.ultimo_login 
                            ? new Date(user.ultimo_login).toLocaleDateString()
                            : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setAssignForm({
                                id_usuario: user.id_usuario,
                                id_rol: user.id_rol || ''
                              });
                              setShowAssignModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-md transition-colors flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Cambiar Rol
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingId ? 'Editar Rol' : 'Nuevo Rol'}
                </h3>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    resetForms();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Rol *
                    </label>
                    <input
                      type="text"
                      value={roleForm.nombre_rol}
                      onChange={(e) => setRoleForm({...roleForm, nombre_rol: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Ej: Cajero, Administrador, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={roleForm.descripcion}
                      onChange={(e) => setRoleForm({...roleForm, descripcion: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Breve descripción del rol"
                    />
                  </div>
                </div>

                {/* Permisos por módulo */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Permisos por Módulo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(roleForm.permisos).map(([modulo, permisos]) => (
                      <div key={modulo} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-700 mb-3 capitalize">{modulo}</h5>
                        <div className="space-y-2">
                          {Object.entries(permisos).map(([accion, permitido]) => (
                            <label key={accion} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={permitido}
                                onChange={(e) => {
                                  const newPermisos = {...roleForm.permisos};
                                  newPermisos[modulo][accion] = e.target.checked;
                                  setRoleForm({...roleForm, permisos: newPermisos});
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{accion}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowRoleModal(false);
                      resetForms();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveRole}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCargoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingId ? 'Editar Cargo' : 'Nuevo Cargo'}
                </h3>
                <button
                  onClick={() => {
                    setShowCargoModal(false);
                    resetForms();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Cargo *
                    </label>
                    <input
                      type="text"
                      value={cargoForm.nombre_cargo}
                      onChange={(e) => setCargoForm({...cargoForm, nombre_cargo: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Ej: Cajero, Almacenero, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={cargoForm.departamento}
                      onChange={(e) => setCargoForm({...cargoForm, departamento: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Ej: Ventas, Compras, etc."
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol por Defecto
                  </label>
                  <select
                    value={cargoForm.id_rol_default}
                    onChange={(e) => setCargoForm({...cargoForm, id_rol_default: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.filter(r => r.activo).map(role => (
                      <option key={role.id_rol} value={role.id_rol}>
                        {role.nombre_rol}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={cargoForm.descripcion}
                    onChange={(e) => setCargoForm({...cargoForm, descripcion: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Descripción de las responsabilidades del cargo..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowCargoModal(false);
                      resetForms();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveCargo}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Asignar Rol a Usuario
                </h3>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    resetForms();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario *
                  </label>
                  <select
                    value={assignForm.id_usuario}
                    onChange={(e) => setAssignForm({...assignForm, id_usuario: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="">Seleccione un usuario</option>
                    {usuarios.map(user => (
                      <option key={user.id_usuario} value={user.id_usuario}>
                        {user.username} - {user.empleados?.nombres || 'Sin empleado'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol a Asignar *
                  </label>
                  <select
                    value={assignForm.id_rol}
                    onChange={(e) => setAssignForm({...assignForm, id_rol: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="">Seleccione un rol</option>
                    {roles.filter(r => r.activo).map(role => (
                      <option key={role.id_rol} value={role.id_rol}>
                        {role.nombre_rol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      resetForms();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAssignRole}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Asignando...' : 'Asignar Rol'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesYCargos;
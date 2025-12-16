// src/pages/Productos.jsx
import { useState, useEffect } from 'react';
import {
  Package, Plus, Edit, Trash2, Search,
  X, Save, Loader2, Filter, AlertTriangle,
  CheckCircle, AlertCircle, TrendingUp,
  Sparkles, ShoppingBag, RefreshCw,
  Camera, Upload, Image as ImageIcon
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    codigo_interno: '',
    codigo_barras: '',
    nombre: '',
    categoria_id: '',
    marca: '',
    proveedor_id: '',
    precio_costo: '',
    precio_venta: '',
    stock_minimo: 10,
    stock_maximo: 100,
    unidad_medida: 'UNIDAD',
    presentacion: '',
    controla_vencimiento: false,
    foto_url: '',
    fotoFile: null
  });

  const getUsername = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try { return JSON.parse(user).usuario_id || 'USR-001'; }
      catch { return 'USR-001'; }
    }
    return 'USR-001';
  };

  // Lista de marcas bolivianas populares
  const marcasBolivianas = [
    // Alimentos y Bebidas
    { nombre: 'PIL Andina', categoria: 'Lácteos' },
    { nombre: 'Delizia', categoria: 'Lácteos' },
    { nombre: 'Pil Tarija', categoria: 'Lácteos' },
    { nombre: 'Ilva', categoria: 'Lácteos' },
    { nombre: 'Ceibo', categoria: 'Cacao/Chocolate' },
    { nombre: 'Para Ti', categoria: 'Chocolate' },
    { nombre: 'Breick', categoria: 'Snacks' },
    { nombre: 'Lucana', categoria: 'Snacks' },
    { nombre: 'Monopol', categoria: 'Galletas' },
    { nombre: 'Cereales Andinos', categoria: 'Cereales' },
    { nombre: 'Quinua Real', categoria: 'Cereales' },
    { nombre: 'INI', categoria: 'Cereales' },
    { nombre: 'Coronilla', categoria: 'Fideos' },
    { nombre: 'Carozzi', categoria: 'Fideos' },
    { nombre: 'Diana', categoria: 'Aceites' },
    { nombre: 'Fino', categoria: 'Aceites' },
    { nombre: 'Rico Pollo', categoria: 'Cárnicos' },
    { nombre: 'Sofía', categoria: 'Cárnicos' },
    { nombre: 'Stege', categoria: 'Embutidos' },
    { nombre: 'Fridosa', categoria: 'Cárnicos' },
    // Bebidas
    { nombre: 'CBN (Huari, Paceña)', categoria: 'Bebidas' },
    { nombre: 'Taquiña', categoria: 'Bebidas' },
    { nombre: 'Coca-Cola Bolivia', categoria: 'Bebidas' },
    { nombre: 'Cascada', categoria: 'Aguas' },
    { nombre: 'Vital', categoria: 'Aguas' },
    { nombre: 'Naturagua', categoria: 'Aguas' },
    { nombre: 'Mendocina', categoria: 'Bebidas' },
    { nombre: 'Tampico', categoria: 'Jugos' },
    // Limpieza y Hogar
    { nombre: 'Punto Azul', categoria: 'Limpieza' },
    { nombre: 'Fabuloso', categoria: 'Limpieza' },
    { nombre: 'Wiñay', categoria: 'Limpieza' },
    { nombre: 'Boliviana de Detergentes', categoria: 'Limpieza' },
    { nombre: 'Ypfb', categoria: 'Combustibles' },
    // Higiene Personal
    { nombre: 'Copacabana', categoria: 'Higiene' },
    { nombre: 'Suavitel Bolivia', categoria: 'Higiene' },
    // Otros
    { nombre: 'Otras', categoria: 'General' },
    { nombre: 'Importado', categoria: 'General' },
    { nombre: 'Sin marca', categoria: 'General' }
  ];

  // Generar código interno automáticamente
  const generarCodigoInterno = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PROD-${timestamp}-${random}`;
  };

  // Generar código de barras tipo EAN-13
  const generarCodigoBarras = () => {
    // Prefijo Bolivia: 777
    const prefijo = '777';
    // Código de empresa ficticio
    const empresa = '1234';
    // Código de producto aleatorio
    const producto = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    const sinDigito = prefijo + empresa + producto;

    // Calcular dígito verificador
    let suma = 0;
    for (let i = 0; i < 12; i++) {
      suma += parseInt(sinDigito[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const digitoVerificador = (10 - (suma % 10)) % 10;

    return sinDigito + digitoVerificador;
  };

  // Subir imagen a Supabase Storage
  const subirFoto = async (file) => {
    if (!file) return null;
    
    setUploading(true);
    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `producto_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from('productos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('productos')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (err) {
      console.error('Error subiendo foto:', err);
      toast.error('Error al subir la imagen');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Manejar selección de archivo de foto
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes');
        return;
      }
      // Validar tamaño (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar 5MB');
        return;
      }
      // Vista previa
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result);
      reader.readAsDataURL(file);
      // Guardar archivo para subir después
      setFormData({ ...formData, fotoFile: file });
    }
  };

  // Quitar foto
  const quitarFoto = () => {
    setFotoPreview(null);
    setFormData({ ...formData, foto_url: '', fotoFile: null });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar productos, categorías y proveedores en paralelo
      const [prodRes, catRes, provRes] = await Promise.all([
        supabase.rpc('fn_leer_productos', {
          p_buscar: searchTerm || null,
          p_categoria_id: filterCategoria ? parseInt(filterCategoria) : null
        }),
        supabase.rpc('fn_leer_categorias'),
        supabase.rpc('fn_leer_proveedores', { p_buscar_texto: null })
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;
      if (provRes.error) throw provRes.error;

      setProductos(prodRes.data || []);
      setCategorias(catRes.data || []);
      setProveedores(provRes.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Recargar cuando cambian filtros
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarProductos();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterCategoria]);

  const cargarProductos = async () => {
    try {
      const { data, error } = await supabase.rpc('fn_leer_productos', {
        p_buscar: searchTerm || null,
        p_categoria_id: filterCategoria ? parseInt(filterCategoria) : null
      });

      if (error) throw error;
      setProductos(data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleCreate = async () => {
    if (!formData.nombre.trim() || !formData.codigo_interno.trim()) {
      toast.error('Código interno y nombre son obligatorios');
      return;
    }
    if (!formData.categoria_id) {
      toast.error('Seleccione una categoría');
      return;
    }
    if (!formData.precio_venta || parseFloat(formData.precio_venta) <= 0) {
      toast.error('El precio de venta es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.rpc('fn_crear_producto', {
        p_codigo_interno: formData.codigo_interno.trim(),
        p_codigo_barras: formData.codigo_barras.trim() || null,
        p_nombre: formData.nombre.trim(),
        p_id_categoria: formData.categoria_id,  // Corregido: p_id_categoria (string)
        p_marca: formData.marca || null,
        p_precio_costo: parseFloat(formData.precio_costo) || 0,
        p_precio_venta: parseFloat(formData.precio_venta),
        p_stock_minimo: parseInt(formData.stock_minimo) || 10,
        p_stock_maximo: parseInt(formData.stock_maximo) || 100,
        p_unidad_medida: formData.unidad_medida,
        p_controla_vencimiento: formData.controla_vencimiento,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        if (error.message.includes('ya existe')) {
          toast.error('El código interno ya está registrado');
        } else {
          toast.error(error.message || 'Error al crear producto');
        }
      } else {
        // Subir foto si hay una y tenemos el ID del producto
        if (formData.fotoFile && data) {
          const fotoUrl = await subirFoto(formData.fotoFile);
          if (fotoUrl) {
            await supabase.rpc('fn_actualizar_foto_producto', {
              p_id_producto: data,
              p_foto_url: fotoUrl,
              p_usuario_auditoria: getUsername()
            });
          }
        }
        
        // Si hay proveedor seleccionado, asociar el producto con el proveedor
        if (formData.proveedor_id && data) {
          try {
            const { error: errorAsociacion } = await supabase.rpc('fn_asociar_producto_proveedor', {
              p_id_producto: data,  // data contiene el ID del producto creado
              p_id_proveedor: formData.proveedor_id,
              p_precio_compra: parseFloat(formData.precio_costo) || 0,
              p_usuario_auditoria: getUsername()
            });
            
            if (errorAsociacion) {
              console.error('Error al asociar proveedor:', errorAsociacion);
              toast.success('Producto creado, pero hubo un error al asociar proveedor');
            } else {
              toast.success('Producto creado y asociado al proveedor');
            }
          } catch (errAsoc) {
            console.error('Error:', errAsoc);
            toast.success('Producto creado exitosamente');
          }
        } else {
          toast.success('Producto creado exitosamente');
        }
        setShowModal(false);
        setFotoPreview(null);
        resetForm();
        cargarProductos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al crear producto');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.rpc('fn_actualizar_producto', {
        p_id: editingItem.id,
        p_codigo_barras: formData.codigo_barras.trim() || null,
        p_nombre: formData.nombre.trim(),
        p_categoria_id: parseInt(formData.categoria_id),
        p_marca: formData.marca.trim() || null,
        p_precio_costo: parseFloat(formData.precio_costo) || 0,
        p_precio_venta: parseFloat(formData.precio_venta),
        p_stock_minimo: parseInt(formData.stock_minimo) || 10,
        p_stock_maximo: parseInt(formData.stock_maximo) || 100,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        toast.error(error.message || 'Error al actualizar');
      } else {
        // Subir nueva foto si hay una seleccionada
        if (formData.fotoFile) {
          const fotoUrl = await subirFoto(formData.fotoFile);
          if (fotoUrl) {
            await supabase.rpc('fn_actualizar_foto_producto', {
              p_id_producto: editingItem.id,
              p_foto_url: fotoUrl,
              p_usuario_auditoria: getUsername()
            });
          }
        }
        
        // Si hay proveedor seleccionado, actualizar/crear la asociación
        if (formData.proveedor_id) {
          try {
            const { error: errorAsociacion } = await supabase.rpc('fn_asociar_producto_proveedor', {
              p_id_producto: editingItem.id,
              p_id_proveedor: formData.proveedor_id,
              p_precio_compra: parseFloat(formData.precio_costo) || 0,
              p_usuario_auditoria: getUsername()
            });
            
            if (errorAsociacion) {
              console.error('Error al asociar proveedor:', errorAsociacion);
            }
          } catch (errAsoc) {
            console.error('Error asociando proveedor:', errAsoc);
          }
        }
        toast.success('Producto actualizado exitosamente');
        setShowModal(false);
        setFotoPreview(null);
        resetForm();
        cargarProductos();
      }
    } catch (err) {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    const motivo = window.prompt(`¿Eliminar "${nombre}"?\n\nIngrese el motivo de eliminación:`);
    if (!motivo) return;

    try {
      const { error } = await supabase.rpc('fn_eliminar_producto', {
        p_id: id,
        p_motivo: motivo,
        p_usuario_auditoria: getUsername()
      });

      if (error) {
        if (error.message.includes('stock')) {
          toast.error('No se puede eliminar: tiene stock. Realice un ajuste primero.');
        } else {
          toast.error(error.message || 'Error al eliminar');
        }
      } else {
        toast.success('Producto eliminado');
        cargarProductos();
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const openEditModal = async (producto) => {
    setEditingItem(producto);
    setFotoPreview(null);  // Limpiar preview anterior
    // Obtener detalles completos del producto
    try {
      const { data, error } = await supabase.rpc('fn_obtener_producto_por_id', {
        p_id: producto.id
      });

      if (data && data[0]) {
        const p = data[0];
        setFormData({
          codigo_interno: p.codigo_interno || '',
          codigo_barras: p.codigo_barras || '',
          nombre: p.nombre || '',
          categoria_id: p.categoria_id || '',
          marca: p.marca || '',
          proveedor_id: p.proveedor_id || '',
          precio_costo: p.precio_costo || '',
          precio_venta: p.precio_venta || '',
          stock_minimo: p.stock_minimo || 10,
          stock_maximo: p.stock_maximo || 100,
          unidad_medida: p.unidad_medida || 'UNIDAD',
          presentacion: p.presentacion || '',
          controla_vencimiento: p.controla_vencimiento || false,
          foto_url: p.foto_url || '',
          fotoFile: null
        });
      } else {
        // Fallback con datos de la tabla
        setFormData({
          codigo_interno: producto.codigo_interno || '',
          codigo_barras: producto.codigo_barras || '',
          nombre: producto.nombre || '',
          categoria_id: '',
          marca: producto.marca || '',
          proveedor_id: '',
          precio_costo: '',
          precio_venta: producto.precio_venta || '',
          stock_minimo: producto.stock_minimo || 10,
          stock_maximo: 100,
          unidad_medida: 'UNIDAD',
          presentacion: '',
          controla_vencimiento: false,
          foto_url: producto.foto_url || '',
          fotoFile: null
        });
      }
    } catch (err) {
      console.error('Error al obtener producto:', err);
    }
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFotoPreview(null);  // Limpiar preview anterior
    // Generar códigos automáticamente para nuevo producto
    setFormData({
      codigo_interno: generarCodigoInterno(),
      codigo_barras: generarCodigoBarras(),
      nombre: '',
      categoria_id: '',
      marca: '',
      proveedor_id: '',
      precio_costo: '',
      precio_venta: '',
      stock_minimo: 10,
      stock_maximo: 100,
      unidad_medida: 'UNIDAD',
      presentacion: '',
      controla_vencimiento: false,
      foto_url: '',
      fotoFile: null
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      codigo_interno: '', codigo_barras: '', nombre: '',
      categoria_id: '', marca: '', proveedor_id: '',
      precio_costo: '', precio_venta: '',
      stock_minimo: 10, stock_maximo: 100,
      unidad_medida: 'UNIDAD', presentacion: '',
      controla_vencimiento: false,
      foto_url: '', fotoFile: null
    });
    setEditingItem(null);
    setFotoPreview(null);
  };

  // Obtener estilo del semáforo de stock
  const getStockBadge = (estado) => {
    const estilos = {
      CRITICO: { bg: '#ffebee', color: '#c62828', icon: <AlertTriangle size={12} /> },
      BAJO: { bg: '#fff3e0', color: '#e65100', icon: <AlertCircle size={12} /> },
      NORMAL: { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle size={12} /> },
      SOBRESTOCK: { bg: '#e3f2fd', color: '#1565c0', icon: <TrendingUp size={12} /> }
    };
    return estilos[estado] || estilos.NORMAL;
  };

  // Estadísticas rápidas
  const stats = {
    total: productos.length,
    critico: productos.filter(p => p.estado_stock === 'CRITICO').length,
    bajo: productos.filter(p => p.estado_stock === 'BAJO').length,
    normal: productos.filter(p => p.estado_stock === 'NORMAL').length
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Package size={28} style={{ marginRight: '12px' }} />
            Productos
          </h1>
          <p style={styles.subtitle}>
            Catálogo de productos • {productos.length} registros
          </p>
        </div>
        <button style={styles.primaryButton} onClick={openCreateModal}>
          <Plus size={18} />
          Nuevo Producto
        </button>
      </header>

      {/* Estadísticas de stock */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #1a5d1a' }}>
          <span style={styles.statValue}>{stats.total}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #c62828' }}>
          <span style={{ ...styles.statValue, color: '#c62828' }}>{stats.critico}</span>
          <span style={styles.statLabel}>Sin Stock</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #e65100' }}>
          <span style={{ ...styles.statValue, color: '#e65100' }}>{stats.bajo}</span>
          <span style={styles.statLabel}>Bajo Stock</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #2e7d32' }}>
          <span style={{ ...styles.statValue, color: '#2e7d32' }}>{stats.normal}</span>
          <span style={styles.statLabel}>Normal</span>
        </div>
      </div>

      {/* Barra de filtros */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
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
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          style={styles.select}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
        <button style={styles.refreshButton} onClick={cargarDatos} disabled={loading}>
          <Loader2 size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualizar
        </button>
      </div>

      {/* Tabla de productos */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando productos...</p>
          </div>
        ) : productos.length === 0 ? (
          <div style={styles.emptyState}>
            <Package size={48} style={{ color: '#ccc' }} />
            <p>{searchTerm || filterCategoria ? 'No se encontraron resultados' : 'No hay productos registrados'}</p>
            {!searchTerm && !filterCategoria && (
              <button style={styles.primaryButton} onClick={openCreateModal}>
                <Plus size={18} /> Crear primer producto
              </button>
            )}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Imagen</th>
                <th style={styles.th}>Código</th>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Precio Venta</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Estado</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((prod) => {
                const stockStyle = getStockBadge(prod.estado_stock);
                return (
                  <tr key={prod.id} style={styles.tr}>
                    <td style={styles.td}>
                      {prod.foto_url ? (
                        <img 
                          src={prod.foto_url} 
                          alt={prod.nombre}
                          style={styles.tableFotoImg}
                        />
                      ) : (
                        <div style={styles.tableFotoPlaceholder}>
                          <Package size={20} style={{ color: '#ccc' }} />
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <code style={styles.code}>{prod.codigo_interno}</code>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <strong>{prod.nombre}</strong>
                        {prod.marca && <span style={styles.marca}>{prod.marca}</span>}
                      </div>
                    </td>
                    <td style={styles.td}>{prod.categoria || '-'}</td>
                    <td style={styles.td}>
                      <strong style={{ color: '#1a5d1a' }}>
                        Bs {parseFloat(prod.precio_venta || 0).toFixed(2)}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600' }}>{prod.stock_actual}</span>
                      <span style={{ color: '#999', fontSize: '12px' }}> / mín: {prod.stock_minimo}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: stockStyle.bg,
                        color: stockStyle.color
                      }}>
                        {stockStyle.icon}
                        {prod.estado_stock}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.actionButtons}>
                        <button style={styles.editButton} onClick={() => openEditModal(prod)}>
                          <Edit size={16} />
                        </button>
                        <button style={styles.deleteButton} onClick={() => handleDelete(prod.id, prod.nombre)}>
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

      {/* Modal para Crear/Editar */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Mensaje informativo para nuevos productos */}
              {!editingItem && (
                <div style={styles.infoBox}>
                  <Sparkles size={24} style={{ color: '#1a5d1a' }} />
                  <div>
                    <strong>Códigos generados automáticamente</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
                      El código interno y código de barras se han generado automáticamente. Solo completa los datos del producto.
                    </p>
                  </div>
                </div>
              )}

              {/* Códigos - Solo lectura con botón regenerar */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Código Interno
                    <span style={styles.autoBadge}>Auto</span>
                  </label>
                  <div style={styles.codeInputWrapper}>
                    <input
                      type="text"
                      value={formData.codigo_interno}
                      style={{ ...styles.input, ...styles.codeInput }}
                      readOnly
                    />
                    {!editingItem && (
                      <button
                        type="button"
                        style={styles.regenerateButton}
                        onClick={() => setFormData({ ...formData, codigo_interno: generarCodigoInterno() })}
                        title="Regenerar código"
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Código de Barras (EAN-13)
                    <span style={styles.autoBadge}>Auto</span>
                  </label>
                  <div style={styles.codeInputWrapper}>
                    <input
                      type="text"
                      value={formData.codigo_barras}
                      style={{ ...styles.input, ...styles.codeInput }}
                      readOnly
                    />
                    {!editingItem && (
                      <button
                        type="button"
                        style={styles.regenerateButton}
                        onClick={() => setFormData({ ...formData, codigo_barras: generarCodigoBarras() })}
                        title="Regenerar código"
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Nombre del Producto - Campo prominente */}
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Nombre del Producto *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    style={{ ...styles.input, fontSize: '16px', padding: '14px 15px' }}
                    placeholder="Ej: Leche PIL Entera 1L, Arroz Grano de Oro 1Kg..."
                    autoFocus
                  />
                </div>
              </div>

              {/* Categoría y Marca en la misma fila */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Categoría *</label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Seleccione categoría...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <ShoppingBag size={16} />
                    Marca
                  </label>
                  <select
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Seleccione marca...</option>
                    <optgroup label="— Lácteos —">
                      {marcasBolivianas.filter(m => m.categoria === 'Lácteos').map(m => (
                        <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="— Chocolate/Cacao —">
                      {marcasBolivianas.filter(m => m.categoria.includes('Chocolate') || m.categoria.includes('Cacao')).map(m => (
                        <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="— Snacks/Galletas —">
                      {marcasBolivianas.filter(m => m.categoria === 'Snacks' || m.categoria === 'Galletas').map(m => (
                        <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="— Cereales/Fideos —">
                      {marcasBolivianas.filter(m => m.categoria === 'Cereales' || m.categoria === 'Fideos').map(m => (
                        <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="— Cárnicos/Embutidos —">
                      {marcasBolivianas.filter(m => m.categoria === 'Cárnicos' || m.categoria === 'Embutidos').map(m => (
                        <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="— Aceites —">
                      {marcasBolivianas.filter(m => m.categoria === 'Aceites').map(m => (
                        <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="— Bebidas/Aguas/Jugos —">
                      {marcasBolivianas.filter(m => ['Bebidas', 'Aguas', 'Jugos'].includes(m.categoria)).map(m => (
                        <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="— Limpieza/Higiene —">
                      {marcasBolivianas.filter(m => m.categoria === 'Limpieza' || m.categoria === 'Higiene').map(m => (
                        <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="— Otros —">
                      {marcasBolivianas.filter(m => m.categoria === 'General').map(m => (
                        <option key={m.nombre} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>


              {/* Proveedor */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Proveedor Principal</label>
                  <select
                    value={formData.proveedor_id}
                    onChange={(e) => setFormData({ ...formData, proveedor_id: e.target.value })}
                    style={styles.input}
                  >
                    <option value="">Seleccione proveedor (opcional)...</option>
                    {proveedores.map(prov => (
                      <option key={prov.id} value={prov.id}>{prov.razon_social}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Precios */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Precio Costo (Bs)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_costo}
                    onChange={(e) => setFormData({ ...formData, precio_costo: e.target.value })}
                    style={styles.input}
                    placeholder="0.00"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Precio Venta (Bs) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                    style={styles.input}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Stock */}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock Máximo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_maximo}
                    onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unidad de Medida</label>
                  <select
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                    style={styles.input}
                  >
                    <option value="UNIDAD">Unidad</option>
                    <option value="KG">Kilogramo</option>
                    <option value="LT">Litro</option>
                    <option value="PAQUETE">Paquete</option>
                    <option value="CAJA">Caja</option>
                    <option value="DOCENA">Docena</option>
                  </select>
                </div>
              </div>

              {/* Opciones adicionales */}
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 2 }}>
                  <label style={styles.label}>Presentación</label>
                  <input
                    type="text"
                    value={formData.presentacion}
                    onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                    style={styles.input}
                    placeholder="Ej: Botella 500ml, Paquete 6 unidades"
                  />
                </div>
                <div style={{ ...styles.formGroup, display: 'flex', alignItems: 'center', paddingTop: '25px' }}>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.controla_vencimiento}
                      onChange={(e) => setFormData({ ...formData, controla_vencimiento: e.target.checked })}
                    />
                    <span>Controla vencimiento</span>
                  </label>
                </div>
              </div>

              {/* Foto del Producto */}
              <div style={styles.formRow}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>
                    <Camera size={16} />
                    Foto del Producto (opcional)
                  </label>
                  <div style={styles.fotoSection}>
                    {/* Vista previa */}
                    <div style={styles.fotoPreview}>
                      {(fotoPreview || formData.foto_url) ? (
                        <img 
                          src={fotoPreview || formData.foto_url} 
                          alt="Preview" 
                          style={styles.fotoImage}
                        />
                      ) : (
                        <div style={styles.fotoPlaceholder}>
                          <ImageIcon size={48} style={{ color: '#ccc' }} />
                          <span>Sin imagen</span>
                        </div>
                      )}
                    </div>
                    {/* Botones */}
                    <div style={styles.fotoActions}>
                      <label style={styles.uploadButton}>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleFotoChange}
                          style={{ display: 'none' }}
                          disabled={uploading}
                        />
                        <Upload size={16} />
                        {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
                      </label>
                      {(fotoPreview || formData.foto_url) && (
                        <button 
                          type="button"
                          style={styles.removeFotoButton}
                          onClick={quitarFoto}
                        >
                          <X size={16} />
                          Quitar
                        </button>
                      )}
                      <span style={styles.fotoHelp}>
                        JPG, PNG o WebP. Máx 5MB.
                      </span>
                    </div>
                  </div>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  primaryButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 93, 26, 0.3)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' },
  statCard: { background: 'white', padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'block' },
  statLabel: { fontSize: '13px', color: '#6c757d' },
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', flex: 1, maxWidth: '350px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
  select: { padding: '10px 15px', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', background: 'white', minWidth: '180px' },
  refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', color: '#495057', cursor: 'pointer' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  code: { background: '#f8f9fa', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' },
  marca: { display: 'block', fontSize: '12px', color: '#6c757d', marginTop: '2px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  actionButtons: { display: 'flex', gap: '8px', justifyContent: 'center' },
  editButton: { padding: '8px', background: '#e3f2fd', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#1976d2' },
  deleteButton: { padding: '8px', background: '#ffebee', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#d32f2f' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)', position: 'sticky', top: 0, zIndex: 10 },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: '5px', borderRadius: '5px' },
  modalBody: { padding: '25px' },
  formRow: { display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' },
  formGroup: { flex: 1, minWidth: '180px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1a5d1a' },
  input: { width: '100%', padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  checkbox: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa', position: 'sticky', bottom: 0 },
  cancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  // Nuevos estilos para el formulario mejorado
  infoBox: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '15px', background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', borderRadius: '12px', marginBottom: '20px', border: '1px solid #a5d6a7' },
  infoIcon: { fontSize: '24px' },
  autoBadge: { display: 'inline-block', padding: '2px 8px', background: '#1a5d1a', color: 'white', borderRadius: '10px', fontSize: '10px', fontWeight: '600', marginLeft: '8px' },
  codeInputWrapper: { display: 'flex', gap: '8px', alignItems: 'center' },
  codeInput: { background: '#f8f9fa', fontFamily: 'monospace', fontSize: '13px', color: '#495057' },
  regenerateButton: { padding: '10px 12px', background: 'white', border: '2px solid #e9ecef', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s' },
  // Estilos para foto de producto
  fotoSection: { display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' },
  fotoPreview: { width: '150px', height: '150px', border: '2px dashed #e9ecef', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' },
  fotoImage: { width: '100%', height: '100%', objectFit: 'cover' },
  fotoPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#999', fontSize: '12px' },
  fotoActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  uploadButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#e8f5e9', color: '#1a5d1a', border: '2px solid #1a5d1a', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  removeFotoButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  fotoHelp: { fontSize: '12px', color: '#6c757d' },
  // Estilos para imagen en tabla
  tableFotoImg: { 
    width: '50px', 
    height: '50px', 
    borderRadius: '10px', 
    objectFit: 'cover',
    border: '2px solid #e8f5e9',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)'
  },
  tableFotoPlaceholder: { 
    width: '50px', 
    height: '50px', 
    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)', 
    borderRadius: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    border: '2px dashed #dee2e6'
  },
};

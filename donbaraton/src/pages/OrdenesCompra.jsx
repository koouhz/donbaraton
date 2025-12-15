// src/pages/OrdenesCompra.jsx
import { useState, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Edit, Trash2, Search, 
  X, Save, Loader2, Package, Truck, Calendar,
  CheckCircle, Clock, XCircle, Eye, PackageCheck, Ban, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function OrdenesCompra() {
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosProveedor, setProductosProveedor] = useState([]); // Productos filtrados por proveedor
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [ordenAscendente, setOrdenAscendente] = useState(false); // false = desc, true = asc
  const [showModal, setShowModal] = useState(false);
  const [showRecepcionModal, setShowRecepcionModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  
  // Form para nueva orden
  const [formData, setFormData] = useState({
    id_proveedor: '',
    fecha_entrega: '',
    detalles: []
  });

  // Form para nuevo item en orden
  const [nuevoItem, setNuevoItem] = useState({
    id_producto: '',
    cantidad: 1,
    precio_unitario: 0
  });

  // Form para recepción
  const [recepcionData, setRecepcionData] = useState({
    lote: '',
    fecha_vencimiento: ''
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
    cargarDatos();
  }, []);

  // Filtrar y ordenar órdenes localmente
  const ordenesFiltradas = ordenes
    .filter(orden => {
      // Filtro por proveedor
      if (filtroProveedor && orden.id_proveedor !== filtroProveedor) return false;
      
      // Filtro por fecha inicio
      if (filtroFechaInicio) {
        const fechaOrden = new Date(orden.fecha_emision);
        const fechaInicio = new Date(filtroFechaInicio);
        if (fechaOrden < fechaInicio) return false;
      }
      
      // Filtro por fecha fin
      if (filtroFechaFin) {
        const fechaOrden = new Date(orden.fecha_emision);
        const fechaFin = new Date(filtroFechaFin);
        if (fechaOrden > fechaFin) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Ordenar por ID (extraer número del ID como OC-001, OC-002)
      const idA = parseInt((a.id || a.id_orden || '').replace(/\D/g, '') || '0');
      const idB = parseInt((b.id || b.id_orden || '').replace(/\D/g, '') || '0');
      return ordenAscendente ? idA - idB : idB - idA;
    });

  // Cargar productos cuando cambia el proveedor seleccionado
  const cargarProductosProveedor = async (idProveedor) => {
    if (!idProveedor) {
      setProductosProveedor([]);
      return;
    }

    setCargandoProductos(true);
    try {
      // Usar SP para consultar productos del proveedor
      const { data, error } = await supabase.rpc('fn_leer_productos_proveedor', {
        p_id_proveedor: idProveedor
      });

      if (error) {
        console.error('Error cargando productos del proveedor:', error);
        toast.error('Error al cargar productos del proveedor');
        setProductosProveedor([]);
      } else {
        // SP retorna: id_producto, nombre, precio_compra, precio_costo, stock_actual, estado
        const productosFormateados = (data || []).map(p => ({
          id_producto: p.id_producto,
          nombre: p.nombre,
          precio_costo: p.precio_compra || p.precio_costo,
          stock_actual: p.stock_actual,
          estado: p.estado
        }));
        setProductosProveedor(productosFormateados);
      }
    } catch (err) {
      console.error('Error:', err);
      setProductosProveedor([]);
    } finally {
      setCargandoProductos(false);
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar órdenes de compra usando SP completo
      const ordenesRes = await supabase.rpc('fn_leer_ordenes_compra_completo', {
        p_estado: null,
        p_fecha_inicio: null,
        p_fecha_fin: null,
        p_id_proveedor: null
      });
      
      if (ordenesRes.error) {
        console.error('Error cargando órdenes:', ordenesRes.error);
        toast.error('Error al cargar órdenes');
      } else {
        // fn_leer_ordenes_compra_completo retorna TODOS los campos necesarios
        const ordenesFormateadas = (ordenesRes.data || []).map(o => ({
          id: o.id_orden,
          id_orden: o.id_orden,
          id_proveedor: o.id_proveedor,
          proveedor: o.proveedor || 'Sin proveedor',
          fecha_emision: o.fecha_emision,
          fecha_entrega: o.fecha_entrega,
          total: o.total,
          estado: o.estado
        }));
        setOrdenes(ordenesFormateadas);
      }

      // Cargar proveedores usando SP
      const provRes = await supabase.rpc('fn_listar_proveedores');
      if (provRes.error) {
        console.error('Error cargando proveedores:', provRes.error);
      } else {
        setProveedores(provRes.data || []);
      }

      // Cargar productos usando SP
      const prodRes = await supabase.rpc('fn_listar_productos', { p_buscar: null });
      if (prodRes.error) {
        console.error('Error cargando productos:', prodRes.error);
      } else {
        setProductos(prodRes.data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Validar proveedor seleccionado y activo
    if (!formData.id_proveedor) {
      toast.error('Seleccione un proveedor');
      return;
    }
    const proveedorSeleccionado = proveedores.find(p => p.id_proveedor === formData.id_proveedor);
    if (!proveedorSeleccionado || proveedorSeleccionado.estado !== 'ACTIVO') {
      toast.error('El proveedor seleccionado no está activo');
      return;
    }
    
    // Validar fecha de entrega no sea pasada
    if (formData.fecha_entrega) {
      const fechaEntrega = new Date(formData.fecha_entrega + 'T12:00:00');
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaEntrega < hoy) {
        toast.error('La fecha de entrega no puede ser en el pasado');
        return;
      }
    }
    
    // Validar que haya productos
    if (formData.detalles.length === 0) {
      toast.error('Agregue al menos un producto');
      return;
    }

    setSaving(true);
    try {
      const detallesJson = formData.detalles.map(item => ({
        id_producto: item.id_producto,
        cantidad: parseInt(item.cantidad),
        precio_unitario: parseFloat(item.precio_unitario)
      }));

      // Usar v2 que acepta fecha_emision como parámetro (sin SQL directo)
      const fechaLocal = new Date().toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
      const { data, error } = await supabase.rpc('fn_crear_orden_compra_v2', {
        p_id_proveedor: formData.id_proveedor,
        p_fecha_emision: fechaLocal,
        p_fecha_entrega: formData.fecha_entrega || null,
        p_detalles: detallesJson,
        p_username: getUsername()
      });

      if (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Error al crear orden');
      } else {
        toast.success('Orden de compra creada exitosamente');
        setShowModal(false);
        resetForm();
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al crear orden');
    } finally {
      setSaving(false);
    }
  };

  const handleRecepcionar = async () => {
    if (!recepcionData.lote.trim()) {
      toast.error('Ingrese el número de lote');
      return;
    }
    
    // Validar que la orden no tenga más de 60 días
    if (ordenSeleccionada) {
      const fechaEmision = new Date(ordenSeleccionada.fecha_emision + 'T12:00:00');
      const hoy = new Date();
      const diasDiferencia = Math.floor((hoy - fechaEmision) / (1000 * 60 * 60 * 24));
      if (diasDiferencia > 60) {
        toast.error(`Esta orden tiene ${diasDiferencia} días de antigüedad. No se puede recepcionar órdenes con más de 60 días. Debe cancelarla.`);
        return;
      }
    }

    setSaving(true);
    try {
      // Usar v2 que acepta fecha_entrega como parámetro (sin SQL directo)
      const fechaLocal = new Date().toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
      const { data, error } = await supabase.rpc('fn_recepcionar_orden_v2', {
        p_id_orden: ordenSeleccionada.id_orden,
        p_lote: recepcionData.lote.trim(),
        p_fecha_vencimiento: recepcionData.fecha_vencimiento || null,
        p_fecha_entrega: fechaLocal,
        p_username: getUsername()
      });

      if (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Error al recepcionar');
      } else {
        toast.success('Mercadería recepcionada exitosamente');
        setShowRecepcionModal(false);
        setRecepcionData({ lote: '', fecha_vencimiento: '' });
        setOrdenSeleccionada(null);
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al recepcionar');
    } finally {
      setSaving(false);
    }
  };

  const agregarProducto = () => {
    if (!nuevoItem.id_producto) {
      toast.error('Seleccione un producto');
      return;
    }
    if (nuevoItem.cantidad <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    const producto = productosProveedor.find(p => p.id_producto === nuevoItem.id_producto);
    if (!producto) return;

    // Verificar si ya existe
    const existente = formData.detalles.find(d => d.id_producto === nuevoItem.id_producto);
    if (existente) {
      toast.error('El producto ya está en la lista');
      return;
    }

    setFormData({
      ...formData,
      detalles: [...formData.detalles, {
        id_producto: nuevoItem.id_producto,
        nombre: producto.nombre,
        cantidad: parseInt(nuevoItem.cantidad),
        precio_unitario: parseFloat(nuevoItem.precio_unitario) || parseFloat(producto.precio_costo || 0)
      }]
    });

    setNuevoItem({ id_producto: '', cantidad: 1, precio_unitario: 0 });
  };

  const eliminarProducto = (id_producto) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter(d => d.id_producto !== id_producto)
    });
  };

  const calcularTotal = () => {
    return formData.detalles.reduce((sum, item) => 
      sum + (item.cantidad * item.precio_unitario), 0
    );
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openRecepcionModal = async (orden) => {
    setOrdenSeleccionada(orden);
    
    // Auto-generar número de lote usando SP
    try {
      const { data: nuevoLote, error } = await supabase.rpc('fn_obtener_ultimo_lote');
      
      if (error) {
        console.error('Error obteniendo lote:', error);
        setRecepcionData({ lote: 'LOT-006', fecha_vencimiento: '' });
      } else {
        setRecepcionData({ lote: nuevoLote || 'LOT-006', fecha_vencimiento: '' });
      }
    } catch (err) {
      console.error('Error generando lote:', err);
      setRecepcionData({ lote: 'LOT-006', fecha_vencimiento: '' });
    }
    
    setShowRecepcionModal(true);
  };

  const openDetalleModal = (orden) => {
    setOrdenSeleccionada(orden);
    setShowDetalleModal(true);
  };

  const handleCancelarOrden = (orden) => {
    setOrdenSeleccionada({...orden, id_orden: orden.id || orden.id_orden});
    setShowCancelModal(true);
  };

  const confirmCancelarOrden = async () => {
    if (!ordenSeleccionada) return;
    
    setSaving(true);
    try {
      // Usar SP para cancelar orden (ya registra auditoría internamente)
      const { data, error } = await supabase.rpc('fn_cancelar_orden', {
        p_id_orden: ordenSeleccionada.id_orden,
        p_username: getUsername()
      });

      if (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Error al cancelar la orden');
      } else {
        toast.success('Orden cancelada exitosamente');
        setShowCancelModal(false);
        setOrdenSeleccionada(null);
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cancelar la orden');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_proveedor: '',
      fecha_entrega: '',
      detalles: []
    });
    setNuevoItem({ id_producto: '', cantidad: 1, precio_unitario: 0 });
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      PENDIENTE: { bg: '#fff3e0', color: '#e65100', icon: Clock },
      RECIBIDA: { bg: '#e8f5e9', color: '#2e7d32', icon: CheckCircle },
      CANCELADA: { bg: '#ffebee', color: '#c62828', icon: XCircle }
    };
    const config = estilos[estado] || estilos.PENDIENTE;
    const Icon = config.icon;
    return (
      <span style={{ ...styles.badge, background: config.bg, color: config.color }}>
        <Icon size={14} /> {estado}
      </span>
    );
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;
  const formatDate = (date) => {
    if (!date) return '-';
    // Evitar problema de timezone: parsear la fecha como string directamente
    const [year, month, day] = date.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    // Fallback para otros formatos
    const d = new Date(date + 'T12:00:00'); // Agregar hora del mediodía para evitar cambio de día
    return d.toLocaleDateString('es-BO');
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <ShoppingBag size={28} style={{ marginRight: '12px' }} />
            Órdenes de Compra
          </h1>
          <p style={styles.subtitle}>
            Gestión de compras a proveedores • {ordenesFiltradas.length} órdenes
          </p>
        </div>
        <button style={styles.primaryButton} onClick={openCreateModal}>
          <Plus size={18} />
          Nueva Orden
        </button>
      </header>

      {/* Filtros */}
      <div style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Desde:</label>
          <input
            type="date"
            value={filtroFechaInicio}
            onChange={(e) => setFiltroFechaInicio(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Hasta:</label>
          <input
            type="date"
            value={filtroFechaFin}
            onChange={(e) => setFiltroFechaFin(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Proveedor:</label>
          <select 
            value={filtroProveedor} 
            onChange={(e) => setFiltroProveedor(e.target.value)}
            style={styles.select}
          >
            <option value="">Todos</option>
            {proveedores.filter(p => p.estado === 'ACTIVO').map(prov => (
              <option key={prov.id_proveedor} value={prov.id_proveedor}>
                {prov.razon_social}
              </option>
            ))}
          </select>
        </div>
        <button 
          style={{
            ...styles.refreshButton,
            background: ordenAscendente ? '#e8f5e9' : '#fff3e0',
            color: ordenAscendente ? '#2e7d32' : '#e65100'
          }} 
          onClick={() => setOrdenAscendente(!ordenAscendente)}
          title={ordenAscendente ? 'Orden Ascendente (click para cambiar)' : 'Orden Descendente (click para cambiar)'}
        >
          {ordenAscendente ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          {ordenAscendente ? 'Antiguo primero' : 'Reciente primero'}
        </button>
        <button style={styles.refreshButton} onClick={cargarDatos} disabled={loading}>
          <Loader2 size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Actualizar
        </button>
      </div>

      {/* Tabla de órdenes */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando órdenes...</p>
          </div>
        ) : ordenesFiltradas.length === 0 ? (
          <div style={styles.emptyState}>
            <ShoppingBag size={48} style={{ color: '#ccc' }} />
            <p>No hay órdenes que coincidan con los filtros</p>
            <button style={styles.primaryButton} onClick={openCreateModal}>
              <Plus size={18} /> Crear orden
            </button>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID Orden</th>
                <th style={styles.th}>Proveedor</th>
                <th style={styles.th}>Fecha Emisión</th>
                <th style={styles.th}>Fecha Entrega</th>
                <th style={styles.th}>Total</th>
                <th style={{...styles.th, textAlign: 'center'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((orden) => (
                <tr key={orden.id || orden.id_orden} style={styles.tr}>
                  <td style={styles.td}><strong>{orden.id || orden.id_orden}</strong></td>
                  <td style={styles.td}>{orden.proveedor}</td>
                  <td style={styles.td}>{formatDate(orden.fecha_emision)}</td>
                  <td style={styles.td}>{formatDate(orden.fecha_entrega)}</td>
                  <td style={styles.td}><strong>{formatCurrency(orden.total)}</strong></td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <div style={styles.actionButtons}>
                      <button 
                        style={styles.viewButton} 
                        onClick={() => openDetalleModal(orden)}
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      {orden.estado === 'PENDIENTE' && (
                        <>
                          <button 
                            style={styles.recepcionButton} 
                            onClick={() => openRecepcionModal({...orden, id_orden: orden.id || orden.id_orden})}
                            title="Recepcionar"
                          >
                            <PackageCheck size={16} />
                          </button>
                          <button 
                            style={styles.cancelButton} 
                            onClick={() => handleCancelarOrden({...orden, id_orden: orden.id || orden.id_orden})}
                            title="Cancelar orden"
                          >
                            <Ban size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}  
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nueva Orden */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalLarge} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Nueva Orden de Compra</h2>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Proveedor *</label>
                  <select
                    value={formData.id_proveedor}
                    onChange={(e) => {
                      const newProveedor = e.target.value;
                      setFormData({
                        ...formData, 
                        id_proveedor: newProveedor,
                        detalles: [] // Limpiar productos al cambiar proveedor
                      });
                      setNuevoItem({ id_producto: '', cantidad: 1, precio_unitario: 0 });
                      cargarProductosProveedor(newProveedor);
                    }}
                    style={styles.select}
                  >
                    <option value="">Seleccione proveedor...</option>
                    {proveedores.filter(p => p.estado === 'ACTIVO').map(prov => (
                      <option key={prov.id_proveedor} value={prov.id_proveedor}>
                        {prov.razon_social}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Fecha Entrega Esperada</label>
                  <input
                    type="date"
                    value={formData.fecha_entrega}
                    onChange={(e) => setFormData({...formData, fecha_entrega: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Agregar productos */}
              <div style={styles.productSection}>
                <h4 style={styles.sectionTitle}>
                  <Package size={18} /> Productos
                </h4>
                <div style={styles.addProductRow}>
                  <select
                    value={nuevoItem.id_producto}
                    onChange={(e) => {
                      const prod = productosProveedor.find(p => p.id_producto === e.target.value);
                      setNuevoItem({
                        ...nuevoItem,
                        id_producto: e.target.value,
                        precio_unitario: prod?.precio_costo || 0
                      });
                    }}
                    style={{...styles.select, flex: 2}}
                    disabled={!formData.id_proveedor || cargandoProductos}
                  >
                    <option value="">
                      {!formData.id_proveedor 
                        ? 'Primero seleccione un proveedor...' 
                        : cargandoProductos 
                          ? 'Cargando productos...' 
                          : productosProveedor.length === 0 
                            ? 'No hay productos asociados a este proveedor'
                            : 'Seleccione producto...'}
                    </option>
                    {productosProveedor.map(prod => (
                      <option key={prod.id_producto} value={prod.id_producto}>
                        {prod.nombre} - Precio: Bs {parseFloat(prod.precio_costo || 0).toFixed(2)} - Stock: {prod.stock_actual}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={nuevoItem.cantidad}
                    onChange={(e) => setNuevoItem({...nuevoItem, cantidad: e.target.value})}
                    style={{...styles.input, flex: 1}}
                    min="1"
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={nuevoItem.precio_unitario}
                    onChange={(e) => setNuevoItem({...nuevoItem, precio_unitario: e.target.value})}
                    style={{...styles.input, flex: 1}}
                    step="0.01"
                  />
                  <button style={styles.addButton} onClick={agregarProducto}>
                    <Plus size={18} />
                  </button>
                </div>

                {/* Lista de productos agregados */}
                {formData.detalles.length > 0 && (
                  <div style={styles.productList}>
                    {formData.detalles.map((item, idx) => (
                      <div key={idx} style={styles.productItem}>
                        <span style={styles.productName}>{item.nombre}</span>
                        <span>{item.cantidad} x {formatCurrency(item.precio_unitario)}</span>
                        <span style={styles.subtotal}>
                          {formatCurrency(item.cantidad * item.precio_unitario)}
                        </span>
                        <button 
                          style={styles.removeButton}
                          onClick={() => eliminarProducto(item.id_producto)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div style={styles.totalRow}>
                      <strong>TOTAL:</strong>
                      <strong style={styles.totalValue}>{formatCurrency(calcularTotal())}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button style={styles.saveButton} onClick={handleCreate} disabled={saving}>
                {saving ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
                ) : (
                  <><Save size={16} /> Crear Orden</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Recepcionar */}
      {showRecepcionModal && ordenSeleccionada && (
        <div style={styles.modalOverlay} onClick={() => setShowRecepcionModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <PackageCheck size={20} /> Recepcionar Orden
              </h2>
              <button style={styles.closeButton} onClick={() => setShowRecepcionModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.infoCard}>
                <p><strong>Orden:</strong> {ordenSeleccionada.id_orden}</p>
                <p><strong>Proveedor:</strong> {ordenSeleccionada.proveedor}</p>
                <p><strong>Total:</strong> {formatCurrency(ordenSeleccionada.total)}</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Número de Lote *</label>
                <input
                  type="text"
                  value={recepcionData.lote}
                  onChange={(e) => setRecepcionData({...recepcionData, lote: e.target.value})}
                  style={styles.input}
                  placeholder="Ej: LOTE-2024-001"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Fecha de Vencimiento (si aplica)</label>
                <input
                  type="date"
                  value={recepcionData.fecha_vencimiento}
                  onChange={(e) => setRecepcionData({...recepcionData, fecha_vencimiento: e.target.value})}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowRecepcionModal(false)} disabled={saving}>
                Cancelar
              </button>
              <button style={styles.saveButton} onClick={handleRecepcionar} disabled={saving}>
                {saving ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</>
                ) : (
                  <><PackageCheck size={16} /> Confirmar Recepción</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {showDetalleModal && ordenSeleccionada && (
        <div style={styles.modalOverlay} onClick={() => setShowDetalleModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Eye size={20} /> Detalle de Orden
              </h2>
              <button style={styles.closeButton} onClick={() => setShowDetalleModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.infoCard}>
                <p><strong>Orden:</strong> {ordenSeleccionada.id || ordenSeleccionada.id_orden}</p>
                <p><strong>Proveedor:</strong> {ordenSeleccionada.proveedor}</p>
                <p><strong>Fecha Emisión:</strong> {formatDate(ordenSeleccionada.fecha_emision)}</p>
                <p><strong>Fecha Entrega:</strong> {formatDate(ordenSeleccionada.fecha_entrega || '-')}</p>
                <p><strong>Estado:</strong> {getEstadoBadge(ordenSeleccionada.estado)}</p>
                <p style={styles.totalBig}><strong>Total:</strong> {formatCurrency(ordenSeleccionada.total)}</p>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowDetalleModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación Cancelar */}
      {showCancelModal && ordenSeleccionada && (
        <div style={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{...styles.modalHeader, background: 'linear-gradient(135deg, #ffebee, #ffcdd2)'}}>
              <h2 style={{...styles.modalTitle, color: '#c62828'}}>
                <Ban size={20} /> Cancelar Orden
              </h2>
              <button style={styles.closeButton} onClick={() => setShowCancelModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{textAlign: 'center', padding: '20px'}}>
                <Ban size={48} style={{color: '#c62828', marginBottom: '15px'}} />
                <p style={{fontSize: '16px', marginBottom: '10px'}}>
                  ¿Está seguro de cancelar la orden <strong>{ordenSeleccionada.id_orden}</strong>?
                </p>
                <p style={{color: '#6c757d', fontSize: '14px'}}>
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.modalCancelButton} 
                onClick={() => setShowCancelModal(false)} 
                disabled={saving}
              >
                No, volver
              </button>
              <button 
                style={{...styles.saveButton, background: 'linear-gradient(135deg, #c62828, #e53935)'}} 
                onClick={confirmCancelarOrden} 
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Cancelando...</>
                ) : (
                  <><Ban size={16} /> Sí, cancelar</>
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
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  filterLabel: { fontWeight: '500', color: '#495057' },
  select: { padding: '10px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white', minWidth: '150px' },
  refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', color: '#495057', cursor: 'pointer' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  actionButtons: { display: 'flex', gap: '8px', justifyContent: 'center' },
  viewButton: { padding: '8px', background: '#e3f2fd', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#1976d2' },
  recepcionButton: { padding: '8px', background: '#e8f5e9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#2e7d32' },
  cancelButton: { padding: '8px', background: '#ffebee', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#c62828' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' },
  modalLarge: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a', display: 'flex', alignItems: 'center', gap: '10px' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: '5px', borderRadius: '5px' },
  modalBody: { padding: '25px' },
  formRow: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
  formGroup: { flex: 1, minWidth: '200px', marginBottom: '15px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1a5d1a' },
  input: { width: '100%', padding: '12px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  productSection: { marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#333' },
  addProductRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  addButton: { padding: '12px', background: '#1a5d1a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' },
  productList: { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
  productItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', background: 'white', borderRadius: '8px', border: '1px solid #e9ecef' },
  productName: { flex: 1, fontWeight: '500' },
  subtotal: { fontWeight: '600', color: '#1a5d1a', minWidth: '80px', textAlign: 'right' },
  removeButton: { padding: '6px', background: '#ffebee', border: 'none', borderRadius: '6px', color: '#c62828', cursor: 'pointer' },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#e8f5e9', borderRadius: '8px', marginTop: '10px' },
  totalValue: { color: '#1a5d1a', fontSize: '18px' },
  infoCard: { padding: '20px', background: '#f8f9fa', borderRadius: '12px', marginBottom: '20px' },
  totalBig: { marginTop: '15px', fontSize: '18px', color: '#1a5d1a' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  modalCancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
  saveButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};

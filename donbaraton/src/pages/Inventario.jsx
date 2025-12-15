// src/pages/Inventario.jsx
import { useState, useEffect } from 'react';
import {
  Warehouse, Search, X, Loader2, AlertTriangle,
  CheckCircle, AlertCircle, TrendingUp, Package,
  RefreshCw, Eye, ArrowUpCircle, ArrowDownCircle,
  Calendar, FileText, DollarSign
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Inventario() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [inventarioValorado, setInventarioValorado] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar todos los datos necesarios usando SPs
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, alertasRes, valoradoRes] = await Promise.all([
        // Productos con estado de stock
        supabase.rpc('fn_leer_productos', {
          p_buscar: null,
          p_categoria_id: null
        }),
        // Categorías
        supabase.rpc('fn_leer_categorias'),
        // Alertas de stock bajo
        supabase.rpc('fn_alerta_stock_bajo'),
        // Inventario valorado por categoría
        supabase.rpc('fn_reporte_inventario_valorado')
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;
      // Las alertas pueden no existir, no lanzamos error

      setProductos(prodRes.data || []);
      setCategorias(catRes.data || []);
      setAlertasStock(alertasRes.data || []);
      setInventarioValorado(valoradoRes.data || []);

    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  // Ver detalle de un producto (Kardex/Movimientos)
  const verDetalleProducto = async (producto) => {
    setProductoSeleccionado(producto);
    setShowDetalleModal(true);
    setLoadingMovimientos(true);

    try {
      // Cargar movimientos del producto - Usar id_producto correcto
      // El producto viene de fn_leer_productos que devuelve 'id' mapeado
      const productoId = producto.id_producto || producto.id;

      const { data, error } = await supabase
        .from('movimientos_inventario')
        .select(`
          id_movimiento,
          tipo,
          cantidad,
          lote,
          fecha_vencimiento,
          documento,
          motivo,
          observaciones,
          fecha_hora,
          id_usuario
        `)
        .eq('id_producto', productoId)
        .order('fecha_hora', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMovimientos(data || []);
    } catch (err) {
      console.error('Error cargando movimientos:', err);
      toast.error('Error al cargar el kardex del producto');
      setMovimientos([]);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  // Filtrar productos localmente
  const productosFiltrados = productos.filter(prod => {
    const matchSearch = !searchTerm ||
      prod.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategoria = !filterCategoria || prod.categoria === filterCategoria;
    const matchEstado = !filterEstado || prod.estado_stock === filterEstado;

    return matchSearch && matchCategoria && matchEstado;
  });

  // Estadísticas calculadas
  const stats = {
    total: productos.length,
    critico: productos.filter(p => p.estado_stock === 'CRITICO').length,
    bajo: productos.filter(p => p.estado_stock === 'BAJO').length,
    normal: productos.filter(p => p.estado_stock === 'NORMAL').length,
    sobrestock: productos.filter(p => p.estado_stock === 'SOBRESTOCK').length,
    valorTotal: productos.reduce((sum, p) => sum + ((p.stock_actual || 0) * (p.precio_venta || 0)), 0),
    alertasActivas: alertasStock.length
  };

  // Estilos del semáforo de stock
  const getStockBadge = (estado) => {
    const estilos = {
      CRITICO: { bg: '#ffebee', color: '#c62828', icon: <AlertTriangle size={14} />, label: 'Sin Stock' },
      BAJO: { bg: '#fff3e0', color: '#e65100', icon: <AlertCircle size={14} />, label: 'Stock Bajo' },
      NORMAL: { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle size={14} />, label: 'Normal' },
      SOBRESTOCK: { bg: '#e3f2fd', color: '#1565c0', icon: <TrendingUp size={14} />, label: 'Sobrestock' }
    };
    return estilos[estado] || estilos.NORMAL;
  };

  // Formatear moneda boliviana
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  };

  // Tipo de movimiento con icono
  const getTipoMovimiento = (tipo) => {
    const tipos = {
      'ENTRADA': { icon: <ArrowDownCircle size={16} />, color: '#2e7d32', label: 'Entrada' },
      'SALIDA': { icon: <ArrowUpCircle size={16} />, color: '#c62828', label: 'Salida' },
      'AJUSTE+': { icon: <ArrowDownCircle size={16} />, color: '#1565c0', label: 'Ajuste +' },
      'AJUSTE-': { icon: <ArrowUpCircle size={16} />, color: '#e65100', label: 'Ajuste -' },
      'VENTA': { icon: <ArrowUpCircle size={16} />, color: '#c62828', label: 'Venta' },
      'MERMA': { icon: <ArrowUpCircle size={16} />, color: '#d32f2f', label: 'Merma' },
      'DAÑO': { icon: <ArrowUpCircle size={16} />, color: '#d32f2f', label: 'Daño' }
    };
    return tipos[tipo] || { icon: null, color: '#6c757d', label: tipo };
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Warehouse size={28} style={{ marginRight: '12px' }} />
            Control de Inventario
          </h1>
          <p style={styles.subtitle}>
            Gestión de stock y movimientos en tiempo real
          </p>
        </div>
        <div style={styles.headerActions}>
          {stats.alertasActivas > 0 && (
            <button style={styles.alertButton} onClick={() => navigate('/alertas-stock')}>
              <AlertTriangle size={18} />
              Ver Alertas ({stats.alertasActivas})
            </button>
          )}
          <button style={styles.refreshButton} onClick={cargarDatos} disabled={loading}>
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </header>

      {/* Tarjetas de estadísticas */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderTop: '4px solid #1a5d1a' }}>
          <Package size={24} style={{ color: '#1a5d1a', marginBottom: '10px' }} />
          <span style={styles.statValue}>{stats.total}</span>
          <span style={styles.statLabel}>Total Productos</span>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #c62828', cursor: 'pointer' }}
          onClick={() => setFilterEstado(filterEstado === 'CRITICO' ? '' : 'CRITICO')}>
          <AlertTriangle size={24} style={{ color: '#c62828', marginBottom: '10px' }} />
          <span style={{ ...styles.statValue, color: '#c62828' }}>{stats.critico}</span>
          <span style={styles.statLabel}>Sin Stock</span>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #e65100', cursor: 'pointer' }}
          onClick={() => setFilterEstado(filterEstado === 'BAJO' ? '' : 'BAJO')}>
          <AlertCircle size={24} style={{ color: '#e65100', marginBottom: '10px' }} />
          <span style={{ ...styles.statValue, color: '#e65100' }}>{stats.bajo}</span>
          <span style={styles.statLabel}>Stock Bajo</span>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #2e7d32', cursor: 'pointer' }}
          onClick={() => setFilterEstado(filterEstado === 'NORMAL' ? '' : 'NORMAL')}>
          <CheckCircle size={24} style={{ color: '#2e7d32', marginBottom: '10px' }} />
          <span style={{ ...styles.statValue, color: '#2e7d32' }}>{stats.normal}</span>
          <span style={styles.statLabel}>Normal</span>
        </div>
        <div style={{ ...styles.statCard, borderTop: '4px solid #1565c0' }}>
          <DollarSign size={24} style={{ color: '#1565c0', marginBottom: '10px' }} />
          <span style={{ ...styles.statValue, color: '#1565c0', fontSize: '18px' }}>
            Bs {formatCurrency(stats.valorTotal)}
          </span>
          <span style={styles.statLabel}>Valor Inventario</span>
        </div>
      </div>

      {/* Resumen por categoría (del SP fn_reporte_inventario_valorado) */}
      {inventarioValorado.length > 0 && (
        <div style={styles.categoriaResumen}>
          <h3 style={styles.seccionTitulo}>
            <FileText size={18} />
            Inventario por Categoría
          </h3>
          <div style={styles.categoriaGrid}>
            {inventarioValorado.slice(0, 4).map((cat, idx) => (
              <div key={idx} style={styles.categoriaCard}>
                <span style={styles.categoriaNombre}>{cat.categoria}</span>
                <div style={styles.categoriaStats}>
                  <span><strong>{cat.cantidad_productos}</strong> productos</span>
                  <span><strong>{cat.stock_total}</strong> unids.</span>
                  <span style={{ color: '#1a5d1a' }}>
                    <strong>Bs {formatCurrency(cat.valor_venta_potencial)}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Buscar producto..."
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
            <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          style={styles.select}
        >
          <option value="">Todos los estados</option>
          <option value="CRITICO">🔴 Sin Stock</option>
          <option value="BAJO">🟠 Stock Bajo</option>
          <option value="NORMAL">🟢 Normal</option>
          <option value="SOBRESTOCK">🔵 Sobrestock</option>
        </select>
        {(filterCategoria || filterEstado) && (
          <button
            style={styles.clearFiltersButton}
            onClick={() => { setFilterCategoria(''); setFilterEstado(''); }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla de inventario */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando inventario...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <Warehouse size={48} style={{ color: '#ccc' }} />
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Código</th>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Stock Actual</th>
                <th style={styles.th}>Stock Mín.</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Valor Stock</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((prod) => {
                const stockStyle = getStockBadge(prod.estado_stock);
                const valorStock = (prod.stock_actual || 0) * (prod.precio_venta || 0);

                return (
                  <tr key={prod.id} style={{
                    ...styles.tr,
                    background: prod.estado_stock === 'CRITICO' ? '#fff5f5' :
                      prod.estado_stock === 'BAJO' ? '#fffbf0' : 'white'
                  }}>
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
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: prod.stock_actual <= 0 ? '#c62828' :
                          prod.stock_actual <= prod.stock_minimo ? '#e65100' : '#1a5d1a'
                      }}>
                        {prod.stock_actual}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#6c757d' }}>{prod.stock_minimo}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: stockStyle.bg,
                        color: stockStyle.color
                      }}>
                        {stockStyle.icon}
                        {stockStyle.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>Bs {formatCurrency(valorStock)}</strong>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button
                        style={styles.viewButton}
                        onClick={() => verDetalleProducto(prod)}
                        title="Ver Kardex"
                      >
                        <Eye size={16} />
                        Kardex
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Detalle/Kardex */}
      {showDetalleModal && productoSeleccionado && (
        <div style={styles.modalOverlay} onClick={() => setShowDetalleModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Kardex del Producto</h2>
                <p style={styles.modalSubtitle}>
                  {productoSeleccionado.codigo_interno} - {productoSeleccionado.nombre}
                </p>
              </div>
              <button style={styles.closeButton} onClick={() => setShowDetalleModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Info del producto */}
              <div style={styles.productoInfo}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Stock Actual</span>
                  <span style={styles.infoValue}>{productoSeleccionado.stock_actual}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Stock Mínimo</span>
                  <span style={styles.infoValue}>{productoSeleccionado.stock_minimo}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Precio Venta</span>
                  <span style={styles.infoValue}>Bs {formatCurrency(productoSeleccionado.precio_venta)}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Categoría</span>
                  <span style={styles.infoValue}>{productoSeleccionado.categoria || '-'}</span>
                </div>
              </div>

              {/* Historial de movimientos */}
              <h3 style={styles.seccionTitulo}>
                <Calendar size={18} />
                Últimos Movimientos
              </h3>

              {loadingMovimientos ? (
                <div style={styles.loadingState}>
                  <Loader2 size={30} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
                </div>
              ) : movimientos.length === 0 ? (
                <div style={styles.emptyMovimientos}>
                  <p>No hay movimientos registrados</p>
                </div>
              ) : (
                <div style={styles.movimientosLista}>
                  {movimientos.map((mov, idx) => {
                    const tipoInfo = getTipoMovimiento(mov.tipo);
                    return (
                      <div key={mov.id_movimiento || idx} style={styles.movimientoItem}>
                        <div style={{ ...styles.movimientoIcono, background: `${tipoInfo.color}15`, color: tipoInfo.color }}>
                          {tipoInfo.icon}
                        </div>
                        <div style={styles.movimientoInfo}>
                          <div style={styles.movimientoTipo}>
                            <strong>{tipoInfo.label}</strong>
                            <span style={{
                              ...styles.movimientoCantidad,
                              color: mov.tipo.includes('ENTRADA') || mov.tipo.includes('+') ? '#2e7d32' : '#c62828'
                            }}>
                              {mov.tipo.includes('ENTRADA') || mov.tipo.includes('+') ? '+' : '-'}
                              {mov.cantidad} unids.
                            </span>
                          </div>
                          <div style={styles.movimientoMeta}>
                            <span style={{ fontWeight: '500', color: '#333' }}>
                              {mov.motivo || mov.tipo || 'Sin motivo'}
                            </span>
                            {mov.documento && (
                              <span style={{
                                background: '#e9ecef',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontFamily: 'monospace'
                              }}>
                                {mov.documento}
                              </span>
                            )}
                          </div>
                          {mov.observaciones && (
                            <p style={{
                              margin: '4px 0 0 0',
                              fontSize: '12px',
                              color: '#6c757d',
                              fontStyle: 'italic'
                            }}>
                              "{mov.observaciones}"
                            </p>
                          )}
                          <div style={{
                            display: 'flex',
                            gap: '15px',
                            marginTop: '6px',
                            fontSize: '11px',
                            color: '#999'
                          }}>
                            <span>{new Date(mov.fecha_hora).toLocaleDateString('es-BO')}</span>
                            <span>{new Date(mov.fecha_hora).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</span>
                            {mov.lote && <span>Lote: {mov.lote}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============== ESTILOS ==============
const styles = {
  container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  headerActions: { display: 'flex', gap: '10px' },
  alertButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  refreshButton: { padding: '10px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', cursor: 'pointer', color: '#6c757d' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' },
  statCard: { background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'block' },
  statLabel: { fontSize: '13px', color: '#6c757d', marginTop: '5px', display: 'block' },
  // Resumen por categoría
  categoriaResumen: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  seccionTitulo: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1a5d1a' },
  categoriaGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' },
  categoriaCard: { background: '#f8f9fa', borderRadius: '10px', padding: '15px', border: '1px solid #e9ecef' },
  categoriaNombre: { display: 'block', fontWeight: '600', color: '#333', marginBottom: '8px' },
  categoriaStats: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#6c757d' },
  // Toolbar
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', flex: 1, maxWidth: '300px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
  select: { padding: '10px 15px', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', background: 'white', minWidth: '160px' },
  clearFiltersButton: { padding: '10px 16px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
  // Tabla
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #e9ecef', transition: 'background 0.2s' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  code: { background: '#f8f9fa', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' },
  marca: { display: 'block', fontSize: '12px', color: '#6c757d', marginTop: '2px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  viewButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#e8f5e9', color: '#1a5d1a', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  // Estados
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  // Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a' },
  modalSubtitle: { margin: '5px 0 0 0', fontSize: '14px', color: '#6c757d' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: '5px' },
  modalBody: { padding: '25px', maxHeight: 'calc(90vh - 100px)', overflowY: 'auto' },
  // Info del producto
  productoInfo: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '25px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' },
  infoItem: { textAlign: 'center' },
  infoLabel: { display: 'block', fontSize: '12px', color: '#6c757d', marginBottom: '5px' },
  infoValue: { display: 'block', fontSize: '16px', fontWeight: '600', color: '#1a5d1a' },
  // Movimientos
  emptyMovimientos: { textAlign: 'center', padding: '30px', color: '#6c757d' },
  movimientosLista: { display: 'flex', flexDirection: 'column', gap: '10px' },
  movimientoItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', background: '#f8f9fa', borderRadius: '10px' },
  movimientoIcono: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  movimientoInfo: { flex: 1 },
  movimientoTipo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  movimientoCantidad: { fontSize: '14px', fontWeight: '600' },
  movimientoMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d' },
};

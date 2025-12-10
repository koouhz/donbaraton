// src/pages/Inventario.jsx
import { useState, useEffect } from 'react';
import { 
  Warehouse, Search, X, Loader2, AlertTriangle,
  CheckCircle, AlertCircle, TrendingUp, Package,
  RefreshCw, Filter, Eye
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Inventario() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.rpc('fn_leer_productos', { 
          p_buscar: null,
          p_categoria_id: null
        }),
        supabase.rpc('fn_leer_categorias')
      ]);

      if (prodRes.error) throw prodRes.error;
      if (catRes.error) throw catRes.error;

      setProductos(prodRes.data || []);
      setCategorias(catRes.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(prod => {
    const matchSearch = !searchTerm || 
      prod.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategoria = !filterCategoria || prod.categoria === filterCategoria;
    
    const matchEstado = !filterEstado || prod.estado_stock === filterEstado;
    
    return matchSearch && matchCategoria && matchEstado;
  });

  // Estadísticas
  const stats = {
    total: productos.length,
    critico: productos.filter(p => p.estado_stock === 'CRITICO').length,
    bajo: productos.filter(p => p.estado_stock === 'BAJO').length,
    normal: productos.filter(p => p.estado_stock === 'NORMAL').length,
    sobrestock: productos.filter(p => p.estado_stock === 'SOBRESTOCK').length,
    valorTotal: productos.reduce((sum, p) => sum + ((p.stock_actual || 0) * (p.precio_venta || 0)), 0)
  };

  const getStockBadge = (estado) => {
    const estilos = {
      CRITICO: { bg: '#ffebee', color: '#c62828', icon: <AlertTriangle size={14} />, label: 'Sin Stock' },
      BAJO: { bg: '#fff3e0', color: '#e65100', icon: <AlertCircle size={14} />, label: 'Stock Bajo' },
      NORMAL: { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle size={14} />, label: 'Normal' },
      SOBRESTOCK: { bg: '#e3f2fd', color: '#1565c0', icon: <TrendingUp size={14} />, label: 'Sobrestock' }
    };
    return estilos[estado] || estilos.NORMAL;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(value).replace('BOB', 'Bs');
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Warehouse size={28} style={{ marginRight: '12px' }} />
            Inventario
          </h1>
          <p style={styles.subtitle}>
            Control de stock en tiempo real
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.alertButton} onClick={() => navigate('/alertas-stock')}>
            <AlertTriangle size={18} />
            Ver Alertas ({stats.critico + stats.bajo})
          </button>
          <button style={styles.refreshButton} onClick={cargarDatos} disabled={loading}>
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </header>

      {/* Tarjetas de estadísticas */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTop: '4px solid #1a5d1a'}}>
          <Package size={24} style={{ color: '#1a5d1a', marginBottom: '10px' }} />
          <span style={styles.statValue}>{stats.total}</span>
          <span style={styles.statLabel}>Total Productos</span>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #c62828', cursor: 'pointer'}} 
             onClick={() => setFilterEstado(filterEstado === 'CRITICO' ? '' : 'CRITICO')}>
          <AlertTriangle size={24} style={{ color: '#c62828', marginBottom: '10px' }} />
          <span style={{...styles.statValue, color: '#c62828'}}>{stats.critico}</span>
          <span style={styles.statLabel}>Sin Stock</span>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #e65100', cursor: 'pointer'}}
             onClick={() => setFilterEstado(filterEstado === 'BAJO' ? '' : 'BAJO')}>
          <AlertCircle size={24} style={{ color: '#e65100', marginBottom: '10px' }} />
          <span style={{...styles.statValue, color: '#e65100'}}>{stats.bajo}</span>
          <span style={styles.statLabel}>Stock Bajo</span>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #2e7d32', cursor: 'pointer'}}
             onClick={() => setFilterEstado(filterEstado === 'NORMAL' ? '' : 'NORMAL')}>
          <CheckCircle size={24} style={{ color: '#2e7d32', marginBottom: '10px' }} />
          <span style={{...styles.statValue, color: '#2e7d32'}}>{stats.normal}</span>
          <span style={styles.statLabel}>Normal</span>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #1565c0'}}>
          <TrendingUp size={24} style={{ color: '#1565c0', marginBottom: '10px' }} />
          <span style={{...styles.statValue, color: '#1565c0', fontSize: '20px'}}>{formatCurrency(stats.valorTotal)}</span>
          <span style={styles.statLabel}>Valor Inventario</span>
        </div>
      </div>

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
                      <strong>{formatCurrency(valorStock)}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

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
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', flex: 1, maxWidth: '300px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
  select: { padding: '10px 15px', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', background: 'white', minWidth: '160px' },
  clearFiltersButton: { padding: '10px 16px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' },
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #e9ecef', transition: 'background 0.2s' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  code: { background: '#f8f9fa', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' },
  marca: { display: 'block', fontSize: '12px', color: '#6c757d', marginTop: '2px' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
};

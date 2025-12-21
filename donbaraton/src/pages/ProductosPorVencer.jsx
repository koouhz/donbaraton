// src/pages/ProductosPorVencer.jsx
// INV-04: Productos por Vencer con pestañas 30/20/15 días
import { useState, useEffect } from 'react';
import {
  Calendar, AlertTriangle, Package, Loader2, Search,
  X, AlertCircle, Clock, RefreshCw, FileDown
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import logo from '../logo/images.jpg';

export default function ProductosPorVencer() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabActivo, setTabActivo] = useState(30); // Tabs: 30, 20, 15 días

  useEffect(() => {
    cargarProductos();
  }, [tabActivo]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_listar_productos_por_vencer', {
        p_dias: tabActivo
      });
      if (error) throw error;
      setProductos(data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar productos');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_barras?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAlertStyle = (estado) => {
    switch (estado) {
      case 'CRITICO': return { bg: '#ffebee', color: '#c62828', icon: <AlertTriangle size={14} /> };
      case 'ALERTA': return { bg: '#fff3e0', color: '#e65100', icon: <AlertCircle size={14} /> };
      default: return { bg: '#e8f5e9', color: '#2e7d32', icon: <Clock size={14} /> };
    }
  };

  const resumenPorEstado = {
    criticos: productos.filter(p => p.estado_alerta === 'CRITICO').length,
    alerta: productos.filter(p => p.estado_alerta === 'ALERTA').length,
    proximos: productos.filter(p => p.estado_alerta === 'PROXIMO').length
  };

  const exportarPDF = () => {
    const printWindow = window.open('', '_blank');
    const fecha = new Date().toLocaleDateString('es-BO');
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Productos por Vencer - ${tabActivo} días</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a5d1a; padding-bottom: 15px; }
          .header img { width: 60px; height: 60px; }
          .header h1 { color: #1a5d1a; margin: 10px 0 5px; font-size: 18px; }
          .info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #1a5d1a; color: white; padding: 8px; text-align: left; font-size: 11px; }
          td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .critico { background: #ffebee; color: #c62828; }
          .alerta { background: #fff3e0; color: #e65100; }
          .proximo { background: #e8f5e9; color: #2e7d32; }
          .resumen { display: flex; justify-content: space-around; margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
          .resumen-item { text-align: center; }
          .resumen-valor { font-size: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logo}" alt="Logo" />
          <h1>DON BARATÓN - Productos por Vencer</h1>
          <p>Próximos ${tabActivo} días • Generado: ${fecha}</p>
        </div>
        
        <div class="resumen">
          <div class="resumen-item"><span class="resumen-valor" style="color:#c62828">${resumenPorEstado.criticos}</span><br>Críticos (≤15d)</div>
          <div class="resumen-item"><span class="resumen-valor" style="color:#e65100">${resumenPorEstado.alerta}</span><br>Alerta (≤20d)</div>
          <div class="resumen-item"><span class="resumen-valor" style="color:#2e7d32">${resumenPorEstado.proximos}</span><br>Próximos (≤30d)</div>
          <div class="resumen-item"><span class="resumen-valor" style="color:#1a5d1a">${productosFiltrados.length}</span><br>Total</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Código</th>
              <th>Categoría</th>
              <th>Lote</th>
              <th>Cantidad</th>
              <th>Vencimiento</th>
              <th>Días Rest.</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
    `;

    productosFiltrados.forEach(p => {
      const estadoClass = p.estado_alerta === 'CRITICO' ? 'critico' : p.estado_alerta === 'ALERTA' ? 'alerta' : 'proximo';
      html += `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.codigo_barras || '-'}</td>
          <td>${p.categoria || '-'}</td>
          <td>${p.lote || '-'}</td>
          <td>${p.cantidad}</td>
          <td>${new Date(p.fecha_vencimiento).toLocaleDateString('es-BO')}</td>
          <td><strong>${p.dias_restantes}</strong></td>
          <td class="${estadoClass}">${p.estado_alerta}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    toast.success('Generando PDF...');
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Calendar size={28} style={{ marginRight: '12px' }} />
            Productos por Vencer
          </h1>
          <p style={styles.subtitle}>
            Control de vencimientos próximos • {productos.length} productos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={styles.refreshButton} onClick={cargarProductos} title="Actualizar">
            <RefreshCw size={18} />
          </button>
          <button style={styles.exportButton} onClick={exportarPDF}>
            <FileDown size={18} /> Exportar PDF
          </button>
        </div>
      </header>

      {/* Tabs de días */}
      <div style={styles.tabsContainer}>
        {[30, 20, 15].map(dias => (
          <button
            key={dias}
            style={{
              ...styles.tab,
              ...(tabActivo === dias ? styles.tabActivo : {})
            }}
            onClick={() => setTabActivo(dias)}
          >
            <Clock size={16} />
            Próximos {dias} días
          </button>
        ))}
      </div>

      {/* Resumen de alertas */}
      <div style={styles.resumenCards}>
        <div style={{ ...styles.resumenCard, borderLeft: '4px solid #c62828' }}>
          <AlertTriangle size={24} style={{ color: '#c62828' }} />
          <div>
            <span style={{ ...styles.resumenValor, color: '#c62828' }}>{resumenPorEstado.criticos}</span>
            <span style={styles.resumenLabel}>Críticos (≤15 días)</span>
          </div>
        </div>
        <div style={{ ...styles.resumenCard, borderLeft: '4px solid #e65100' }}>
          <AlertCircle size={24} style={{ color: '#e65100' }} />
          <div>
            <span style={{ ...styles.resumenValor, color: '#e65100' }}>{resumenPorEstado.alerta}</span>
            <span style={styles.resumenLabel}>En Alerta (≤20 días)</span>
          </div>
        </div>
        <div style={{ ...styles.resumenCard, borderLeft: '4px solid #2e7d32' }}>
          <Clock size={24} style={{ color: '#2e7d32' }} />
          <div>
            <span style={{ ...styles.resumenValor, color: '#2e7d32' }}>{resumenPorEstado.proximos}</span>
            <span style={styles.resumenLabel}>Próximos (≤30 días)</span>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div style={styles.toolbar}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Buscar por nombre, código o categoría..."
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

      {/* Tabla */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando productos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <Package size={48} style={{ color: '#ccc' }} />
            <p>No hay productos por vencer en los próximos {tabActivo} días</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Código</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Lote</th>
                <th style={styles.th}>Cantidad</th>
                <th style={styles.th}>Vencimiento</th>
                <th style={styles.th}>Días Rest.</th>
                <th style={styles.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto, i) => {
                const alertStyle = getAlertStyle(producto.estado_alerta);
                return (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{producto.nombre}</strong>
                    </td>
                    <td style={styles.td}>{producto.codigo_barras || '-'}</td>
                    <td style={styles.td}>{producto.categoria || '-'}</td>
                    <td style={styles.td}>{producto.lote || '-'}</td>
                    <td style={styles.td}><strong>{producto.cantidad}</strong></td>
                    <td style={styles.td}>
                      {new Date(producto.fecha_vencimiento).toLocaleDateString('es-BO')}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '700', color: alertStyle.color }}>
                      {producto.dias_restantes} días
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: alertStyle.bg,
                        color: alertStyle.color
                      }}>
                        {alertStyle.icon}
                        {producto.estado_alerta}
                      </span>
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
  refreshButton: { padding: '12px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', color: '#666' },
  exportButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  
  // Tabs
  tabsContainer: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'white', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', color: '#6c757d', transition: 'all 0.2s' },
  tabActivo: { background: '#e8f5e9', borderColor: '#1a5d1a', color: '#1a5d1a' },
  
  // Resumen
  resumenCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' },
  resumenCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  resumenValor: { display: 'block', fontSize: '28px', fontWeight: '700' },
  resumenLabel: { fontSize: '13px', color: '#6c757d' },
  
  // Toolbar
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', flex: 1, maxWidth: '400px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
  
  // Tabla
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  th: { padding: '15px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '12px 15px', fontSize: '13px', color: '#495057' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  
  // Estados
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' }
};

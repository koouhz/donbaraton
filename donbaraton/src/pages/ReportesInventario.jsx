// src/pages/ReportesInventario.jsx
import { useState, useEffect } from 'react';
import { 
  Package, FileDown, Loader2, AlertTriangle, TrendingUp,
  Archive, DollarSign, Layers, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import logo from '../logo/images.jpg';

export default function ReportesInventario() {
  const [inventario, setInventario] = useState([]);
  const [stockCritico, setStockCritico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  const [stats, setStats] = useState({
    totalCategorias: 0,
    totalProductos: 0,
    stockTotal: 0,
    valorTotal: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // fn_reporte_inventario_valorado retorna:
      // categoria, cantidad_productos, stock_total, valor_venta_potencial
      const { data, error } = await supabase.rpc('fn_reporte_inventario_valorado');
      
      if (error) {
        console.error('Error:', error);
        toast.error('Error al cargar inventario valorado');
      } else {
        setInventario(data || []);
        calcularEstadisticas(data || []);
      }

      // Cargar stock crítico
      const stockRes = await supabase.rpc('fn_alerta_stock_critico');
      if (!stockRes.error) {
        setStockCritico(stockRes.data || []);
      }

    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (data) => {
    const totalProductos = data.reduce((sum, c) => sum + parseInt(c.cantidad_productos || 0), 0);
    const stockTotal = data.reduce((sum, c) => sum + parseInt(c.stock_total || 0), 0);
    const valorTotal = data.reduce((sum, c) => sum + parseFloat(c.valor_venta_potencial || 0), 0);
    
    setStats({
      totalCategorias: data.length,
      totalProductos,
      stockTotal,
      valorTotal
    });
  };

  const exportarPDF = async () => {
    setExportando(true);
    try {
      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Inventario - Don Baraton</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #fff; color: #333; }
            .header { display: flex; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #1a5d1a; }
            .logo { width: 80px; height: 80px; margin-right: 20px; border-radius: 10px; }
            .empresa h1 { color: #1a5d1a; font-size: 28px; margin-bottom: 5px; }
            .empresa p { color: #666; font-size: 14px; }
            .titulo-reporte { background: linear-gradient(135deg, #1a5d1a, #2e8b57); color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 25px; }
            .titulo-reporte h2 { font-size: 20px; margin-bottom: 5px; }
            .titulo-reporte p { font-size: 12px; opacity: 0.9; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
            .stat { background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; border-left: 4px solid #1a5d1a; }
            .stat-value { font-size: 20px; font-weight: bold; color: #1a5d1a; }
            .stat-label { font-size: 11px; color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #1a5d1a; color: white; padding: 12px 10px; text-align: left; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #e9ecef; font-size: 11px; }
            tr:nth-child(even) { background: #f8f9fa; }
            .critico { background: #ffebee !important; color: #c62828; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 11px; color: #666; text-align: center; }
            .section { margin-top: 30px; }
            .section h3 { margin-bottom: 15px; color: #1a5d1a; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logo}" class="logo" alt="Logo">
            <div class="empresa">
              <h1>Don Baraton</h1>
              <p>Supermercado - Sistema de Gestión</p>
            </div>
          </div>
          
          <div class="titulo-reporte">
            <h2>Reporte de Inventario Valorado</h2>
            <p>Generado: ${new Date().toLocaleDateString('es-BO')} ${new Date().toLocaleTimeString('es-BO')}</p>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-value">${stats.totalCategorias}</div>
              <div class="stat-label">Categorías</div>
            </div>
            <div class="stat">
              <div class="stat-value">${stats.totalProductos}</div>
              <div class="stat-label">Productos</div>
            </div>
            <div class="stat">
              <div class="stat-value">${stats.stockTotal}</div>
              <div class="stat-label">Unidades en Stock</div>
            </div>
            <div class="stat">
              <div class="stat-value">Bs ${stats.valorTotal.toFixed(2)}</div>
              <div class="stat-label">Valor Total Inventario</div>
            </div>
          </div>

          <h3 style="margin-bottom: 10px;">Inventario por Categoría</h3>
          <table>
            <thead>
              <tr>
                <th>Categoría</th>
                <th style="text-align:center">Productos</th>
                <th style="text-align:center">Stock Total</th>
                <th style="text-align:right">Valor Potencial (Bs)</th>
              </tr>
            </thead>
            <tbody>
              ${inventario.map(cat => `
                <tr>
                  <td><strong>${cat.categoria || 'Sin categoría'}</strong></td>
                  <td style="text-align:center">${cat.cantidad_productos || 0}</td>
                  <td style="text-align:center">${cat.stock_total || 0}</td>
                  <td style="text-align:right">Bs ${parseFloat(cat.valor_venta_potencial || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #e8f5e9; font-weight: bold;">
                <td>TOTAL</td>
                <td style="text-align:center">${stats.totalProductos}</td>
                <td style="text-align:center">${stats.stockTotal}</td>
                <td style="text-align:right">Bs ${stats.valorTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          ${stockCritico.length > 0 ? `
          <div class="section">
            <h3 style="color: #c62828;">Productos con Stock Crítico (${stockCritico.length})</h3>
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style="text-align:center">Stock Actual</th>
                  <th style="text-align:center">Stock Mínimo</th>
                </tr>
              </thead>
              <tbody>
                ${stockCritico.slice(0, 20).map(p => `
                  <tr class="critico">
                    <td><strong>${p.producto || p.nombre || 'Sin nombre'}</strong></td>
                    <td style="text-align:center"><strong>${p.stock_actual || 0}</strong></td>
                    <td style="text-align:center">${p.stock_minimo || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <div class="footer">
            <p>Don Baraton - Sistema de Gestión de Supermercado</p>
            <p>Reporte generado automáticamente el ${new Date().toLocaleDateString('es-BO')}</p>
          </div>
        </body>
        </html>
      `;

      const ventana = window.open('', '_blank');
      if (!ventana) {
        toast.error('Por favor permite las ventanas emergentes para generar el PDF');
        setExportando(false);
        return;
      }
      ventana.document.write(contenidoHTML);
      ventana.document.close();
      
      setTimeout(() => {
        ventana.print();
        toast.success('PDF listo para guardar');
      }, 500);

    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al generar PDF');
    } finally {
      setExportando(false);
    }
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Package size={28} style={{ marginRight: '12px' }} />
            Reporte de Inventario
          </h1>
          <p style={styles.subtitle}>
            Inventario valorado por categoría y stock crítico
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={styles.refreshButton} onClick={cargarDatos} disabled={loading}>
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Actualizar
          </button>
          <button 
            style={styles.exportButton} 
            onClick={exportarPDF}
            disabled={exportando || inventario.length === 0}
          >
            {exportando ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generando...</>
            ) : (
              <><FileDown size={18} /> Exportar PDF</>
            )}
          </button>
        </div>
      </header>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTop: '4px solid #1a5d1a'}}>
          <Layers size={32} style={{ color: '#1a5d1a' }} />
          <div>
            <span style={styles.statValue}>{stats.totalCategorias}</span>
            <span style={styles.statLabel}>Categorías</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #1565c0'}}>
          <Package size={32} style={{ color: '#1565c0' }} />
          <div>
            <span style={{...styles.statValue, color: '#1565c0'}}>{stats.totalProductos}</span>
            <span style={styles.statLabel}>Productos Activos</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #e65100'}}>
          <Archive size={32} style={{ color: '#e65100' }} />
          <div>
            <span style={{...styles.statValue, color: '#e65100'}}>{stats.stockTotal}</span>
            <span style={styles.statLabel}>Unidades en Stock</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #2e7d32'}}>
          <DollarSign size={32} style={{ color: '#2e7d32' }} />
          <div>
            <span style={{...styles.statValue, color: '#2e7d32'}}>{formatCurrency(stats.valorTotal)}</span>
            <span style={styles.statLabel}>Valor Total Inventario</span>
          </div>
        </div>
      </div>

      {/* Tabla Inventario por Categoría */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>
            <Layers size={18} style={{ marginRight: '8px' }} />
            Inventario por Categoría
          </h3>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando inventario...</p>
          </div>
        ) : inventario.length === 0 ? (
          <div style={styles.emptyState}>
            <Package size={48} style={{ color: '#ccc' }} />
            <p>No hay datos de inventario</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Categoría</th>
                <th style={{...styles.th, textAlign: 'center'}}>Productos</th>
                <th style={{...styles.th, textAlign: 'center'}}>Stock Total</th>
                <th style={{...styles.th, textAlign: 'right'}}>Valor Potencial</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((cat, index) => (
                <tr key={`cat-${index}`} style={styles.tr}>
                  <td style={styles.td}><strong>{cat.categoria || 'Sin categoría'}</strong></td>
                  <td style={{...styles.td, textAlign: 'center'}}>{cat.cantidad_productos || 0}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>{cat.stock_total || 0}</td>
                  <td style={{...styles.td, textAlign: 'right', fontWeight: '600', color: '#2e7d32'}}>
                    {formatCurrency(cat.valor_venta_potencial)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={styles.tfootRow}>
                <td style={{...styles.td, fontWeight: '700'}}>TOTAL</td>
                <td style={{...styles.td, textAlign: 'center', fontWeight: '600'}}>{stats.totalProductos}</td>
                <td style={{...styles.td, textAlign: 'center', fontWeight: '600'}}>{stats.stockTotal}</td>
                <td style={{...styles.td, textAlign: 'right', fontWeight: '700', color: '#2e7d32', fontSize: '16px'}}>
                  {formatCurrency(stats.valorTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Stock Crítico */}
      {stockCritico.length > 0 && (
        <div style={{...styles.tableContainer, borderTop: '4px solid #c62828'}}>
          <div style={styles.tableHeader}>
            <h3 style={{...styles.tableTitle, color: '#c62828'}}>
              <AlertTriangle size={18} style={{ marginRight: '8px' }} />
              Productos con Stock Crítico ({stockCritico.length})
            </h3>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, background: '#c62828'}}>Producto</th>
                <th style={{...styles.th, background: '#c62828', textAlign: 'center'}}>Stock Actual</th>
                <th style={{...styles.th, background: '#c62828', textAlign: 'center'}}>Stock Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {stockCritico.map((prod, index) => (
                <tr key={`critico-${index}`} style={{...styles.tr, background: '#ffebee'}}>
                  <td style={styles.td}><strong>{prod.producto || prod.nombre || 'Sin nombre'}</strong></td>
                  <td style={{...styles.td, textAlign: 'center', color: '#c62828', fontWeight: '700'}}>
                    {prod.stock_actual || 0}
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>{prod.stock_minimo || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  exportButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 93, 26, 0.3)' },
  refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'white', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#495057' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  statValue: { display: 'block', fontSize: '26px', fontWeight: '700', color: '#1a5d1a' },
  statLabel: { fontSize: '13px', color: '#6c757d' },
  tableContainer: { background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '25px' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e9ecef' },
  tableTitle: { margin: 0, fontSize: '16px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px 15px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '12px 15px', fontSize: '13px', color: '#495057' },
  tfootRow: { background: '#e8f5e9' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
};

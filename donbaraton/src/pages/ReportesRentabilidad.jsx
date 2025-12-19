// src/pages/ReportesRentabilidad.jsx
import { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, DollarSign, Package, FileDown,
  Loader2, ArrowUp, ArrowDown, ShoppingBag
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import logo from '../logo/images.jpg';

export default function ReportesRentabilidad() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  
  const [filtros, setFiltros] = useState({
    periodo: 'mes',
    fechaInicio: (() => {
      const d = new Date();
      d.setDate(1);
      return d.toISOString().split('T')[0];
    })(),
    fechaFin: new Date().toISOString().split('T')[0]
  });

  const [stats, setStats] = useState({
    totalProductos: 0,
    gananciaTotal: 0,
    unidadesVendidas: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (filtros.fechaInicio && filtros.fechaFin) {
      cargarDatos();
    }
  }, [filtros.fechaInicio, filtros.fechaFin]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // fn_reporte_rentabilidad_producto retorna:
      // producto, precio_costo, precio_venta, margen_unitario, cantidad_vendida, ganancia_total
      const { data, error } = await supabase.rpc('fn_reporte_rentabilidad_producto', {
        p_fecha_inicio: filtros.fechaInicio,
        p_fecha_fin: filtros.fechaFin
      });
      
      if (error) {
        console.error('Error:', error);
        toast.error('Error al cargar datos de rentabilidad');
      } else {
        setProductos(data || []);
        calcularEstadisticas(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (data) => {
    const gananciaTotal = data.reduce((sum, p) => sum + parseFloat(p.ganancia_total || 0), 0);
    const unidadesVendidas = data.reduce((sum, p) => sum + parseInt(p.cantidad_vendida || 0), 0);
    
    setStats({
      totalProductos: data.length,
      gananciaTotal,
      unidadesVendidas
    });
  };

  const aplicarFiltrosPeriodo = (periodo) => {
    const hoy = new Date();
    let inicio, fin;
    
    switch (periodo) {
      case 'hoy':
        inicio = fin = hoy.toISOString().split('T')[0];
        break;
      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        inicio = inicioSemana.toISOString().split('T')[0];
        fin = hoy.toISOString().split('T')[0];
        break;
      case 'mes':
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        fin = hoy.toISOString().split('T')[0];
        break;
      default:
        return;
    }
    
    setFiltros({ ...filtros, periodo, fechaInicio: inicio, fechaFin: fin });
  };

  // Función para obtener texto del período con fechas reales
  const obtenerTextoPeriodo = () => {
    const opciones = { day: '2-digit', month: 'long', year: 'numeric' };
    const fechaInicioFormateada = new Date(filtros.fechaInicio + 'T00:00:00').toLocaleDateString('es-BO', opciones);
    const fechaFinFormateada = new Date(filtros.fechaFin + 'T00:00:00').toLocaleDateString('es-BO', opciones);
    
    if (filtros.fechaInicio === filtros.fechaFin) {
      return fechaInicioFormateada;
    }
    return `${fechaInicioFormateada} - ${fechaFinFormateada}`;
  };

  const productosFiltrados = [...productos].sort((a, b) => {
    return ordenAscendente 
      ? parseFloat(a.ganancia_total) - parseFloat(b.ganancia_total)
      : parseFloat(b.ganancia_total) - parseFloat(a.ganancia_total);
  });

  const limpiarFiltros = () => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setFiltros({
      periodo: 'mes',
      fechaInicio: inicioMes.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0]
    });
  };

  const exportarPDF = async () => {
    setExportando(true);
    try {
      // Usar fechas reales en el PDF
      const periodoTexto = obtenerTextoPeriodo();

      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Rentabilidad - Don Baraton</title>
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
            .positivo { color: #2e7d32; font-weight: bold; }
            .negativo { color: #c62828; font-weight: bold; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 11px; color: #666; text-align: center; }
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
            <h2>Reporte de Rentabilidad por Producto</h2>
            <p>Período: ${periodoTexto} | Generado: ${new Date().toLocaleDateString('es-BO')} ${new Date().toLocaleTimeString('es-BO')}</p>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-value">${stats.totalProductos}</div>
              <div class="stat-label">Productos Analizados</div>
            </div>
            <div class="stat">
              <div class="stat-value">${stats.unidadesVendidas}</div>
              <div class="stat-label">Unidades Vendidas</div>
            </div>
            <div class="stat">
              <div class="stat-value" style="color:#2e7d32">Bs ${stats.gananciaTotal.toFixed(2)}</div>
              <div class="stat-label">Ganancia Total</div>
            </div>
          </div>

          <h3 style="margin-bottom: 10px;">Detalle de Rentabilidad por Producto</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th style="text-align:right">Costo</th>
                <th style="text-align:right">Venta</th>
                <th style="text-align:right">Margen</th>
                <th style="text-align:center">Vendidos</th>
                <th style="text-align:right">Ganancia Total</th>
              </tr>
            </thead>
            <tbody>
              ${productosFiltrados.map((p, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${p.producto || 'Sin nombre'}</td>
                  <td style="text-align:right">Bs ${parseFloat(p.precio_costo || 0).toFixed(2)}</td>
                  <td style="text-align:right">Bs ${parseFloat(p.precio_venta || 0).toFixed(2)}</td>
                  <td style="text-align:right" class="${parseFloat(p.margen_unitario) >= 0 ? 'positivo' : 'negativo'}">Bs ${parseFloat(p.margen_unitario || 0).toFixed(2)}</td>
                  <td style="text-align:center">${p.cantidad_vendida || 0}</td>
                  <td style="text-align:right" class="${parseFloat(p.ganancia_total) >= 0 ? 'positivo' : 'negativo'}">Bs ${parseFloat(p.ganancia_total || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #e8f5e9; font-weight: bold;">
                <td colspan="5" style="text-align: right;">TOTAL GANANCIA:</td>
                <td style="text-align:center">${stats.unidadesVendidas}</td>
                <td style="text-align:right" class="positivo">Bs ${stats.gananciaTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

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
            <TrendingUp size={28} style={{ marginRight: '12px' }} />
            Reporte de Rentabilidad
          </h1>
          <p style={styles.subtitle}>
            Análisis de margen de ganancia por producto • {productosFiltrados.length} productos
          </p>
        </div>
        <button 
          style={styles.exportButton} 
          onClick={exportarPDF}
          disabled={exportando || productosFiltrados.length === 0}
        >
          {exportando ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generando...</>
          ) : (
            <><FileDown size={18} /> Exportar PDF</>
          )}
        </button>
      </header>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={{...styles.statCard, borderTop: '4px solid #1a5d1a'}}>
          <Package size={32} style={{ color: '#1a5d1a' }} />
          <div>
            <span style={styles.statValue}>{stats.totalProductos}</span>
            <span style={styles.statLabel}>Productos Analizados</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #1565c0'}}>
          <ShoppingBag size={32} style={{ color: '#1565c0' }} />
          <div>
            <span style={{...styles.statValue, color: '#1565c0'}}>{stats.unidadesVendidas}</span>
            <span style={styles.statLabel}>Unidades Vendidas</span>
          </div>
        </div>

        <div style={{...styles.statCard, borderTop: '4px solid #2e7d32'}}>
          <DollarSign size={32} style={{ color: '#2e7d32' }} />
          <div>
            <span style={{...styles.statValue, color: '#2e7d32'}}>{formatCurrency(stats.gananciaTotal)}</span>
            <span style={styles.statLabel}>Ganancia Total</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filtersCard}>
        <h3 style={styles.filtersTitle}>
          <Calendar size={18} /> Filtros de Período
        </h3>
        <div style={styles.filtersRow}>
          <div style={styles.periodButtons}>
            {[
              { key: 'hoy', label: 'Hoy' },
              { key: 'semana', label: 'Esta Semana' },
              { key: 'mes', label: 'Este Mes' }
            ].map(p => (
              <button
                key={p.key}
                style={{
                  ...styles.periodButton,
                  ...(filtros.periodo === p.key ? styles.periodButtonActive : {})
                }}
                onClick={() => aplicarFiltrosPeriodo(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Desde:</label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({...filtros, periodo: 'personalizado', fechaInicio: e.target.value})}
              style={styles.input}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Hasta:</label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({...filtros, periodo: 'personalizado', fechaFin: e.target.value})}
              style={styles.input}
            />
          </div>
          <button 
            style={{
              ...styles.periodButton,
              background: ordenAscendente ? '#fff3e0' : '#e8f5e9',
              color: ordenAscendente ? '#e65100' : '#2e7d32'
            }} 
            onClick={() => setOrdenAscendente(!ordenAscendente)}
          >
            {ordenAscendente ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {ordenAscendente ? 'Menor ganancia' : 'Mayor ganancia'}
          </button>
          <button style={styles.clearButton} onClick={limpiarFiltros}>
            Limpiar
          </button>
        </div>
        <div style={{marginTop: '10px', fontSize: '13px', color: '#1a5d1a', fontWeight: '500'}}>
          📅 Período: {obtenerTextoPeriodo()}
        </div>
      </div>

      {/* Tabla */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>
            Rentabilidad por Producto ({productosFiltrados.length} productos)
          </h3>
          <button style={styles.refreshButton} onClick={cargarDatos} disabled={loading}>
            <Loader2 size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando datos...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <TrendingUp size={48} style={{ color: '#ccc' }} />
            <p>No hay datos de rentabilidad para mostrar</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Producto</th>
                <th style={{...styles.th, textAlign: 'right'}}>Precio Costo</th>
                <th style={{...styles.th, textAlign: 'right'}}>Precio Venta</th>
                <th style={{...styles.th, textAlign: 'right'}}>Margen Unitario</th>
                <th style={{...styles.th, textAlign: 'center'}}>Vendidos</th>
                <th style={{...styles.th, textAlign: 'right'}}>Ganancia Total</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto, index) => (
                <tr key={`prod-${index}`} style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}><strong>{producto.producto || 'Sin nombre'}</strong></td>
                  <td style={{...styles.td, textAlign: 'right'}}>{formatCurrency(producto.precio_costo)}</td>
                  <td style={{...styles.td, textAlign: 'right'}}>{formatCurrency(producto.precio_venta)}</td>
                  <td style={{...styles.td, textAlign: 'right', color: parseFloat(producto.margen_unitario) >= 0 ? '#2e7d32' : '#c62828', fontWeight: '600'}}>
                    {formatCurrency(producto.margen_unitario)}
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>{producto.cantidad_vendida || 0}</td>
                  <td style={{...styles.td, textAlign: 'right', color: parseFloat(producto.ganancia_total) >= 0 ? '#2e7d32' : '#c62828', fontWeight: '700'}}>
                    {formatCurrency(producto.ganancia_total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={styles.tfootRow}>
                <td colSpan="5" style={{...styles.td, textAlign: 'right', fontWeight: '600'}}>
                  TOTAL:
                </td>
                <td style={{...styles.td, textAlign: 'center', fontWeight: '600'}}>{stats.unidadesVendidas}</td>
                <td style={{...styles.td, textAlign: 'right', fontWeight: '700', color: '#2e7d32', fontSize: '16px'}}>
                  {formatCurrency(stats.gananciaTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

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
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  statValue: { display: 'block', fontSize: '26px', fontWeight: '700', color: '#1a5d1a' },
  statLabel: { fontSize: '13px', color: '#6c757d' },
  filtersCard: { background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  filtersTitle: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#333' },
  filtersRow: { display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' },
  periodButtons: { display: 'flex', gap: '5px', marginRight: '20px' },
  periodButton: { padding: '8px 16px', border: '2px solid #e9ecef', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#6c757d', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px' },
  periodButtonActive: { background: '#1a5d1a', color: 'white', borderColor: '#1a5d1a' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  filterLabel: { fontSize: '13px', fontWeight: '500', color: '#6c757d' },
  input: { padding: '10px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  clearButton: { padding: '10px 20px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
  tableContainer: { background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '25px' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e9ecef' },
  tableTitle: { margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' },
  refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', color: '#495057', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px 15px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '12px 15px', fontSize: '13px', color: '#495057' },
  tfootRow: { background: '#e8f5e9' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
};

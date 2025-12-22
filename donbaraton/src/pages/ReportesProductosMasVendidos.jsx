// src/pages/ReportesProductosMasVendidos.jsx
// REP-01: Reporte de Productos Más Vendidos
import { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, Search, Loader2, FileDown,
  Package, DollarSign, Award, Filter, X, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import logo from '../logo/images.jpg';

export default function ReportesProductosMasVendidos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros de período
  const [periodoTipo, setPeriodoTipo] = useState('mes'); // dia, mes, rango
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [limite, setLimite] = useState(50);

  useEffect(() => {
    aplicarFiltroRapido('mes');
  }, []);

  const aplicarFiltroRapido = (tipo) => {
    const hoy = new Date();
    // Función helper para formatear fecha local como YYYY-MM-DD
    const formatLocalDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    let inicio, fin;
    
    switch (tipo) {
      case 'dia':
        inicio = fin = formatLocalDate(hoy);
        break;
      case 'semana':
        // Últimos 7 días (hoy - 6 días = 7 días en total)
        const hace7Dias = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 6);
        inicio = formatLocalDate(hace7Dias);
        fin = formatLocalDate(hoy);
        break;
      case 'mes':
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        inicio = formatLocalDate(inicioMes);
        fin = formatLocalDate(hoy);
        break;
      default:
        return;
    }
    
    console.log(`📆 Productos Más Vendidos ${tipo}: ${inicio} a ${fin}`);
    setPeriodoTipo(tipo);
    setFechaInicio(inicio);
    setFechaFin(fin);
    cargarDatos(inicio, fin);
  };

  const cargarDatos = async (inicio = fechaInicio, fin = fechaFin) => {
    if (!inicio || !fin) {
      toast.error('Seleccione un período');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_productos_mas_vendidos', {
        p_fecha_inicio: inicio,
        p_fecha_fin: fin,
        p_limite: limite
      });
      
      if (error) throw error;
      setProductos(data || []);
      
      if (data?.length === 0) {
        toast('No hay ventas en el período seleccionado', { icon: '📊' });
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const estadisticas = {
    totalProductos: productosFiltrados.length,
    totalUnidades: productosFiltrados.reduce((sum, p) => sum + parseInt(p.cantidad_vendida || 0), 0),
    totalMonto: productosFiltrados.reduce((sum, p) => sum + parseFloat(p.monto_generado || 0), 0)
  };

  const formatCurrency = (value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value || 0);

  const getMedalStyle = (pos) => {
    if (pos === 1) return { bg: '#FFD700', color: '#000' };
    if (pos === 2) return { bg: '#C0C0C0', color: '#000' };
    if (pos === 3) return { bg: '#CD7F32', color: '#fff' };
    return { bg: '#f5f5f5', color: '#666' };
  };

  const exportarPDF = () => {
    const printWindow = window.open('', '_blank');
    const fecha = new Date().toLocaleDateString('es-BO');
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Productos Más Vendidos</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a5d1a; padding-bottom: 15px; }
          .header img { width: 60px; height: 60px; }
          .header h1 { color: #1a5d1a; margin: 10px 0 5px; font-size: 18px; }
          .periodo { text-align: center; margin-bottom: 15px; padding: 10px; background: #e8f5e9; border-radius: 5px; }
          .resumen { display: flex; justify-content: space-around; margin: 15px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
          .resumen-item { text-align: center; }
          .resumen-valor { font-size: 20px; font-weight: bold; color: #1a5d1a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #1a5d1a; color: white; padding: 10px; text-align: left; font-size: 11px; }
          td { padding: 10px; border-bottom: 1px solid #ddd; font-size: 11px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .pos { font-weight: bold; text-align: center; }
          .top1 { background: #FFD700; }
          .top2 { background: #C0C0C0; }
          .top3 { background: #CD7F32; color: white; }
          .monto { color: #1a5d1a; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logo}" alt="Logo" />
          <h1>DON BARATÓN - Productos Más Vendidos</h1>
          <p>Generado: ${fecha}</p>
        </div>
        
        <div class="periodo">
          <strong>Período:</strong> ${fechaInicio && fechaFin ? 
            (fechaInicio === fechaFin 
              ? new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })
              : new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }) + ' - ' + new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })
            )
          : 'Sin período seleccionado'}
        </div>
        
        <div class="resumen">
          <div class="resumen-item">
            <span class="resumen-valor">${estadisticas.totalProductos}</span><br>Productos
          </div>
          <div class="resumen-item">
            <span class="resumen-valor">${estadisticas.totalUnidades.toLocaleString()}</span><br>Unidades Vendidas
          </div>
          <div class="resumen-item">
            <span class="resumen-valor">${formatCurrency(estadisticas.totalMonto)}</span><br>Monto Total
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width:50px">Pos.</th>
              <th>Producto</th>
              <th>Código</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Monto Generado</th>
              <th>Ticket Prom.</th>
            </tr>
          </thead>
          <tbody>
    `;

    productosFiltrados.forEach((p, i) => {
      const topClass = p.posicion === 1 ? 'top1' : p.posicion === 2 ? 'top2' : p.posicion === 3 ? 'top3' : '';
      html += `
        <tr>
          <td class="pos ${topClass}">#${p.posicion}</td>
          <td><strong>${p.nombre}</strong></td>
          <td>${p.codigo || '-'}</td>
          <td>${p.categoria || '-'}</td>
          <td><strong>${parseInt(p.cantidad_vendida).toLocaleString()}</strong></td>
          <td class="monto">${formatCurrency(p.monto_generado)}</td>
          <td>${formatCurrency(p.ticket_promedio)}</td>
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
            <TrendingUp size={28} style={{ marginRight: '12px' }} />
            Productos Más Vendidos
          </h1>
          <p style={styles.subtitle}>
            REP-01 • Ranking de productos por cantidad vendida
          </p>
        </div>
        <button 
          style={styles.exportButton} 
          onClick={exportarPDF}
          disabled={productosFiltrados.length === 0}
        >
          <FileDown size={18} /> Exportar PDF
        </button>
      </header>

      {/* Filtros de período rápido */}
      <div style={styles.filtrosRapidos}>
        {['dia', 'semana', 'mes'].map(tipo => (
          <button
            key={tipo}
            style={{
              ...styles.filtroBtn,
              ...(periodoTipo === tipo ? styles.filtroBtnActivo : {})
            }}
            onClick={() => aplicarFiltroRapido(tipo)}
          >
            {tipo === 'dia' ? 'Hoy' : tipo === 'semana' ? 'Semana' : 'Este Mes'}
          </button>
        ))}
      </div>

      {/* Filtros personalizados */}
      <div style={styles.filtrosContainer}>
        <div style={styles.filtroGroup}>
          <label style={styles.filtroLabel}>
            <Calendar size={14} /> Fecha Inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => { setFechaInicio(e.target.value); setPeriodoTipo('rango'); }}
            style={styles.input}
          />
        </div>
        <div style={styles.filtroGroup}>
          <label style={styles.filtroLabel}>
            <Calendar size={14} /> Fecha Fin
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => { setFechaFin(e.target.value); setPeriodoTipo('rango'); }}
            style={styles.input}
          />
        </div>
        <div style={styles.filtroGroup}>
          <label style={styles.filtroLabel}>
            <Filter size={14} /> Límite
          </label>
          <select value={limite} onChange={(e) => setLimite(parseInt(e.target.value))} style={styles.select}>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
          </select>
        </div>
        <button style={styles.buscarBtn} onClick={() => cargarDatos()}>
          <RefreshCw size={16} /> Consultar
        </button>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsCards}>
        <div style={styles.statCard}>
          <Package size={24} style={{ color: '#1a5d1a' }} />
          <div>
            <span style={styles.statValor}>{estadisticas.totalProductos}</span>
            <span style={styles.statLabel}>Productos</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <Award size={24} style={{ color: '#e65100' }} />
          <div>
            <span style={styles.statValor}>{estadisticas.totalUnidades.toLocaleString()}</span>
            <span style={styles.statLabel}>Unidades Vendidas</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <DollarSign size={24} style={{ color: '#2e7d32' }} />
          <div>
            <span style={styles.statValor}>{formatCurrency(estadisticas.totalMonto)}</span>
            <span style={styles.statLabel}>Monto Total Generado</span>
          </div>
        </div>
      </div>

      {/* Buscador */}
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
      </div>

      {/* Tabla de ranking */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
            <p>Cargando ranking...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div style={styles.emptyState}>
            <Package size={48} style={{ color: '#ccc' }} />
            <p>No hay datos para el período seleccionado</p>
            <p style={{ fontSize: '13px', color: '#999' }}>Seleccione un período y presione "Consultar"</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '80px', textAlign: 'center' }}>Posición</th>
                <th style={styles.th}>Producto</th>
                <th style={styles.th}>Código</th>
                <th style={styles.th}>Categoría</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Cantidad</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Monto Generado</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Ticket Prom.</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto, i) => {
                const medal = getMedalStyle(producto.posicion);
                return (
                  <tr key={i} style={styles.tr}>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={{
                        ...styles.posicionBadge,
                        background: medal.bg,
                        color: medal.color
                      }}>
                        #{producto.posicion}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>{producto.nombre}</strong>
                    </td>
                    <td style={styles.td}>{producto.codigo || '-'}</td>
                    <td style={styles.td}>
                      <span style={styles.categoriaBadge}>{producto.categoria}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#e65100' }}>
                      {parseInt(producto.cantidad_vendida).toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '700', color: '#1a5d1a' }}>
                      {formatCurrency(producto.monto_generado)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#6c757d' }}>
                      {formatCurrency(producto.ticket_promedio)}
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
  exportButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  
  // Filtros rápidos
  filtrosRapidos: { display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' },
  filtroBtn: { padding: '10px 18px', background: 'white', border: '2px solid #e9ecef', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', color: '#6c757d' },
  filtroBtnActivo: { background: '#e8f5e9', borderColor: '#1a5d1a', color: '#1a5d1a' },
  
  // Filtros container
  filtrosContainer: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end', padding: '15px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  filtroGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  filtroLabel: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#6c757d', fontWeight: '500' },
  input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', minWidth: '150px' },
  select: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', background: 'white' },
  buscarBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  
  // Stats
  statsCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  statValor: { display: 'block', fontSize: '24px', fontWeight: '700', color: '#1a5d1a' },
  statLabel: { fontSize: '13px', color: '#6c757d' },
  
  // Toolbar
  toolbar: { display: 'flex', gap: '12px', marginBottom: '20px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 15px', background: 'white', border: '1px solid #e9ecef', borderRadius: '10px', flex: 1, maxWidth: '400px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
  
  // Tabla
  tableContainer: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th: { padding: '15px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '12px 15px', fontSize: '13px', color: '#495057' },
  posicionBadge: { display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' },
  categoriaBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '11px', background: '#e3f2fd', color: '#1565c0' },
  
  // Estados
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', color: '#6c757d', gap: '10px' }
};

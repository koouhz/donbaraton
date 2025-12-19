// src/pages/ReportesVentas.jsx
import { useState, useEffect } from 'react';
import { 
  FileBarChart, Calendar, Package, Eye, X,
  Loader2, TrendingUp, DollarSign, ShoppingCart, FileDown, 
  ArrowUp, ArrowDown, Users, RotateCcw
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import logo from '../logo/images.jpg';

export default function ReportesVentas() {
  const [ventas, setVentas] = useState([]);
  const [reporteResumen, setReporteResumen] = useState([]);
  const [productosTop, setProductosTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [detalleVenta, setDetalleVenta] = useState([]);
  const [exportando, setExportando] = useState(false);
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  const [devoluciones, setDevoluciones] = useState([]);
  const [cajeros, setCajeros] = useState([]);
  const [cajeroFiltro, setCajeroFiltro] = useState('');
  const [cajeroSearchText, setCajeroSearchText] = useState('');
  const [showCajeroDropdown, setShowCajeroDropdown] = useState(false);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    periodo: 'mes',
    fechaInicio: (() => {
      const d = new Date();
      d.setDate(1);
      return d.toISOString().split('T')[0];
    })(),
    fechaFin: new Date().toISOString().split('T')[0]
  });

  // Estadísticas
  const [stats, setStats] = useState({
    totalVentas: 0,
    cantidadTickets: 0,
    promedioTicket: 0,
    totalDevoluciones: 0,
    ventasNetas: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  // Recargar al cambiar filtros de fechas o cajero
  useEffect(() => {
    if (filtros.fechaInicio && filtros.fechaFin) {
      cargarDatos();
    }
  }, [filtros.fechaInicio, filtros.fechaFin, cajeroFiltro]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar usuarios para el filtro de cajero - SOLO ROL CAJERO
      const cajerosRes = await supabase.rpc('fn_listar_usuarios');
      if (!cajerosRes.error) {
        // Filtrar solo usuarios activos con rol de Cajero (exacto)
        const cajerosFiltrados = (cajerosRes.data || []).filter(u => 
          u.estado === 'ACTIVO' && 
          u.rol_nombre?.toUpperCase() === 'CAJERO'
        );
        setCajeros(cajerosFiltrados);
      }

      // Cargar ventas usando fn_leer_ventas_cajero (incluye nombre del cajero)
      // Retorna: id, fecha, cliente, cajero, comprobante, total, estado
      const ventasRes = await supabase.rpc('fn_leer_ventas_cajero', {
        p_fecha_inicio: filtros.fechaInicio,
        p_fecha_fin: filtros.fechaFin,
        p_id_usuario: cajeroFiltro || null
      });
      
      // Cargar devoluciones de ventas - FILTRAR POR CAJERO TAMBIÉN
      const devRes = await supabase.rpc('fn_leer_devoluciones_ventas', {
        p_fecha_inicio: filtros.fechaInicio,
        p_fecha_fin: filtros.fechaFin,
        p_id_usuario: cajeroFiltro || null // Filtrar por cajero
      });
      
      const devolucionesData = devRes.error ? [] : (devRes.data || []);
      setDevoluciones(devolucionesData);
      
      if (ventasRes.error) {
        console.error('Error cargando ventas:', ventasRes.error);
        toast.error('Error al cargar ventas');
      } else {
        setVentas(ventasRes.data || []);
        // Pasar devoluciones para calcular ventas netas
        calcularEstadisticas(ventasRes.data || [], devolucionesData);
      }

      // Cargar resumen por día
      const resumenRes = await supabase.rpc('fn_reporte_ventas_periodo', {
        p_fecha_inicio: filtros.fechaInicio,
        p_fecha_fin: filtros.fechaFin
      });
      if (!resumenRes.error) {
        setReporteResumen(resumenRes.data || []);
      }

    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (data, devolucionesData = []) => {
    const total = data.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
    const cantidad = data.length;
    // Usar total_devuelto en lugar de total_venta para el cálculo exacto
    const totalDev = devolucionesData.reduce((sum, d) => sum + parseFloat(d.total_devuelto || d.total_venta || 0), 0);
    
    setStats({
      totalVentas: total,
      cantidadTickets: cantidad,
      promedioTicket: cantidad > 0 ? total / cantidad : 0,
      totalDevoluciones: totalDev,
      ventasNetas: total - totalDev
    });
  };

  // Aplicar filtros de período
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

  // Ordenar ventas
  const ventasFiltradas = [...ventas].sort((a, b) => {
    const fechaA = new Date(a.fecha);
    const fechaB = new Date(b.fecha);
    return ordenAscendente ? fechaA - fechaB : fechaB - fechaA;
  });

  const limpiarFiltros = () => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setFiltros({
      periodo: 'mes',
      fechaInicio: inicioMes.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0]
    });
    setCajeroFiltro('');
    setCajeroSearchText('');
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

  const openDetalleModal = async (venta) => {
    setVentaSeleccionada(venta);
    setShowDetalleModal(true);
    setDetalleVenta([]); // Limpiar detalle anterior
    
    // Intentar cargar detalle de la venta (si existe la función)
    try {
      const { data, error } = await supabase.rpc('fn_obtener_detalle_venta', {
        p_id_venta: venta.id
      });
      if (!error && data) {
        setDetalleVenta(data);
      }
    } catch (err) {
      // Si la función no existe, no mostrar error
      console.log('Detalle no disponible');
    }
  };

  // Exportar a PDF
  const exportarPDF = async () => {
    setExportando(true);
    try {
      // Usar fechas reales en el PDF
      const periodoTexto = obtenerTextoPeriodo();

      const totalFiltrado = ventasFiltradas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);

      // Cargar detalles de cada venta (máximo 50 para no sobrecargar)
      toast.loading('Cargando detalles de productos...');
      const ventasConDetalle = [];
      const ventasParaPDF = ventasFiltradas.slice(0, 50);
      
      for (const venta of ventasParaPDF) {
        try {
          const { data } = await supabase.rpc('fn_obtener_detalle_venta', {
            p_id_venta: venta.id
          });
          ventasConDetalle.push({
            ...venta,
            productos: data || []
          });
        } catch {
          ventasConDetalle.push({
            ...venta,
            productos: []
          });
        }
      }
      toast.dismiss();

      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Ventas - Don Baraton</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #fff; color: #333; }
            .header { display: flex; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #1a5d1a; }
            .logo { width: 80px; height: 80px; margin-right: 20px; border-radius: 10px; }
            .empresa { flex: 1; }
            .empresa h1 { color: #1a5d1a; font-size: 28px; margin-bottom: 5px; }
            .empresa p { color: #666; font-size: 14px; }
            .titulo-reporte { background: linear-gradient(135deg, #1a5d1a, #2e8b57); color: white; padding: 15px 25px; border-radius: 10px; margin-bottom: 25px; }
            .titulo-reporte h2 { font-size: 20px; margin-bottom: 5px; }
            .titulo-reporte p { font-size: 12px; opacity: 0.9; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
            .stat { background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center; border-left: 4px solid #1a5d1a; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1a5d1a; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            .venta-card { background: #f8f9fa; border-radius: 10px; padding: 15px; margin-bottom: 15px; border-left: 4px solid #1a5d1a; page-break-inside: avoid; }
            .venta-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .venta-id { font-weight: bold; color: #1a5d1a; }
            .venta-total { font-weight: bold; color: #2e7d32; font-size: 16px; }
            .venta-info { font-size: 12px; color: #666; margin-bottom: 10px; }
            .productos-table { width: 100%; border-collapse: collapse; font-size: 11px; }
            .productos-table th { background: #e8f5e9; padding: 8px; text-align: left; }
            .productos-table td { padding: 8px; border-bottom: 1px solid #e9ecef; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 11px; color: #666; text-align: center; }
            .top-productos { margin-top: 30px; page-break-before: always; }
            .top-productos h3 { margin-bottom: 15px; color: #1a5d1a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #1a5d1a; color: white; padding: 10px; text-align: left; font-size: 12px; }
            td { padding: 10px; border-bottom: 1px solid #e9ecef; font-size: 11px; }
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
            <h2>Reporte Detallado de Ventas</h2>
            <p>Período: ${periodoTexto} | Generado: ${new Date().toLocaleDateString('es-BO')} ${new Date().toLocaleTimeString('es-BO')}</p>
          </div>

          <div class="stats">
            <div class="stat">
              <div class="stat-value">${ventasFiltradas.length}</div>
              <div class="stat-label">Tickets Emitidos</div>
            </div>
            <div class="stat">
              <div class="stat-value">Bs ${totalFiltrado.toFixed(2)}</div>
              <div class="stat-label">Total Bruto</div>
            </div>
            <div class="stat" style="border-left-color: #c62828;">
              <div class="stat-value" style="color: #c62828;">- Bs ${stats.totalDevoluciones.toFixed(2)}</div>
              <div class="stat-label">Devoluciones</div>
            </div>
            <div class="stat" style="border-left-color: #1565c0;">
              <div class="stat-value" style="color: #1565c0; font-size: 28px;">Bs ${stats.ventasNetas.toFixed(2)}</div>
              <div class="stat-label">VENTAS NETAS</div>
            </div>
          </div>

          <h3 style="margin-bottom: 15px;">Detalle de Ventas (${ventasConDetalle.length} de ${ventasFiltradas.length})</h3>
          
          ${ventasConDetalle.map(v => `
            <div class="venta-card">
              <div class="venta-header">
                <span class="venta-id">${v.id || '-'}</span>
                <span class="venta-total">Bs ${parseFloat(v.total || 0).toFixed(2)}</span>
              </div>
              <div class="venta-info">
                Fecha: ${formatDateTime(v.fecha)} | Cliente: ${v.cliente || 'Cliente General'} | Cajero: ${v.cajero || 'Sin asignar'} | ${v.comprobante || 'TICKET'}
              </div>
              ${v.productos && v.productos.length > 0 ? `
                <table class="productos-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th style="text-align:center">Cant.</th>
                      <th style="text-align:right">Precio</th>
                      <th style="text-align:right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${v.productos.map(p => `
                      <tr>
                        <td>${p.nombre || 'Producto'}</td>
                        <td style="text-align:center">${p.cantidad}</td>
                        <td style="text-align:right">Bs ${parseFloat(p.precio_unitario || 0).toFixed(2)}</td>
                        <td style="text-align:right">Bs ${parseFloat(p.subtotal || 0).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : '<p style="font-size:11px; color:#999;">Sin detalle de productos</p>'}
            </div>
          `).join('')}

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
  const formatDateTime = (datetime) => {
    if (!datetime) return '-';
    const d = new Date(datetime);
    return `${d.toLocaleDateString('es-BO')} ${d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FileBarChart size={28} style={{ marginRight: '12px' }} />
            Reportes de Ventas
          </h1>
          <p style={styles.subtitle}>
            Historial y estadísticas de ventas • {ventasFiltradas.length} registros
          </p>
        </div>
        <button 
          style={styles.exportButton} 
          onClick={exportarPDF}
          disabled={exportando || ventasFiltradas.length === 0}
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
          <ShoppingCart size={32} style={{ color: '#1a5d1a' }} />
          <div>
            <span style={styles.statValue}>{stats.cantidadTickets}</span>
            <span style={styles.statLabel}>Tickets Emitidos</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #2e7d32'}}>
          <DollarSign size={32} style={{ color: '#2e7d32' }} />
          <div>
            <span style={{...styles.statValue, color: '#2e7d32'}}>{formatCurrency(stats.totalVentas)}</span>
            <span style={styles.statLabel}>Total Bruto</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #c62828'}}>
          <TrendingUp size={32} style={{ color: '#c62828' }} />
          <div>
            <span style={{...styles.statValue, color: '#c62828'}}>- {formatCurrency(stats.totalDevoluciones)}</span>
            <span style={styles.statLabel}>Devoluciones</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #1565c0'}}>
          <DollarSign size={32} style={{ color: '#1565c0' }} />
          <div>
            <span style={{...styles.statValue, color: '#1565c0', fontSize: '28px'}}>{formatCurrency(stats.ventasNetas)}</span>
            <span style={styles.statLabel}>VENTAS NETAS</span>
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
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Cajero:</label>
            <div style={{position: 'relative'}}>
              <input
                type="text"
                value={cajeroSearchText}
                onChange={(e) => {
                  setCajeroSearchText(e.target.value);
                  setShowCajeroDropdown(true);
                  if (!e.target.value) {
                    setCajeroFiltro('');
                  }
                }}
                onFocus={() => setShowCajeroDropdown(true)}
                placeholder="Buscar cajero..."
                style={{...styles.input, minWidth: '200px'}}
              />
              {showCajeroDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  background: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 100
                }}>
                  <div
                    style={{
                      padding: '10px 15px',
                      cursor: 'pointer',
                      background: !cajeroFiltro ? '#e8f5e9' : 'white',
                      borderBottom: '1px solid #e9ecef'
                    }}
                    onClick={() => {
                      setCajeroFiltro('');
                      setCajeroSearchText('');
                      setShowCajeroDropdown(false);
                    }}
                  >
                    <strong>Todas las cajas</strong>
                  </div>
                  {cajeros
                    .filter(c => {
                      const searchLower = cajeroSearchText.toLowerCase();
                      const nombre = (c.empleado_nombre || c.username || '').toLowerCase();
                      return nombre.includes(searchLower);
                    })
                    .slice(0, 10)
                    .map(c => (
                      <div
                        key={c.id_usuario}
                        style={{
                          padding: '10px 15px',
                          cursor: 'pointer',
                          background: cajeroFiltro === c.id_usuario ? '#e8f5e9' : 'white',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                        onClick={() => {
                          setCajeroFiltro(c.id_usuario);
                          setCajeroSearchText(c.empleado_nombre || c.username);
                          setShowCajeroDropdown(false);
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.background = cajeroFiltro === c.id_usuario ? '#e8f5e9' : 'white'}
                      >
                        <div style={{fontWeight: '500'}}>{c.empleado_nombre || c.username}</div>
                        <div style={{fontSize: '11px', color: '#666'}}>{c.rol_nombre || 'Usuario'}</div>
                      </div>
                    ))}
                </div>
              )}
              {showCajeroDropdown && (
                <div
                  style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99}}
                  onClick={() => setShowCajeroDropdown(false)}
                />
              )}
            </div>
          </div>
          <button 
            style={{
              ...styles.periodButton,
              background: ordenAscendente ? '#e8f5e9' : '#fff3e0',
              color: ordenAscendente ? '#2e7d32' : '#e65100'
            }} 
            onClick={() => setOrdenAscendente(!ordenAscendente)}
            title={ordenAscendente ? 'Orden Ascendente' : 'Orden Descendente'}
          >
            {ordenAscendente ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {ordenAscendente ? 'Antiguo primero' : 'Reciente primero'}
          </button>
          <button style={styles.clearButton} onClick={limpiarFiltros}>
            Limpiar
          </button>
        </div>
        <div style={{marginTop: '10px', fontSize: '13px', color: '#1a5d1a', fontWeight: '500'}}>
          📅 Período: {obtenerTextoPeriodo()}
        </div>
      </div>

      {/* Tabla de ventas */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>
            Historial de Ventas ({ventasFiltradas.length} registros)
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
        ) : ventasFiltradas.length === 0 ? (
          <div style={styles.emptyState}>
            <FileBarChart size={48} style={{ color: '#ccc' }} />
            <p>No hay ventas para mostrar</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID Venta</th>
                <th style={styles.th}>Fecha/Hora</th>
                <th style={styles.th}>Cliente</th>
                <th style={styles.th}>Cajero</th>
                <th style={styles.th}>Comprobante</th>
                <th style={styles.th}>Total</th>
                <th style={{...styles.th, textAlign: 'center'}}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map((venta, index) => (
                <tr key={venta.id || `venta-${index}`} style={styles.tr}>
                  <td style={styles.td}><strong>{venta.id || '-'}</strong></td>
                  <td style={styles.td}>{formatDateTime(venta.fecha)}</td>
                  <td style={styles.td}>{venta.cliente || 'Cliente General'}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, background: '#e8f5e9', color: '#2e7d32'}}>
                      {venta.cajero || 'Sin asignar'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, background: venta.comprobante?.includes('FACTURA') ? '#e3f2fd' : '#f5f5f5'}}>
                      {venta.comprobante || 'TICKET'}
                    </span>
                  </td>
                  <td style={styles.td}><strong style={{ color: '#1a5d1a' }}>{formatCurrency(venta.total)}</strong></td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <button 
                      style={styles.viewButton} 
                      onClick={() => openDetalleModal(venta)}
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={styles.tfootRow}>
                <td colSpan="6" style={{...styles.td, textAlign: 'right', fontWeight: '600'}}>
                  Total Filtrado:
                </td>
                <td style={{...styles.td, fontWeight: '700', color: '#1a5d1a', fontSize: '16px'}}>
                  {formatCurrency(ventasFiltradas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0))}
                </td>
                <td style={styles.td}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Sección Devoluciones de Ventas - Con campos mejorados */}
      {devoluciones.length > 0 && (
        <div style={{...styles.tableContainer, borderTop: '4px solid #c62828', marginTop: '25px'}}>
          <div style={styles.tableHeader}>
            <h3 style={{...styles.tableTitle, color: '#c62828'}}>
              <RotateCcw size={18} style={{ marginRight: '8px' }} />
              Devoluciones de Ventas ({devoluciones.length} registros) - Total: {formatCurrency(stats.totalDevoluciones)}
            </h3>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, background: '#c62828'}}>ID Devolución</th>
                <th style={{...styles.th, background: '#c62828'}}>Venta</th>
                <th style={{...styles.th, background: '#c62828'}}>Fecha</th>
                <th style={{...styles.th, background: '#c62828'}}>Cliente</th>
                <th style={{...styles.th, background: '#c62828'}}>Realizado por</th>
                <th style={{...styles.th, background: '#c62828', textAlign: 'center'}}>Productos</th>
                <th style={{...styles.th, background: '#c62828'}}>Motivo</th>
                <th style={{...styles.th, background: '#c62828', textAlign: 'right'}}>Total Devuelto</th>
              </tr>
            </thead>
            <tbody>
              {devoluciones.map((dev, index) => (
                <tr key={`dev-${index}`} style={{...styles.tr, background: '#fff5f5'}}>
                  <td style={styles.td}><strong>{dev.id_devolucion}</strong></td>
                  <td style={styles.td}>{dev.id_venta}</td>
                  <td style={styles.td}>{formatDateTime(dev.fecha)}</td>
                  <td style={styles.td}>{dev.cliente || 'Cliente General'}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, background: '#ffebee', color: '#c62828'}}>
                      {dev.usuario_devolucion || 'Sistema'}
                    </span>
                  </td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    {dev.productos_devueltos || 0}
                  </td>
                  <td style={styles.td}>{dev.motivo || '-'}</td>
                  <td style={{...styles.td, textAlign: 'right', color: '#c62828', fontWeight: '700'}}>
                    - {formatCurrency(dev.total_devuelto || dev.total_venta || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{background: '#ffebee'}}>
                <td colSpan="7" style={{...styles.td, textAlign: 'right', fontWeight: '600', color: '#c62828'}}>
                  Total Devoluciones:
                </td>
                <td style={{...styles.td, fontWeight: '700', color: '#c62828', fontSize: '16px', textAlign: 'right'}}>
                  - {formatCurrency(stats.totalDevoluciones)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Modal Detalle */}
      {showDetalleModal && ventaSeleccionada && (
        <div style={styles.modalOverlay} onClick={() => setShowDetalleModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <Eye size={20} /> Detalle de Venta
              </h2>
              <button style={styles.closeButton} onClick={() => setShowDetalleModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.infoCard}>
                <p><strong>Venta:</strong> {ventaSeleccionada.id || '-'}</p>
                <p><strong>Fecha:</strong> {formatDateTime(ventaSeleccionada.fecha)}</p>
                <p><strong>Cliente:</strong> {ventaSeleccionada.cliente || 'Cliente General'}</p>
                <p><strong>Cajero:</strong> {ventaSeleccionada.cajero || 'Sin asignar'}</p>
                <p><strong>Comprobante:</strong> {ventaSeleccionada.comprobante || 'TICKET'}</p>
              </div>

              {detalleVenta.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#1a5d1a' }}>Productos:</h4>
                  <table style={{ width: '100%', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Producto</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Cant.</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Precio</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleVenta.map((item, i) => (
                        <tr key={`det-${i}`} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '8px' }}>{item.nombre || 'Producto'}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>{item.cantidad}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.precio_unitario)}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p style={styles.totalBig}><strong>Total:</strong> {formatCurrency(ventaSeleccionada.total)}</p>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.modalCancelButton} onClick={() => setShowDetalleModal(false)}>
                Cerrar
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
  exportButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 93, 26, 0.3)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '25px' },
  statCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '25px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  statValue: { display: 'block', fontSize: '28px', fontWeight: '700', color: '#1a5d1a' },
  statLabel: { fontSize: '14px', color: '#6c757d' },
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
  th: { padding: '15px 20px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#495057' },
  tfootRow: { background: '#f8f9fa' },
  badge: { display: 'inline-block', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  viewButton: { padding: '8px', background: '#e3f2fd', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#1976d2' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px' },
  topProductosCard: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  topProductosTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1a5d1a' },
  topProductosList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  topProductoItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px' },
  topProductoRank: { width: '35px', height: '35px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' },
  topProductoInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' },
  topProductoCantidad: { fontSize: '12px', color: '#6c757d' },
  topProductoTotal: { fontSize: '16px', fontWeight: '700', color: '#1a5d1a' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a', display: 'flex', alignItems: 'center', gap: '10px' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: '5px', borderRadius: '5px' },
  modalBody: { padding: '25px' },
  infoCard: { padding: '20px', background: '#f8f9fa', borderRadius: '12px' },
  totalBig: { marginTop: '20px', fontSize: '20px', color: '#1a5d1a', padding: '15px', background: '#e8f5e9', borderRadius: '10px', textAlign: 'center' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  modalCancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
};

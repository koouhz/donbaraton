// src/pages/ReportesCompras.jsx
import { useState, useEffect } from 'react';
import { 
  FileBarChart, Calendar, Package, Eye, X,
  Loader2, TrendingUp, DollarSign, ShoppingBag, FileDown, ArrowUp, ArrowDown, RotateCcw
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import logo from '../logo/images.jpg';

export default function ReportesCompras() {
  const [ordenes, setOrdenes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [exportando, setExportando] = useState(false);
  const [ordenAscendente, setOrdenAscendente] = useState(false); // false = desc, true = asc
  const [devoluciones, setDevoluciones] = useState([]);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    periodo: 'mes', // hoy, semana, mes
    fechaInicio: (() => {
      const d = new Date();
      d.setDate(1);
      return d.toISOString().split('T')[0];
    })(),
    fechaFin: new Date().toISOString().split('T')[0],
    proveedor: ''
  });

  // Estadísticas
  const [stats, setStats] = useState({
    totalCompras: 0,
    cantidadOrdenes: 0,
    ordenesRecibidas: 0,
    ordenesPendientes: 0,
    totalDevoluciones: 0,
    comprasNetas: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar órdenes usando SP completo (sin SQL directo)
      const ordenesRes = await supabase.rpc('fn_leer_ordenes_compra_completo', {
        p_estado: null,
        p_fecha_inicio: null,
        p_fecha_fin: null,
        p_id_proveedor: null
      });
      
      if (ordenesRes.error) {
        toast.error('Error al cargar datos');
      } else {
        // fn_leer_ordenes_compra_completo retorna TODOS los campos necesarios
        const ordenesFormateadas = (ordenesRes.data || []).map(o => ({
          id: o.id_orden,
          id_proveedor: o.id_proveedor,
          proveedor: o.proveedor || 'Sin proveedor',
          fecha_emision: o.fecha_emision,
          fecha_entrega: o.fecha_entrega,
          total: o.total,
          estado: o.estado
        }));
        setOrdenes(ordenesFormateadas);

        // Cargar proveedores usando SP
        const provRes = await supabase.rpc('fn_listar_proveedores');
        if (!provRes.error) {
          setProveedores(provRes.data || []);
        }
        
        // Cargar devoluciones a proveedores
        const devRes = await supabase.rpc('fn_leer_devoluciones_proveedor');
        const devolucionesData = devRes.error ? [] : (devRes.data || []);
        setDevoluciones(devolucionesData);
        
        // Calcular estadisticas con devoluciones
        calcularEstadisticas(ordenesFormateadas, devolucionesData);
      }
    } catch (err) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (data, devolucionesData = []) => {
    const totalCompras = data.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const totalDev = devolucionesData.reduce((sum, d) => sum + parseFloat(d.total || 0), 0);
    
    setStats({
      totalCompras,
      cantidadOrdenes: data.length,
      ordenesRecibidas: data.filter(o => o.estado === 'RECIBIDA').length,
      ordenesPendientes: data.filter(o => o.estado === 'PENDIENTE').length,
      totalDevoluciones: totalDev,
      comprasNetas: totalCompras - totalDev
    });
  };

  // Aplicar filtros de período
  const aplicarFiltrosPeriodo = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    switch (filtros.periodo) {
      case 'hoy':
        return {
          inicio: hoy,
          fin: new Date(hoy.getTime() + 24 * 60 * 60 * 1000)
        };
      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        return {
          inicio: inicioSemana,
          fin: new Date(inicioSemana.getTime() + 7 * 24 * 60 * 60 * 1000)
        };
      case 'mes':
        return {
          inicio: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
          fin: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
        };
      default:
        return null;
    }
  };

  // Filtrar y ordenar órdenes
  const ordenesFiltradas = ordenes
    .filter(orden => {
      if (filtros.proveedor && orden.id_proveedor !== filtros.proveedor) return false;
      
      const fechaOrden = new Date(orden.fecha_emision + 'T12:00:00');
      
      // Filtro por período predefinido
      if (filtros.periodo !== 'todos' && filtros.periodo !== 'personalizado') {
        const rango = aplicarFiltrosPeriodo();
        if (rango && (fechaOrden < rango.inicio || fechaOrden > rango.fin)) return false;
      }
      
      // Filtro por fechas personalizadas
      if (filtros.periodo === 'personalizado' || filtros.fechaInicio || filtros.fechaFin) {
        if (filtros.fechaInicio && fechaOrden < new Date(filtros.fechaInicio + 'T00:00:00')) return false;
        if (filtros.fechaFin && fechaOrden > new Date(filtros.fechaFin + 'T23:59:59')) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Ordenar por ID (extraer número del ID como OC-001, OC-002)
      const idA = parseInt((a.id || '').replace(/\D/g, '') || '0');
      const idB = parseInt((b.id || '').replace(/\D/g, '') || '0');
      return ordenAscendente ? idA - idB : idB - idA;
    });

  // Recalcular stats cuando cambian filtros
  useEffect(() => {
    calcularEstadisticas(ordenesFiltradas);
  }, [filtros, ordenes]);

  // Validar rango de fechas
  useEffect(() => {
    if (filtros.fechaInicio && filtros.fechaFin) {
      const desde = new Date(filtros.fechaInicio);
      const hasta = new Date(filtros.fechaFin);
      if (desde > hasta) {
        toast.error('La fecha "Desde" no puede ser mayor que "Hasta"');
      }
    }
  }, [filtros.fechaInicio, filtros.fechaFin]);

  const limpiarFiltros = () => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    setFiltros({ 
      periodo: 'mes', 
      fechaInicio: inicioMes.toISOString().split('T')[0], 
      fechaFin: hoy.toISOString().split('T')[0], 
      proveedor: '' 
    });
  };

  // Función para obtener texto del período con fechas reales
  const obtenerTextoPeriodo = () => {
    const opciones = { day: '2-digit', month: 'long', year: 'numeric' };
    if (filtros.fechaInicio && filtros.fechaFin) {
      const fechaInicioFormateada = new Date(filtros.fechaInicio + 'T00:00:00').toLocaleDateString('es-BO', opciones);
      const fechaFinFormateada = new Date(filtros.fechaFin + 'T00:00:00').toLocaleDateString('es-BO', opciones);
      if (filtros.fechaInicio === filtros.fechaFin) {
        return fechaInicioFormateada;
      }
      return `${fechaInicioFormateada} - ${fechaFinFormateada}`;
    }
    return 'Todas las fechas';
  };

  const openDetalleModal = (orden) => {
    setOrdenSeleccionada(orden);
    setShowDetalleModal(true);
  };

  // Exportar a PDF
  const exportarPDF = async () => {
    setExportando(true);
    try {
      // Usar fechas reales en el PDF
      const periodoTexto = obtenerTextoPeriodo();

      const totalFiltrado = ordenesFiltradas.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

      // Crear contenido HTML para el PDF con diseño profesional
      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Compras - Don Baraton</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
              background: #fff; 
              color: #333; 
              font-size: 11px;
              line-height: 1.4;
            }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            
            /* Header Premium */
            .header { 
              display: flex; 
              align-items: center; 
              justify-content: space-between;
              margin-bottom: 25px; 
              padding-bottom: 20px; 
              border-bottom: 3px solid #1a5d1a;
            }
            .header-left { display: flex; align-items: center; gap: 15px; }
            .logo { width: 70px; height: 70px; border-radius: 10px; object-fit: cover; }
            .empresa h1 { color: #1a5d1a; font-size: 24px; margin-bottom: 3px; }
            .empresa p { color: #666; font-size: 11px; }
            .header-right { text-align: right; }
            .header-right p { font-size: 10px; color: #666; margin-bottom: 2px; }
            
            /* Título */
            .titulo-reporte { 
              background: linear-gradient(135deg, #1a5d1a 0%, #2e8b57 100%); 
              color: white; 
              padding: 18px 25px; 
              border-radius: 12px; 
              margin-bottom: 25px;
              box-shadow: 0 4px 15px rgba(26, 93, 26, 0.3);
            }
            .titulo-reporte h2 { font-size: 18px; margin-bottom: 5px; font-weight: 700; }
            .titulo-reporte p { font-size: 11px; opacity: 0.9; }
            
            /* Stats Grid */
            .stats { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              gap: 12px; 
              margin-bottom: 25px; 
            }
            .stat { 
              background: linear-gradient(145deg, #f8f9fa, #ffffff);
              padding: 18px; 
              border-radius: 12px; 
              text-align: center; 
              border-left: 4px solid #1a5d1a;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }
            .stat-value { font-size: 22px; font-weight: 700; color: #1a5d1a; }
            .stat-label { font-size: 10px; color: #666; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
            
            /* Secciones */
            .seccion {
              background: #fff;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 20px;
              border: 1px solid #e9ecef;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }
            .seccion-titulo {
              font-size: 14px;
              font-weight: 700;
              color: #1a5d1a;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e8f5e9;
            }
            .seccion-titulo.devolucion { color: #c62828; border-bottom-color: #ffebee; }
            
            /* Tablas */
            table { width: 100%; border-collapse: collapse; }
            th { 
              background: linear-gradient(135deg, #1a5d1a, #2e8b57); 
              color: white; 
              padding: 12px 10px; 
              text-align: left; 
              font-size: 10px; 
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            th.devolucion { background: linear-gradient(135deg, #c62828, #e53935); }
            th:first-child { border-radius: 8px 0 0 0; }
            th:last-child { border-radius: 0 8px 0 0; }
            td { 
              padding: 10px; 
              border-bottom: 1px solid #e9ecef; 
              font-size: 10px; 
            }
            tr:nth-child(even) { background: #f8f9fa; }
            tr:hover { background: #e8f5e9; }
            .currency { font-weight: 600; }
            .positive { color: #2e7d32; }
            .negative { color: #c62828; }
            
            tfoot td {
              background: linear-gradient(135deg, #e8f5e9, #f0f9f0);
              font-weight: 700;
              border-top: 2px solid #1a5d1a;
            }
            
            /* Footer */
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 2px solid #e9ecef; 
              text-align: center;
            }
            .footer p { font-size: 9px; color: #999; margin-bottom: 2px; }
            .footer .brand { color: #1a5d1a; font-weight: 600; font-size: 10px; }
            
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .container { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-left">
                <img src="${logo}" class="logo" alt="Logo">
                <div class="empresa">
                  <h1>Don Baraton</h1>
                  <p>Supermercado - Sistema de Gestión</p>
                </div>
              </div>
              <div class="header-right">
                <p><strong>NIT:</strong> 123456789</p>
                <p><strong>Tel:</strong> +591 XXX XXXX</p>
                <p><strong>Dirección:</strong> La Paz, Bolivia</p>
              </div>
            </div>
            
            <div class="titulo-reporte">
              <h2>Reporte de Compras</h2>
              <p>Período: ${periodoTexto} • Generado: ${new Date().toLocaleDateString('es-BO')} ${new Date().toLocaleTimeString('es-BO')}</p>
            </div>

            <div class="stats">
              <div class="stat">
                <div class="stat-value">${ordenesFiltradas.length}</div>
                <div class="stat-label">Órdenes Totales</div>
              </div>
              <div class="stat">
                <div class="stat-value">Bs ${totalFiltrado.toFixed(2)}</div>
                <div class="stat-label">Total en Compras</div>
              </div>
              <div class="stat">
                <div class="stat-value">${ordenesFiltradas.filter(o => o.estado === 'RECIBIDA').length}</div>
                <div class="stat-label">Recibidas</div>
              </div>
              <div class="stat">
                <div class="stat-value" style="color:${devoluciones.length > 0 ? '#c62828' : '#1a5d1a'}">${devoluciones.length}</div>
                <div class="stat-label">Devoluciones</div>
              </div>
            </div>

            <div class="seccion">
              <div class="seccion-titulo">Órdenes de Compra</div>
              <table>
                <thead>
                  <tr>
                    <th>ID Orden</th>
                    <th>Proveedor</th>
                    <th>Fecha Emisión</th>
                    <th>Fecha Entrega</th>
                    <th style="text-align:right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${ordenesFiltradas.map(o => `
                    <tr>
                      <td><strong>${o.id}</strong></td>
                      <td>${o.proveedor}</td>
                      <td>${formatDate(o.fecha_emision)}</td>
                      <td>${formatDate(o.fecha_entrega) || '-'}</td>
                      <td style="text-align:right" class="currency positive"><strong>Bs ${parseFloat(o.total || 0).toFixed(2)}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="text-align:right"><strong>TOTAL:</strong></td>
                    <td style="text-align:right" class="currency positive"><strong>Bs ${totalFiltrado.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            ${devoluciones.length > 0 ? `
            <div class="seccion">
              <div class="seccion-titulo devolucion">Devoluciones a Proveedores</div>
              <table>
                <thead>
                  <tr>
                    <th class="devolucion">ID</th>
                    <th class="devolucion">Fecha</th>
                    <th class="devolucion">Producto</th>
                    <th class="devolucion" style="text-align:center">Cantidad</th>
                    <th class="devolucion">Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  ${devoluciones.map(dev => `
                    <tr style="background:#fff5f5">
                      <td><strong>${dev.id}</strong></td>
                      <td>${formatDate(dev.fecha)}</td>
                      <td>${dev.producto || 'Sin producto'}</td>
                      <td style="text-align:center;color:#c62828;font-weight:700">${dev.cantidad}</td>
                      <td>${dev.motivo || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            <div class="footer">
              <p class="brand">Don Baraton - Sistema de Gestión de Supermercado</p>
              <p>Reporte generado automáticamente • ${new Date().toLocaleDateString('es-BO')} ${new Date().toLocaleTimeString('es-BO')}</p>
              <p>Este documento es para uso interno</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Abrir nueva ventana para imprimir como PDF
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
  const formatDate = (date) => {
    if (!date) return '-';
    // Evitar problema de timezone: parsear la fecha como string directamente
    const [year, month, day] = date.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    // Fallback para otros formatos
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString('es-BO');
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      PENDIENTE: { bg: '#fff3e0', color: '#e65100' },
      RECIBIDA: { bg: '#e8f5e9', color: '#2e7d32' },
      CANCELADA: { bg: '#ffebee', color: '#c62828' }
    };
    const config = estilos[estado] || estilos.PENDIENTE;
    return (
      <span style={{ ...styles.badge, background: config.bg, color: config.color }}>
        {estado}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FileBarChart size={28} style={{ marginRight: '12px' }} />
            Reportes de Compras
          </h1>
          <p style={styles.subtitle}>
            Historial y estadísticas de compras • {ordenesFiltradas.length} registros
          </p>
        </div>
        <button 
          style={styles.exportButton} 
          onClick={exportarPDF}
          disabled={exportando || ordenesFiltradas.length === 0}
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
          <ShoppingBag size={32} style={{ color: '#1a5d1a' }} />
          <div>
            <span style={styles.statValue}>{stats.cantidadOrdenes}</span>
            <span style={styles.statLabel}>Órdenes Totales</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #2e7d32'}}>
          <DollarSign size={32} style={{ color: '#2e7d32' }} />
          <div>
            <span style={{...styles.statValue, color: '#2e7d32'}}>{formatCurrency(stats.totalCompras)}</span>
            <span style={styles.statLabel}>Total Bruto</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #c62828'}}>
          <RotateCcw size={32} style={{ color: '#c62828' }} />
          <div>
            <span style={{...styles.statValue, color: '#c62828'}}>- {formatCurrency(stats.totalDevoluciones)}</span>
            <span style={styles.statLabel}>Devoluciones</span>
          </div>
        </div>
        <div style={{...styles.statCard, borderTop: '4px solid #1565c0'}}>
          <DollarSign size={32} style={{ color: '#1565c0' }} />
          <div>
            <span style={{...styles.statValue, color: '#1565c0', fontSize: '28px'}}>{formatCurrency(stats.comprasNetas)}</span>
            <span style={styles.statLabel}>COMPRAS NETAS</span>
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
                onClick={() => {
                  const hoy = new Date();
                  let inicio, fin;
                  switch(p.key) {
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
                      inicio = fin = hoy.toISOString().split('T')[0];
                  }
                  setFiltros({ ...filtros, periodo: p.key, fechaInicio: inicio, fechaFin: fin });
                }}
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
            <label style={styles.filterLabel}>Proveedor:</label>
            <select
              value={filtros.proveedor}
              onChange={(e) => setFiltros({...filtros, proveedor: e.target.value})}
              style={styles.select}
            >
              <option value="">Todos</option>
              {proveedores.map(prov => (
                <option key={prov.id_proveedor} value={prov.id_proveedor}>
                  {prov.razon_social}
                </option>
              ))}
            </select>
          </div>
          <button 
            style={{
              ...styles.periodButton,
              background: ordenAscendente ? '#e8f5e9' : '#fff3e0',
              color: ordenAscendente ? '#2e7d32' : '#e65100',
              borderColor: ordenAscendente ? '#2e7d32' : '#e65100'
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

      {/* Tabla de órdenes */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>
            Historial de Compras ({ordenesFiltradas.length} registros)
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
        ) : ordenesFiltradas.length === 0 ? (
          <div style={styles.emptyState}>
            <FileBarChart size={48} style={{ color: '#ccc' }} />
            <p>No hay datos para mostrar</p>
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
                <th style={{...styles.th, textAlign: 'center'}}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map((orden) => (
                <tr key={orden.id} style={styles.tr}>
                  <td style={styles.td}><strong>{orden.id}</strong></td>
                  <td style={styles.td}>{orden.proveedor}</td>
                  <td style={styles.td}>{formatDate(orden.fecha_emision)}</td>
                  <td style={styles.td}>{formatDate(orden.fecha_entrega)}</td>
                  <td style={styles.td}><strong>{formatCurrency(orden.total)}</strong></td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    <button 
                      style={styles.viewButton} 
                      onClick={() => openDetalleModal(orden)}
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
                <td colSpan="4" style={{...styles.td, textAlign: 'right', fontWeight: '600'}}>
                  Total Filtrado:
                </td>
                <td style={{...styles.td, fontWeight: '700', color: '#1a5d1a', fontSize: '16px'}}>
                  {formatCurrency(ordenesFiltradas.reduce((sum, o) => sum + parseFloat(o.total || 0), 0))}
                </td>
                <td style={styles.td}></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Sección Devoluciones a Proveedores - Con campos mejorados */}
      {devoluciones.length > 0 && (
        <div style={{...styles.tableContainer, borderTop: '4px solid #c62828', marginTop: '25px'}}>
          <div style={styles.tableHeader}>
            <h3 style={{...styles.tableTitle, color: '#c62828'}}>
              <RotateCcw size={18} style={{ marginRight: '8px' }} />
              Devoluciones a Proveedores ({devoluciones.length} registros) - Total: {formatCurrency(stats.totalDevoluciones)}
            </h3>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{...styles.th, background: '#c62828'}}>ID</th>
                <th style={{...styles.th, background: '#c62828'}}>Fecha</th>
                <th style={{...styles.th, background: '#c62828'}}>Proveedor</th>
                <th style={{...styles.th, background: '#c62828'}}>Producto</th>
                <th style={{...styles.th, background: '#c62828', textAlign: 'center'}}>Cantidad</th>
                <th style={{...styles.th, background: '#c62828'}}>Realizado por</th>
                <th style={{...styles.th, background: '#c62828'}}>Motivo</th>
                <th style={{...styles.th, background: '#c62828', textAlign: 'right'}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {devoluciones.map((dev, index) => (
                <tr key={`dev-${index}`} style={{...styles.tr, background: '#fff5f5'}}>
                  <td style={styles.td}><strong>{dev.id}</strong></td>
                  <td style={styles.td}>{formatDate(dev.fecha)}</td>
                  <td style={styles.td}>{dev.proveedor || 'Sin proveedor'}</td>
                  <td style={styles.td}>{dev.producto || '-'}</td>
                  <td style={{...styles.td, textAlign: 'center'}}>
                    {dev.cantidad || 0}
                  </td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, background: '#ffebee', color: '#c62828'}}>
                      {dev.usuario || 'Sistema'}
                    </span>
                  </td>
                  <td style={styles.td}>{dev.motivo || '-'}</td>
                  <td style={{...styles.td, textAlign: 'right', color: '#c62828', fontWeight: '700'}}>
                    - {formatCurrency(dev.total || 0)}
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
                <p><strong>Orden:</strong> {ordenSeleccionada.id}</p>
                <p><strong>Proveedor:</strong> {ordenSeleccionada.proveedor}</p>
                <p><strong>Fecha Emisión:</strong> {formatDate(ordenSeleccionada.fecha_emision)}</p>
                <p><strong>Fecha Entrega:</strong> {formatDate(ordenSeleccionada.fecha_entrega)}</p>
                <p><strong>Estado:</strong> {getEstadoBadge(ordenSeleccionada.estado)}</p>
                <p style={styles.totalBig}><strong>Total:</strong> {formatCurrency(ordenSeleccionada.total)}</p>
              </div>
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
  periodButton: { padding: '8px 16px', border: '2px solid #e9ecef', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#6c757d', transition: 'all 0.2s' },
  periodButtonActive: { background: '#1a5d1a', color: 'white', borderColor: '#1a5d1a' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  filterLabel: { fontSize: '13px', fontWeight: '500', color: '#6c757d' },
  input: { padding: '10px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  select: { padding: '10px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none', background: 'white', minWidth: '150px' },
  clearButton: { padding: '10px 20px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
  tableContainer: { background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' },
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
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', borderBottom: '1px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#1a5d1a', display: 'flex', alignItems: 'center', gap: '10px' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: '5px', borderRadius: '5px' },
  modalBody: { padding: '25px' },
  infoCard: { padding: '20px', background: '#f8f9fa', borderRadius: '12px' },
  totalBig: { marginTop: '15px', fontSize: '18px', color: '#1a5d1a' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '20px 25px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  modalCancelButton: { padding: '10px 20px', background: 'white', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', color: '#6c757d' },
};

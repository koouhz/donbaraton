// src/pages/BalanceGeneral.jsx
import { useState, useEffect } from 'react';
import { 
  Scale, TrendingUp, TrendingDown, Loader2,
  DollarSign, Package, Wallet, Calendar, FileDown, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import logo from '../logo/images.jpg';

export default function BalanceGeneral() {
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [rentabilidad, setRentabilidad] = useState([]);
  const [inventario, setInventario] = useState([]);

  const [filtros, setFiltros] = useState({
    periodo: 'mes',
    fechaInicio: (() => {
      const d = new Date();
      d.setDate(1);
      return d.toISOString().split('T')[0];
    })(),
    fechaFin: new Date().toISOString().split('T')[0]
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
      const [rentRes, invRes] = await Promise.all([
        supabase.rpc('fn_reporte_rentabilidad_producto', {
          p_fecha_inicio: filtros.fechaInicio,
          p_fecha_fin: filtros.fechaFin
        }),
        supabase.rpc('fn_reporte_inventario_valorado')
      ]);

      if (rentRes.error) console.error(rentRes.error);
      if (invRes.error) console.error(invRes.error);

      setRentabilidad(rentRes.data || []);
      setInventario(invRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
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
      case 'anio':
        inicio = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0];
        fin = hoy.toISOString().split('T')[0];
        break;
      case 'todos':
        inicio = '2024-01-01';
        fin = hoy.toISOString().split('T')[0];
        break;
      default:
        return;
    }
    
    setFiltros({ ...filtros, periodo, fechaInicio: inicio, fechaFin: fin });
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;

  // Cálculos - usando campos de fn_reporte_rentabilidad_producto
  const totalIngresos = rentabilidad.reduce((sum, p) => sum + (parseFloat(p.cantidad_vendida || 0) * parseFloat(p.precio_venta || 0)), 0);
  const totalCostos = rentabilidad.reduce((sum, p) => sum + (parseFloat(p.cantidad_vendida || 0) * parseFloat(p.precio_costo || 0)), 0);
  const gananciasBrutas = rentabilidad.reduce((sum, p) => sum + parseFloat(p.ganancia_total || 0), 0);
  const margenPromedio = totalIngresos > 0 ? ((gananciasBrutas / totalIngresos) * 100).toFixed(1) : 0;

  const valorInventario = inventario.reduce((sum, c) => sum + parseFloat(c.valor_venta_potencial || 0) * 0.7, 0);
  const valorVentaPotencial = inventario.reduce((sum, c) => sum + parseFloat(c.valor_venta_potencial || 0), 0);
  const totalStock = inventario.reduce((sum, c) => sum + parseInt(c.stock_total || 0), 0);
  const totalProductos = inventario.reduce((sum, c) => sum + parseInt(c.cantidad_productos || 0), 0);

  const periodoTexto = {
    'todos': 'Todas las fechas',
    'hoy': 'Hoy',
    'semana': 'Esta semana',
    'mes': 'Este mes',
    'anio': 'Este año'
  }[filtros.periodo] || `${filtros.fechaInicio} - ${filtros.fechaFin}`;

  const exportarPDF = async () => {
    setExportando(true);
    try {
      const contenidoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Balance General - Don Baraton</title>
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
            
            /* Resumen Financiero Principal */
            .resumen-principal {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin-bottom: 25px;
            }
            .resumen-card {
              background: linear-gradient(145deg, #f8f9fa, #ffffff);
              border-radius: 12px;
              padding: 20px;
              text-align: center;
              border: 1px solid #e9ecef;
              box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            }
            .resumen-card.ingresos { border-left: 4px solid #2e7d32; }
            .resumen-card.costos { border-left: 4px solid #c62828; }
            .resumen-card.ganancia { border-left: 4px solid #1a5d1a; background: linear-gradient(145deg, #e8f5e9, #ffffff); }
            .resumen-valor { font-size: 22px; font-weight: 700; margin-bottom: 5px; }
            .resumen-label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
            .margen-tag { 
              display: inline-block; 
              margin-top: 8px; 
              padding: 4px 12px; 
              background: #2e7d32; 
              color: white; 
              border-radius: 20px; 
              font-size: 10px; 
              font-weight: 600; 
            }
            
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
            
            /* Grid de Inventario */
            .inv-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 20px;
            }
            .inv-item {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 10px;
              text-align: center;
            }
            .inv-valor { font-size: 18px; font-weight: 700; color: #1a5d1a; }
            .inv-label { font-size: 10px; color: #666; margin-top: 3px; }
            
            /* Tablas */
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
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
              <h2>Balance General</h2>
              <p>Período: ${periodoTexto} • Generado: ${new Date().toLocaleDateString('es-BO')} ${new Date().toLocaleTimeString('es-BO')}</p>
            </div>

            <div class="resumen-principal">
              <div class="resumen-card ingresos">
                <div class="resumen-valor positive">${formatCurrency(totalIngresos)}</div>
                <div class="resumen-label">Ingresos por Ventas</div>
              </div>
              <div class="resumen-card costos">
                <div class="resumen-valor negative">${formatCurrency(totalCostos)}</div>
                <div class="resumen-label">Costos de Venta</div>
              </div>
              <div class="resumen-card ganancia">
                <div class="resumen-valor positive">${formatCurrency(gananciasBrutas)}</div>
                <div class="resumen-label">Ganancia Bruta</div>
                <div class="margen-tag">${margenPromedio}% Margen</div>
              </div>
            </div>

            <div class="seccion">
              <div class="seccion-titulo">Valoración del Inventario</div>
              <div class="inv-grid">
                <div class="inv-item">
                  <div class="inv-valor">${totalProductos}</div>
                  <div class="inv-label">Productos Activos</div>
                </div>
                <div class="inv-item">
                  <div class="inv-valor">${totalStock}</div>
                  <div class="inv-label">Unidades en Stock</div>
                </div>
                <div class="inv-item">
                  <div class="inv-valor">${formatCurrency(valorVentaPotencial)}</div>
                  <div class="inv-label">Valor de Venta Potencial</div>
                </div>
              </div>
            </div>

            ${inventario.length > 0 ? `
            <div class="seccion">
              <div class="seccion-titulo">Inventario por Categoría</div>
              <table>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th style="text-align:center">Productos</th>
                    <th style="text-align:center">Stock</th>
                    <th style="text-align:right">Valor Venta</th>
                  </tr>
                </thead>
                <tbody>
                  ${inventario.map(cat => `
                    <tr>
                      <td><strong>${cat.categoria || 'Sin categoría'}</strong></td>
                      <td style="text-align:center">${cat.cantidad_productos || 0}</td>
                      <td style="text-align:center">${cat.stock_total || 0}</td>
                      <td style="text-align:right" class="currency positive">${formatCurrency(cat.valor_venta_potencial)}</td>
                    </tr>
                  `).join('')}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>TOTAL</strong></td>
                    <td style="text-align:center"><strong>${totalProductos}</strong></td>
                    <td style="text-align:center"><strong>${totalStock}</strong></td>
                    <td style="text-align:right" class="currency positive"><strong>${formatCurrency(valorVentaPotencial)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            ` : ''}

            ${rentabilidad.length > 0 ? `
            <div class="seccion">
              <div class="seccion-titulo">Productos Más Rentables (Top 10)</div>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style="text-align:center">Vendidos</th>
                    <th style="text-align:right">Margen Unit.</th>
                    <th style="text-align:right">Ganancia Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${rentabilidad.slice(0, 10).map(p => `
                    <tr>
                      <td><strong>${p.producto || 'Sin nombre'}</strong></td>
                      <td style="text-align:center">${p.cantidad_vendida || 0}</td>
                      <td style="text-align:right" class="currency">${formatCurrency(p.margen_unitario)}</td>
                      <td style="text-align:right" class="currency positive">${formatCurrency(p.ganancia_total)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            <div class="footer">
              <p class="brand">Don Baraton - Sistema de Gestión de Supermercado</p>
              <p>Reporte generado automáticamente • ${new Date().toLocaleDateString('es-BO')} ${new Date().toLocaleTimeString('es-BO')}</p>
              <p>Este documento es un resumen financiero para uso interno</p>
            </div>
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

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Scale size={28} style={{ marginRight: '12px' }} />
            Balance General
          </h1>
          <p style={styles.subtitle}>
            Resumen financiero del período seleccionado
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
            disabled={exportando}
          >
            {exportando ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generando...</>
            ) : (
              <><FileDown size={18} /> Exportar PDF</>
            )}
          </button>
        </div>
      </header>

      {/* Filtros de Período */}
      <div style={styles.filtersCard}>
        <div style={styles.filtersRow}>
          <div style={styles.periodButtons}>
            {[
              { key: 'hoy', label: 'Hoy' },
              { key: 'semana', label: 'Semana' },
              { key: 'mes', label: 'Este Mes' },
              { key: 'anio', label: 'Este Año' },
              { key: 'todos', label: 'Todos' }
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
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingState}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#1a5d1a' }} />
          <p>Cargando balance...</p>
        </div>
      ) : (
        <>
          {/* Resumen Principal */}
          <div style={styles.mainGrid}>
            <div style={{...styles.bigCard, borderTop: '4px solid #2e7d32'}}>
              <TrendingUp size={36} style={{ color: '#2e7d32' }} />
              <div>
                <span style={styles.bigLabel}>Ingresos del Período</span>
                <span style={{...styles.bigValue, color: '#2e7d32'}}>{formatCurrency(totalIngresos)}</span>
              </div>
            </div>
            <div style={{...styles.bigCard, borderTop: '4px solid #c62828'}}>
              <TrendingDown size={36} style={{ color: '#c62828' }} />
              <div>
                <span style={styles.bigLabel}>Costos del Período</span>
                <span style={{...styles.bigValue, color: '#c62828'}}>{formatCurrency(totalCostos)}</span>
              </div>
            </div>
            <div style={{...styles.bigCard, borderTop: '4px solid #1a5d1a'}}>
              <DollarSign size={36} style={{ color: '#1a5d1a' }} />
              <div>
                <span style={styles.bigLabel}>Ganancia Bruta</span>
                <span style={{...styles.bigValue, color: '#1a5d1a'}}>{formatCurrency(gananciasBrutas)}</span>
                <span style={styles.margenTag}>{margenPromedio}% margen</span>
              </div>
            </div>
          </div>

          {/* Inventario */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Package size={20} />
              Valoración del Inventario
            </h2>
            <div style={styles.invGrid}>
              <div style={styles.invCard}>
                <Package size={24} style={{ color: '#1565c0' }} />
                <div>
                  <span style={styles.invLabel}>Productos Activos</span>
                  <span style={styles.invValue}>{totalProductos}</span>
                </div>
              </div>
              <div style={styles.invCard}>
                <Wallet size={24} style={{ color: '#e65100' }} />
                <div>
                  <span style={styles.invLabel}>Unidades en Stock</span>
                  <span style={{...styles.invValue, color: '#e65100'}}>{totalStock}</span>
                </div>
              </div>
              <div style={styles.invCard}>
                <TrendingUp size={24} style={{ color: '#2e7d32' }} />
                <div>
                  <span style={styles.invLabel}>Valor Potencial de Venta</span>
                  <span style={{...styles.invValue, color: '#2e7d32'}}>{formatCurrency(valorVentaPotencial)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detalle por categoría */}
          {inventario.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Inventario por Categoría</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Categoría</th>
                    <th style={{...styles.th, textAlign: 'center'}}>Productos</th>
                    <th style={{...styles.th, textAlign: 'center'}}>Stock Total</th>
                    <th style={{...styles.th, textAlign: 'right'}}>Valor Venta</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map((cat, i) => (
                    <tr key={i} style={styles.tr}>
                      <td style={styles.td}><strong>{cat.categoria || 'Sin categoría'}</strong></td>
                      <td style={{...styles.td, textAlign: 'center'}}>{cat.cantidad_productos}</td>
                      <td style={{...styles.td, textAlign: 'center'}}>{cat.stock_total}</td>
                      <td style={{...styles.td, textAlign: 'right', color: '#2e7d32', fontWeight: '600'}}>{formatCurrency(cat.valor_venta_potencial)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={styles.tfootRow}>
                    <td style={{...styles.td, fontWeight: '700'}}>TOTAL</td>
                    <td style={{...styles.td, textAlign: 'center', fontWeight: '600'}}>{totalProductos}</td>
                    <td style={{...styles.td, textAlign: 'center', fontWeight: '600'}}>{totalStock}</td>
                    <td style={{...styles.td, textAlign: 'right', fontWeight: '700', color: '#2e7d32', fontSize: '16px'}}>{formatCurrency(valorVentaPotencial)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  exportButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 93, 26, 0.3)' },
  refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'white', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#495057' },
  filtersCard: { background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '25px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  filtersRow: { display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' },
  periodButtons: { display: 'flex', gap: '5px', marginRight: '20px' },
  periodButton: { padding: '10px 16px', border: '2px solid #e9ecef', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#6c757d', transition: 'all 0.2s' },
  periodButtonActive: { background: '#1a5d1a', color: 'white', borderColor: '#1a5d1a' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  filterLabel: { fontSize: '13px', fontWeight: '500', color: '#6c757d' },
  input: { padding: '10px 15px', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '25px' },
  bigCard: { padding: '30px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  bigLabel: { display: 'block', fontSize: '14px', color: '#6c757d', marginBottom: '5px' },
  bigValue: { display: 'block', fontSize: '32px', fontWeight: '700' },
  margenTag: { display: 'inline-block', marginTop: '8px', padding: '4px 10px', background: '#e8f5e9', borderRadius: '20px', fontSize: '12px', color: '#2e7d32', fontWeight: '600' },
  section: { background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#333' },
  invGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  invCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' },
  invLabel: { display: 'block', fontSize: '13px', color: '#6c757d' },
  invValue: { display: 'block', fontSize: '22px', fontWeight: '700', color: '#333' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 15px', textAlign: 'left', background: '#f8f9fa', color: '#1a5d1a', fontWeight: '600', fontSize: '13px', borderBottom: '2px solid #e9ecef' },
  tr: { borderBottom: '1px solid #e9ecef' },
  td: { padding: '12px 15px', fontSize: '14px', color: '#495057' },
  tfootRow: { background: '#e8f5e9' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px', color: '#6c757d', gap: '15px' },
};

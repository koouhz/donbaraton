// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Users, ShoppingCart, Package,
  DollarSign, ChefHat, Calendar, RefreshCw,
  BarChart3, PieChart, Box, User, Plus,
  PackageOpen, ShoppingBag, CreditCard, AlertCircle,
  Store, Clock, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

// Paleta de colores para supermercado
const COLORS = {
  primary: {
    dark: "#1a5d1a",      // Verde oscuro principal
    main: "#2e8b57",      // Verde mar
    light: "#3cb371",     // Verde medio claro
  },
  secondary: {
    dark: "#d4af37",      // Dorado oscuro
    main: "#f5deb3",      // Beige claro (trigo)
    light: "#fff8dc",     // Beige muy claro
  },
  neutral: {
    white: "#ffffff",
    light: "#f8f9fa",
    medium: "#e9ecef",
    dark: "#6c757d",
    black: "#343a40",
  },
  status: {
    success: "#28a745",
    warning: "#ffc107",
    danger: "#dc3545",
    info: "#17a2b8",
  }
};

// Componente Card simplificado
const DashboardCard = ({ title, value, subtitle, icon, color, trend, onClick }) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up": return <ArrowUp size={14} />;
      case "down": return <ArrowDown size={14} />;
      case "warning": return <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: COLORS.status.warning }} />;
      default: return <Minus size={14} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up": return COLORS.status.success;
      case "down": return COLORS.status.danger;
      case "warning": return COLORS.status.warning;
      default: return COLORS.neutral.dark;
    }
  };

  return (
    <div
      style={styles.card}
      onClick={onClick}
      className="dashboard-card"
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardContent}>
          <h3 style={styles.cardTitle}>{title}</h3>
          <div style={styles.cardValue}>{value}</div>
          <div style={styles.cardSubtitle}>{subtitle}</div>
        </div>
        <div style={{ ...styles.cardIcon, backgroundColor: `${color}15`, color: color }}>
          {icon}
        </div>
      </div>

      <div style={{ ...styles.cardTrend, color: getTrendColor() }}>
        {getTrendIcon()}
        <span style={{ marginLeft: "6px" }}>
          {trend === "up" ? "Aumentando" :
            trend === "down" ? "Disminuyendo" :
              trend === "warning" ? "Requiere atención" :
                "Estable"}
        </span>
      </div>
    </div>
  );
};

// Componente de gráfica de barras simplificado
const SimpleBarChart = ({ data, color, title }) => {
  const maxValue = Math.max(...data.map(item => item.value));

  const formatCurrencyShort = (amount) => {
    if (amount >= 1000000) return `Bs. ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `Bs. ${(amount / 1000).toFixed(1)}K`;
    return `Bs. ${amount}`;
  };

  return (
    <div style={styles.chartCard}>
      <h3 style={styles.chartTitle}>{title}</h3>
      <div style={styles.chartContainer}>
        {data.map((item, index) => (
          <div key={index} style={styles.barContainer}>
            <div style={styles.barLabel}>{item.label}</div>
            <div style={styles.barWrapper}>
              <div
                style={{
                  ...styles.bar,
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color
                }}
              />
              <span style={styles.barValue}>{formatCurrencyShort(item.value)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de gráfica donut simplificado
const SimpleDonutChart = ({ data, colors, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartColors = colors || [
    COLORS.primary.dark,
    COLORS.primary.main,
    COLORS.primary.light,
    COLORS.secondary.dark,
    COLORS.secondary.main
  ];

  const formatCurrencyShort = (amount) => {
    if (amount >= 1000000) return `Bs. ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `Bs. ${(amount / 1000).toFixed(1)}K`;
    return `Bs. ${amount}`;
  };

  return (
    <div style={styles.chartCard}>
      <h3 style={styles.chartTitle}>{title}</h3>
      <div style={styles.donutContainer}>
        <div style={styles.donutChart}>
          <div style={styles.donutVisual}>
            <div style={styles.donutCenter}>
              <span style={styles.donutTotal}>{formatCurrencyShort(total)}</span>
              <span style={styles.donutLabel}>Total</span>
            </div>
          </div>
        </div>
        <div style={styles.donutLegend}>
          {data.map((item, index) => (
            <div key={index} style={styles.legendItem}>
              <div
                style={{
                  ...styles.legendColor,
                  backgroundColor: chartColors[index % chartColors.length]
                }}
              />
              <span style={styles.legendLabel}>{item.label}</span>
              <span style={styles.legendValue}>
                {total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : "0%"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente Header simplificado
const SimpleDashboardHeader = ({ lastUpdate, onRefresh, loading, title, subtitle }) => {
  const formatDateTime = (date) => {
    if (!date) return 'Cargando...';
    return date.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.headerTitle}>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>
            <span style={styles.statusDot}></span>
            Actualizado: {formatDateTime(lastUpdate)}
          </p>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.restaurantBadge}>
            <Store size={16} />
            Don Baraton
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              ...styles.refreshButton,
              ...(loading ? styles.refreshButtonLoading : {})
            }}
          >
            <RefreshCw size={16} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>
    </header>
  );
};

// Componente QuickActions simplificado
const SimpleQuickActions = ({ onAction }) => {
  // Icono Truck simplificado
  const Truck = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 17h4V5H2v12h3m13 0h5l-1.7-4.4a2 2 0 0 0-1.8-1.2h-2.5v6ZM16 3h5l1 2h-6V3Z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );

  const actions = [
    { key: 'inventario', label: 'Inventario', icon: <PackageOpen size={20} /> },
    { key: 'productos', label: 'Productos', icon: <ShoppingBag size={20} /> },
    { key: 'compras', label: 'Compras', icon: <ShoppingCart size={20} /> },
    { key: 'ventas', label: 'Ventas', icon: <CreditCard size={20} /> },
    { key: 'proveedores', label: 'Proveedores', icon: <Truck size={20} /> },
    { key: 'clientes', label: 'Clientes', icon: <Users size={20} /> },
    { key: 'personal', label: 'Personal', icon: <User size={20} /> },
    { key: 'reportes', label: 'Reportes', icon: <BarChart3 size={20} /> },
  ];

  return (
    <section style={styles.quickActions}>
      <h2 style={styles.quickActionsTitle}>Acciones Rápidas</h2>
      <div style={styles.actionsGrid}>
        {actions.map(action => (
          <button
            key={action.key}
            onClick={() => onAction(action.key)}
            style={styles.actionButton}
            title={`Ir a ${action.label}`}
          >
            <div style={styles.actionIcon}>
              {action.icon}
            </div>
            <span style={styles.actionLabel}>{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

// Componente de carga simplificado
const SimpleLoadingSkeleton = () => {
  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.headerSkeleton}></div>
      <div style={styles.statsGrid}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={styles.cardSkeleton}></div>
        ))}
      </div>
    </div>
  );
};

// ==================== FUNCIONES DE CONEXIÓN A SUPABASE (SOLO RPC) ====================

// 1. Obtener ventas del día actual usando fn_reporte_ventas_periodo
const fetchVentasHoy = async () => {
  try {
    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split('T')[0];

    const { data, error } = await supabase.rpc('fn_reporte_ventas_periodo', {
      p_fecha_inicio: fechaHoy,
      p_fecha_fin: fechaHoy
    });

    if (error) throw error;

    // fn_reporte_ventas_periodo retorna: fecha, cantidad_ventas, total_vendido, promedio_ticket
    const ventasHoy = data && data.length > 0 ? data[0] : null;

    return {
      total: ventasHoy?.total_vendido || 0,
      cantidad: ventasHoy?.cantidad_ventas || 0
    };
  } catch (error) {
    console.error('Error fetching ventas hoy:', error);
    return { total: 0, cantidad: 0 };
  }
};

// 2. Obtener pedidos activos usando fn_historial_compras
const fetchPedidosActivos = async () => {
  try {
    const hoy = new Date();
    const hace6Meses = new Date();
    hace6Meses.setMonth(hace6Meses.getMonth() - 6);

    const { data, error } = await supabase.rpc('fn_historial_compras', {
      p_fecha_inicio: hace6Meses.toISOString().split('T')[0],
      p_fecha_fin: hoy.toISOString().split('T')[0],
      p_id_proveedor: null
    });

    console.log('fn_historial_compras resultado:', { data, error });

    if (error) {
      console.warn('Error en fn_historial_compras (tabla puede no existir):', error);
      return 0; // Devolver 0 si la tabla no existe
    }

    // Filtrar solo órdenes pendientes
    const pendientes = data ? data.filter(orden => orden.estado === 'PENDIENTE') : [];
    console.log('Pedidos pendientes encontrados:', pendientes.length);
    return pendientes.length;
  } catch (error) {
    console.error('Error fetching pedidos activos:', error);
    return 0;
  }
};

// 3. Obtener estadísticas de inventario usando fn_listar_productos y fn_generar_alertas_stock_bajo
const fetchInventarioStats = async () => {
  try {
    // Obtener total de productos activos (fn_leer_productos acepta p_buscar)
    const { data: productos, error: errorProd } = await supabase.rpc('fn_leer_productos', { p_buscar: null });

    if (errorProd) throw errorProd;

    // Obtener productos con stock bajo (fn_alerta_stock_bajo es el nombre correcto)
    const { data: alertasStock, error: errorAlertas } = await supabase.rpc('fn_alerta_stock_bajo');

    if (errorAlertas) {
      console.warn('Error en fn_generar_alertas_stock_bajo:', errorAlertas);
    }

    // Contar productos activos
    const productosActivos = productos ? productos.filter(p => p.estado === 'ACTIVO') : [];
    const bajoStock = alertasStock ? alertasStock.length : 0;

    return {
      total: productosActivos.length,
      bajoStock: bajoStock
    };
  } catch (error) {
    console.error('Error fetching inventario:', error);
    return { total: 0, bajoStock: 0 };
  }
};

// 4. Obtener empleados activos usando fn_listar_empleados
const fetchEmpleadosActivos = async () => {
  try {
    const { data, error } = await supabase.rpc('fn_listar_empleados');

    console.log('fn_listar_empleados resultado:', { data, error });

    if (error) throw error;

    // fn_listar_empleados ya filtra por estado ACTIVO
    const count = data ? data.length : 0;
    console.log('Empleados activos encontrados:', count);
    return count;
  } catch (error) {
    console.error('Error fetching empleados:', error);
    return 0;
  }
};

// 5. Obtener ventas del mes actual usando fn_reporte_ventas_periodo
const fetchVentasMensuales = async () => {
  try {
    const fecha = new Date();
    const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

    const { data, error } = await supabase.rpc('fn_reporte_ventas_periodo', {
      p_fecha_inicio: primerDiaMes.toISOString().split('T')[0],
      p_fecha_fin: ultimoDiaMes.toISOString().split('T')[0]
    });

    if (error) throw error;

    // Sumar total de todos los días del mes
    const totalMes = data ? data.reduce((sum, dia) => sum + (parseFloat(dia.total_vendido) || 0), 0) : 0;
    return totalMes;
  } catch (error) {
    console.error('Error fetching ventas mensuales:', error);
    return 0;
  }
};

// 6. Obtener ventas de los últimos 6 meses usando fn_reporte_ventas_periodo
const fetchVentasUltimosMeses = async (meses = 6) => {
  try {
    const fecha = new Date();
    const resultados = [];

    for (let i = meses - 1; i >= 0; i--) {
      const fechaMes = new Date(fecha.getFullYear(), fecha.getMonth() - i, 1);
      const primerDia = fechaMes.toISOString().split('T')[0];
      const ultimoDia = new Date(fechaMes.getFullYear(), fechaMes.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase.rpc('fn_reporte_ventas_periodo', {
        p_fecha_inicio: primerDia,
        p_fecha_fin: ultimoDia
      });

      if (error) throw error;

      // Sumar total del mes
      const totalMes = data ? data.reduce((sum, dia) => sum + (parseFloat(dia.total_vendido) || 0), 0) : 0;

      resultados.push({
        label: fechaMes.toLocaleDateString('es-ES', { month: 'short' }),
        value: totalMes
      });
    }

    return resultados;
  } catch (error) {
    console.error('Error fetching ventas últimos meses:', error);
    return [
      { label: 'Ene', value: 0 },
      { label: 'Feb', value: 0 },
      { label: 'Mar', value: 0 },
      { label: 'Abr', value: 0 },
      { label: 'May', value: 0 },
      { label: 'Jun', value: 0 }
    ];
  }
};

// 7. Obtener distribución de ventas por categoría usando fn_listar_productos y fn_reporte_productos_mas_vendidos
const fetchDistribucionVentas = async () => {
  try {
    const fecha = new Date();
    const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);

    // Usar fn_reporte_productos_mas_vendidos para obtener las ventas por producto
    const { data: productosVendidos, error } = await supabase.rpc('fn_reporte_productos_mas_vendidos', {
      p_fecha_inicio: primerDiaMes.toISOString().split('T')[0],
      p_fecha_fin: ultimoDiaMes.toISOString().split('T')[0],
      p_limite: 100
    });

    if (error) throw error;

    // Obtener productos con sus categorías
    const { data: productos, error: errorProd } = await supabase.rpc('fn_leer_productos', { p_buscar: null });

    if (errorProd) throw errorProd;

    // Crear mapa de producto a categoría
    const productoCategoria = {};
    if (productos) {
      productos.forEach(p => {
        productoCategoria[p.nombre] = p.categoria || 'Sin categoría';
      });
    }

    // Agrupar ventas por categoría
    const distribucion = {};
    if (productosVendidos) {
      productosVendidos.forEach(pv => {
        const categoria = productoCategoria[pv.producto] || 'Sin categoría';
        distribucion[categoria] = (distribucion[categoria] || 0) + (parseFloat(pv.ingresos_generados) || 0);
      });
    }

    // Convertir a formato de gráfico
    const resultado = Object.entries(distribucion).map(([categoria, total]) => ({
      label: categoria,
      value: total
    }));

    return resultado.length > 0 ? resultado : [
      { label: 'Sin ventas', value: 0 }
    ];
  } catch (error) {
    console.error('Error fetching distribución ventas:', error);
    return [
      { label: 'Sin datos', value: 0 }
    ];
  }
};

// 8. Obtener productos por categoría usando fn_listar_productos
const fetchProductosPorCategoria = async () => {
  try {
    const { data: productos, error } = await supabase.rpc('fn_leer_productos', { p_buscar: null });

    if (error) throw error;

    // Contar productos por categoría
    const conteoPorCategoria = {};
    if (productos) {
      productos.forEach(p => {
        if (p.estado === 'ACTIVO') {
          const categoria = p.categoria || 'Sin categoría';
          conteoPorCategoria[categoria] = (conteoPorCategoria[categoria] || 0) + 1;
        }
      });
    }

    return conteoPorCategoria;
  } catch (error) {
    console.error('Error fetching productos por categoría:', error);
    return { 'Sin datos': 0 };
  }
};

// 9. Obtener productos próximos a vencer usando fn_productos_por_vencer
const fetchProximosVencimientos = async () => {
  try {
    const { data, error } = await supabase.rpc('fn_productos_por_vencer', {
      p_dias_anticipacion: 30
    });

    if (error) throw error;

    return data ? data.length : 0;
  } catch (error) {
    console.error('Error fetching próximos vencimientos:', error);
    return 0;
  }
};

// 10. Obtener alertas de stock bajo usando fn_generar_alertas_stock_bajo
const fetchAlertasStockBajo = async () => {
  try {
    const { data, error } = await supabase.rpc('fn_alerta_stock_bajo');

    if (error) throw error;

    return data ? data.length : 0;
  } catch (error) {
    console.error('Error fetching alertas stock:', error);
    return 0;
  }
};

// ==================== COMPONENTE PRINCIPAL ====================

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  // Datos del dashboard
  const [dashboardData, setDashboardData] = useState({
    // Estadísticas principales
    stats: {
      ventasHoy: { value: "Bs. 0.00", label: "0 ventas hoy", trend: "neutral" },
      pedidosActivos: { value: "0", label: "ordenes pendientes", trend: "neutral" },
      productosStock: { value: "0", label: "0 bajo stock", trend: "neutral" },
      empleadosActivos: { value: "0", label: "personal activo", trend: "neutral" },
    },

    // Gráficas
    charts: {
      ventasMensuales: [],
      distribucionVentas: [],
      productosCategoria: {},
    },

    // Información adicional
    summary: {
      ventasMes: 0,
      promedioDiario: 0,
      productosBajoStock: 0,
      proximosVencimientos: 0,
    }
  });

  // Formatear moneda
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }, []);

  // Calcular tendencias (ejemplo simple - en producción deberías comparar con datos históricos)
  const calcularTrend = (valorActual, valorComparacion = 0) => {
    if (valorActual > valorComparacion) return "up";
    if (valorActual < valorComparacion) return "down";
    return "neutral";
  };

  // Cargar datos REALES de la base de datos
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Cargando datos del dashboard desde Supabase...');

      // Ejecutar todas las consultas en paralelo
      const [
        ventasHoy,
        pedidosActivos,
        inventarioStats,
        empleadosActivos,
        ventasMes,
        ventasUltimosMeses,
        distribucionVentas,
        productosCategoria,
        proximosVencimientos,
        alertasStock
      ] = await Promise.all([
        fetchVentasHoy(),
        fetchPedidosActivos(),
        fetchInventarioStats(),
        fetchEmpleadosActivos(),
        fetchVentasMensuales(),
        fetchVentasUltimosMeses(6),
        fetchDistribucionVentas(),
        fetchProductosPorCategoria(),
        fetchProximosVencimientos(),
        fetchAlertasStockBajo()
      ]);

      console.log('Datos cargados exitosamente:', {
        ventasHoy,
        inventarioStats,
        ventasMes
      });

      // Configurar datos REALES
      setDashboardData({
        stats: {
          ventasHoy: {
            value: formatCurrency(ventasHoy.total),
            label: `${ventasHoy.cantidad} ventas hoy`,
            trend: calcularTrend(ventasHoy.total, 0)
          },
          pedidosActivos: {
            value: pedidosActivos.toString(),
            label: "ordenes pendientes",
            trend: pedidosActivos > 0 ? "up" : "neutral"
          },
          productosStock: {
            value: inventarioStats.total.toString(),
            label: `${inventarioStats.bajoStock} bajo stock`,
            trend: inventarioStats.bajoStock > 0 ? "warning" : "neutral"
          },
          empleadosActivos: {
            value: empleadosActivos.toString(),
            label: "personal activo",
            trend: "neutral"
          },
        },

        charts: {
          ventasMensuales: ventasUltimosMeses,
          distribucionVentas: distribucionVentas,
          productosCategoria: productosCategoria,
        },

        summary: {
          ventasMes: ventasMes,
          promedioDiario: ventasMes / new Date().getDate(),
          productosBajoStock: inventarioStats.bajoStock,
          proximosVencimientos: proximosVencimientos,
        }
      });

      setLastUpdate(new Date());
      setError(null);

    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('No se pudieron cargar las estadísticas. Verifica tu conexión a internet o la configuración de la base de datos.');

      // Cargar datos de ejemplo como fallback
      loadExampleData();
    } finally {
      setLoading(false);
    }
  }, [formatCurrency]);

  // Datos de ejemplo para fallback
  const loadExampleData = useCallback(() => {
    console.log('Cargando datos de ejemplo...');

    const ventasMensualesEjemplo = [
      { label: 'Ene', value: 45000 },
      { label: 'Feb', value: 52000 },
      { label: 'Mar', value: 48000 },
      { label: 'Abr', value: 61000 },
      { label: 'May', value: 58000 },
      { label: 'Jun', value: 72000 }
    ];

    const distribucionVentasEjemplo = [
      { label: 'Alimentos', value: 15600 },
      { label: 'Bebidas', value: 8400 },
      { label: 'Limpieza', value: 3200 },
      { label: 'Otros', value: 2100 }
    ];

    const productosCategoriaEjemplo = {
      'alimentos': 45,
      'bebidas': 32,
      'limpieza': 18,
      'otros': 12
    };

    setDashboardData({
      stats: {
        ventasHoy: {
          value: formatCurrency(12560.75),
          label: "23 ventas hoy",
          trend: "up"
        },
        pedidosActivos: {
          value: "8",
          label: "ordenes pendientes",
          trend: "up"
        },
        productosStock: {
          value: "107",
          label: "5 bajo stock",
          trend: "neutral"
        },
        empleadosActivos: {
          value: "12",
          label: "personal activo",
          trend: "neutral"
        },
      },

      charts: {
        ventasMensuales: ventasMensualesEjemplo,
        distribucionVentas: distribucionVentasEjemplo,
        productosCategoria: productosCategoriaEjemplo,
      },

      summary: {
        ventasMes: 156800.50,
        promedioDiario: 5226.68,
        productosBajoStock: 5,
        proximosVencimientos: 3,
      }
    });
  }, [formatCurrency]);

  useEffect(() => {
    loadDashboardData();
    addGlobalStyles();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleQuickAction = (action) => {
    const routes = {
      inventario: '/inventario',
      personal: '/personal',
      ventas: '/ventas',
      compras: '/compras',
      productos: '/productos',
      proveedores: '/proveedores',
      clientes: '/clientes',
      reportes: '/reportes',
    };

    if (routes[action]) {
      navigate(routes[action]);
    } else {
      alert(`Función ${action} no implementada aún`);
    }
  };

  if (loading) {
    return <SimpleLoadingSkeleton />;
  }

  return (
    <div style={styles.dashboardContainer}>
      {/* Header */}
      <SimpleDashboardHeader
        lastUpdate={lastUpdate}
        onRefresh={handleRefresh}
        loading={loading}
        title="Don Baraton - Panel de Control"
        subtitle="Gestión integral de inventario y ventas"
      />

      {/* Mensaje de error */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={handleRefresh} style={styles.retryButton}>
            Reintentar
          </button>
        </div>
      )}

      {/* Estadísticas Principales */}
      <section style={styles.statsSection}>
        <h2 style={styles.sectionTitle}>
          <BarChart3 size={20} />
          Resumen General
        </h2>

        <div style={styles.statsGrid}>
          <DashboardCard
            title="Ventas del Día"
            value={dashboardData.stats.ventasHoy.value}
            subtitle={dashboardData.stats.ventasHoy.label}
            icon={<DollarSign size={24} />}
            color={COLORS.primary.dark}
            trend={dashboardData.stats.ventasHoy.trend}
            onClick={() => handleQuickAction('ventas')}
          />

          <DashboardCard
            title="Pedidos Activos"
            value={dashboardData.stats.pedidosActivos.value}
            subtitle={dashboardData.stats.pedidosActivos.label}
            icon={<ShoppingCart size={24} />}
            color={COLORS.secondary.dark}
            trend={dashboardData.stats.pedidosActivos.trend}
            onClick={() => handleQuickAction('compras')}
          />

          <DashboardCard
            title="Inventario"
            value={dashboardData.stats.productosStock.value}
            subtitle={dashboardData.stats.productosStock.label}
            icon={<Package size={24} />}
            color={dashboardData.stats.productosStock.trend === "warning" ? COLORS.status.warning : COLORS.primary.main}
            trend={dashboardData.stats.productosStock.trend}
            onClick={() => handleQuickAction('inventario')}
          />

          <DashboardCard
            title="Personal"
            value={dashboardData.stats.empleadosActivos.value}
            subtitle={dashboardData.stats.empleadosActivos.label}
            icon={<Users size={24} />}
            color={COLORS.primary.light}
            trend={dashboardData.stats.empleadosActivos.trend}
            onClick={() => handleQuickAction('personal')}
          />
        </div>
      </section>

      {/* Gráficas */}
      <section style={styles.chartsSection}>
        <h2 style={styles.sectionTitle}>
          <BarChart3 size={20} />
          Métricas del Negocio
        </h2>

        <div style={styles.chartsGrid}>
          <SimpleBarChart
            title="Ventas Mensuales (Bs)"
            data={dashboardData.charts.ventasMensuales}
            color={COLORS.primary.dark}
          />

          <SimpleDonutChart
            title="Distribución de Ventas"
            data={dashboardData.charts.distribucionVentas}
            colors={[
              COLORS.primary.dark,
              COLORS.primary.main,
              COLORS.primary.light,
              COLORS.secondary.dark,
              COLORS.secondary.main
            ]}
          />
        </div>
      </section>

      {/* Información Adicional */}
      <section style={styles.infoSection}>
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <div style={styles.infoHeader}>
              <ChefHat size={20} />
              <h3 style={styles.infoTitle}>Productos por Categoría</h3>
            </div>
            <div style={styles.categoryList}>
              {Object.entries(dashboardData.charts.productosCategoria).map(([categoria, cantidad], index) => (
                <div key={categoria} style={styles.categoryItem}>
                  <span style={styles.categoryName}>
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </span>
                  <span style={styles.categoryCount}>{cantidad}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoHeader}>
              <Calendar size={20} />
              <h3 style={styles.infoTitle}>Resumen del Mes</h3>
            </div>
            <div style={styles.summaryList}>
              <div style={styles.summaryItem}>
                <span>Ventas totales:</span>
                <strong>{formatCurrency(dashboardData.summary.ventasMes)}</strong>
              </div>
              <div style={styles.summaryItem}>
                <span>Promedio diario:</span>
                <strong>{formatCurrency(dashboardData.summary.promedioDiario)}</strong>
              </div>
              <div style={styles.summaryItem}>
                <span>Productos bajo stock:</span>
                <strong style={{ color: dashboardData.summary.productosBajoStock > 0 ? COLORS.status.warning : COLORS.primary.dark }}>
                  {dashboardData.summary.productosBajoStock}
                </strong>
              </div>
              <div style={styles.summaryItem}>
                <span>Próximos vencimientos:</span>
                <strong style={{ color: dashboardData.summary.proximosVencimientos > 0 ? COLORS.status.warning : COLORS.primary.dark }}>
                  {dashboardData.summary.proximosVencimientos}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Estilos (mantenidos igual)
const styles = {
  dashboardContainer: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },

  // Header
  header: {
    marginBottom: "30px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },

  headerTitle: {
    flex: 1,
  },

  title: {
    fontSize: "28px",
    color: "#1a5d1a",
    margin: "0 0 8px 0",
    fontWeight: "700",
  },

  subtitle: {
    color: "#6c757d",
    fontSize: "14px",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#28a745",
    borderRadius: "50%",
    display: "inline-block",
  },

  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexShrink: 0,
  },

  restaurantBadge: {
    padding: "8px 16px",
    background: "white",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    fontSize: "14px",
    color: "#1a5d1a",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  refreshButton: {
    padding: "8px 16px",
    background: "#1a5d1a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    transition: "all 0.3s ease",
  },

  refreshButtonLoading: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  // Error Banner
  errorBanner: {
    backgroundColor: "rgba(220, 53, 69, 0.1)",
    color: "#dc3545",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(220, 53, 69, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    fontSize: "14px",
  },

  retryButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    marginLeft: "auto",
    transition: "all 0.2s ease",
  },

  // Secciones
  statsSection: {
    marginBottom: "30px",
  },

  chartsSection: {
    marginBottom: "30px",
  },

  infoSection: {
    marginBottom: "30px",
  },

  sectionTitle: {
    fontSize: "20px",
    color: "#1a5d1a",
    marginBottom: "20px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  // Card
  card: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    color: "#6c757d",
    fontSize: "14px",
    margin: "0 0 8px 0",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  cardValue: {
    color: "#1a5d1a",
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 4px 0",
    lineHeight: "1.2",
  },

  cardSubtitle: {
    color: "#6c757d",
    fontSize: "12px",
    opacity: 0.8,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  cardIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(26, 93, 26, 0.3)",
    flexShrink: 0,
    marginLeft: "12px",
  },

  cardTrend: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: "500",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #f8f9fa",
  },

  // Grids
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },

  // Charts
  chartCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  chartTitle: {
    color: "#1a5d1a",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "15px",
  },

  chartContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  barContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  barLabel: {
    width: "40px",
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
  },

  barWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  bar: {
    height: "20px",
    borderRadius: "4px",
    transition: "width 0.3s ease",
    minWidth: "4px",
  },

  barValue: {
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
    minWidth: "50px",
    textAlign: "right",
  },

  // Donut Chart
  donutContainer: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
  },

  donutChart: {
    flexShrink: 0,
    position: "relative",
    width: "200px",
    height: "200px",
  },

  donutVisual: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "conic-gradient(#1a5d1a 0% 40%, #2e8b57 40% 65%, #3cb371 65% 80%, #d4af37 80% 90%, #f5deb3 90% 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  donutCenter: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  donutTotal: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#1a5d1a",
  },

  donutLabel: {
    fontSize: "12px",
    color: "#6c757d",
    marginTop: "4px",
  },

  donutLegend: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  legendColor: {
    width: "12px",
    height: "12px",
    borderRadius: "2px",
  },

  legendLabel: {
    fontSize: "12px",
    color: "#6c757d",
    flex: 1,
  },

  legendValue: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#1a5d1a",
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
  },

  // Info Cards
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  infoCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  infoHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    color: "#1a5d1a",
  },

  infoTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
    color: "#1a5d1a",
  },

  // Listas
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  categoryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f8f9fa",
  },

  categoryName: {
    color: "#6c757d",
    fontSize: "14px",
  },

  categoryCount: {
    color: "#1a5d1a",
    fontWeight: "600",
    fontSize: "14px",
    backgroundColor: "rgba(26, 93, 26, 0.1)",
    padding: "4px 12px",
    borderRadius: "20px",
  },

  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
  },

  // Quick Actions
  quickActions: {
    marginTop: "30px",
    padding: "24px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e9ecef",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  quickActionsTitle: {
    fontSize: "20px",
    color: "#1a5d1a",
    marginBottom: "24px",
    fontWeight: "600",
  },

  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },

  actionButton: {
    padding: "20px 16px",
    background: "white",
    border: "1px solid #e9ecef",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    fontSize: "16px",
    color: "#1a5d1a",
  },

  actionIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    background: "rgba(26, 93, 26, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1a5d1a",
  },

  actionLabel: {
    fontWeight: "500",
  },

  // Skeleton Loading
  headerSkeleton: {
    backgroundColor: "#e9ecef",
    height: "120px",
    borderRadius: "12px",
    marginBottom: "30px",
    animation: "pulse 1.5s infinite",
  },

  cardSkeleton: {
    backgroundColor: "#e9ecef",
    height: "140px",
    borderRadius: "12px",
    animation: "pulse 1.5s infinite",
  },
};

// Agregar estilos de animación
const addGlobalStyles = () => {
  if (document.getElementById('dashboard-styles')) return;

  const styleSheet = document.createElement('style');
  styleSheet.id = 'dashboard-styles';
  styleSheet.textContent = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .dashboard-card {
      animation: fadeIn 0.3s ease-out;
    }
    
    .dashboard-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(26, 93, 26, 0.1);
      border-color: #1a5d1a;
    }
    
    .action-button:hover {
      transform: translateY(-2px);
      border-color: #1a5d1a;
      box-shadow: 0 4px 12px rgba(26, 93, 26, 0.1);
    }
  `;
  document.head.appendChild(styleSheet);
};

export default Dashboard;
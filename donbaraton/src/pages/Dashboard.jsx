// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, Users, ShoppingCart, Package, DollarSign,
  Plus, Box, User, RefreshCw, Eye, BarChart3, 
  Calendar, AlertTriangle, CheckCircle, Store, Layers
} from "lucide-react";
import { supabase } from "../bd/supabaseClient";

// Componente Card
const Card = ({ title, value, subtitle, icon, trend, onClick, clickable }) => {
  const [hover, setHover] = useState(false);

  const cardStyle = {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e9d8b5",
    transition: "all 0.3s ease",
    cursor: clickable ? "pointer" : "default",
    minWidth: "280px",
    boxShadow: hover && clickable ? "0 4px 12px rgba(122, 59, 6, 0.1)" : "none",
    transform: hover && clickable ? "translateY(-2px)" : "none",
    borderColor: hover && clickable ? "#7a3b06" : "#e9d8b5"
  };

  return (
    <div 
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <h3 style={{ color: "#6d4611", fontSize: "14px", margin: "0 0 8px 0", fontWeight: "500" }}>
            {title}
          </h3>
          <div style={{ color: "#7a3b06", fontSize: "24px", fontWeight: "700", margin: "0 0 4px 0" }}>
            {value}
          </div>
          <div style={{ color: "#6d4611", fontSize: "12px", opacity: 0.8 }}>
            {subtitle}
          </div>
        </div>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "8px",
          background: "rgba(122, 59, 6, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7a3b06"
        }}>
          {icon}
        </div>
      </div>
      {trend && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "12px",
          color: trend === "up" ? "#28a745" : trend === "down" ? "#dc3545" : "#6c757d"
        }}>
          {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"}
          {trend === "up" ? "Aumentando" : trend === "down" ? "Disminuyendo" : "Estable"}
        </div>
      )}
    </div>
  );
};

// Componente de Gráfica de Barras Simple
const BarChart = ({ data, title, color = "#7a3b06" }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
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
                  backgroundColor: color,
                  opacity: 0.8
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

// Componente de Gráfica de Donut Simple
const DonutChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#7a3b06', '#28a745', '#007bff', '#ffc107', '#dc3545', '#6f42c1'];
  
  if (total === 0) {
    return (
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>{title}</h3>
        <div style={styles.noData}>
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.chartCard}>
      <h3 style={styles.chartTitle}>{title}</h3>
      <div style={styles.donutContainer}>
        <div style={styles.donutChart}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const largeArc = angle > 180 ? 1 : 0;
              
              const x1 = 60 + 50 * Math.cos((index * (360 / data.length) * Math.PI) / 180);
              const y1 = 60 + 50 * Math.sin((index * (360 / data.length) * Math.PI) / 180);
              const x2 = 60 + 50 * Math.cos(((index + 1) * (360 / data.length) * Math.PI) / 180);
              const y2 = 60 + 50 * Math.sin(((index + 1) * (360 / data.length) * Math.PI) / 180);
              
              const path = `M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;
              
              return (
                <path
                  key={index}
                  d={path}
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth="2"
                />
              );
            })}
            <circle cx="60" cy="60" r="30" fill="white" />
            <text x="60" y="60" textAnchor="middle" dy=".3em" fontSize="12" fill="#7a3b06" fontWeight="bold">
              {total.toFixed(0)}
            </text>
          </svg>
        </div>
        <div style={styles.donutLegend}>
          {data.map((item, index) => (
            <div key={index} style={styles.legendItem}>
              <div 
                style={{
                  ...styles.legendColor,
                  backgroundColor: colors[index % colors.length]
                }} 
              />
              <span style={styles.legendLabel}>{item.label}</span>
              <span style={styles.legendValue}>
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Función para formatear moneda en formato corto
const formatCurrencyShort = (amount) => {
  if (!amount || amount === 0) return "Bs. 0";
  if (amount >= 1000000) {
    return `Bs. ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `Bs. ${(amount / 1000).toFixed(1)}K`;
  }
  return `Bs. ${amount.toFixed(2)}`;
};

// Componente de Header del Dashboard
function DashboardHeader({ lastUpdate, onRefresh, loading }) {
  const formatFullDate = (date) => {
    if (!date) return 'Cargando...';
    return date.toLocaleString('es-ES', {
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
          <h1 style={styles.title}>Panel Principal - Don Baratón</h1>
          <p style={styles.subtitle}>
            <span style={styles.statusDot}></span>
            Actualizado: {formatFullDate(lastUpdate)}
          </p>
        </div>
        
        <div style={styles.headerActions}>
          <div style={styles.restaurantBadge}>
            <Store size={16} />
            Don Baratón
          </div>
          <button 
            onClick={onRefresh}
            disabled={loading}
            style={{
              ...styles.refreshButton,
              ...(loading ? styles.refreshButtonDisabled : {})
            }}
            title="Actualizar estadísticas"
          >
            <RefreshCw 
              size={16} 
              style={loading ? { animation: "spin 1s linear infinite" } : {}} 
            />
            Actualizar
          </button>
        </div>
      </div>
    </header>
  );
}

// Componente de Acciones Rápidas
function QuickActions({ onAction }) {
  const actions = [
    { 
      key: 'ventas', 
      label: 'Nueva Venta', 
      icon: <Plus size={20} />,
      description: 'Crear nueva venta'
    },
    { 
      key: 'inventario', 
      label: 'Ver Inventario', 
      icon: <Box size={20} />,
      description: 'Gestionar stock'
    },
    { 
      key: 'personal', 
      label: 'Gestionar Personal', 
      icon: <User size={20} />,
      description: 'Administrar empleados'
    },
    { 
      key: 'compras', 
      label: 'Nueva Compra', 
      icon: <ShoppingCart size={20} />,
      description: 'Registrar compra'
    }
  ];

  return (
    <section style={styles.quickActions}>
      <h2 style={styles.quickActionsTitle}>
        <Layers size={20} />
        Acciones Rápidas
      </h2>
      <div style={styles.actionsGrid}>
        {actions.map(action => (
          <button
            key={action.key}
            onClick={() => onAction(action.key)}
            style={styles.actionButton}
            title={action.description}
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
}

// Componente de Alerta
function Alert({ type, message }) {
  const alertStyles = {
    success: {
      background: "#d4edda",
      color: "#155724",
      borderColor: "#c3e6cb"
    },
    warning: {
      background: "#fff3cd",
      color: "#856404",
      borderColor: "#ffeaa7"
    },
    danger: {
      background: "#f8d7da",
      color: "#721c24",
      borderColor: "#f5c6cb"
    }
  };

  const style = alertStyles[type] || alertStyles.warning;

  return (
    <div style={{
      padding: "12px 16px",
      borderRadius: "8px",
      border: `1px solid ${style.borderColor}`,
      backgroundColor: style.background,
      color: style.color,
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "20px"
    }}>
      {type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
      {message}
    </div>
  );
}

// Componente de Carga
function DashboardSkeleton() {
  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerTitle}>
            <div style={styles.skeletonTitle}></div>
            <div style={styles.skeletonSubtitle}></div>
          </div>
        </div>
      </div>
      <div style={styles.statsGrid}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={styles.cardSkeleton}>
            <div style={styles.skeletonLoader}></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Función principal del Dashboard
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    ventasHoy: 0,
    ventasMes: 0,
    clientesRegistrados: 0,
    productosStockBajo: 0,
    empleadosActivos: 0,
    proveedoresActivos: 0
  });
  const [chartData, setChartData] = useState({
    ventasMensuales: [],
    categoriasVentas: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  // Estilos globales
  useEffect(() => {
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
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return "Bs. 0.00";
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Funciones para obtener datos de Supabase
  const fetchVentasHoy = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('ventas')
        .select('total')
        .gte('fecha_hora', `${hoy}T00:00:00`)
        .lte('fecha_hora', `${hoy}T23:59:59`)
        .eq('estadoA', true);

      if (error) throw error;
      
      const total = data.reduce((sum, venta) => sum + (parseFloat(venta.total) || 0), 0);
      return { total, count: data.length };
    } catch (error) {
      console.error('Error fetching ventas hoy:', error);
      return { total: 0, count: 0 };
    }
  };

  const fetchVentasMes = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('ventas')
        .select('total, fecha_hora')
        .gte('fecha_hora', startDate.toISOString())
        .lte('fecha_hora', endDate.toISOString())
        .eq('estadoA', true);

      if (error) throw error;
      
      const total = data.reduce((sum, venta) => sum + (parseFloat(venta.total) || 0), 0);
      
      // Generar datos para gráfica de ventas mensuales
      const ventasMensuales = generarDatosMensuales(data);
      
      return { total, ventasMensuales };
    } catch (error) {
      console.error('Error fetching ventas mes:', error);
      return { total: 0, ventasMensuales: [] };
    }
  };

  const generarDatosMensuales = (ventasData) => {
    const meses = [];
    const ahora = new Date();
    
    // Generar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'short' });
      meses.push({ label: nombreMes, value: 0 });
    }
    
    // Calcular ventas por mes
    ventasData.forEach(venta => {
      const fechaVenta = new Date(venta.fecha_hora);
      const mesVenta = fechaVenta.toLocaleDateString('es-ES', { month: 'short' });
      const monto = parseFloat(venta.total) || 0;
      
      const mesIndex = meses.findIndex(mes => mes.label === mesVenta);
      if (mesIndex !== -1) {
        meses[mesIndex].value += monto;
      }
    });
    
    return meses;
  };

  const fetchClientesRegistrados = async () => {
    try {
      const { count, error } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('estadoA', true)
        .eq('estado', 'ACTIVO');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching clientes:', error);
      return 0;
    }
  };

  const fetchProductosStockBajo = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('id, nombre, stock_actual, stock_minimo')
        .eq('estadoA', true)
        .lt('stock_actual', supabase.raw('stock_minimo + 5'));

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error fetching productos stock bajo:', error);
      return 0;
    }
  };

  const fetchEmpleadosActivos = async () => {
    try {
      const { count, error } = await supabase
        .from('empleados')
        .select('*', { count: 'exact', head: true })
        .eq('estadoA', true)
        .neq('estado', 'INACTIVO');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching empleados:', error);
      return 0;
    }
  };

  const fetchProveedoresActivos = async () => {
    try {
      const { count, error } = await supabase
        .from('proveedores')
        .select('*', { count: 'exact', head: true })
        .eq('estadoA', true)
        .eq('estado', 'ACTIVO');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching proveedores:', error);
      return 0;
    }
  };

  const fetchDatosGraficas = async () => {
    try {
      // Obtener ventas por categoría de los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select(`
          id,
          detalle_ventas (
            producto_id,
            productos (
              categoria_id,
              categorias (nombre)
            ),
            subtotal
          )
        `)
        .gte('fecha_hora', thirtyDaysAgo.toISOString())
        .eq('estadoA', true);

      if (ventasError) throw ventasError;

      // Procesar ventas por categoría
      const categoriasVentasMap = {};
      
      ventasData?.forEach(venta => {
        venta.detalle_ventas?.forEach(detalle => {
          const categoriaNombre = detalle.productos?.categorias?.nombre || 'Sin categoría';
          const subtotal = parseFloat(detalle.subtotal) || 0;
          
          if (categoriasVentasMap[categoriaNombre]) {
            categoriasVentasMap[categoriaNombre] += subtotal;
          } else {
            categoriasVentasMap[categoriaNombre] = subtotal;
          }
        });
      });

      // Convertir a array para la gráfica
      const categoriasVentas = Object.entries(categoriasVentasMap).map(([label, value]) => ({
        label: label.length > 10 ? label.substring(0, 10) + '...' : label,
        value: value
      })).slice(0, 5); // Limitar a 5 categorías

      return {
        categoriasVentas
      };
    } catch (error) {
      console.error('Error fetching datos gráficas:', error);
      return {
        categoriasVentas: []
      };
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      setAlert(null);

      const [
        ventasHoyData,
        ventasMesData,
        clientesRegistradosData,
        productosStockBajoData,
        empleadosActivosData,
        proveedoresActivosData,
        datosGraficas
      ] = await Promise.allSettled([
        fetchVentasHoy(),
        fetchVentasMes(),
        fetchClientesRegistrados(),
        fetchProductosStockBajo(),
        fetchEmpleadosActivos(),
        fetchProveedoresActivos(),
        fetchDatosGraficas()
      ]);

      const ventasHoy = ventasHoyData.status === 'fulfilled' ? ventasHoyData.value : { total: 0, count: 0 };
      const ventasMes = ventasMesData.status === 'fulfilled' ? ventasMesData.value : { total: 0, ventasMensuales: [] };
      const clientesRegistrados = clientesRegistradosData.status === 'fulfilled' ? clientesRegistradosData.value : 0;
      const productosStockBajo = productosStockBajoData.status === 'fulfilled' ? productosStockBajoData.value : 0;
      const empleadosActivos = empleadosActivosData.status === 'fulfilled' ? empleadosActivosData.value : 0;
      const proveedoresActivos = proveedoresActivosData.status === 'fulfilled' ? proveedoresActivosData.value : 0;
      const graficas = datosGraficas.status === 'fulfilled' ? datosGraficas.value : {
        categoriasVentas: []
      };

      setStats({
        ventasHoy: ventasHoy.total,
        ventasMes: ventasMes.total,
        clientesRegistrados,
        productosStockBajo,
        empleadosActivos,
        proveedoresActivos
      });

      setChartData({
        ventasMensuales: ventasMes.ventasMensuales.length > 0 ? ventasMes.ventasMensuales : generarDatosDefault(),
        categoriasVentas: graficas.categoriasVentas.length > 0 ? graficas.categoriasVentas : [
          { label: 'Abarrotes', value: 12000 },
          { label: 'Lácteos', value: 8500 },
          { label: 'Bebidas', value: 6500 }
        ]
      });

      setLastUpdate(new Date());

      // Mostrar alerta si hay productos con stock bajo
      if (productosStockBajo > 0) {
        setAlert({
          type: 'warning',
          message: `Hay ${productosStockBajo} productos con stock bajo. Revisa el inventario.`
        });
      }

    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('No se pudieron cargar las estadísticas. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  };

  const generarDatosDefault = () => {
    const ahora = new Date();
    const meses = [];
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const nombreMes = fecha.toLocaleDateString('es-ES', { month: 'short' });
      meses.push({ 
        label: nombreMes, 
        value: Math.floor(Math.random() * 50000) + 10000 
      });
    }
    
    return meses;
  };

  useEffect(() => {
    fetchStats();
    
    // Refrescar automáticamente cada 5 minutos
    const intervalId = setInterval(fetchStats, 300000);
    return () => clearInterval(intervalId);
  }, []);

  const handleQuickAction = (action) => {
    const routes = {
      ventas: '/ventas',
      inventario: '/inventario',
      personal: '/empleados',
      compras: '/compras'
    };
    
    if (routes[action]) {
      navigate(routes[action]);
    }
  };

  if (loading && !lastUpdate) {
    return <DashboardSkeleton />;
  }

  return (
    <div style={styles.dashboardContainer}>
      {/* Header */}
      <DashboardHeader 
        lastUpdate={lastUpdate} 
        onRefresh={fetchStats}
        loading={loading}
      />

      {/* Alertas */}
      {alert && <Alert type={alert.type} message={alert.message} />}

      {/* Mensaje de error */}
      {error && (
        <div style={styles.errorBanner}>
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={fetchStats} style={styles.retryButton}>
            Reintentar
          </button>
        </div>
      )}

      {/* Estadísticas Principales */}
      <section style={styles.statsGrid}>
        <Card 
          title="Ventas del día" 
          value={formatCurrency(stats.ventasHoy)}
          subtitle="Ingresos totales de hoy"
          icon={<DollarSign size={20} />}
          trend={stats.ventasHoy > 0 ? "up" : "neutral"}
          onClick={() => handleQuickAction('ventas')}
          clickable
        />
        
        <Card 
          title="Ventas del mes" 
          value={formatCurrency(stats.ventasMes)}
          subtitle="Ingresos mensuales"
          icon={<TrendingUp size={20} />}
          trend={stats.ventasMes > 0 ? "up" : "neutral"}
        />
        
        <Card 
          title="Clientes activos" 
          value={stats.clientesRegistrados}
          subtitle="Clientes registrados"
          icon={<Users size={20} />}
          trend={stats.clientesRegistrados > 0 ? "up" : "neutral"}
          onClick={() => navigate('/clientes')}
          clickable
        />
        
        <Card 
          title="Stock bajo" 
          value={stats.productosStockBajo}
          subtitle="Productos por reabastecer"
          icon={<Package size={20} />}
          trend={stats.productosStockBajo > 0 ? "down" : "neutral"}
          onClick={() => navigate('/alertas-stock')}
          clickable
        />
      </section>

      {/* Gráficas Principales */}
      <section style={styles.chartsSection}>
        <h2 style={styles.sectionTitle}>
          <BarChart3 size={20} />
          Métricas del Negocio
        </h2>
        
        <div style={styles.chartsGrid}>
          <BarChart 
            title="Ventas Mensuales (Últimos 6 meses)" 
            data={chartData.ventasMensuales}
            color="#7a3b06"
          />
          
          <DonutChart 
            title="Ventas por Categoría"
            data={chartData.categoriasVentas}
          />
        </div>
      </section>

      {/* Información Adicional */}
      <section style={styles.infoSection}>
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <div style={styles.infoHeader}>
              <Users size={18} />
              <h3 style={styles.infoTitle}>Personal</h3>
            </div>
            <div style={styles.categoryInfo}>
              <div style={styles.categoryItem}>
                <span style={styles.categoryName}>Empleados activos</span>
                <span style={styles.categoryCount}>{stats.empleadosActivos}</span>
              </div>
              <div style={styles.categoryItem}>
                <span style={styles.categoryName}>Proveedores activos</span>
                <span style={styles.categoryCount}>{stats.proveedoresActivos}</span>
              </div>
            </div>
          </div>
          
          <div style={styles.infoCard}>
            <div style={styles.infoHeader}>
              <Calendar size={18} />
              <h3 style={styles.infoTitle}>Resumen del Mes</h3>
            </div>
            <div style={styles.summaryInfo}>
              <div style={styles.summaryItem}>
                <span>Ventas mensuales:</span>
                <strong>{formatCurrency(stats.ventasMes)}</strong>
              </div>
              <div style={styles.summaryItem}>
                <span>Ventas diarias promedio:</span>
                <strong>{formatCurrency(stats.ventasMes / 30)}</strong>
              </div>
              <div style={styles.summaryItem}>
                <span>Días transcurridos:</span>
                <strong>{new Date().getDate()}/30</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acciones Rápidas */}
      <QuickActions onAction={handleQuickAction} />
    </div>
  );
}

// Estilos actualizados
const styles = {
  dashboardContainer: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "30px",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: "28px",
    color: "#7a3b06",
    marginBottom: "8px",
    fontWeight: "700",
    margin: 0,
  },
  subtitle: {
    color: "#6d4611",
    fontSize: "14px",
    opacity: 0.9,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
  },
  statusDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "#28a745",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
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
    border: "1px solid #e9d8b5",
    fontSize: "14px",
    color: "#7a3b06",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  refreshButton: {
    padding: "8px 16px",
    background: "#7a3b06",
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
  refreshButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  errorBanner: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #f5c6cb",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  retryButton: {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "4px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "auto",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  chartsSection: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "20px",
    color: "#7a3b06",
    marginBottom: "20px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
  },
  chartCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e9d8b5",
    minHeight: "300px",
  },
  chartTitle: {
    color: "#7a3b06",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "15px",
    margin: "0 0 15px 0",
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
    color: "#6d4611",
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
    color: "#6d4611",
    fontWeight: "500",
    minWidth: "50px",
    textAlign: "right",
  },
  // Gráfica de Donut
  donutContainer: {
    display: "flex",
    gap: "20px",
    alignItems: "center",
    justifyContent: "center",
    height: "200px",
  },
  donutChart: {
    flexShrink: 0,
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
    color: "#6d4611",
    flex: 1,
  },
  legendValue: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#7a3b06",
  },
  noData: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "200px",
    color: "#6d4611",
    fontSize: "14px",
  },
  // Sección de Información
  infoSection: {
    marginBottom: "30px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  infoCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e9d8b5",
  },
  infoHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  infoTitle: {
    color: "#7a3b06",
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
  },
  categoryInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  categoryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  categoryName: {
    color: "#6d4611",
    fontSize: "14px",
  },
  categoryCount: {
    color: "#7a3b06",
    fontWeight: "600",
    fontSize: "14px",
  },
  summaryInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
  },
  // Acciones Rápidas
  quickActions: {
    marginTop: "30px",
  },
  quickActionsTitle: {
    fontSize: "20px",
    color: "#7a3b06",
    marginBottom: "20px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  actionButton: {
    padding: "20px 15px",
    background: "white",
    border: "1px solid #e9d8b5",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    fontSize: "16px",
    color: "#7a3b06",
  },
  actionIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    background: "rgba(122, 59, 6, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#7a3b06",
  },
  actionLabel: {
    fontWeight: "500",
  },
  // Skeleton
  cardSkeleton: {
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e9d8b5",
    height: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "280px"
  },
  skeletonLoader: {
    width: "80%",
    height: "20px",
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "loading 1.5s infinite",
    borderRadius: "4px",
  },
  skeletonTitle: {
    width: "200px",
    height: "28px",
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "loading 1.5s infinite",
    borderRadius: "4px",
    marginBottom: "10px",
  },
  skeletonSubtitle: {
    width: "150px",
    height: "16px",
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "loading 1.5s infinite",
    borderRadius: "4px",
  },
};
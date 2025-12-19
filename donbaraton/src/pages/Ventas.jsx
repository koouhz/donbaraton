// src/pages/Ventas.jsx
import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Plus, Minus, Trash2,
  X, CreditCard, Banknote, QrCode, Receipt,
  Loader2, User, CheckCircle, AlertCircle, Scan, Printer,
  Store, FileText, Calendar, Clock, Hash
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabaseClient';

export default function Ventas() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(0);
  const [tipoComprobante, setTipoComprobante] = useState('TICKET');
  const [facturaDatos, setFacturaDatos] = useState({ nit: '', razon_social: '', direccion: '' });
  const [ultimoProductoAgregado, setUltimoProductoAgregado] = useState(null);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [comprobanteData, setComprobanteData] = useState(null);
  const scannerRef = useRef(null);

  const getUser = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return { id: parsed.usuario_id || 1, username: parsed.username || 'admin' };
      } catch { return { id: 1, username: 'admin' }; }
    }
    return { id: 1, username: 'admin' };
  };

  useEffect(() => {
    cargarDatos();
    // Enfocar el campo del escáner al cargar
    setTimeout(() => scannerRef.current?.focus(), 100);
  }, []);

  // Temporizador automático para pago QR
  useEffect(() => {
    let timer;
    let processed = false;
    if (showPaymentModal && medioPago === 'QR' && clienteSeleccionado && carrito.length > 0 && !processing) {
      setQrCountdown(20);
      timer = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1 && !processed) {
            clearInterval(timer);
            processed = true;
            procesarVenta();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setQrCountdown(0);
    }
    return () => {
      clearInterval(timer);
      processed = true;
    };
  }, [showPaymentModal, medioPago, clienteSeleccionado]);

  // Pre-llenar datos de factura al seleccionar cliente
  useEffect(() => {
    if (clienteSeleccionado) {
      setFacturaDatos({
        nit: clienteSeleccionado.ci_nit !== '0' ? clienteSeleccionado.ci_nit : '',
        razon_social: clienteSeleccionado.nombres + (clienteSeleccionado.apellido_paterno ? ' ' + clienteSeleccionado.apellido_paterno : ''),
        direccion: clienteSeleccionado.direccion || ''
      });
    }
  }, [clienteSeleccionado]);

  // Limpiar feedback del último producto después de 3 segundos
  useEffect(() => {
    if (ultimoProductoAgregado) {
      const timer = setTimeout(() => setUltimoProductoAgregado(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [ultimoProductoAgregado]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [prodRes, cliRes] = await Promise.all([
        supabase.rpc('fn_listar_productos', { p_buscar: null }),
        supabase.rpc('fn_listar_clientes', { p_busqueda: null })
      ]);

      if (prodRes.error) throw prodRes.error;
      if (cliRes.error) throw cliRes.error;

      setProductos(prodRes.data || []);
      setClientes(cliRes.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar producto por código de barras
  const buscarPorCodigoBarras = (codigo) => {
    if (!codigo.trim()) return null;

    // Buscar por código de barras o código interno
    const producto = productos.find(p =>
      p.codigo_barras === codigo.trim() ||
      p.codigo_interno?.toLowerCase() === codigo.trim().toLowerCase()
    );

    return producto;
  };

  // Manejar escaneo de código de barras
  const handleScan = (e) => {
    // Si se presiona Enter, buscar el producto
    if (e.key === 'Enter') {
      e.preventDefault();

      const producto = buscarPorCodigoBarras(codigoBarras);

      if (producto) {
        agregarAlCarrito(producto);
        setUltimoProductoAgregado(producto);
      } else {
        toast.error(`Producto no encontrado: ${codigoBarras}`);
      }

      // Limpiar el campo para el siguiente escaneo
      setCodigoBarras('');
      scannerRef.current?.focus();
    }
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(c =>
    c.nombre_completo?.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    c.ci_nit?.includes(clienteSearch)
  ).slice(0, 20);

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    if (producto.stock_actual <= 0) {
      toast.error('Producto sin stock');
      return;
    }

    const existente = carrito.find(item => item.producto_id === producto.id_producto);

    if (existente) {
      if (existente.cantidad >= producto.stock_actual) {
        toast.error('Stock insuficiente');
        return;
      }
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id_producto
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id_producto,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio_venta),
        cantidad: 1,
        stock_disponible: producto.stock_actual
      }]);
    }

    toast.success(`${producto.nombre} agregado`);
  };

  // Modificar cantidad
  const modificarCantidad = (productoId, delta) => {
    setCarrito(carrito.map(item => {
      if (item.producto_id === productoId) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad <= 0) return null;
        if (nuevaCantidad > item.stock_disponible) {
          toast.error('Stock insuficiente');
          return item;
        }
        return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }).filter(Boolean));
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.producto_id !== productoId));
  };

  // Calcular totales
  const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const total = subtotal;
  const vuelto = parseFloat(montoRecibido || 0) - total;

  // Procesar venta
  const procesarVenta = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    if (!clienteSeleccionado) {
      toast.error('Seleccione un cliente');
      setShowClienteModal(true);
      return;
    }

    if (medioPago === 'EFECTIVO' && parseFloat(montoRecibido || 0) < total) {
      toast.error('Monto recibido insuficiente');
      return;
    }

    if (tipoComprobante === 'FACTURA' && (!facturaDatos.nit || !facturaDatos.razon_social)) {
      toast.error('NIT y Razón Social son obligatorios para Factura');
      return;
    }

    setProcessing(true);
    try {
      const user = getUser();
      const detallesJson = carrito.map(item => ({
        id_producto: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        descuento: 0
      }));

      const { data, error } = await supabase.rpc('fn_registrar_venta', {
        p_id_cliente: clienteSeleccionado.id_cliente,
        p_tipo_comprobante: tipoComprobante,
        p_detalles: detallesJson,
        p_medio_pago: medioPago,
        p_monto_total: total,
        p_monto_recibido: medioPago === 'EFECTIVO' ? parseFloat(montoRecibido) : total,
        p_username: user.username,
        p_nit_cliente: tipoComprobante === 'FACTURA' ? facturaDatos.nit : null,
        p_razon_social: tipoComprobante === 'FACTURA' ? facturaDatos.razon_social : null,
        p_direccion_factura: tipoComprobante === 'FACTURA' ? facturaDatos.direccion : null
      });

      if (error) {
        console.error('Error venta:', error);
        if (error.message.includes('Stock insuficiente')) {
          toast.error('Stock insuficiente para uno de los productos');
        } else {
          toast.error(error.message || 'Error al registrar venta');
        }
      } else {
        // Guardar datos para el comprobante
        const fechaVenta = new Date();
        setComprobanteData({
          idVenta: data,
          tipo: tipoComprobante,
          fecha: fechaVenta.toLocaleDateString('es-BO'),
          hora: fechaVenta.toLocaleTimeString('es-BO'),
          cliente: clienteSeleccionado,
          items: [...carrito],
          subtotal: subtotal,
          total: total,
          medioPago: medioPago,
          montoRecibido: medioPago === 'EFECTIVO' ? parseFloat(montoRecibido) : total,
          vuelto: medioPago === 'EFECTIVO' ? vuelto : 0,
          facturaDatos: tipoComprobante === 'FACTURA' ? { ...facturaDatos } : null,
          cajero: getUser().username
        });

        toast.success('¡Venta registrada exitosamente!');

        if (medioPago === 'EFECTIVO' && vuelto > 0) {
          toast(`Vuelto: Bs ${vuelto.toFixed(2)}`, { icon: '💰', duration: 5000 });
        }

        // Mostrar modal del comprobante
        setShowPaymentModal(false);
        setShowComprobanteModal(true);

        setCarrito([]);
        setClienteSeleccionado(null);
        setMontoRecibido('');
        cargarDatos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al procesar la venta');
    } finally {
      setProcessing(false);
    }
  };

  // Limpiar venta
  const limpiarVenta = () => {
    if (carrito.length > 0 && !window.confirm('¿Limpiar la venta actual?')) return;
    setCarrito([]);
    setClienteSeleccionado(null);
    setMontoRecibido('');
    scannerRef.current?.focus();
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value).toFixed(2)}`;

  return (
    <div style={styles.container}>
      <Toaster position="top-center" />

      <div style={styles.posLayout}>
        {/* Panel izquierdo: Escáner y cliente */}
        <div style={styles.leftPanel}>
          {/* Sección del Escáner de Código de Barras */}
          <div style={styles.scannerSection}>
            <h2 style={styles.panelTitle}>
              <Scan size={24} />
              Escáner de Código de Barras
            </h2>

            <div style={styles.scannerBox}>
              <div style={styles.scannerIcon}>
                <Scan size={32} />
              </div>
              <input
                ref={scannerRef}
                type="text"
                placeholder="Escanee o ingrese el código de barras..."
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                onKeyDown={handleScan}
                style={styles.scannerInput}
                autoFocus
              />
              {codigoBarras && (
                <button onClick={() => setCodigoBarras('')} style={styles.clearButton}>
                  <X size={18} />
                </button>
              )}
            </div>

            <p style={styles.scannerHint}>
              Escanee el código de barras del producto o escriba el código y presione <strong>Enter</strong>
            </p>

            {/* Feedback del último producto agregado */}
            {ultimoProductoAgregado && (
              <div style={styles.feedbackCard}>
                <CheckCircle size={20} style={{ color: '#2e7d32' }} />
                <div>
                  <strong>{ultimoProductoAgregado.nombre}</strong>
                  <span style={styles.feedbackPrice}>
                    {formatCurrency(ultimoProductoAgregado.precio_venta)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cliente seleccionado */}
          <div style={styles.clienteSection}>
            <h3 style={styles.clienteTitle}>
              <User size={18} />
              Cliente
            </h3>
            {clienteSeleccionado ? (
              <div style={styles.clienteCard}>
                <div>
                  <strong>{clienteSeleccionado.nombre_completo}</strong>
                  <span style={styles.clienteCI}>CI/NIT: {clienteSeleccionado.ci_nit}</span>
                </div>
                <button
                  style={styles.changeClienteBtn}
                  onClick={() => setShowClienteModal(true)}
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <button
                style={styles.selectClienteBtn}
                onClick={() => setShowClienteModal(true)}
              >
                <Plus size={18} />
                Seleccionar Cliente
              </button>
            )}
          </div>

          {/* Instrucciones */}
          <div style={styles.instructionsCard}>
            <h4 style={styles.instructionsTitle}>📋 Instrucciones</h4>
            <ol style={styles.instructionsList}>
              <li>Seleccione un cliente</li>
              <li>Escanee los productos con el lector</li>
              <li>Verifique el carrito</li>
              <li>Procese el pago</li>
            </ol>
          </div>
        </div>

        {/* Panel derecho: Carrito */}
        <div style={styles.rightPanel}>
          <div style={styles.cartHeader}>
            <h2 style={styles.panelTitle}>
              <ShoppingCart size={20} />
              Carrito ({carrito.length})
            </h2>
            {carrito.length > 0 && (
              <button style={styles.clearCartBtn} onClick={limpiarVenta}>
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div style={styles.cartItems}>
            {carrito.length === 0 ? (
              <div style={styles.emptyCart}>
                <ShoppingCart size={48} style={{ color: '#ccc' }} />
                <p>Carrito vacío</p>
                <span>Escanee productos para agregar</span>
              </div>
            ) : (
              carrito.map(item => (
                <div key={item.producto_id} style={styles.cartItem}>
                  <div style={styles.cartItemInfo}>
                    <span style={styles.cartItemName}>{item.nombre}</span>
                    <span style={styles.cartItemPrice}>{formatCurrency(item.precio)} c/u</span>
                  </div>
                  <div style={styles.cartItemControls}>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => modificarCantidad(item.producto_id, -1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={styles.qtyValue}>{item.cantidad}</span>
                    <button
                      style={styles.qtyBtn}
                      onClick={() => modificarCantidad(item.producto_id, 1)}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      style={styles.removeBtn}
                      onClick={() => eliminarDelCarrito(item.producto_id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={styles.cartItemTotal}>
                    {formatCurrency(item.precio * item.cantidad)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totales y pago */}
          <div style={styles.cartFooter}>
            <div style={styles.totalsRow}>
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div style={styles.totalRow}>
              <span>TOTAL:</span>
              <span style={styles.totalValue}>{formatCurrency(total)}</span>
            </div>

            <button
              style={{
                ...styles.payButton,
                opacity: carrito.length === 0 ? 0.5 : 1
              }}
              onClick={() => setShowPaymentModal(true)}
              disabled={carrito.length === 0}
            >
              <CreditCard size={20} />
              Procesar Pago
            </button>
          </div>
        </div>
      </div>

      {/* Modal de selección de cliente */}
      {showClienteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowClienteModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Seleccionar Cliente</h3>
              <button style={styles.closeBtn} onClick={() => setShowClienteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.searchBox}>
                <input
                  type="text"
                  placeholder="Buscar por nombre o CI..."
                  value={clienteSearch}
                  onChange={e => setClienteSearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              <div style={styles.clienteList}>
                {clientesFiltrados.map(cliente => (
                  <div
                    key={cliente.id_cliente}
                    style={styles.clienteOption}
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setShowClienteModal(false);
                      setClienteSearch('');
                      scannerRef.current?.focus();
                    }}
                  >
                    <User size={20} style={{ color: '#1a5d1a' }} />
                    <div>
                      <strong>{cliente.nombre_completo}</strong>
                      <span style={styles.clienteCI}>{cliente.ci_nit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      {showPaymentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.paymentModal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Procesar Pago</h3>
              <button style={styles.closeBtn} onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.paymentBody}>

              {/* Selector Tipo Comprobante */}
              <div style={styles.comprobanteSelector}>
                <button
                  style={{
                    ...styles.comprobanteBtn,
                    ...(tipoComprobante === 'TICKET' ? styles.comprobanteBtnActive : {})
                  }}
                  onClick={() => setTipoComprobante('TICKET')}
                >
                  <Receipt size={18} /> Ticket
                </button>
                <button
                  style={{
                    ...styles.comprobanteBtn,
                    ...(tipoComprobante === 'FACTURA' ? styles.comprobanteBtnActive : {})
                  }}
                  onClick={() => setTipoComprobante('FACTURA')}
                >
                  <Receipt size={18} /> Factura
                </button>
              </div>

              {tipoComprobante === 'FACTURA' && (
                <div style={styles.facturaForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>NIT / CI *</label>
                    <input
                      type="text"
                      value={facturaDatos.nit}
                      onChange={(e) => setFacturaDatos({ ...facturaDatos, nit: e.target.value })}
                      style={styles.input}
                      placeholder="NIT del cliente"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Razón Social *</label>
                    <input
                      type="text"
                      value={facturaDatos.razon_social}
                      onChange={(e) => setFacturaDatos({ ...facturaDatos, razon_social: e.target.value })}
                      style={styles.input}
                      placeholder="Nombre o Razón Social"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Dirección (Opcional)</label>
                    <input
                      type="text"
                      value={facturaDatos.direccion}
                      onChange={(e) => setFacturaDatos({ ...facturaDatos, direccion: e.target.value })}
                      style={styles.input}
                      placeholder="Dirección fiscal"
                    />
                  </div>
                </div>
              )}

              <div style={styles.paymentTotal}>
                <span>Total a Pagar</span>
                <span style={styles.paymentTotalValue}>{formatCurrency(total)}</span>
              </div>

              <div style={styles.paymentMethods}>
                <button
                  style={{
                    ...styles.paymentMethod,
                    ...(medioPago === 'EFECTIVO' ? styles.paymentMethodActive : {})
                  }}
                  onClick={() => setMedioPago('EFECTIVO')}
                >
                  <Banknote size={24} />
                  Efectivo
                </button>
                <button
                  style={{
                    ...styles.paymentMethod,
                    ...(medioPago === 'QR' ? styles.paymentMethodActive : {})
                  }}
                  onClick={() => setMedioPago('QR')}
                >
                  <QrCode size={24} />
                  QR
                </button>
                <button
                  style={{
                    ...styles.paymentMethod,
                    ...(medioPago === 'DEBITO' ? styles.paymentMethodActive : {})
                  }}
                  onClick={() => setMedioPago('DEBITO')}
                >
                  <CreditCard size={24} />
                  Tarjeta
                </button>
              </div>

              {medioPago === 'EFECTIVO' && (
                <div style={styles.efectivoSection}>
                  <label>Monto Recibido (Bs)</label>
                  <input
                    type="number"
                    value={montoRecibido}
                    onChange={e => setMontoRecibido(e.target.value)}
                    style={styles.montoInput}
                    placeholder="0.00"
                    min={total}
                    step="0.5"
                  />
                  {parseFloat(montoRecibido) >= total && (
                    <div style={styles.vueltoBox}>
                      <span>Vuelto:</span>
                      <span style={styles.vueltoValue}>{formatCurrency(vuelto)}</span>
                    </div>
                  )}
                </div>
              )}

              {medioPago === 'QR' && (
                <div style={styles.qrSection}>
                  <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '15px' }}>
                    Escanea el código QR para pagar
                  </p>
                  <div style={styles.qrContainer}>
                    <QRCodeSVG
                      value={`DON BARATON - PAGO SIMULADO\nMonto: Bs ${total.toFixed(2)}\nCliente: ${clienteSeleccionado?.nombre_completo || 'N/A'}\nFecha: ${new Date().toLocaleDateString('es-BO')}`}
                      size={180}
                      level="H"
                      includeMargin={true}
                      bgColor="#ffffff"
                      fgColor="#1a5d1a"
                    />
                  </div>
                  {qrCountdown > 0 ? (
                    <div style={styles.qrCountdown}>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Confirmando pago en {qrCountdown} segundos...</span>
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '10px' }}>
                      Código QR simulado para demostración
                    </p>
                  )}
                </div>
              )}

              <button
                style={styles.confirmPayBtn}
                onClick={procesarVenta}
                disabled={processing || !clienteSeleccionado}
              >
                {processing ? (
                  <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</>
                ) : (
                  <><CheckCircle size={20} /> Confirmar Venta</>
                )}
              </button>

              {!clienteSeleccionado && (
                <p style={styles.warningText}>
                  <AlertCircle size={16} /> Debe seleccionar un cliente
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comprobante (Ticket/Factura) */}
      {showComprobanteModal && comprobanteData && (
        <div style={styles.modalOverlay}>
          <div style={styles.comprobanteModal}>
            <div style={styles.comprobanteHeader}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                {comprobanteData.tipo === 'FACTURA' ? <FileText size={20} /> : <Receipt size={20} />}
                {comprobanteData.tipo === 'FACTURA' ? 'Factura' : 'Ticket de Venta'}
              </h3>
              <div style={styles.comprobanteActions}>
                <button
                  style={styles.printBtn}
                  onClick={() => {
                    const printContent = document.getElementById('comprobante-print');
                    const WinPrint = window.open('', '', 'width=400,height=600');
                    WinPrint.document.write('<html><head><title>Comprobante</title>');
                    WinPrint.document.write('<style>body{font-family:Arial,sans-serif;padding:20px;font-size:12px} table{width:100%;border-collapse:collapse} th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd} .center{text-align:center} .right{text-align:right} .bold{font-weight:bold} .total{font-size:16px;font-weight:bold} hr{border:1px dashed #ccc}</style>');
                    WinPrint.document.write('</head><body>');
                    WinPrint.document.write(printContent.innerHTML);
                    WinPrint.document.write('</body></html>');
                    WinPrint.document.close();
                    WinPrint.focus();
                    WinPrint.print();
                    WinPrint.close();
                  }}
                >
                  <Printer size={18} />
                  Imprimir
                </button>
                <button
                  style={styles.closeComprobanteBtn}
                  onClick={() => {
                    setShowComprobanteModal(false);
                    setComprobanteData(null);
                    setTimeout(() => scannerRef.current?.focus(), 100);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div id="comprobante-print" style={styles.comprobanteBody}>
              {/* Encabezado */}
              <div style={styles.comprobanteTitulo}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <Store size={32} style={{ color: '#1a5d1a' }} />
                </div>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1a5d1a' }}>DON BARATON</h2>
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Supermercado</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#999' }}>NIT: 123456789 | La Paz, Bolivia</p>
              </div>

              <hr style={{ border: '1px dashed #ccc', margin: '15px 0' }} />

              {/* Tipo de comprobante */}
              <div style={styles.comprobanteTipo}>
                <strong>{comprobanteData.tipo === 'FACTURA' ? 'FACTURA' : 'TICKET DE VENTA'}</strong>
              </div>

              {/* Info de la venta */}
              <div style={styles.comprobanteInfo}>
                <div style={styles.infoRow}>
                  <span>Nº Comprobante:</span>
                  <strong>{comprobanteData.idVenta}</strong>
                </div>
                <div style={styles.infoRow}>
                  <span>Fecha:</span>
                  <span>{comprobanteData.fecha}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>Hora:</span>
                  <span>{comprobanteData.hora}</span>
                </div>
                <div style={styles.infoRow}>
                  <span>Cajero:</span>
                  <span>{comprobanteData.cajero}</span>
                </div>
              </div>

              <hr style={{ border: '1px dashed #ccc', margin: '15px 0' }} />

              {/* Datos del cliente */}
              <div style={styles.comprobanteCliente}>
                <strong>CLIENTE</strong>
                <p style={{ margin: '5px 0' }}>{comprobanteData.cliente?.nombre_completo || 'Cliente General'}</p>
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                  CI/NIT: {comprobanteData.cliente?.ci_nit || 'N/A'}
                </p>
                {comprobanteData.tipo === 'FACTURA' && comprobanteData.facturaDatos && (
                  <>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
                      <strong>Razón Social:</strong> {comprobanteData.facturaDatos.razon_social}
                    </p>
                    {comprobanteData.facturaDatos.direccion && (
                      <p style={{ margin: '3px 0 0 0', fontSize: '12px' }}>
                        <strong>Dirección:</strong> {comprobanteData.facturaDatos.direccion}
                      </p>
                    )}
                  </>
                )}
              </div>

              <hr style={{ border: '1px dashed #ccc', margin: '15px 0' }} />

              {/* Detalle de productos */}
              <table style={styles.comprobanteTable}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', paddingBottom: '10px', borderBottom: '2px solid #333' }}>Producto</th>
                    <th style={{ textAlign: 'center', paddingBottom: '10px', borderBottom: '2px solid #333' }}>Cant.</th>
                    <th style={{ textAlign: 'right', paddingBottom: '10px', borderBottom: '2px solid #333' }}>P.Unit</th>
                    <th style={{ textAlign: 'right', paddingBottom: '10px', borderBottom: '2px solid #333' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {comprobanteData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '8px 0', fontSize: '13px' }}>{item.nombre}</td>
                      <td style={{ textAlign: 'center', padding: '8px 0' }}>{item.cantidad}</td>
                      <td style={{ textAlign: 'right', padding: '8px 0' }}>Bs {item.precio.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: '600' }}>
                        Bs {(item.precio * item.cantidad).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <hr style={{ border: '1px dashed #ccc', margin: '15px 0' }} />

              {/* Totales */}
              <div style={styles.comprobanteTotales}>
                <div style={styles.totalRow}>
                  <span>Subtotal:</span>
                  <span>Bs {comprobanteData.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ ...styles.totalRow, fontSize: '20px', fontWeight: '700', color: '#1a5d1a', marginTop: '10px' }}>
                  <span>TOTAL:</span>
                  <span>Bs {comprobanteData.total.toFixed(2)}</span>
                </div>
              </div>

              <hr style={{ border: '1px dashed #ccc', margin: '15px 0' }} />

              {/* Información de pago */}
              <div style={styles.comprobantePago}>
                <div style={styles.infoRow}>
                  <span>Método de Pago:</span>
                  <strong>{comprobanteData.medioPago}</strong>
                </div>
                {comprobanteData.medioPago === 'EFECTIVO' && (
                  <>
                    <div style={styles.infoRow}>
                      <span>Monto Recibido:</span>
                      <span>Bs {comprobanteData.montoRecibido.toFixed(2)}</span>
                    </div>
                    <div style={{ ...styles.infoRow, color: '#1a5d1a', fontWeight: '600' }}>
                      <span>Vuelto:</span>
                      <span>Bs {comprobanteData.vuelto.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <hr style={{ border: '1px dashed #ccc', margin: '15px 0' }} />

              {/* Pie de comprobante */}
              <div style={styles.comprobantePie}>
                <p style={{ margin: '0', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                  ¡Gracias por su compra!
                </p>
                <p style={{ margin: '5px 0 0 0', textAlign: 'center', fontSize: '11px', color: '#999' }}>
                  Conserve este comprobante para cualquier reclamo
                </p>
                {comprobanteData.tipo === 'FACTURA' && (
                  <p style={{ margin: '10px 0 0 0', textAlign: 'center', fontSize: '10px', color: '#999' }}>
                    Este documento es una representación impresa de la factura electrónica
                  </p>
                )}
              </div>
            </div>

            <div style={styles.comprobanteFooter}>
              <button
                style={styles.nuevaVentaBtn}
                onClick={() => {
                  setShowComprobanteModal(false);
                  setComprobanteData(null);
                  setTimeout(() => scannerRef.current?.focus(), 100);
                }}
              >
                <CheckCircle size={18} />
                Nueva Venta
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
  container: { height: 'calc(100vh - 80px)', overflow: 'hidden' },
  posLayout: { display: 'flex', height: '100%', gap: '20px', padding: '20px' },
  leftPanel: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 },
  rightPanel: { width: '420px', background: 'white', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  panelTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a5d1a' },

  // Scanner Section
  scannerSection: { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  scannerBox: { display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', border: '3px solid #1a5d1a', borderRadius: '16px', marginTop: '20px' },
  scannerIcon: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', borderRadius: '12px', color: 'white' },
  scannerInput: { flex: 1, border: 'none', outline: 'none', fontSize: '22px', fontWeight: '600', background: 'transparent', padding: '10px 0', letterSpacing: '2px' },
  scannerHint: { marginTop: '15px', fontSize: '14px', color: '#6c757d', textAlign: 'center' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '5px' },

  // Feedback
  feedbackCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', background: '#e8f5e9', borderRadius: '12px', marginTop: '20px', animation: 'fadeIn 0.3s ease' },
  feedbackPrice: { display: 'block', fontSize: '14px', color: '#2e7d32', fontWeight: '600' },

  // Cliente Section
  clienteSection: { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  clienteTitle: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#333' },
  clienteCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#e8f5e9', borderRadius: '10px' },
  clienteCI: { display: 'block', fontSize: '12px', color: '#6c757d' },
  changeClienteBtn: { padding: '8px 16px', background: 'white', border: '1px solid #1a5d1a', borderRadius: '8px', color: '#1a5d1a', cursor: 'pointer', fontSize: '13px' },
  selectClienteBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '15px', background: '#f8f9fa', border: '2px dashed #ccc', borderRadius: '10px', color: '#6c757d', cursor: 'pointer', fontSize: '14px' },

  // Instructions
  instructionsCard: { background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)', borderRadius: '16px', padding: '20px' },
  instructionsTitle: { margin: '0 0 15px 0', fontSize: '16px', color: '#333' },
  instructionsList: { margin: 0, paddingLeft: '20px', color: '#6c757d', lineHeight: '2' },

  // Cart
  cartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e9ecef' },
  clearCartBtn: { padding: '8px', background: '#ffebee', border: 'none', borderRadius: '8px', color: '#c62828', cursor: 'pointer' },
  cartItems: { flex: 1, overflowY: 'auto', padding: '15px' },
  emptyCart: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', gap: '10px' },
  cartItem: { display: 'flex', flexDirection: 'column', padding: '15px', background: '#f8f9fa', borderRadius: '10px', marginBottom: '10px' },
  cartItemInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  cartItemName: { fontWeight: '600', color: '#333' },
  cartItemPrice: { fontSize: '13px', color: '#6c757d' },
  cartItemControls: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: { padding: '6px', background: 'white', border: '1px solid #e9ecef', borderRadius: '6px', cursor: 'pointer' },
  qtyValue: { minWidth: '30px', textAlign: 'center', fontWeight: '600' },
  removeBtn: { padding: '6px', background: '#ffebee', border: 'none', borderRadius: '6px', color: '#c62828', cursor: 'pointer', marginLeft: 'auto' },
  cartItemTotal: { textAlign: 'right', fontWeight: '700', color: '#1a5d1a', marginTop: '10px' },
  cartFooter: { padding: '20px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  totalsRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#6c757d' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '700', marginBottom: '20px' },
  totalValue: { color: '#1a5d1a' },
  payButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },

  // Modals
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'hidden' },
  paymentModal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e9ecef' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d' },
  modalBody: { padding: '20px', maxHeight: '400px', overflowY: 'auto' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '10px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '14px', width: '100%', background: 'transparent' },
  clienteList: { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
  clienteOption: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', cursor: 'pointer' },

  // Payment Modal
  paymentBody: { padding: '25px' },
  paymentTotal: { textAlign: 'center', marginBottom: '25px' },
  paymentTotalValue: { display: 'block', fontSize: '36px', fontWeight: '700', color: '#1a5d1a' },
  paymentMethods: { display: 'flex', gap: '10px', marginBottom: '25px' },
  paymentMethod: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', background: '#f8f9fa', border: '2px solid #e9ecef', borderRadius: '12px', cursor: 'pointer', color: '#6c757d' },
  paymentMethodActive: { background: '#e8f5e9', border: '2px solid #1a5d1a', color: '#1a5d1a' },
  efectivoSection: { marginBottom: '20px' },
  montoInput: { width: '100%', padding: '15px', fontSize: '24px', textAlign: 'center', border: '2px solid #e9ecef', borderRadius: '12px', marginTop: '10px', boxSizing: 'border-box' },
  vueltoBox: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#e8f5e9', borderRadius: '10px', marginTop: '15px' },
  vueltoValue: { fontSize: '20px', fontWeight: '700', color: '#1a5d1a' },
  confirmPayBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '18px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '600', cursor: 'pointer' },
  warningText: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '15px', color: '#e65100', fontSize: '14px' },
  qrSection: { marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' },
  qrContainer: { display: 'flex', justifyContent: 'center', padding: '15px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  qrCountdown: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '15px', padding: '12px', background: '#e8f5e9', borderRadius: '8px', color: '#1a5d1a', fontWeight: '600' },
  comprobanteSelector: { display: 'flex', gap: '10px', marginBottom: '20px', background: '#f8f9fa', padding: '5px', borderRadius: '10px' },
  comprobanteBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: 'none', borderRadius: '8px', background: 'transparent', cursor: 'pointer', color: '#6c757d', fontWeight: '600' },
  comprobanteBtnActive: { background: 'white', color: '#1a5d1a', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  facturaForm: { marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e9ecef' },
  formGroup: { marginBottom: '10px' },
  label: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '600', color: '#1a5d1a' },
  input: { width: '100%', padding: '10px', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },

  // Comprobante Modal
  comprobanteModal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  comprobanteHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #e9ecef', background: '#f8f9fa' },
  comprobanteActions: { display: 'flex', gap: '10px', alignItems: 'center' },
  printBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  closeComprobanteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '5px' },
  comprobanteBody: { flex: 1, overflowY: 'auto', padding: '20px', background: 'white' },
  comprobanteTitulo: { textAlign: 'center', marginBottom: '10px' },
  comprobanteTipo: { textAlign: 'center', padding: '8px', background: '#e8f5e9', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' },
  comprobanteInfo: { fontSize: '13px' },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '4px 0' },
  comprobanteCliente: { fontSize: '13px' },
  comprobanteTable: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  comprobanteTotales: { fontSize: '14px' },
  comprobantePago: { fontSize: '13px' },
  comprobantePie: { marginTop: '10px' },
  comprobanteFooter: { padding: '15px 20px', borderTop: '1px solid #e9ecef', background: '#f8f9fa' },
  nuevaVentaBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
};

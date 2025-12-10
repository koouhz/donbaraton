// src/pages/Ventas.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Plus, Minus, Trash2, Search, 
  X, CreditCard, Banknote, QrCode, Receipt,
  Loader2, User, Package, CheckCircle, AlertCircle
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
  const [searchTerm, setSearchTerm] = useState('');
  const [clienteSearch, setClienteSearch] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [medioPago, setMedioPago] = useState('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(0);
  const searchRef = useRef(null);

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
            // Confirmar venta automáticamente
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

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [prodRes, cliRes] = await Promise.all([
        supabase.rpc('fn_leer_productos', { p_buscar: null, p_categoria_id: null }),
        supabase.rpc('fn_leer_clientes', { p_buscar: null })
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

  // Filtrar productos para búsqueda
  const productosFiltrados = productos.filter(p => 
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_barras?.includes(searchTerm)
  ).slice(0, 10);

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

    const existente = carrito.find(item => item.producto_id === producto.id);
    
    if (existente) {
      if (existente.cantidad >= producto.stock_actual) {
        toast.error('Stock insuficiente');
        return;
      }
      setCarrito(carrito.map(item => 
        item.producto_id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio_venta),
        cantidad: 1,
        stock_disponible: producto.stock_actual
      }]);
    }
    
    setSearchTerm('');
    searchRef.current?.focus();
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

    setProcessing(true);
    try {
      const user = getUser();
      const detallesJson = carrito.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio: item.precio
      }));

      const { data, error } = await supabase.rpc('fn_registrar_venta', {
        p_cliente_id: clienteSeleccionado.id,
        p_tipo_comprobante: 'TICKET',
        p_detalles_json: detallesJson,
        p_medio_pago: medioPago,
        p_monto_total: total,
        p_monto_recibido: medioPago === 'EFECTIVO' ? parseFloat(montoRecibido) : total,
        p_usuario_id: user.id,
        p_usuario_nombre: user.username
      });

      if (error) {
        console.error('Error venta:', error);
        if (error.message.includes('Stock insuficiente')) {
          toast.error('Stock insuficiente para uno de los productos');
        } else {
          toast.error(error.message || 'Error al registrar venta');
        }
      } else {
        toast.success('¡Venta registrada exitosamente!');
        
        // Mostrar vuelto si es efectivo
        if (medioPago === 'EFECTIVO' && vuelto > 0) {
          toast(`Vuelto: Bs ${vuelto.toFixed(2)}`, { icon: '💰', duration: 5000 });
        }

        // Limpiar
        setCarrito([]);
        setClienteSeleccionado(null);
        setMontoRecibido('');
        setShowPaymentModal(false);
        cargarDatos(); // Recargar stock
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
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value).toFixed(2)}`;

  return (
    <div style={styles.container}>
      <Toaster position="top-center" />
      
      <div style={styles.posLayout}>
        {/* Panel izquierdo: Búsqueda y productos */}
        <div style={styles.leftPanel}>
          <div style={styles.searchSection}>
            <h2 style={styles.panelTitle}>
              <Package size={20} />
              Productos
            </h2>
            <div style={styles.searchBox}>
              <Search size={18} style={{ color: '#6c757d' }} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar producto o escanear código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                autoFocus
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} style={styles.clearButton}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Resultados de búsqueda */}
            {searchTerm && (
              <div style={styles.searchResults}>
                {loading ? (
                  <div style={styles.searchLoading}>Buscando...</div>
                ) : productosFiltrados.length === 0 ? (
                  <div style={styles.noResults}>No se encontraron productos</div>
                ) : (
                  productosFiltrados.map(prod => (
                    <div
                      key={prod.id}
                      style={{
                        ...styles.productResult,
                        opacity: prod.stock_actual <= 0 ? 0.5 : 1
                      }}
                      onClick={() => agregarAlCarrito(prod)}
                    >
                      <div style={styles.productInfo}>
                        <span style={styles.productName}>{prod.nombre}</span>
                        <span style={styles.productCode}>{prod.codigo_interno}</span>
                      </div>
                      <div style={styles.productMeta}>
                        <span style={styles.productPrice}>{formatCurrency(prod.precio_venta)}</span>
                        <span style={{
                          ...styles.productStock,
                          color: prod.stock_actual <= 0 ? '#c62828' : '#2e7d32'
                        }}>
                          Stock: {prod.stock_actual}
                        </span>
                      </div>
                    </div>
                  ))
                )}
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
                <span>Busque productos para agregar</span>
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
                <Search size={18} />
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
                    key={cliente.id}
                    style={styles.clienteOption}
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setShowClienteModal(false);
                      setClienteSearch('');
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  container: { height: 'calc(100vh - 80px)', overflow: 'hidden' },
  posLayout: { display: 'flex', height: '100%', gap: '20px', padding: '20px' },
  leftPanel: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 },
  rightPanel: { width: '400px', background: 'white', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  panelTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '18px', fontWeight: '600', color: '#1a5d1a' },
  searchSection: { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#f8f9fa', border: '2px solid #e9ecef', borderRadius: '12px', marginTop: '15px' },
  searchInput: { border: 'none', outline: 'none', fontSize: '16px', width: '100%', background: 'transparent' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' },
  searchResults: { marginTop: '15px', maxHeight: '300px', overflowY: 'auto' },
  searchLoading: { padding: '20px', textAlign: 'center', color: '#6c757d' },
  noResults: { padding: '20px', textAlign: 'center', color: '#6c757d' },
  productResult: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '10px', marginBottom: '10px', cursor: 'pointer', transition: 'all 0.2s' },
  productInfo: { display: 'flex', flexDirection: 'column' },
  productName: { fontWeight: '600', color: '#333' },
  productCode: { fontSize: '12px', color: '#6c757d' },
  productMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  productPrice: { fontWeight: '700', color: '#1a5d1a', fontSize: '16px' },
  productStock: { fontSize: '12px' },
  clienteSection: { background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' },
  clienteTitle: { display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#333' },
  clienteCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#e8f5e9', borderRadius: '10px' },
  clienteCI: { display: 'block', fontSize: '12px', color: '#6c757d' },
  changeClienteBtn: { padding: '8px 16px', background: 'white', border: '1px solid #1a5d1a', borderRadius: '8px', color: '#1a5d1a', cursor: 'pointer', fontSize: '13px' },
  selectClienteBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '15px', background: '#f8f9fa', border: '2px dashed #ccc', borderRadius: '10px', color: '#6c757d', cursor: 'pointer', fontSize: '14px' },
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
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'hidden' },
  paymentModal: { background: 'white', borderRadius: '16px', width: '100%', maxWidth: '450px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e9ecef' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d' },
  modalBody: { padding: '20px', maxHeight: '400px', overflowY: 'auto' },
  clienteList: { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
  clienteOption: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '10px', cursor: 'pointer' },
  paymentBody: { padding: '25px' },
  paymentTotal: { textAlign: 'center', marginBottom: '25px' },
  paymentTotalValue: { display: 'block', fontSize: '36px', fontWeight: '700', color: '#1a5d1a' },
  paymentMethods: { display: 'flex', gap: '10px', marginBottom: '25px' },
  paymentMethod: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', background: '#f8f9fa', border: '2px solid #e9ecef', borderRadius: '12px', cursor: 'pointer', color: '#6c757d' },
  paymentMethodActive: { background: '#e8f5e9', borderColor: '#1a5d1a', color: '#1a5d1a' },
  efectivoSection: { marginBottom: '20px' },
  montoInput: { width: '100%', padding: '15px', fontSize: '24px', textAlign: 'center', border: '2px solid #e9ecef', borderRadius: '12px', marginTop: '10px', boxSizing: 'border-box' },
  vueltoBox: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#e8f5e9', borderRadius: '10px', marginTop: '15px' },
  vueltoValue: { fontSize: '20px', fontWeight: '700', color: '#1a5d1a' },
  confirmPayBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '18px', background: 'linear-gradient(135deg, #1a5d1a, #2e8b57)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '600', cursor: 'pointer' },
  warningText: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '15px', color: '#e65100', fontSize: '14px' },
  qrSection: { marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' },
  qrContainer: { display: 'flex', justifyContent: 'center', padding: '15px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  qrCountdown: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '15px', padding: '12px', background: '#e8f5e9', borderRadius: '8px', color: '#1a5d1a', fontWeight: '600' },
};

// src/pages/AjustesInventario.jsx
import { useState, useEffect, useRef } from 'react';
import {
  Package, Scan, Plus, Minus, CheckCircle, AlertCircle,
  X, Loader2, FileText, Calendar, Hash, ClipboardList,
  ArrowUpCircle, ArrowDownCircle, AlertTriangle, Trash2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function AjustesInventario() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [ultimoProductoAgregado, setUltimoProductoAgregado] = useState(null);
  
  // Formulario
  const [tipoMovimiento, setTipoMovimiento] = useState('AJUSTE+');
  const [cantidad, setCantidad] = useState('');
  const [lote, setLote] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [documento, setDocumento] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
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
    cargarProductos();
    setTimeout(() => scannerRef.current?.focus(), 100);
  }, []);

  // Limpiar feedback del último producto después de 3 segundos
  useEffect(() => {
    if (ultimoProductoAgregado) {
      const timer = setTimeout(() => setUltimoProductoAgregado(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [ultimoProductoAgregado]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('fn_listar_productos', { p_buscar: null });
      
      if (error) throw error;
      setProductos(data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Generar lote automático
  const generarLoteAutomatico = async () => {
    try {
      const { data, error } = await supabase.rpc('fn_obtener_ultimo_lote');
      if (error) throw error;
      return data || 'LOT-001';
    } catch (err) {
      console.error('Error generando lote:', err);
      // Generar lote basado en fecha si falla
      const fecha = new Date();
      const timestamp = fecha.getTime().toString().slice(-6);
      return `LOT-${timestamp}`;
    }
  };

  // Generar número de documento automático
  const generarDocumentoAutomatico = () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const timestamp = fecha.getTime().toString().slice(-4);
    return `DOC-${año}${mes}${dia}-${timestamp}`;
  };

  // Buscar producto por código de barras (igual que en Ventas.jsx)
  const buscarPorCodigoBarras = (codigo) => {
    if (!codigo.trim()) return null;

    const producto = productos.find(p =>
      p.codigo_barras === codigo.trim() ||
      p.codigo_interno?.toLowerCase() === codigo.trim().toLowerCase()
    );

    return producto;
  };

  // Manejar escaneo de código de barras
  const handleScan = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const producto = buscarPorCodigoBarras(codigoBarras);

      if (producto) {
        setProductoSeleccionado(producto);
        setUltimoProductoAgregado(producto);
        
        // Generar lote y documento automáticamente
        const loteGenerado = await generarLoteAutomatico();
        const documentoGenerado = generarDocumentoAutomatico();
        
        setLote(loteGenerado);
        setDocumento(documentoGenerado);
        
        toast.success(`Producto seleccionado: ${producto.nombre}`);
      } else {
        toast.error(`Producto no encontrado: ${codigoBarras}`);
      }

      setCodigoBarras('');
      scannerRef.current?.focus();
    }
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setProductoSeleccionado(null);
    setCantidad('');
    setLote('');
    setFechaVencimiento('');
    setDocumento('');
    setMotivo('');
    setObservaciones('');
    setCodigoBarras('');
    setTipoMovimiento('AJUSTE+');
    scannerRef.current?.focus();
  };

  // Validar formulario
  const validarFormulario = () => {
    if (!productoSeleccionado) {
      toast.error('Debe seleccionar un producto');
      return false;
    }

    if (!cantidad || parseInt(cantidad) <= 0) {
      toast.error('Ingrese una cantidad válida');
      return false;
    }

    if (!motivo.trim()) {
      toast.error('El motivo es obligatorio');
      return false;
    }

    // Validar stock para salidas
    const estiposDecremento = ['SALIDA', 'AJUSTE-', 'MERMA', 'DAÑO', 'DEVOLUCION_PROVEEDOR'];
    if (estiposDecremento.includes(tipoMovimiento)) {
      if (parseInt(cantidad) > productoSeleccionado.stock_actual) {
        toast.error(`Stock insuficiente. Disponible: ${productoSeleccionado.stock_actual}`);
        return false;
      }
    }

    return true;
  };

  // Registrar ajuste
  const registrarAjuste = async () => {
    if (!validarFormulario()) return;

    setProcessing(true);
    try {
      const user = getUser();
      
      const { data, error } = await supabase.rpc('fn_ajustar_inventario', {
        p_id_producto: productoSeleccionado.id_producto,
        p_tipo: tipoMovimiento,
        p_cantidad: parseInt(cantidad),
        p_username: user.username,  // Movido aquí para coincidir con la firma de la función
        p_lote: lote.trim() || null,
        p_fecha_vencimiento: fechaVencimiento || null,
        p_documento: documento.trim() || null,
        p_motivo: motivo.trim(),
        p_observaciones: observaciones.trim() || null
      });

      if (error) {
        console.error('Error al ajustar inventario:', error);
        toast.error(error.message || 'Error al registrar ajuste');
      } else {
        toast.success('¡Ajuste registrado exitosamente!');
        
        // Mostrar resumen del ajuste
        const esIncremento = ['ENTRADA', 'AJUSTE+', 'DEVOLUCION_VENTA'].includes(tipoMovimiento);
        toast.success(
          `${esIncremento ? '+' : '-'}${cantidad} unidades ${productoSeleccionado.nombre}`,
          { duration: 4000, icon: esIncremento ? '📈' : '📉' }
        );

        limpiarFormulario();
        cargarProductos();
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al procesar el ajuste');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value) => `Bs ${parseFloat(value || 0).toFixed(2)}`;

  // Obtener configuración visual según tipo de movimiento
  const getTipoConfig = (tipo) => {
    const configs = {
      'ENTRADA': { 
        icon: <ArrowDownCircle size={20} />, 
        color: '#2e7d32', 
        bg: '#e8f5e9',
        label: 'Entrada Manual',
        simbolo: '+' 
      },
      'SALIDA': { 
        icon: <ArrowUpCircle size={20} />, 
        color: '#d32f2f', 
        bg: '#ffebee',
        label: 'Salida Manual',
        simbolo: '-'
      },
      'AJUSTE+': { 
        icon: <Plus size={20} />, 
        color: '#1565c0', 
        bg: '#e3f2fd',
        label: 'Ajuste Positivo',
        simbolo: '+'
      },
      'AJUSTE-': { 
        icon: <Minus size={20} />, 
        color: '#e65100', 
        bg: '#fff3e0',
        label: 'Ajuste Negativo',
        simbolo: '-'
      },
      'MERMA': { 
        icon: <AlertTriangle size={20} />, 
        color: '#c62828', 
        bg: '#ffebee',
        label: 'Merma',
        simbolo: '-'
      },
      'DAÑO': { 
        icon: <Trash2 size={20} />, 
        color: '#c62828', 
        bg: '#ffebee',
        label: 'Producto Dañado',
        simbolo: '-'
      }
    };
    return configs[tipo] || configs['AJUSTE+'];
  };

  const currentConfig = getTipoConfig(tipoMovimiento);

  return (
    <div style={styles.container}>
      <Toaster position="top-center" />

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Package size={28} style={{ marginRight: '12px' }} />
            Ajustes de Inventario
          </h1>
          <p style={styles.subtitle}>
            Registrar ingresos, egresos y ajustes de stock
          </p>
        </div>
      </header>

      <div style={styles.layout}>
        {/* Panel izquierdo: Escáner */}
        <div style={styles.leftPanel}>
          {/* Escáner de código de barras */}
          <div style={styles.scannerSection}>
            <h2 style={styles.panelTitle}>
              <Scan size={24} />
              Escanear Producto
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
              Escanee el código de barras o escriba el código y presione <strong>Enter</strong>
            </p>

            {/* Feedback del último producto escaneado */}
            {ultimoProductoAgregado && (
              <div style={styles.feedbackCard}>
                <CheckCircle size={20} style={{ color: '#2e7d32' }} />
                <div>
                  <strong>{ultimoProductoAgregado.nombre}</strong>
                  <span style={styles.feedbackStock}>
                    Stock actual: {ultimoProductoAgregado.stock_actual}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Producto seleccionado */}
          {productoSeleccionado && (
            <div style={styles.productoCard}>
              <div style={styles.productoHeader}>
                <Package size={20} style={{ color: '#1a5d1a' }} />
                <h3 style={styles.productoTitulo}>Producto Seleccionado</h3>
              </div>
              <div style={styles.productoInfo}>
                <strong>{productoSeleccionado.nombre}</strong>
                <div style={styles.productoMeta}>
                  <span>Código: {productoSeleccionado.codigo_interno}</span>
                  <span>Stock: <strong>{productoSeleccionado.stock_actual}</strong></span>
                  <span>Precio: {formatCurrency(productoSeleccionado.precio_venta)}</span>
                </div>
              </div>
              <button 
                style={styles.changeProductBtn}
                onClick={limpiarFormulario}
              >
                Cambiar Producto
              </button>
            </div>
          )}

          {/* Instrucciones */}
          <div style={styles.instructionsCard}>
            <h4 style={styles.instructionsTitle}>📋 Instrucciones</h4>
            <ol style={styles.instructionsList}>
              <li>Escanee el código de barras del producto</li>
              <li>Seleccione el tipo de movimiento</li>
              <li>Ingrese cantidad, lote y motivo</li>
              <li>Confirme el ajuste</li>
            </ol>
          </div>
        </div>

        {/* Panel derecho: Formulario */}
        <div style={styles.rightPanel}>
          <div style={styles.formHeader}>
            <h2 style={styles.panelTitle}>
              <ClipboardList size={20} />
              Registro de Ajuste
            </h2>
          </div>

          <div style={styles.formBody}>
            {!productoSeleccionado ? (
              <div style={styles.emptyState}>
                <Package size={48} style={{ color: '#ccc' }} />
                <p>Escanee un producto para comenzar</p>
                <span>Use el escáner de código de barras</span>
              </div>
            ) : (
              <>
                {/* Tipo de Movimiento */}
                <div style={styles.formSection}>
                  <label style={styles.label}>Tipo de Movimiento *</label>
                  <div style={styles.tipoGrid}>
                    {['ENTRADA', 'SALIDA', 'AJUSTE+', 'AJUSTE-', 'MERMA', 'DAÑO'].map(tipo => {
                      const config = getTipoConfig(tipo);
                      return (
                        <button
                          key={tipo}
                          style={{
                            ...styles.tipoBtn,
                            ...(tipoMovimiento === tipo ? {
                              background: config.bg,
                              borderColor: config.color,
                              color: config.color
                            } : {})
                          }}
                          onClick={() => setTipoMovimiento(tipo)}
                        >
                          {config.icon}
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Indicador visual del tipo seleccionado */}
                <div style={{
                  ...styles.tipoIndicator,
                  background: currentConfig.bg,
                  borderColor: currentConfig.color
                }}>
                  {currentConfig.icon}
                  <span style={{ color: currentConfig.color, fontWeight: '600' }}>
                    {currentConfig.label} ({currentConfig.simbolo})
                  </span>
                </div>

                {/* Cantidad */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cantidad *</label>
                  <div style={styles.cantidadInput}>
                    <Hash size={18} style={{ color: '#6c757d' }} />
                    <input
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      placeholder="Ej: 50"
                      style={styles.input}
                    />
                    <span style={styles.inputHint}>unidades</span>
                  </div>
                  {productoSeleccionado && (
                    <span style={styles.stockInfo}>
                      Stock actual: <strong>{productoSeleccionado.stock_actual}</strong>
                    </span>
                  )}
                </div>

                {/* Lote */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Lote</label>
                  <input
                    type="text"
                    value={lote}
                    onChange={(e) => setLote(e.target.value)}
                    placeholder="Autogenerado"
                    style={styles.input}
                    readOnly
                  />
                  <span style={styles.fieldHint}>Se genera automáticamente</span>
                </div>

                {/* Fecha de Vencimiento */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Fecha de Vencimiento
                    {productoSeleccionado?.controla_vencimiento && (
                      <span style={{ color: '#c62828', marginLeft: '4px' }}>*</span>
                    )}
                  </label>
                  <div style={styles.dateInput}>
                    <Calendar size={18} style={{ color: '#6c757d' }} />
                    <input
                      type="date"
                      value={fechaVencimiento}
                      onChange={(e) => setFechaVencimiento(e.target.value)}
                      style={styles.input}
                      min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })()}
                      required={productoSeleccionado?.controla_vencimiento}
                    />
                  </div>
                  {productoSeleccionado?.controla_vencimiento && (
                    <span style={{ fontSize: '11px', color: '#c62828', marginTop: '4px', display: 'block' }}>
                      ⚠️ Producto perecedero - fecha obligatoria
                    </span>
                  )}
                </div>

                {/* Número de Documento */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nº Documento / Remito</label>
                  <div style={styles.docInput}>
                    <FileText size={18} style={{ color: '#6c757d' }} />
                    <input
                      type="text"
                      value={documento}
                      onChange={(e) => setDocumento(e.target.value)}
                      placeholder="Autogenerado"
                      style={styles.input}
                      readOnly
                    />
                  </div>
                  <span style={styles.fieldHint}>Se genera automáticamente</span>
                </div>

                {/* Motivo (obligatorio) */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Motivo *</label>
                  <input
                    type="text"
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Ej: Conteo físico, Corrección de inventario"
                    style={styles.input}
                    required
                  />
                </div>

                {/* Observaciones (opcional) */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Observaciones (Opcional)</label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Información adicional sobre el ajuste"
                    style={styles.textarea}
                    rows={3}
                  />
                </div>

                {/* Botones de acción */}
                <div style={styles.formActions}>
                  <button
                    style={styles.cancelBtn}
                    onClick={limpiarFormulario}
                    disabled={processing}
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                  <button
                    style={styles.submitBtn}
                    onClick={registrarAjuste}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Confirmar Ajuste
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ============== ESTILOS ==============
const styles = {
  container: { padding: '20px', maxWidth: '1400px', margin: '0 auto' },
  header: { marginBottom: '20px' },
  title: { margin: 0, fontSize: '28px', fontWeight: '700', color: '#1a5d1a', display: 'flex', alignItems: 'center' },
  subtitle: { margin: '8px 0 0 0', color: '#6c757d', fontSize: '14px' },
  
  layout: { display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px' },
  
  // Panel izquierdo
  leftPanel: { display: 'flex', flexDirection: 'column', gap: '20px' },
  
  // Escáner
  scannerSection: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  panelTitle: { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1a5d1a' },
  scannerBox: { position: 'relative', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)', border: '2px solid #1a5d1a', borderRadius: '12px', marginBottom: '10px' },
  scannerIcon: { color: '#1a5d1a' },
  scannerInput: { flex: 1, border: 'none', outline: 'none', fontSize: '15px', fontWeight: '500', background: 'transparent', color: '#1a5d1a' },
  clearButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', padding: '4px', display: 'flex', alignItems: 'center' },
  scannerHint: { fontSize: '13px', color: '#6c757d', margin: 0 },
  
  feedbackCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', background: '#e8f5e9', borderRadius: '10px', marginTop: '15px', border: '1px solid #c8e6c9' },
  feedbackStock: { display: 'block', fontSize: '12px', color: '#6c757d', marginTop: '4px' },
  
  // Producto seleccionado
  productoCard: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '2px solid #1a5d1a' },
  productoHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  productoTitulo: { margin: 0, fontSize: '14px', fontWeight: '600', color: '#1a5d1a' },
  productoInfo: { marginBottom: '15px' },
  productoMeta: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#6c757d', marginTop: '8px' },
  changeProductBtn: { width: '100%', padding: '10px', background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  
  // Instrucciones
  instructionsCard: { background: 'linear-gradient(135deg, #e3f2fd, #e8f5e9)', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  instructionsTitle: { margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1a5d1a' },
  instructionsList: { margin: 0, paddingLeft: '20px', color: '#495057', fontSize: '13px', lineHeight: '1.8' },
  
  // Panel derecho
  rightPanel: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' },
  formHeader: { padding: '20px', borderBottom: '2px solid #e9ecef', background: 'linear-gradient(135deg, #f8f9fa, #e8f5e9)' },
  formBody: { padding: '25px', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' },
  
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: '#6c757d', gap: '15px', textAlign: 'center' },
  
  // Formulario
  formSection: { marginBottom: '25px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' },
  
  // Tipo de movimiento
  tipoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' },
  tipoBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'white', border: '2px solid #e9ecef', borderRadius: '10px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s', color: '#495057' },
  
  tipoIndicator: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', border: '2px solid' },
  
  // Inputs
  formGroup: { marginBottom: '20px' },
  input: { flex: 1, padding: '12px 15px', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%' },
  textarea: { width: '100%', padding: '12px 15px', border: '1px solid #e9ecef', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical' },
  
  cantidadInput: { display: 'flex', alignItems: 'center', gap: '10px', padding: ' 12px 15px', border: '1px solid #e9ecef', borderRadius: '8px', background: 'white' },
  inputHint: { fontSize: '13px', color: '#6c757d', fontWeight: '500' },
  stockInfo: { display: 'block', fontSize: '12px', color: '#6c757d', marginTop: '6px' },
  fieldHint: { display: 'block', fontSize: '11px', color: '#28a745', marginTop: '4px', fontStyle: 'italic' },
  
  dateInput: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', border: '1px solid #e9ecef', borderRadius: '8px' },
  docInput: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', border: '1px solid #e9ecef', borderRadius: '8px' },
  
  // Acciones
  formActions: { display: 'flex', gap: '12px', marginTop: '30px' },
  cancelBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#f8f9fa', color: '#6c757d', border: '1px solid #e9ecef', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  submitBtn: { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#1a5d1a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
};

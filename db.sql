-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alertas_stock (
  id character varying NOT NULL,
  producto_id character varying,
  tipo character varying CHECK (tipo::text = ANY (ARRAY['STOCK_MINIMO'::character varying, 'VENCIMIENTO'::character varying, 'STOCK_CRITICO'::character varying]::text[])),
  fecha_generada timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_resuelta timestamp without time zone,
  estado character varying DEFAULT 'PENDIENTE'::character varying CHECK (estado::text = ANY (ARRAY['PENDIENTE'::character varying, 'RESUELTA'::character varying, 'DESCARTADA'::character varying]::text[])),
  mensaje text,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT alertas_stock_pkey PRIMARY KEY (id),
  CONSTRAINT alertas_stock_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT alertas_stock_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.asistencias (
  id character varying NOT NULL,
  empleado_id character varying,
  fecha date,
  hora_entrada time without time zone,
  hora_salida time without time zone,
  tipo character varying CHECK (tipo::text = ANY (ARRAY['ENTRADA'::character varying, 'SALIDA'::character varying, 'RETRASO'::character varying]::text[])),
  metodo character varying DEFAULT 'MANUAL'::character varying CHECK (metodo::text = ANY (ARRAY['BIOMETRICO'::character varying, 'MANUAL'::character varying, 'TARJETA'::character varying]::text[])),
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT asistencias_pkey PRIMARY KEY (id),
  CONSTRAINT asistencias_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES public.empleados(id),
  CONSTRAINT asistencias_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.auditoria (
  id character varying NOT NULL,
  usuario character varying,
  fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  modulo character varying,
  accion character varying,
  detalles text,
  estado character varying,
  CONSTRAINT auditoria_pkey PRIMARY KEY (id)
);
CREATE TABLE public.backups (
  id integer NOT NULL DEFAULT nextval('backups_id_seq'::regclass),
  fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  ruta_archivo character varying,
  usuario_id integer,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT backups_pkey PRIMARY KEY (id),
  CONSTRAINT backups_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT backups_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.cargos (
  id integer NOT NULL DEFAULT nextval('cargos_id_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cargos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_cargos_auditoria FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.categorias (
  id integer NOT NULL DEFAULT nextval('categorias_id_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categorias_pkey PRIMARY KEY (id),
  CONSTRAINT fk_categorias_auditoria FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.cierre_caja (
  id character varying NOT NULL,
  usuario_id integer,
  fecha date,
  hora_cierre time without time zone,
  total_efectivo numeric,
  diferencia numeric,
  observaciones character varying,
  firma_supervisor character varying,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cierre_caja_pkey PRIMARY KEY (id),
  CONSTRAINT cierre_caja_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT cierre_caja_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.cierre_caja_detalle (
  id integer NOT NULL DEFAULT nextval('cierre_caja_detalle_id_seq'::regclass),
  cierre_id character varying,
  denominacion numeric,
  cantidad integer,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cierre_caja_detalle_pkey PRIMARY KEY (id),
  CONSTRAINT cierre_caja_detalle_cierre_id_fkey FOREIGN KEY (cierre_id) REFERENCES public.cierre_caja(id),
  CONSTRAINT cierre_caja_detalle_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.clientes (
  id character varying NOT NULL,
  nombres character varying,
  apellido_paterno character varying,
  apellido_materno character varying,
  ci_nit character varying NOT NULL UNIQUE,
  telefono character varying,
  email character varying,
  direccion text,
  estado character varying DEFAULT 'ACTIVO'::character varying CHECK (estado::text = ANY (ARRAY['ACTIVO'::character varying, 'INACTIVO'::character varying]::text[])),
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT clientes_pkey PRIMARY KEY (id),
  CONSTRAINT clientes_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.cuentas_por_pagar (
  id character varying NOT NULL,
  proveedor_id character varying,
  factura_nro character varying,
  fecha_emision date,
  fecha_vencimiento date,
  monto_total numeric,
  saldo_pendiente numeric,
  estado character varying DEFAULT 'PENDIENTE'::character varying CHECK (estado::text = ANY (ARRAY['PENDIENTE'::character varying, 'PAGADO'::character varying, 'VENCIDO'::character varying]::text[])),
  observaciones text,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cuentas_por_pagar_pkey PRIMARY KEY (id),
  CONSTRAINT cuentas_por_pagar_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id),
  CONSTRAINT cuentas_por_pagar_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.detalle_devolucion_proveedor (
  id integer NOT NULL DEFAULT nextval('detalle_devolucion_proveedor_id_seq'::regclass),
  devolucion_id character varying,
  producto_id character varying,
  cantidad integer CHECK (cantidad > 0),
  lote character varying,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT detalle_devolucion_proveedor_pkey PRIMARY KEY (id),
  CONSTRAINT detalle_devolucion_proveedor_devolucion_id_fkey FOREIGN KEY (devolucion_id) REFERENCES public.devoluciones_proveedor(id),
  CONSTRAINT detalle_devolucion_proveedor_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT detalle_devolucion_proveedor_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.detalle_orden_compra (
  id integer NOT NULL DEFAULT nextval('detalle_orden_compra_id_seq'::regclass),
  orden_id character varying,
  producto_id character varying,
  cantidad integer CHECK (cantidad > 0),
  precio_unitario numeric,
  descuento numeric,
  subtotal numeric,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT detalle_orden_compra_pkey PRIMARY KEY (id),
  CONSTRAINT detalle_orden_compra_orden_id_fkey FOREIGN KEY (orden_id) REFERENCES public.ordenes_compra(id),
  CONSTRAINT detalle_orden_compra_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT detalle_orden_compra_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.detalle_ventas (
  id integer NOT NULL DEFAULT nextval('detalle_ventas_id_seq'::regclass),
  venta_id character varying,
  producto_id character varying,
  cantidad integer CHECK (cantidad > 0),
  precio_unitario numeric,
  descuento numeric,
  subtotal numeric,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT detalle_ventas_pkey PRIMARY KEY (id),
  CONSTRAINT detalle_ventas_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id),
  CONSTRAINT detalle_ventas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT detalle_ventas_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.devoluciones_proveedor (
  id character varying NOT NULL,
  recepcion_id character varying,
  motivo character varying CHECK (motivo::text = ANY (ARRAY['DAÑO'::character varying, 'VENCIDO'::character varying, 'SOBRANTE'::character varying, 'OTRO'::character varying]::text[])),
  cantidad integer CHECK (cantidad > 0),
  observaciones text,
  fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT devoluciones_proveedor_pkey PRIMARY KEY (id),
  CONSTRAINT devoluciones_proveedor_recepcion_id_fkey FOREIGN KEY (recepcion_id) REFERENCES public.recepciones(id),
  CONSTRAINT devoluciones_proveedor_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.devoluciones_ventas (
  id character varying NOT NULL,
  venta_id character varying,
  motivo character varying,
  forma_reembolso character varying CHECK (forma_reembolso::text = ANY (ARRAY['EFECTIVO'::character varying, 'NOTA_CREDITO'::character varying, 'TARJETA'::character varying]::text[])),
  fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  usuario_id integer,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT devoluciones_ventas_pkey PRIMARY KEY (id),
  CONSTRAINT devoluciones_ventas_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id),
  CONSTRAINT devoluciones_ventas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT devoluciones_ventas_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.empleados (
  id character varying NOT NULL,
  ci character varying NOT NULL UNIQUE,
  expedido character,
  nombres character varying,
  apellido_paterno character varying,
  apellido_materno character varying,
  fecha_nacimiento date,
  sexo boolean,
  telefono character varying,
  celular character varying,
  email character varying UNIQUE,
  direccion character varying,
  cargo_id integer,
  fecha_contratacion date,
  tipo_contrato character varying,
  horario_id integer,
  salario numeric,
  estado character varying,
  foto_url text,
  fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  usuario_id integer,
  CONSTRAINT empleados_pkey PRIMARY KEY (id),
  CONSTRAINT fk_empleados_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT fk_empleados_cargo FOREIGN KEY (cargo_id) REFERENCES public.cargos(id),
  CONSTRAINT fk_empleados_horario FOREIGN KEY (horario_id) REFERENCES public.horarios(id),
  CONSTRAINT fk_empleados_auditoria FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.horarios (
  id integer NOT NULL DEFAULT nextval('horarios_id_seq'::regclass),
  nombre character varying,
  hora_entrada time without time zone,
  hora_salida time without time zone,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT horarios_pkey PRIMARY KEY (id),
  CONSTRAINT fk_horarios_auditoria FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.lotes (
  id character varying NOT NULL,
  producto_id character varying,
  lote character varying NOT NULL,
  fecha_vencimiento date NOT NULL,
  cantidad integer NOT NULL CHECK (cantidad >= 0),
  estado character varying DEFAULT 'ACTIVO'::character varying CHECK (estado::text = ANY (ARRAY['ACTIVO'::character varying, 'VENCIDO'::character varying, 'AGOTADO'::character varying]::text[])),
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT lotes_pkey PRIMARY KEY (id),
  CONSTRAINT lotes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT lotes_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.movimientos_inventario (
  id character varying NOT NULL,
  producto_id character varying,
  tipo character varying CHECK (tipo::text = ANY (ARRAY['ENTRADA'::character varying, 'SALIDA'::character varying, 'AJUSTE+'::character varying, 'AJUSTE-'::character varying, 'MERMA'::character varying, 'DAÑO'::character varying, 'ROBO'::character varying, 'DONACION'::character varying]::text[])),
  cantidad numeric CHECK (cantidad >= 0::numeric),
  lote character varying,
  fecha_vencimiento date,
  documento character varying,
  motivo character varying,
  usuario_id integer,
  fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (id),
  CONSTRAINT movimientos_inventario_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id),
  CONSTRAINT movimientos_inventario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT movimientos_inventario_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.ordenes_compra (
  id character varying NOT NULL,
  proveedor_id character varying,
  fecha_emision date,
  fecha_entrega date,
  estado character varying CHECK (estado::text = ANY (ARRAY['PENDIENTE'::character varying, 'RECIBIDA'::character varying, 'CANCELADA'::character varying]::text[])),
  total numeric,
  usuario_id integer,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ordenes_compra_pkey PRIMARY KEY (id),
  CONSTRAINT ordenes_compra_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id),
  CONSTRAINT ordenes_compra_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT ordenes_compra_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.pagos (
  id character varying NOT NULL,
  venta_id character varying,
  medio character varying CHECK (medio::text = ANY (ARRAY['EFECTIVO'::character varying, 'DEBITO'::character varying, 'CREDITO'::character varying, 'QR'::character varying, 'TRANSFERENCIA'::character varying, 'CHEQUE'::character varying]::text[])),
  importe numeric,
  ultimos_4_digitos character varying,
  cupon character varying,
  vuelto numeric,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pagos_pkey PRIMARY KEY (id),
  CONSTRAINT pagos_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES public.ventas(id),
  CONSTRAINT pagos_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.productos (
  id character varying NOT NULL,
  codigo_interno character varying NOT NULL UNIQUE,
  codigo_barras character varying,
  nombre character varying NOT NULL,
  categoria_id integer,
  marca character varying,
  proveedor_principal_id character varying,
  precio_costo numeric,
  precio_venta numeric NOT NULL,
  stock_minimo integer DEFAULT 0,
  stock_maximo integer DEFAULT 0,
  stock_actual integer DEFAULT 0 CHECK (stock_actual >= 0),
  unidad_medida character varying,
  presentacion character varying,
  controla_vencimiento boolean DEFAULT false,
  foto_url text,
  motivo_desactivacion text,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT productos_pkey PRIMARY KEY (id),
  CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id),
  CONSTRAINT productos_proveedor_principal_id_fkey FOREIGN KEY (proveedor_principal_id) REFERENCES public.proveedores(id),
  CONSTRAINT productos_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.proveedores (
  id character varying NOT NULL,
  razon_social character varying NOT NULL,
  nit_ci character varying NOT NULL UNIQUE,
  telefono character varying,
  celular_contacto character varying,
  email character varying,
  direccion text,
  nombre_contacto character varying,
  plazo_credito integer DEFAULT 0,
  estado character varying DEFAULT 'ACTIVO'::character varying CHECK (estado::text = ANY (ARRAY['ACTIVO'::character varying, 'INACTIVO'::character varying]::text[])),
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT proveedores_pkey PRIMARY KEY (id),
  CONSTRAINT proveedores_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.recepciones (
  id character varying NOT NULL,
  orden_id character varying,
  fecha_ingreso date,
  lote character varying,
  fecha_vencimiento date,
  usuario_id integer,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT recepciones_pkey PRIMARY KEY (id),
  CONSTRAINT recepciones_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id),
  CONSTRAINT recepciones_orden_id_fkey FOREIGN KEY (orden_id) REFERENCES public.ordenes_compra(id),
  CONSTRAINT recepciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.roles (
  id integer NOT NULL DEFAULT nextval('roles_id_seq'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT roles_pkey PRIMARY KEY (id),
  CONSTRAINT fk_roles_auditoria FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
CREATE TABLE public.usuarios (
  id integer NOT NULL DEFAULT nextval('usuarios_id_seq'::regclass),
  empleado_id character varying,
  username character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  rol_id integer,
  estado character varying DEFAULT 'ACTIVO'::character varying CHECK (estado::text = ANY (ARRAY['ACTIVO'::character varying, 'INACTIVO'::character varying]::text[])),
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT fk_usuarios_empleado FOREIGN KEY (empleado_id) REFERENCES public.empleados(id),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES public.roles(id)
);
CREATE TABLE public.ventas (
  id character varying NOT NULL,
  cliente_id character varying,
  fecha_hora timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  total numeric,
  tipo_comprobante character varying CHECK (tipo_comprobante::text = ANY (ARRAY['TICKET'::character varying, 'FACTURA_A'::character varying, 'FACTURA_B'::character varying, 'FACTURA_C'::character varying, 'FACTURA_E'::character varying, 'NOTA_CREDITO'::character varying]::text[])),
  cae character varying,
  razon_social character varying,
  direccion_facturacion text,
  condicion_iva character varying,
  usuario_id integer,
  auditoria_id character varying,
  estadoa boolean DEFAULT true,
  fechaa timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ventas_pkey PRIMARY KEY (id),
  CONSTRAINT ventas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT ventas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT ventas_auditoria_id_fkey FOREIGN KEY (auditoria_id) REFERENCES public.auditoria(id)
);
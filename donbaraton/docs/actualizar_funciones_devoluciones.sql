-- =======================================================
-- ACTUALIZACIÓN: Filtrar devoluciones por cajero/usuario
-- Ejecutar en Supabase SQL Editor
-- =======================================================

-- Primero eliminar la función existente
DROP FUNCTION IF EXISTS public.fn_leer_devoluciones_ventas(date, date);

-- Recrear con parámetro de usuario
CREATE OR REPLACE FUNCTION public.fn_leer_devoluciones_ventas(
    p_fecha_inicio date DEFAULT NULL::date, 
    p_fecha_fin date DEFAULT NULL::date,
    p_id_usuario character varying DEFAULT NULL::character varying -- NUEVO: Filtro por cajero
)
RETURNS TABLE(
    id_devolucion character varying, 
    id_venta character varying, 
    fecha timestamp without time zone, 
    cliente text, 
    usuario_devolucion text,
    motivo character varying, 
    forma_reembolso character varying, 
    total_venta numeric, 
    total_devuelto numeric, 
    productos_devueltos integer
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        dv.id_devolucion_venta AS id_devolucion,
        dv.id_venta,
        dv.fecha,
        COALESCE(c.nombres || ' ' || COALESCE(c.apellido_paterno, ''), v.razon_social, 'Cliente General')::TEXT AS cliente,
        COALESCE(
            (SELECT e.nombres || ' ' || COALESCE(e.apellido_paterno, '')
             FROM public.usuarios u
             LEFT JOIN public.empleados e ON u.id_empleado = e.id_empleado
             WHERE u.id_usuario = dv.id_usuario),
            'Sistema'
        )::TEXT AS usuario_devolucion,
        dv.motivo,
        dv.forma_reembolso,
        v.total AS total_venta,
        COALESCE((
            SELECT SUM(mi.cantidad * detv.precio_unitario)
            FROM public.movimientos_inventario mi
            JOIN public.detalle_ventas detv ON mi.id_producto = detv.id_producto AND detv.id_venta = dv.id_venta
            WHERE mi.documento = dv.id_devolucion_venta
            AND mi.tipo = 'ENTRADA'
            AND mi.motivo = 'DEVOLUCION_VENTA'
        ), 0)::NUMERIC AS total_devuelto,
        COALESCE((
            SELECT COUNT(*)::INTEGER
            FROM public.movimientos_inventario mi
            WHERE mi.documento = dv.id_devolucion_venta
            AND mi.tipo = 'ENTRADA'
            AND mi.motivo = 'DEVOLUCION_VENTA'
        ), 0)::INTEGER AS productos_devueltos
    FROM public.devoluciones_ventas dv
    JOIN public.ventas v ON dv.id_venta = v.id_venta
    LEFT JOIN public.clientes c ON v.id_cliente = c.id_cliente
    WHERE (p_fecha_inicio IS NULL OR DATE(dv.fecha) >= p_fecha_inicio)
      AND (p_fecha_fin IS NULL OR DATE(dv.fecha) <= p_fecha_fin)
      AND (p_id_usuario IS NULL OR v.id_usuario = p_id_usuario)  -- FILTRO POR CAJERO
    ORDER BY dv.fecha DESC;
END;
$function$;

-- Verificación:
-- SELECT * FROM fn_leer_devoluciones_ventas('2024-01-01', '2024-12-31', 'USR-001');

-- =======================================================
-- FUNCIÓN: Leer devoluciones a proveedores (CON TOTALES)
-- =======================================================
DROP FUNCTION IF EXISTS public.fn_leer_devoluciones_proveedor();
DROP FUNCTION IF EXISTS public.fn_leer_devoluciones_proveedor(date);
DROP FUNCTION IF EXISTS public.fn_leer_devoluciones_proveedor(date, date);

CREATE OR REPLACE FUNCTION public.fn_leer_devoluciones_proveedor(
    p_fecha_inicio date DEFAULT NULL::date, 
    p_fecha_fin date DEFAULT NULL::date
)
RETURNS TABLE(
    id_devolucion character varying,
    id_recepcion character varying,
    fecha timestamp without time zone,
    producto text,
    cantidad integer,
    proveedor text,
    motivo character varying,
    observaciones text,
    precio_unitario numeric,
    total numeric
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        dp.id_devolucion,
        dp.id_recepcion,
        dp.fecha,
        -- Obtener producto desde movimientos_inventario
        COALESCE(
            (SELECT pr.nombre FROM public.movimientos_inventario mi 
             JOIN public.productos pr ON mi.id_producto = pr.id_producto 
             WHERE mi.documento = dp.id_devolucion LIMIT 1),
            'Producto'
        )::TEXT AS producto,
        dp.cantidad,
        -- Obtener proveedor desde recepción
        COALESCE(
            (SELECT prov.razon_social 
             FROM public.recepciones rec 
             JOIN public.ordenes_compra oc ON rec.id_orden = oc.id_orden
             JOIN public.proveedores prov ON oc.id_proveedor = prov.id_proveedor
             WHERE rec.id_recepcion = dp.id_recepcion),
            'Proveedor'
        )::TEXT AS proveedor,
        dp.motivo,
        dp.observaciones,
        -- Obtener precio unitario desde detalle_orden_compra
        COALESCE(
            (SELECT doc.precio_unitario 
             FROM public.recepciones rec 
             JOIN public.ordenes_compra oc ON rec.id_orden = oc.id_orden
             JOIN public.detalle_orden_compra doc ON doc.id_orden = oc.id_orden
             JOIN public.movimientos_inventario mi ON mi.documento = dp.id_devolucion AND mi.id_producto = doc.id_producto
             WHERE rec.id_recepcion = dp.id_recepcion
             LIMIT 1),
            0
        )::NUMERIC AS precio_unitario,
        -- Calcular total
        COALESCE(
            (SELECT dp.cantidad * doc.precio_unitario 
             FROM public.recepciones rec 
             JOIN public.ordenes_compra oc ON rec.id_orden = oc.id_orden
             JOIN public.detalle_orden_compra doc ON doc.id_orden = oc.id_orden
             JOIN public.movimientos_inventario mi ON mi.documento = dp.id_devolucion AND mi.id_producto = doc.id_producto
             WHERE rec.id_recepcion = dp.id_recepcion
             LIMIT 1),
            0
        )::NUMERIC AS total
    FROM public.devoluciones_proveedor dp
    WHERE (p_fecha_inicio IS NULL OR DATE(dp.fecha) >= p_fecha_inicio)
      AND (p_fecha_fin IS NULL OR DATE(dp.fecha) <= p_fecha_fin)
    ORDER BY dp.fecha DESC;
END;
$function$;

-- TEST:
-- SELECT * FROM fn_leer_devoluciones_proveedor();

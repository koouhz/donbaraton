-- =====================================================
-- fn_leer_devoluciones_ventas (VERSIÓN ACTUALIZADA)
-- Ahora retorna el monto devuelto calculándolo desde movimientos de inventario
-- =====================================================

CREATE OR REPLACE FUNCTION public.fn_leer_devoluciones_ventas(
    p_fecha_inicio date DEFAULT NULL::date, 
    p_fecha_fin date DEFAULT NULL::date
)
RETURNS TABLE(
    id_devolucion character varying, 
    id_venta character varying, 
    fecha timestamp without time zone, 
    cliente text, 
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
        dv.motivo,
        dv.forma_reembolso,
        v.total AS total_venta,
        -- Calcular monto devuelto sumando (cantidad * precio_unitario) de los productos devueltos
        COALESCE((
            SELECT SUM(mi.cantidad * detv.precio_unitario)
            FROM public.movimientos_inventario mi
            JOIN public.detalle_ventas detv ON mi.id_producto = detv.id_producto AND detv.id_venta = dv.id_venta
            WHERE mi.documento = dv.id_devolucion_venta
            AND mi.tipo = 'ENTRADA'
            AND mi.motivo = 'DEVOLUCION_VENTA'
        ), 0)::NUMERIC AS total_devuelto,
        -- Contar productos devueltos (movimientos de entrada con este documento)
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
    ORDER BY dv.fecha DESC;
END;
$function$;

-- =====================================================
-- COMENTARIO:
-- Esta versión actualizada agrega el campo 'total_devuelto' que calcula
-- el monto real devuelto sumando (cantidad * precio_unitario) de los
-- movimientos de inventario tipo ENTRADA con motivo DEVOLUCION_VENTA
-- =====================================================

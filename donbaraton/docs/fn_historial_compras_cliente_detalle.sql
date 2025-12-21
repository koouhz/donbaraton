-- ============================================================================
-- FUNCIÓN: fn_historial_compras_cliente_detalle
-- PROPÓSITO: Obtener historial de compras de un cliente con detalle de productos
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_historial_compras_cliente_detalle(p_id_cliente VARCHAR)
RETURNS TABLE(
    id_venta VARCHAR,
    fecha TIMESTAMP,
    numero_factura VARCHAR,
    total NUMERIC,
    forma_pago VARCHAR,
    cajero VARCHAR,
    productos TEXT
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY 
    SELECT 
        v.id_venta,
        v.fecha_hora AS fecha,
        v.numero_factura,
        v.total,
        p.medio AS forma_pago,
        u.username AS cajero,
        -- Concatenar productos comprados
        STRING_AGG(
            pr.nombre || ' (x' || dv.cantidad || ')', 
            ', ' 
            ORDER BY pr.nombre
        ) AS productos
    FROM public.ventas v
    JOIN public.pagos p ON v.id_venta = p.id_venta
    JOIN public.usuarios u ON v.id_usuario = u.id_usuario
    LEFT JOIN public.detalle_ventas dv ON dv.id_venta = v.id_venta
    LEFT JOIN public.productos pr ON pr.id_producto = dv.id_producto
    WHERE v.id_cliente = p_id_cliente AND v.estado = 'ACTIVO'
    GROUP BY v.id_venta, v.fecha_hora, v.numero_factura, v.total, p.medio, u.username
    ORDER BY v.fecha_hora DESC;
END;
$function$;

COMMENT ON FUNCTION public.fn_historial_compras_cliente_detalle IS 
'Obtiene el historial de compras de un cliente incluyendo los productos comprados.
Retorna: id_venta, fecha, numero_factura, total, forma_pago, cajero, productos (lista concatenada)';

-- ============================================================================
-- PRUEBA:
-- ============================================================================
-- SELECT * FROM fn_historial_compras_cliente_detalle('CLI-001');

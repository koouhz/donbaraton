-- ============================================================================
-- FUNCIÓN: fn_productos_mas_vendidos
-- PROPÓSITO: REP-01 - Ranking de productos más vendidos por período
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_productos_mas_vendidos(
    p_fecha_inicio DATE,
    p_fecha_fin DATE,
    p_limite INTEGER DEFAULT 50
)
RETURNS TABLE(
    posicion INTEGER,
    id_producto VARCHAR,
    codigo VARCHAR,
    nombre VARCHAR,
    categoria VARCHAR,
    cantidad_vendida BIGINT,
    monto_generado NUMERIC,
    ticket_promedio NUMERIC
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY 
    SELECT 
        ROW_NUMBER() OVER (ORDER BY SUM(dv.cantidad) DESC)::INTEGER AS posicion,
        p.id_producto,
        p.codigo_barras::VARCHAR AS codigo,
        p.nombre::VARCHAR,
        COALESCE(c.nombre, 'Sin Categoría')::VARCHAR AS categoria,
        SUM(dv.cantidad)::BIGINT AS cantidad_vendida,
        SUM(dv.subtotal)::NUMERIC AS monto_generado,
        ROUND(AVG(dv.subtotal), 2)::NUMERIC AS ticket_promedio
    FROM public.detalle_ventas dv
    INNER JOIN public.ventas v ON v.id_venta = dv.id_venta
    INNER JOIN public.productos p ON p.id_producto = dv.id_producto
    LEFT JOIN public.categorias c ON c.id_categoria = p.id_categoria
    WHERE v.fecha_hora::DATE BETWEEN p_fecha_inicio AND p_fecha_fin
      AND v.estado = 'ACTIVO'
    GROUP BY p.id_producto, p.codigo_barras, p.nombre, c.nombre
    ORDER BY SUM(dv.cantidad) DESC
    LIMIT p_limite;
END;
$function$;

COMMENT ON FUNCTION public.fn_productos_mas_vendidos IS 
'REP-01: Genera ranking de productos más vendidos en un período. Muestra posición, cantidad, monto.';

-- ============================================================================
-- SELECT * FROM fn_productos_mas_vendidos('2025-01-01', '2025-12-31', 20);

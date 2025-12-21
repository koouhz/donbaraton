-- ============================================================================
-- FUNCIÓN: fn_listar_productos_por_vencer
-- PROPÓSITO: Listar productos que vencen dentro de X días (para tabla INV-04)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.fn_listar_productos_por_vencer(
    p_dias INTEGER DEFAULT 30
)
RETURNS TABLE(
    id_producto VARCHAR,
    codigo_barras VARCHAR,
    nombre VARCHAR,
    categoria VARCHAR,
    fecha_vencimiento DATE,
    dias_restantes INTEGER,
    cantidad INTEGER,
    lote VARCHAR,
    estado_alerta VARCHAR
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY 
    SELECT 
        p.id_producto,
        p.codigo_barras,
        p.nombre::VARCHAR,
        c.nombre::VARCHAR AS categoria,
        mi.fecha_vencimiento::DATE,
        (mi.fecha_vencimiento - CURRENT_DATE)::INTEGER AS dias_restantes,
        mi.cantidad::INTEGER,
        mi.lote::VARCHAR,
        CASE 
            WHEN (mi.fecha_vencimiento - CURRENT_DATE) <= 15 THEN 'CRITICO'
            WHEN (mi.fecha_vencimiento - CURRENT_DATE) <= 20 THEN 'ALERTA'
            ELSE 'PROXIMO'
        END::VARCHAR AS estado_alerta
    FROM public.movimientos_inventario mi
    INNER JOIN public.productos p ON p.id_producto = mi.id_producto
    LEFT JOIN public.categorias c ON c.id_categoria = p.id_categoria
    WHERE mi.fecha_vencimiento IS NOT NULL
      AND p.estado = 'ACTIVO'
      AND mi.fecha_vencimiento BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_dias)
      AND mi.cantidad > 0
    ORDER BY mi.fecha_vencimiento ASC;
END;
$function$;

COMMENT ON FUNCTION public.fn_listar_productos_por_vencer IS 
'Lista productos con vencimiento próximo. Usado en INV-04 Productos por Vencer.';

-- ============================================================================
-- SELECT * FROM fn_listar_productos_por_vencer(30);

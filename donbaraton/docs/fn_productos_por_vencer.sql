-- ============================================================================
-- FUNCIÓN: fn_productos_por_vencer
-- PROPÓSITO: Contar productos que vencen dentro de X días (para Dashboard)
-- ============================================================================

-- Eliminar función existente si tiene tipo de retorno diferente
DROP FUNCTION IF EXISTS public.fn_productos_por_vencer(INTEGER);

CREATE OR REPLACE FUNCTION public.fn_productos_por_vencer(
    p_dias_anticipacion INTEGER DEFAULT 30
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $function$
DECLARE
    v_count BIGINT;
BEGIN
    -- Contar productos únicos con fecha de vencimiento dentro del rango
    SELECT COUNT(DISTINCT mi.id_producto)
    INTO v_count
    FROM public.movimientos_inventario mi
    INNER JOIN public.productos p ON p.id_producto = mi.id_producto
    WHERE mi.fecha_vencimiento IS NOT NULL
      AND p.estado = 'ACTIVO'
      AND mi.fecha_vencimiento BETWEEN CURRENT_DATE AND (CURRENT_DATE + p_dias_anticipacion);
    
    RETURN COALESCE(v_count, 0);
END;
$function$;

-- ============================================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================================================

COMMENT ON FUNCTION public.fn_productos_por_vencer(INTEGER) IS 
'Cuenta la cantidad de productos únicos que vencen dentro de los próximos X días. 
Usado en el Dashboard para mostrar alerta de vencimientos próximos.
Parámetros:
  - p_dias_anticipacion: Número de días hacia adelante para buscar (default: 30)
Retorna: 
  - Cantidad de productos con vencimiento próximo';

-- ============================================================================
-- EJEMPLOS DE USO:
-- ============================================================================

/*
-- Ver productos que vencen en los próximos 30 días
SELECT fn_productos_por_vencer(30);

-- Ver productos que vencen en los próximos 7 días
SELECT fn_productos_por_vencer(7);

-- Ver productos que vencen en los próximos 60 días
SELECT fn_productos_por_vencer(60);
*/

-- ============================================================================
-- PRUEBA DE LA FUNCIÓN:
-- ============================================================================

-- Ejecutar para verificar que funciona
SELECT 
    fn_productos_por_vencer(30) as proximos_30_dias,
    fn_productos_por_vencer(7) as proximos_7_dias,
    fn_productos_por_vencer(60) as proximos_60_dias;

-- ============================================================================
-- NOTAS:
-- ============================================================================
-- - Esta función es RÁPIDA porque usa COUNT en lugar de retornar registros
-- - Ideal para estadísticas y contadores en el Dashboard
-- - Solo cuenta productos ACTIVOS
-- - Usa el índice idx_movimientos_fecha_vencimiento para mejor performance
-- ============================================================================

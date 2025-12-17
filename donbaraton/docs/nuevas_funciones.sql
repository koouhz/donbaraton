-- =====================================================
-- NUEVAS FUNCIONES fn_* PARA COMPLETAR LA MIGRACIÓN
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Función para leer cuentas por pagar
CREATE OR REPLACE FUNCTION public.fn_leer_cuentas_por_pagar(
    p_estado VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    id VARCHAR,
    proveedor TEXT,
    factura_nro VARCHAR,
    fecha_emision DATE,
    fecha_vencimiento DATE,
    monto_total NUMERIC,
    saldo_pendiente NUMERIC,
    estado VARCHAR,
    dias_vencido INT
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        cpp.id_cuenta_pagar as id,
        COALESCE(p.razon_social, 'Sin proveedor')::TEXT as proveedor,
        cpp.factura_nro,
        cpp.fecha_emision,
        cpp.fecha_vencimiento,
        cpp.monto_total,
        cpp.saldo_pendiente,
        cpp.estado,
        CASE 
            WHEN cpp.fecha_vencimiento < CURRENT_DATE AND cpp.estado != 'PAGADA'
            THEN (CURRENT_DATE - cpp.fecha_vencimiento)::INT
            ELSE 0
        END as dias_vencido
    FROM public.cuentas_por_pagar cpp
    LEFT JOIN public.proveedores p ON cpp.id_proveedor = p.id_proveedor
    WHERE cpp.estadoa = true
      AND (p_estado IS NULL OR cpp.estado = p_estado)
    ORDER BY cpp.fecha_vencimiento ASC;
END;
$function$;

-- 2. Función para leer movimientos de inventario
CREATE OR REPLACE FUNCTION public.fn_leer_movimientos_inventario(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL,
    p_id_producto VARCHAR DEFAULT NULL,
    p_tipo VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    id VARCHAR,
    fecha TIMESTAMP,
    producto TEXT,
    codigo_interno VARCHAR,
    tipo VARCHAR,
    cantidad INT,
    documento VARCHAR,
    motivo VARCHAR,
    usuario TEXT
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        mi.id_movimiento as id,
        mi.fecha_hora as fecha,
        COALESCE(p.nombre, 'Producto eliminado')::TEXT as producto,
        p.codigo_interno,
        mi.tipo,
        mi.cantidad::INT,
        mi.documento,
        mi.motivo,
        COALESCE(u.username, 'Sistema')::TEXT as usuario
    FROM public.movimientos_inventario mi
    LEFT JOIN public.productos p ON mi.id_producto = p.id_producto
    LEFT JOIN public.usuarios u ON mi.id_usuario = u.id_usuario
    WHERE (p_fecha_inicio IS NULL OR DATE(mi.fecha_hora) >= p_fecha_inicio)
      AND (p_fecha_fin IS NULL OR DATE(mi.fecha_hora) <= p_fecha_fin)
      AND (p_id_producto IS NULL OR mi.id_producto = p_id_producto)
      AND (p_tipo IS NULL OR mi.tipo = p_tipo)
    ORDER BY mi.fecha_hora DESC
    LIMIT 200;
END;
$function$;

-- =====================================================
-- INSTRUCCIONES:
-- 1. Copiar este SQL completo
-- 2. Ir a Supabase Dashboard > SQL Editor
-- 3. Pegar y ejecutar
-- =====================================================

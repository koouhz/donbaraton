-- =========================================================
-- PROCEDIMIENTOS PARA CIERRE DE CAJA CON FILTRO POR CAJERO
-- Ejecuta este SQL en Supabase SQL Editor
-- =========================================================

-- ==============================
-- 1. Función para leer cierres de caja con filtro por usuario
-- ==============================
DROP FUNCTION IF EXISTS public.fn_leer_cierres_caja_cajero(date, character varying);

CREATE OR REPLACE FUNCTION public.fn_leer_cierres_caja_cajero(
    p_fecha date DEFAULT NULL,
    p_id_usuario character varying DEFAULT NULL
)
RETURNS TABLE(
    id character varying,
    fecha date,
    hora time,
    usuario text,
    efectivo numeric,
    diferencia numeric,
    observaciones text
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id_cierre as id,
        cc.fecha,
        cc.hora_cierre as hora,
        COALESCE(e.nombres || ' ' || COALESCE(e.apellido_paterno, ''), u.username, 'Sin asignar')::text as usuario,
        cc.total_efectivo as efectivo,
        cc.diferencia,
        cc.observaciones
    FROM public.cierre_caja cc
    LEFT JOIN public.usuarios u ON cc.id_usuario = u.id_usuario
    LEFT JOIN public.empleados e ON u.id_empleado = e.id_empleado
    WHERE (p_fecha IS NULL OR cc.fecha = p_fecha)
      AND (p_id_usuario IS NULL OR cc.id_usuario = p_id_usuario)
    ORDER BY cc.fecha DESC, cc.hora_cierre DESC;
END;
$function$;

-- ==============================
-- 2. Función para resumen de caja con filtro por usuario
-- ==============================
DROP FUNCTION IF EXISTS public.fn_resumen_caja_cajero(date, character varying);

CREATE OR REPLACE FUNCTION public.fn_resumen_caja_cajero(
    p_fecha date,
    p_id_usuario character varying DEFAULT NULL
)
RETURNS TABLE(
    total_ventas bigint,
    total_efectivo numeric,
    total_tarjeta numeric,
    total_qr numeric,
    total_recaudado numeric
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(v.id_venta)::bigint as total_ventas,
        COALESCE(SUM(CASE WHEN p.medio_pago = 'EFECTIVO' THEN p.monto ELSE 0 END), 0) as total_efectivo,
        COALESCE(SUM(CASE WHEN p.medio_pago IN ('DEBITO', 'CREDITO', 'TARJETA') THEN p.monto ELSE 0 END), 0) as total_tarjeta,
        COALESCE(SUM(CASE WHEN p.medio_pago = 'QR' THEN p.monto ELSE 0 END), 0) as total_qr,
        COALESCE(SUM(p.monto), 0) as total_recaudado
    FROM public.ventas v
    LEFT JOIN public.pagos p ON v.id_venta = p.id_venta
    WHERE DATE(v.fecha_hora) = p_fecha
      AND v.estado = 'ACTIVO'
      AND (p_id_usuario IS NULL OR v.id_usuario = p_id_usuario);
END;
$function$;

-- Mensaje de confirmación
SELECT 'Funciones fn_leer_cierres_caja_cajero y fn_resumen_caja_cajero creadas correctamente' as resultado;

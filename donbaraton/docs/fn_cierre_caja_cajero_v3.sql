-- =========================================================
-- PROCEDIMIENTOS PARA CIERRE DE CAJA (VERSION 3 FINAL)
-- Ejecuta este SQL en Supabase SQL Editor
-- =========================================================

-- 1. Eliminar funciones anteriores para evitar conflictos
DROP FUNCTION IF EXISTS public.fn_leer_cierres_caja_cajero(date, character varying);
DROP FUNCTION IF EXISTS public.fn_resumen_caja_cajero(date, character varying);

-- 2. Crear función fn_leer_cierres_caja_cajero (Corrección: CAST a TEXT)
CREATE OR REPLACE FUNCTION public.fn_leer_cierres_caja_cajero(
    p_fecha date DEFAULT NULL,
    p_id_usuario character varying DEFAULT NULL
)
RETURNS TABLE(
    id character varying,
    fecha date,
    hora time without time zone,
    usuario text,
    efectivo numeric,
    diferencia numeric,
    observaciones text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id_cierre as id,
        cc.fecha,
        cc.hora_cierre as hora,
        COALESCE(e.nombres || ' ' || COALESCE(e.apellido_paterno, ''), u.username, 'Sin asignar')::text as usuario,
        cc.total_efectivo as efectivo,
        cc.diferencia,
        cc.observaciones::text  -- CAST explícito para evitar error 42804
    FROM public.cierre_caja cc
    LEFT JOIN public.usuarios u ON cc.id_usuario = u.id_usuario
    LEFT JOIN public.empleados e ON u.id_empleado = e.id_empleado
    WHERE (p_fecha IS NULL OR cc.fecha = p_fecha)
      AND (p_id_usuario IS NULL OR cc.id_usuario = p_id_usuario)
    ORDER BY cc.fecha DESC, cc.hora_cierre DESC;
END;
$$;


-- 3. Crear función fn_resumen_caja_cajero (Corrección: columna 'medio' en lugar de 'medio_pago')
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
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(v.id_venta)::bigint as total_ventas,
        COALESCE(SUM(CASE WHEN p.medio = 'EFECTIVO' THEN p.importe ELSE 0 END), 0) as total_efectivo,
        COALESCE(SUM(CASE WHEN p.medio IN ('DEBITO', 'CREDITO', 'TARJETA') THEN p.importe ELSE 0 END), 0) as total_tarjeta,
        COALESCE(SUM(CASE WHEN p.medio = 'QR' THEN p.importe ELSE 0 END), 0) as total_qr,
        COALESCE(SUM(p.importe), 0) as total_recaudado
    FROM public.ventas v
    LEFT JOIN public.pagos p ON v.id_venta = p.id_venta
    WHERE DATE(v.fecha_hora) = p_fecha
      AND v.estado = 'ACTIVO'
      AND (p_id_usuario IS NULL OR v.id_usuario = p_id_usuario);
END;
$$;

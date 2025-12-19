-- =========================================================
-- ACTUALIZAR fn_leer_ventas_cajero para incluir el nombre del cajero
-- Ejecuta este SQL en Supabase SQL Editor
-- =========================================================

DROP FUNCTION IF EXISTS public.fn_leer_ventas_cajero(date, date, character varying);

CREATE OR REPLACE FUNCTION public.fn_leer_ventas_cajero(
    p_fecha_inicio date, 
    p_fecha_fin date,
    p_id_usuario character varying DEFAULT NULL
)
RETURNS TABLE(
    id character varying, 
    fecha timestamp without time zone, 
    cliente text, 
    cajero text,  -- NUEVO: nombre del cajero
    comprobante text, 
    total numeric, 
    estado boolean
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        v.id_venta as id,
        v.fecha_hora as fecha,
        COALESCE(c.nombres || ' ' || COALESCE(c.apellido_paterno, ''), v.razon_social, 'Cliente General')::text as cliente,
        COALESCE(e.nombres || ' ' || COALESCE(e.apellido_paterno, ''), u.username, 'Sin asignar')::text as cajero,
        COALESCE(v.tipo_comprobante || COALESCE(' - ' || v.numero_factura, ''), 'TICKET')::text as comprobante,
        v.total,
        (v.estado = 'ACTIVO') as estado
    FROM public.ventas v
    LEFT JOIN public.clientes c ON v.id_cliente = c.id_cliente
    LEFT JOIN public.usuarios u ON v.id_usuario = u.id_usuario
    LEFT JOIN public.empleados e ON u.id_empleado = e.id_empleado
    WHERE DATE(v.fecha_hora) BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_id_usuario IS NULL OR v.id_usuario = p_id_usuario)
    ORDER BY v.fecha_hora DESC;
END;
$function$;

-- Mensaje de confirmación
SELECT 'Función fn_leer_ventas_cajero actualizada correctamente' as resultado;

-- =========================================================
-- IMPLEMENTACIÓN DE CIERRE DE TURNO V2 (CONTEOS Y RECAUDADO)
-- Ejecuta este SQL en Supabase SQL Editor
-- =========================================================

-- Asegurarse de que las modificaciones de tabla existan (V1)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ventas' AND column_name = 'id_cierre') THEN
        ALTER TABLE public.ventas ADD COLUMN id_cierre VARCHAR DEFAULT NULL;
    END IF;
END $$;

-- 2. Actualizar fn_resumen_caja_cajero 
-- Primero eliminamos la versión anterior porque cambiamos el tipo de retorno (Error 42P13)
DROP FUNCTION IF EXISTS public.fn_resumen_caja_cajero(date, character varying);

-- AHORA RETORNA CONTEOS TAMBIÉN
CREATE OR REPLACE FUNCTION public.fn_resumen_caja_cajero(
    p_fecha date,
    p_id_usuario character varying DEFAULT NULL
)
RETURNS TABLE(
    total_ventas bigint,
    total_efectivo numeric,
    total_tarjeta numeric,
    total_qr numeric,
    total_recaudado numeric,
    cant_efectivo bigint,
    cant_tarjeta bigint,
    cant_qr bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT v.id_venta)::bigint as total_ventas,
        -- Montos
        COALESCE(SUM(CASE WHEN p.medio = 'EFECTIVO' THEN (p.importe - COALESCE(p.vuelto, 0)) ELSE 0 END), 0) as total_efectivo,
        COALESCE(SUM(CASE WHEN p.medio IN ('DEBITO', 'CREDITO', 'TARJETA') THEN p.importe ELSE 0 END), 0) as total_tarjeta,
        COALESCE(SUM(CASE WHEN p.medio = 'QR' THEN p.importe ELSE 0 END), 0) as total_qr,
        COALESCE(SUM(p.importe - COALESCE(p.vuelto, 0)), 0) as total_recaudado,
        -- Conteos (Ventas únicas por medio de pago)
        COUNT(DISTINCT CASE WHEN p.medio = 'EFECTIVO' THEN v.id_venta END)::bigint as cant_efectivo,
        COUNT(DISTINCT CASE WHEN p.medio IN ('DEBITO', 'CREDITO', 'TARJETA') THEN v.id_venta END)::bigint as cant_tarjeta,
        COUNT(DISTINCT CASE WHEN p.medio = 'QR' THEN v.id_venta END)::bigint as cant_qr
    FROM public.ventas v
    LEFT JOIN public.pagos p ON v.id_venta = p.id_venta
    WHERE DATE(v.fecha_hora) = p_fecha
      AND v.estado = 'ACTIVO'
      AND (p_id_usuario IS NULL OR v.id_usuario = p_id_usuario)
      AND v.id_cierre IS NULL; -- Solo turno abierto
END;
$$;

-- 3. Mantener fn_leer_ventas_cajero por compatibilidad y corrección (igual a V1)
CREATE OR REPLACE FUNCTION public.fn_leer_ventas_cajero(
    p_fecha_inicio date, 
    p_fecha_fin date,
    p_id_usuario character varying DEFAULT NULL
)
RETURNS TABLE(id character varying, fecha timestamp without time zone, cliente text, cajero text, comprobante text, total numeric, estado boolean)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id_venta, v.fecha_hora,
        COALESCE(c.nombres || ' ' || COALESCE(c.apellido_paterno, ''), v.razon_social, 'Cliente General')::text,
        COALESCE(e.nombres || ' ' || COALESCE(e.apellido_paterno, ''), u.username, 'Sin asignar')::text,
        COALESCE(v.tipo_comprobante || COALESCE(' - ' || v.numero_factura, ''), 'TICKET')::text,
        v.total, (v.estado = 'ACTIVO')
    FROM public.ventas v
    LEFT JOIN public.clientes c ON v.id_cliente = c.id_cliente
    LEFT JOIN public.usuarios u ON v.id_usuario = u.id_usuario
    LEFT JOIN public.empleados e ON u.id_empleado = e.id_empleado
    WHERE DATE(v.fecha_hora) BETWEEN p_fecha_inicio AND p_fecha_fin
      AND (p_id_usuario IS NULL OR v.id_usuario = p_id_usuario)
      AND (p_id_usuario IS NULL OR v.id_cierre IS NULL) 
    ORDER BY v.fecha_hora DESC;
END;
$$;

-- 4. Mantener fn_registrar_cierre_caja (igual a V1)
CREATE OR REPLACE FUNCTION public.fn_registrar_cierre_caja(
    p_id_usuario character varying, p_fecha date, p_hora_cierre time without time zone, 
    p_total_efectivo numeric, p_diferencia numeric, p_observaciones text DEFAULT NULL
)
RETURNS character varying
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_cierre VARCHAR;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cierre_caja_seq') THEN CREATE SEQUENCE cierre_caja_seq; END IF;
    v_id_cierre := 'CIE-' || LPAD(nextval('cierre_caja_seq'::regclass)::VARCHAR, 5, '0');

    INSERT INTO public.cierre_caja (id_cierre, id_usuario, fecha, hora_cierre, total_efectivo, diferencia, observaciones)
    VALUES (v_id_cierre, p_id_usuario, p_fecha, p_hora_cierre, p_total_efectivo, p_diferencia, p_observaciones);

    UPDATE public.ventas SET id_cierre = v_id_cierre
    WHERE id_usuario = p_id_usuario AND DATE(fecha_hora) = p_fecha AND estado = 'ACTIVO' AND id_cierre IS NULL;

    RETURN v_id_cierre;
END;
$$;

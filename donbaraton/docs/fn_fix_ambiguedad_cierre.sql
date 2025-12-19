-- =========================================================
-- FIX DE AMBIGÜEDAD EN FUNCIÓN DE CIERRE
-- Ejecuta este script para eliminar versiones duplicadas
-- =========================================================

-- 1. Eliminar explícitamente TODAS las variantes que causan conflicto
-- Variante 1: La que usamos ahora
DROP FUNCTION IF EXISTS public.fn_registrar_cierre_caja(character varying, date, time without time zone, numeric, numeric, text);
-- Variante 2: La antigua/fantasma con supervisor
DROP FUNCTION IF EXISTS public.fn_registrar_cierre_caja(character varying, date, time without time zone, numeric, numeric, text, character varying);

-- 2. Recrear la función ÚNICA y correcta (con lógica de limpieza de caja)
CREATE OR REPLACE FUNCTION public.fn_registrar_cierre_caja(
    p_id_usuario character varying,
    p_fecha date,
    p_hora_cierre time without time zone,
    p_total_efectivo numeric,
    p_diferencia numeric,
    p_observaciones text DEFAULT NULL
)
RETURNS character varying
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_cierre VARCHAR;
BEGIN
    -- Asegurar secuencia
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'cierre_caja_seq') THEN
        CREATE SEQUENCE cierre_caja_seq;
    END IF;

    -- Generar ID
    v_id_cierre := 'CIE-' || LPAD(nextval('cierre_caja_seq'::regclass)::VARCHAR, 5, '0');

    -- Insertar Cierre
    INSERT INTO public.cierre_caja (
        id_cierre, id_usuario, fecha, hora_cierre, total_efectivo, diferencia, observaciones
    ) VALUES (
        v_id_cierre, p_id_usuario, p_fecha, p_hora_cierre, p_total_efectivo, p_diferencia, p_observaciones
    );

    -- LIMPIEZA DE TURNO: Marcar ventas como cerradas
    UPDATE public.ventas
    SET id_cierre = v_id_cierre
    WHERE id_usuario = p_id_usuario
      AND DATE(fecha_hora) = p_fecha
      AND estado = 'ACTIVO'
      AND id_cierre IS NULL;

    RETURN v_id_cierre;
END;
$$;

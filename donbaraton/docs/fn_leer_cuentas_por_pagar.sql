-- ============================================================================
-- FUNCIÓN: fn_leer_cuentas_por_pagar
-- PROPÓSITO: Listar todas las cuentas por pagar con información del proveedor
-- ============================================================================

-- Eliminar todas las versiones posibles de la función
DO $$ 
BEGIN
    -- Intentar eliminar todas las versiones
    EXECUTE 'DROP FUNCTION IF EXISTS public.fn_leer_cuentas_por_pagar() CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS public.fn_leer_cuentas_por_pagar(VARCHAR) CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS public.fn_leer_cuentas_por_pagar(TEXT) CASCADE';
EXCEPTION WHEN OTHERS THEN
    -- Ignorar errores si la función no existe
    NULL;
END $$;

CREATE OR REPLACE FUNCTION public.fn_leer_cuentas_por_pagar()
RETURNS TABLE(
    id VARCHAR,
    factura_nro VARCHAR,
    proveedor VARCHAR,
    fecha_vencimiento DATE,
    monto_total NUMERIC,
    saldo_pendiente NUMERIC,
    estado VARCHAR
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        c.id_cuenta AS id,
        c.numero_factura AS factura_nro,
        p.razon_social AS proveedor,
        c.fecha_vencimiento,
        c.monto_total,
        c.saldo_pendiente,
        c.estado
    FROM public.cuentas_por_pagar c
    LEFT JOIN public.proveedores p ON p.id_proveedor = c.id_proveedor
    ORDER BY 
        CASE c.estado
            WHEN 'VENCIDO' THEN 1
            WHEN 'PENDIENTE' THEN 2
            ELSE 3 -- PAGADO
        END,
        c.fecha_vencimiento ASC;
END;
$function$;

COMMENT ON FUNCTION public.fn_leer_cuentas_por_pagar IS 
'Lista todas las cuentas por pagar con información del proveedor.
Ordena primero las vencidas, luego pendientes, luego pagadas.';

-- ============================================================================
-- PRUEBA:
-- ============================================================================
-- SELECT * FROM fn_leer_cuentas_por_pagar();

-- ============================================================================
-- TRIGGER: Crear Cuenta por Pagar Automáticamente al Recepcionar Orden
-- PROPÓSITO: Generar automáticamente una cuenta por pagar cuando se recibe una orden de compra
-- ============================================================================

-- Paso 1: Crear función trigger
CREATE OR REPLACE FUNCTION public.fn_trigger_crear_cuenta_por_pagar()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
    v_id_proveedor VARCHAR;
    v_total NUMERIC;
    v_numero_factura VARCHAR;
    v_id_cuenta VARCHAR;
    v_plazo_credito INTEGER;
BEGIN
    -- Obtener información de la orden de compra
    SELECT 
        oc.id_proveedor,
        oc.total,
        p.plazo_credito
    INTO 
        v_id_proveedor,
        v_total,
        v_plazo_credito
    FROM public.ordenes_compra oc
    LEFT JOIN public.proveedores p ON p.id_proveedor = oc.id_proveedor
    WHERE oc.id_orden = NEW.id_orden;
    
    --Solo crear cuenta si el estado es RECIBIDA
    IF (SELECT estado FROM public.ordenes_compra WHERE id_orden = NEW.id_orden) = 'RECIBIDA' THEN
        
        -- Generar ID de cuenta
        v_id_cuenta := 'CXP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
                       LPAD(NEXTVAL('sq_cuenta_por_pagar')::TEXT, 4, '0');
        
        -- Generar número de factura basado en la orden
        v_numero_factura := 'FACT-' || NEW.id_orden;
        
        -- Insertar cuenta por pagar
        INSERT INTO public.cuentas_por_pagar (
            id_cuenta,
            id_proveedor,
            numero_factura,
            fecha_emision,
            fecha_vencimiento,
            monto_total,
            saldo_pendiente,
            estado,
            observaciones
        ) VALUES (
            v_id_cuenta,
            v_id_proveedor,
            v_numero_factura,
            NEW.fecha_ingreso,
            NEW.fecha_ingreso + INTERVAL '1 day' * COALESCE(v_plazo_credito, 30),
            v_total,
            v_total,
            'PENDIENTE',
            'Cuenta generada automáticamente de orden ' || NEW.id_orden
        );
        
        RAISE NOTICE 'Cuenta por pagar % creada automáticamente', v_id_cuenta;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Paso 2: Crear secuencia si no existe
CREATE SEQUENCE IF NOT EXISTS public.sq_cuenta_por_pagar START WITH 1 INCREMENT BY 1;

-- Paso 3: Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS trg_crear_cuenta_por_pagar ON public.recepciones;

-- Paso 4: Crear trigger
CREATE TRIGGER trg_crear_cuenta_por_pagar
    AFTER INSERT ON public.recepciones
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_trigger_crear_cuenta_por_pagar();

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION public.fn_trigger_crear_cuenta_por_pagar IS 
'Trigger que crea automáticamente una cuenta por pagar cuando se recepcion una orden de compra.
La cuenta se crea con el plazo de crédito del proveedor (default 30 días).';

-- ============================================================================
-- PRUEBA:
-- ============================================================================

/*
-- Para probar, inserta una recepción y verifica que se cree la cuenta:

-- 1. VER CUENTAS ANTES
SELECT * FROM public.cuentas_por_pagar ORDER BY fecha_registro DESC LIMIT 5;

-- 2. RECEPCIONAR UNA ORDEN (esto se hace desde la aplicación)
-- La recepción automáticamente creará la cuenta

-- 3. VER CUENTAS DESPUÉS
SELECT * FROM public.cuentas_por_pagar ORDER BY fecha_registro DESC LIMIT 5;

-- 4. VERIFICAR DETALLES
SELECT 
    c.id_cuenta,
    c.numero_factura,
    p.razon_social as proveedor,
    c.fecha_emision,
    c.fecha_vencimiento,
    c.monto_total,
    c.estado
FROM public.cuentas_por_pagar c
LEFT JOIN public.proveedores p ON p.id_proveedor = c.id_proveedor
ORDER BY c.fecha_registro DESC
LIMIT 10;
*/

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- ✅ Trigger creado
-- ✅ Al recepcionar orden → Se crea cuenta por pagar automáticamente
-- ✅ Fecha vencimiento = Fecha recepción + Plazo crédito del proveedor
-- ✅ Monto = Total de la orden
-- ✅ Estado = PENDIENTE
-- ============================================================================

-- ============================================
-- FIX: Resincronizar secuencia pagos_seq
-- ============================================
-- Este script corrige el error:
-- "duplicate key value violates unique constraint pagos_pkey"
-- 
-- El problema: La secuencia 'pagos_seq' está desincronizada 
-- con los registros existentes en la tabla 'pagos'.
-- ============================================

-- 1. Verificar el estado actual de la secuencia
SELECT last_value, is_called FROM pagos_seq;

-- 2. Obtener el número máximo actual de pagos
SELECT 
    MAX(CAST(REGEXP_REPLACE(id_pago, '[^0-9]', '', 'g') AS INTEGER)) as max_pago_num,
    'PAG-' || LPAD(MAX(CAST(REGEXP_REPLACE(id_pago, '[^0-9]', '', 'g') AS INTEGER))::VARCHAR, 3, '0') as max_id_pago
FROM pagos;

-- 3. SOLUCIÓN: Resetear la secuencia al valor máximo + 1
-- Primero obtenemos el máximo y luego reseteamos
DO $$
DECLARE
    v_max_num INTEGER;
    v_new_val INTEGER;
BEGIN
    -- Obtener el número máximo existente
    SELECT COALESCE(MAX(CAST(REGEXP_REPLACE(id_pago, '[^0-9]', '', 'g') AS INTEGER)), 0) 
    INTO v_max_num
    FROM pagos;
    
    -- El nuevo valor debe ser max + 1
    v_new_val := v_max_num + 1;
    
    -- Resetear la secuencia
    EXECUTE 'ALTER SEQUENCE pagos_seq RESTART WITH ' || v_new_val;
    
    RAISE NOTICE 'Secuencia pagos_seq reseteada. Valor anterior máximo: %, nuevo inicio: %', v_max_num, v_new_val;
END $$;

-- 4. Verificar que la secuencia fue actualizada correctamente
SELECT last_value, is_called FROM pagos_seq;

-- ============================================
-- NOTA: Ejecuta este script en el SQL Editor de Supabase
-- Si usas un cliente como DBeaver o pgAdmin, ejecuta todo el script.
-- ============================================

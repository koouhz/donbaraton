-- ============================================================================
-- CONFIGURACIÓN DE TIMEZONE PARA BOLIVIA (La Paz -04:00)
-- ============================================================================
-- 
-- INSTRUCCIONES:
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Esto configura la zona horaria de Bolivia para toda la base de datos
--
-- ============================================================================

-- Configurar timezone por defecto de la base de datos a Bolivia
ALTER DATABASE postgres SET timezone TO 'America/La_Paz';

-- También se puede configurar a nivel de sesión si lo anterior no funciona:
-- SET timezone = 'America/La_Paz';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar el timezone actual
SELECT current_setting('TIMEZONE') AS timezone_actual;

-- Verificar hora actual en Bolivia
SELECT 
    NOW() AS hora_servidor,
    NOW() AT TIME ZONE 'America/La_Paz' AS hora_bolivia,
    CURRENT_DATE AS fecha_actual,
    LOCALTIME AS hora_local;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 
-- 1. Bolivia (La Paz) tiene offset UTC-4 sin horario de verano
-- 
-- 2. Después de ejecutar ALTER DATABASE, es necesario:
--    - Desconectar y reconectar a la base de datos
--    - O reiniciar el pooler de conexiones
--
-- 3. Para funciones que usan NOW() o CURRENT_TIMESTAMP:
--    - Si la DB está configurada a 'America/La_Paz', NOW() dará hora de Bolivia
--    - Si no, usar: NOW() AT TIME ZONE 'America/La_Paz'
--
-- 4. Para conversiones explícitas:
--    SELECT fecha_hora AT TIME ZONE 'America/La_Paz' FROM tabla;
--
-- ============================================================================
-- EJEMPLO DE USO EN FUNCIONES
-- ============================================================================

-- En vez de:
--   fecha_registro TIMESTAMP DEFAULT NOW()
-- Usar:
--   fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()

-- O si necesitas conversión explícita:
--   fecha_registro TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'America/La_Paz')

-- ============================================================================

-- Procedimiento para buscar empleado por CI
-- Usado para auto-completar el formulario y verificar si existe un empleado
-- EJECUTAR ESTE SQL EN SUPABASE PARA QUE FUNCIONE LA BÚSQUEDA POR CI

-- Primero eliminar la función existente (si tiene tipos diferentes)
DROP FUNCTION IF EXISTS public.fn_buscar_empleado_por_ci(VARCHAR);

CREATE OR REPLACE FUNCTION public.fn_buscar_empleado_por_ci(
    p_ci VARCHAR
)
RETURNS TABLE (
    id_empleado VARCHAR,
    ci VARCHAR,
    nombres VARCHAR,
    apellido_paterno VARCHAR,
    apellido_materno VARCHAR,
    fecha_nacimiento DATE,
    sexo VARCHAR,
    telefono VARCHAR,
    email VARCHAR,
    id_cargo VARCHAR,
    cargo VARCHAR,
    salario NUMERIC,
    foto_url TEXT,
    estado VARCHAR
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id_empleado,
        e.ci,
        e.nombres,
        e.apellido_paterno,
        e.apellido_materno,
        e.fecha_nacimiento,
        e.sexo,
        e.telefono,
        e.email,
        e.id_cargo,
        c.nombre AS cargo,
        e.salario,
        e.foto_url,
        e.estado
    FROM empleados e
    LEFT JOIN cargos c ON e.id_cargo = c.id_cargo
    WHERE e.ci = p_ci;
END;
$$;

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.fn_buscar_empleado_por_ci(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_buscar_empleado_por_ci(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION public.fn_buscar_empleado_por_ci(VARCHAR) TO service_role;

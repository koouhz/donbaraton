-- FUNCIÓN FALTANTE PARA ASIGNAR ROLES
-- Ejecuta este script en el Editor SQL de Supabase para corregir el error.

CREATE OR REPLACE FUNCTION public.fn_asignar_rol_usuario(
    p_id_usuario character varying,
    p_id_rol character varying,
    p_usuario_auditoria character varying
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Validar existencia del usuario
    IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = p_id_usuario) THEN
        RAISE EXCEPTION 'Usuario no encontrado: %', p_id_usuario;
    END IF;
    
    -- Validar existencia del rol
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE id_rol = p_id_rol) THEN
        RAISE EXCEPTION 'Rol no encontrado: %', p_id_rol;
    END IF;

    -- Registrar auditoría
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 
        'SEGURIDAD', 
        'ASIGNAR_ROL',
        'Usuario: ' || p_id_usuario || ' -> Rol: ' || p_id_rol
    );

    -- Actualizar rol del usuario
    UPDATE public.usuarios
    SET id_rol = p_id_rol
    WHERE id_usuario = p_id_usuario;
    
    RETURN FOUND;
END;
$function$;

-- FUNCIONES FALTANTES PARA CARGOS
-- Ejecuta este script en el Editor SQL de Supabase

-- ============================================
-- FUNCIÓN PARA EDITAR CARGO
-- ============================================
CREATE OR REPLACE FUNCTION public.fn_editar_cargo(
    p_id_cargo character varying,
    p_nombre character varying DEFAULT NULL,
    p_descripcion character varying DEFAULT NULL,
    p_usuario_auditoria character varying DEFAULT 'sistema'
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 'RRHH', 'EDITAR_CARGO',
        'Cargo ID: ' || p_id_cargo
    );

    UPDATE public.cargos
    SET nombre = COALESCE(p_nombre, nombre),
        descripcion = COALESCE(p_descripcion, descripcion)
    WHERE id_cargo = p_id_cargo;

    RETURN FOUND;
END;
$function$;

-- ============================================
-- FUNCIÓN PARA ELIMINAR CARGO
-- ============================================
CREATE OR REPLACE FUNCTION public.fn_desactivar_cargo(
    p_id_cargo character varying,
    p_usuario_auditoria character varying DEFAULT 'sistema'
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 'RRHH', 'ELIMINAR_CARGO',
        'Cargo ID: ' || p_id_cargo
    );

    DELETE FROM public.cargos WHERE id_cargo = p_id_cargo;
    RETURN FOUND;
END;
$function$;

-- Función para reactivar un empleado existente
CREATE OR REPLACE FUNCTION public.fn_reactivar_empleado(p_id_empleado character varying, p_usuario_auditoria character varying)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
    PERFORM public.fn_registrar_auditoria(
        p_usuario_auditoria, 'RRHH', 'REACTIVAR_EMPLEADO',
        'Empleado ID: ' || p_id_empleado
    );

    UPDATE public.empleados 
    SET estado = 'ACTIVO' 
    WHERE id_empleado = p_id_empleado;
    
    RETURN FOUND;
END;
$function$;

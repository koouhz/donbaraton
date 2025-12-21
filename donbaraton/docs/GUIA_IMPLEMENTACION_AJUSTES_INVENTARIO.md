# 🎯 Guía de Implementación: Módulo de Ajustes de Inventario

## ✅ Archivos Creados

### 1. Función de Base de Datos

- **Archivo:** `docs/fn_ajustar_inventario.sql`
- **Propósito:** Stored procedure para registrar ajustes manuales de inventario

### 2. Componente React

- **Archivo:** `src/pages/AjustesInventario.jsx`
- **Propósito:** Interfaz de usuario para ajustes de inventario

### 3. Configuración de Rutas

- **Archivo:** `src/App.jsx`
- ✅ **YA MODIFICADO** - Se agregó el import lazy y la ruta

---

## 📋 PASOS PARA ACTIVAR EL MÓDULO

### Paso 1: Crear la Secuencia en Supabase ⚠️ CRÍTICO

Antes de ejecutar la función, debe crear la secuencia para los IDs de movimiento:

```sql
-- Ejecutar esto PRIMERO en Supabase SQL Editor
CREATE SEQUENCE IF NOT EXISTS public.sq_movimiento_inventario START WITH 1 INCREMENT BY 1;
```

### Paso 2: Ejecutar la Función en Supabase

1. Abre **Supabase Dashboard** → Tu proyecto "Don Baraton"
2. Ve a **SQL Editor**
3. Abre el archivo `docs/fn_ajustar_inventario.sql`
4. Copia **TODO EL CONTENIDO** de la función (desde `CREATE OR REPLACE FUNCTION` hasta el final)
5. Pega en Supabase SQL Editor
6. Click en **RUN** o presiona `Ctrl + Enter`
7. Verifica que no haya errores

### Paso 3: Verificar que el Frontend Compile

El código ya está integrado, solo verifica que compile correctamente:

```bash
# El servidor ya está corriendo (npm run dev)
# Revisa la terminal para ver que no haya errores de compilación
```

### Paso 4: Acceder al Módulo

En tu navegador, accede a:

```
http://localhost:5173/ajustes-inventario
```

O agrega un enlace en el menú lateral (Layout.jsx) si aún no existe.

---

## 🔍 Características del Módulo

### ✅ Búsqueda por Código de Barras

- ✅ Funciona **EXACTAMENTE IGUAL** que en Ventas
- ✅ Busca por código de barras O código interno
- ✅ Presionar `Enter` para confirmar
- ✅ Feedback visual inmediato

### ✅ Tipos de Movimiento Soportados

| Tipo        | Descripción                              | Efecto en Stock |
| ----------- | ---------------------------------------- | --------------- |
| **ENTRADA** | Ingreso manual (donación, transferencia) | ➕ Incrementa   |
| **SALIDA**  | Egreso manual (transferencia, otros)     | ➖ Decrementa   |
| **AJUSTE+** | Corrección por conteo físico (sobrante)  | ➕ Incrementa   |
| **AJUSTE-** | Corrección por conteo físico (faltante)  | ➖ Decrementa   |
| **MERMA**   | Pérdida por vencimiento/deterioro        | ➖ Decrementa   |
| **DAÑO**    | Pérdida por daño físico                  | ➖ Decrementa   |

### ✅ Validaciones Implementadas

1. ✅ El producto debe existir y estar activo
2. ✅ La cantidad debe ser mayor a 0
3. ✅ El motivo es obligatorio
4. ✅ Para salidas/decrementos: valida stock suficiente
5. ✅ No permite stock negativo

### ✅ Campos del Formulario

- **Tipo de Movimiento** \* (Requerido)
- **Cantidad** \* (Requerido, mayor a 0)
- **Lote** (Opcional)
- **Fecha de Vencimiento** (Opcional)
- **Nº Documento/Remito** (Opcional)
- **Motivo** \* (Requerido)
- **Observaciones** (Opcional)

---

## 🎨 Interfaz de Usuario

### Diseño de 2 Paneles

```
┌─────────────────────────────────────────────────────┐
│  📦 Ajustes de Inventario                          │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│  PANEL IZQ.   │         PANEL DERECHO              │
│               │                                     │
│  🔍 Escáner   │    📋 Formulario de Ajuste         │
│  📦 Producto  │                                     │
│  📋 Instruc.  │    Tipo, Cantidad, Lote, etc.      │
│               │                                     │
│               │    [Cancelar] [Confirmar Ajuste]   │
└───────────────┴─────────────────────────────────────┘
```

### Flujo de Uso

1. Usuario escanea código de barras → Producto se selecciona automáticamente
2. Usuario elige tipo de movimiento (ENTRADA, SALIDA, AJUSTE+, etc.)
3. Usuario ingresa cantidad
4. Usuario ingresa motivo (obligatorio)
5. Usuario opcionalmente ingresa lote, vencimiento, documento, observaciones
6. Usuario confirma → Sistema valida → Registra ajuste → Actualiza stock

---

## 🔐 Seguridad y Auditoría

- ✅ Registra el username del usuario que realiza el ajuste
- ✅ Registra auditoría automática con:
  - Tipo de movimiento
  - Producto afectado
  - Cantidad
  - Lote
  - Motivo
- ✅ Todas las operaciones son transaccionales

---

## 🧪 Pruebas Recomendadas

### Prueba 1: Ajuste Positivo (AJUSTE+)

```
1. Escanea un producto
2. Selecciona "AJUSTE+"
3. Ingresa cantidad: 10
4. Motivo: "Conteo físico - sobrante"
5. Confirmar
6. Verificar que el stock aumentó en 10
```

### Prueba 2: Merma

```
1. Escanea un producto
2. Selecciona "MERMA"
3. Ingresa cantidad: 5
4. Motivo: "Productos vencidos"
5. Fecha vencimiento: (fecha pasada)
6. Confirmar
7. Verificar que el stock disminuyó en 5
```

### Prueba 3: Entrada con Lote

```
1. Escanea un producto
2. Selecciona "ENTRADA"
3. Ingresa cantidad: 50
4. Lote: "LOT-2024-123"
5. Fecha vencimiento: 2025-06-30
6. Documento: "REM-001"
7. Motivo: "Compra local"
8. Confirmar
9. Verificar movimiento en "Movimientos de Inventario"
```

### Prueba 4: Validación de Stock Insuficiente

```
1. Escanea un producto con stock = 5
2. Selecciona "SALIDA"
3. Ingresa cantidad: 10 (más del stock disponible)
4. Motivo: "Prueba validación"
5. Intentar confirmar
6. Debe mostrar error: "Stock insuficiente"
```

---

## 📊 Integración con Otros Módulos

### ✅ Inventario.jsx

- Los ajustes se reflejan inmediatamente en el kardex del producto
- El stock_actual se actualiza en tiempo real

### ✅ MovimientosInventario.jsx

- Todos los ajustes aparecen en el historial de movimientos
- Se pueden ver por tipo, fecha, etc.

### ✅ AlertasStock.jsx

- Si un ajuste hace que el stock baje del mínimo, se genera alerta automáticamente

---

## ⚠️ Importante: Sin Cambios Destructivos

✅ **NO se modificó ningún archivo existente crítico**
✅ **NO se alteró ninguna función de base de datos existente**
✅ **SOLO se agregaron:**

- Nueva función `fn_ajustar_inventario`
- Nuevo componente `AjustesInventario.jsx`
- 2 líneas en `App.jsx` (import + ruta)

---

## 🎯 Cumplimiento del Caso de Uso PROD-04

| Requisito                      | Estado                           |
| ------------------------------ | -------------------------------- |
| 1. Seleccionar tipo movimiento | ✅ 6 tipos disponibles           |
| 2. Escanear/buscar producto    | ✅ Escáner de código de barras   |
| 3. Cantidad                    | ✅ Con validación                |
| 4. Lote                        | ✅ Campo opcional                |
| 5. Vencimiento                 | ✅ Campo opcional con calendario |
| 6. Remito/Documento            | ✅ Campo opcional                |
| 7. Confirmar                   | ✅ Con validaciones completas    |

**📈 Cumplimiento: 100%**

---

## 🚀 Próximos Pasos Opcionales

Si deseas mejorar aún más el módulo:

1. **Agregar botón en el menú lateral** (Layout.jsx)
2. **Permisos por rol** (solo Encargado de Almacén puede usar este módulo)
3. **Historial de ajustes del día** (mostrar los últimos 10 ajustes realizados)
4. **Impresión de documento de ajuste** (similar al comprobante de ventas)
5. **Soporte para ajustes masivos** (cargar desde Excel)

---

## 📞 Soporte

Si encuentras algún error:

1. Revisa la consola del navegador (F12 → Console)
2. Revisa la terminal donde corre `npm run dev`
3. Verifica que la función se ejecutó correctamente en Supabase
4. Verifica que la secuencia se creó correctamente

---

**¡Módulo listo para usar! 🎉**

# 🔧 Guía de Implementación: Sistema de Vencimientos

## ✅ Archivos Creados

1. **`fix_estructura_vencimientos.sql`** - Verificación y creación de campos
2. **`fn_productos_por_vencer.sql`** - Función contador para Dashboard
3. **`fn_alerta_vencimientos.sql`** - Función completa para AlertasStock

---

## 📋 ORDEN DE EJECUCIÓN (IMPORTANTE)

### ⚠️ Ejecutar EN ESTE ORDEN en Supabase SQL Editor:

#### **PASO 1:** Estructura de Tablas ✅

```sql
-- Ejecutar: fix_estructura_vencimientos.sql (COMPLETO)
```

**Qué hace:**

- ✅ Crea campo `fecha_vencimiento` en `movimientos_inventario` (si no existe)
- ✅ Crea campo `controla_vencimiento` en `productos` (si no existe)
- ✅ Crea índice para optimizar consultas
- ✅ Muestra reporte de datos existentes

**Resultado esperado:**

```
NOTICE: Campo fecha_vencimiento ya existe en movimientos_inventario
NOTICE: Campo controla_vencimiento ya existe en productos
NOTICE: ============================================
NOTICE: RESUMEN DE DATOS DE VENCIMIENTO:
NOTICE: ============================================
NOTICE: Movimientos con fecha de vencimiento: X
...
```

---

#### **PASO 2:** Función Simple (Dashboard) ✅

```sql
-- Ejecutar: fn_productos_por_vencer.sql (COMPLETO)
```

**Qué hace:**

- ✅ Crea función `fn_productos_por_vencer(p_dias_anticipacion)`
- ✅ Ejecuta prueba automática

**Resultado esperado:**

```
proximos_30_dias | proximos_7_dias | proximos_60_dias
-----------------+-----------------+-----------------
       X         |        X        |        X
```

---

#### **PASO 3:** Función Completa (AlertasStock) ✅

```sql
-- Ejecutar: fn_alerta_vencimientos.sql (COMPLETO)
```

**Qué hace:**

- ✅ Crea función `fn_alerta_vencimientos(p_dias_anticipacion)`
- ✅ Crea vista auxiliar `v_resumen_alertas_vencimiento`
- ✅ Ejecuta prueba automática

**Resultado esperado:**

```
producto       | lote      | fecha_vencimiento | dias_restantes | estado_alerta
---------------+-----------+-------------------+----------------+--------------
Leche Light    | LOT-123   | 2025-01-05       | 15             | AMARILLO
Pan Integral   | LOT-124   | 2025-01-02       | 12             | AMARILLO
...
```

---

## 🧪 VERIFICACIÓN

### Test 1: Dashboard debe mostrar contador

```javascript
// En Dashboard.jsx ya está implementado
// Verifica que NO aparezca error en consola
// Debe mostrar número >= 0
```

**Antes:**

```
Error: function fn_productos_por_vencer does not exist
```

**Después:**

```
✓ Próximos vencimientos: 3
```

---

### Test 2: AlertasStock debe mostrar lista

```javascript
// En AlertasStock.jsx ya está implementado
// Verifica tab "Próximos a Vencer (30 días)"
// Debe mostrar lista con semáforo de colores
```

**Antes:**

```
Error: function fn_alerta_vencimientos does not exist
Próximos a Vencer: 0
```

**Después:**

```
✓ Próximos a Vencer: 5
✓ Lista con productos clasificados por color
  🔴 ROJO: 2 productos
  🟡 AMARILLO: 2 productos
  🟢 VERDE: 1 producto
```

---

## 📊 SEMÁFORO DE ALERTAS

| Color           | Días Restantes | Prioridad     | Acción Recomendada   |
| --------------- | -------------- | ------------- | -------------------- |
| 🔴 **ROJO**     | 0-7 días       | ⚠️ URGENTE    | Liquidar o descontar |
| 🟡 **AMARILLO** | 8-15 días      | ⚠️ ATENCIÓN   | Promocionar          |
| 🟢 **VERDE**    | 16-30 días     | ℹ️ MONITOREAR | Rotar stock          |

---

## 🔄 FLUJO DE DATOS

```
┌─────────────────────────────────────────────────────┐
│  1. REGISTRO DE FECHA DE VENCIMIENTO                │
├─────────────────────────────────────────────────────┤
│  OrdenesCompra.jsx                                  │
│    → Usuario recibe compra                          │
│    → Ingresa lote y fecha de vencimiento            │
│    → Se guarda en movimientos_inventario            │
│                                                      │
│  AjustesInventario.jsx                              │
│    → Usuario hace ajuste con lote                   │
│    → Sistema genera lote automático                 │
│    → Usuario puede ingresar fecha vencimiento       │
│    → Se guarda en movimientos_inventario            │
└─────────────────────────────────────────────────────┘

                        ↓

┌─────────────────────────────────────────────────────┐
│  2. CONSULTA DE VENCIMIENTOS                        │
├─────────────────────────────────────────────────────┤
│  Dashboard.jsx                                      │
│    → Llama fn_productos_por_vencer(30)              │
│    → Muestra contador simple                        │
│                                                      │
│  AlertasStock.jsx                                   │
│    → Llama fn_alerta_vencimientos(30)               │
│    → Muestra lista completa con semáforo            │
│                                                      │
│  Inventario.jsx (Kardex)                            │
│    → Consulta directa a movimientos_inventario      │
│    → Muestra fechas de vencimiento por movimiento   │
└─────────────────────────────────────────────────────┘
```

---

## 📝 CONSULTAS ÚTILES

### Ver todos los vencimientos próximos

```sql
SELECT * FROM fn_alerta_vencimientos(30)
ORDER BY dias_restantes ASC;
```

### Ver resumen por semáforo

```sql
SELECT * FROM v_resumen_alertas_vencimiento;
```

### Ver productos sin fecha de vencimiento

```sql
SELECT p.nombre, COUNT(DISTINCT mi.id_movimiento) as movimientos_sin_fecha
FROM productos p
INNER JOIN movimientos_inventario mi ON p.id_producto = mi.id_producto
WHERE p.controla_vencimiento = TRUE
  AND mi.fecha_vencimiento IS NULL
GROUP BY p.nombre
ORDER BY movimientos_sin_fecha DESC;
```

### Marcar productos que requieren control

```sql
-- Ejemplo: Marcar categorías de alimentos
UPDATE productos
SET controla_vencimiento = TRUE
WHERE categoria IN ('Lácteos', 'Carnes', 'Panadería', 'Frutas', 'Verduras');
```

---

## ⚠️ NOTAS IMPORTANTES

### 1. Datos Históricos

- Si ya tienes datos históricos con `fecha_vencimiento`, las funciones trabajarán inmediatamente
- Si NO tienes datos, empezarán a acumularse desde ahora

### 2. Performance

- Las consultas usan índices optimizados
- `fn_productos_por_vencer` es MUY rápida (solo cuenta)
- `fn_alerta_vencimientos` puede ser más lenta si hay muchos registros

### 3. Actualización de Datos

- Dashboard se actualiza automáticamente cada vez que cargas
- AlertasStock tiene botón "Actualizar"
- Los datos se registran al recibir compras o hacer ajustes

### 4. Campo `controla_vencimiento`

- Marca qué productos requieren control de vencimiento
- Útil para generar reportes específicos
- NO afecta el registro de fechas (opcional)

---

## 🎯 CHECKLIST FINAL

Después de ejecutar todos los scripts:

- [ ] Script 1 ejecutado sin errores
- [ ] Script 2 ejecutado, muestra contadores
- [ ] Script 3 ejecutado, muestra lista de productos
- [ ] Dashboard abre sin errores de consola
- [ ] Dashboard muestra contador de vencimientos
- [ ] AlertasStock abre sin errores
- [ ] AlertasStock tab "Vencimientos" muestra datos
- [ ] Semáforo de colores funciona (🔴🟡🟢)
- [ ] OrdenesCompra puede registrar fechas
- [ ] AjustesInventario puede registrar fechas
- [ ] Kardex muestra fechas en movimientos

---

## 🚀 PRÓXIMOS PASOS (Opcional)

### Mejoras Futuras:

1. **Notificaciones automáticas** cuando un producto entre en zona ROJA
2. **Reporte de productos vencidos** (histórico)
3. **Gráfica de tendencia** de vencimientos por mes
4. **Integración con sistema de descuentos** automáticos
5. **Alertas por email/SMS** para productos críticos

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "column fecha_vencimiento does not exist"

**Solución:** Ejecuta nuevamente `fix_estructura_vencimientos.sql`

### Error: "function fn_productos_por_vencer does not exist"

**Solución:** Ejecuta `fn_productos_por_vencer.sql`

### Error: "function fn_alerta_vencimientos does not exist"

**Solución:** Ejecuta `fn_alerta_vencimientos.sql`

### Dashboard muestra siempre 0 vencimientos

**Causa:** No hay datos con `fecha_vencimiento` registrados
**Solución:** Normal si es instalación nueva. Empezará a mostrar datos al registrar compras/ajustes con fechas

### AlertasStock muestra lista vacía

**Causa:** No hay productos con vencimiento en los próximos 30 días
**Solución:** Normal si no hay productos próximos a vencer. Prueba con más días: `fn_alerta_vencimientos(60)`

---

**¡Sistema de vencimientos listo! 🎉**

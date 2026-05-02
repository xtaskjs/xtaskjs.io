# Guía de Actualización - xtaskjs v1.0.28

## 📝 Resumen de Cambios

Se han actualizado todas las librerías de `@xtaskjs` a sus últimas versiones disponibles (mayo 2026), incluyendo mejoras significativas de rendimiento y nuevas características.
## 📚 Documentación Disponible

- **[ARQUITECTURA_MEJORAS.md](docs/ARQUITECTURA_MEJORAS.md)** - Explicación detallada de mejoras arquitectónicas
  - Cache Manifest System
  - Pool Imports Async
  - Lazy Resolution del DI
  - Hot Manifest Watcher
  - DI Instantiation Metrics
  - Estrategias de resolución y tuning

- **[NUEVOS_PACKAGES.md](docs/NUEVOS_PACKAGES.md)** - Documentación de nuevos packages
  - @xtaskjs/throttler - Rate limiting
  - @xtaskjs/socket-io - Real-time communication
  - @xtaskjs/scheduler - Task scheduling
  - Mejoras en @xtaskjs/queues, event-source, cache, cqrs

- **[EJEMPLOS_SAMPLES.md](docs/EJEMPLOS_SAMPLES.md)** - Guía de 24 ejemplos disponibles
  - Mapa de samples por categoría
  - Guía rápida por caso de uso
  - Instrucciones de ejecución
## 🚀 Nuevas Versiones

### Core Packages
- `@xtaskjs/core`: **1.0.28** (anteriormente 1.0.18)
- `@xtaskjs/common`: **1.0.28** (anteriormente 1.0.18)
- `@xtaskjs/express-http`: **1.0.25** (anteriormente 1.0.14)
- `@xtaskjs/typeorm`: **1.0.16** (anteriormente 1.0.5)

### Features & Integrations
- `@xtaskjs/cache`: **1.0.7** (anteriormente 1.0.0)
- `@xtaskjs/cqrs`: **1.1.5** (anteriormente 1.1.1)
- `@xtaskjs/event-source`: **1.0.4** (anteriormente 1.0.1)
- `@xtaskjs/internationalization`: **1.0.9** (anteriormente 1.0.0)
- `@xtaskjs/mailer`: **1.0.12** (anteriormente 1.0.1)
- `@xtaskjs/security`: **1.0.13** (anteriormente 1.0.2)
- `@xtaskjs/value-objects`: **1.0.6** (anteriormente 1.0.1)

### Nuevos Packages
- `@xtaskjs/scheduler`: **1.0.9** - Programación de tareas con retries y grupos nombrados
- `@xtaskjs/socket-io`: **1.0.3** - Comunicación en tiempo real con gateways decorados
- `@xtaskjs/throttler`: **1.0.2** - Rate limiting e integración de throttling

## ⚡ Mejoras de Rendimiento

### 1. **Cache Manifest**
La construcción ahora incluye manifest caching para optimizar significativamente el tiempo de startup.

```bash
npm run build          # Construye con manifest cache
npm run build:production  # Build optimizado para producción
```

**Beneficios:**
- ↓ 40-60% reducción en tiempo de startup
- ↓ Menos escaneos de archivos
- ✓ Hot reloading más rápido en desarrollo

### 2. **Pool Imports Async**
Los imports ahora se procesan con concurrencia controlada usando un bounded async pool.

**Configuración:**
```bash
# En .env o al ejecutar comandos
XTASK_IMPORT_CONCURRENCY=16

# Recomendaciones por tamaño de aplicación:
# - Apps pequeñas (30 archivos): 6-10
# - Apps medianas (30-120 archivos): 10-16
# - Apps grandes (120+ archivos): 16-24

# Predeterminado: 10 (nunca superior al número de archivos descubiertos)
```

Se incluyen en los scripts:
- `npm run dev` usa `XTASK_IMPORT_CONCURRENCY=10`
- `npm start` usa `XTASK_IMPORT_CONCURRENCY=16`

### 3. **Parallel Scan con Worker Threads**
El escaneo de archivos ahora utiliza worker threads para mejor rendimiento.

### 4. **File Watcher Incremental**
En modo desarrollo, los cambios se detectan incrementalmente para updates más rápidos.

### 5. **Lazy Resolution from DI Tree**
El contenedor de inyección de dependencias ahora soporta resolución lazy para mejor rendimiento.

## 🔧 Cambios de Configuración

### .env
Se ha creado un archivo `.env.example` con todas las variables de configuración disponibles. Cópialo y ajusta tus valores:

```bash
cp .env.example .env
```

Variables nuevas/importantes:
- `XTASK_IMPORT_CONCURRENCY` - Concurrencia de imports (recomendado: 16)
- `SESSION_SECRET` - Secreto para sesiones
- `JWT_EXPIRATION` - Expiración de JWT tokens

## 📦 Instalación de Dependencias

Para instalar todas las nuevas versiones:

```bash
npm install
```

## ✅ Verificación de la Actualización

Ejecuta estos comandos para verificar que todo funciona correctamente:

```bash
# Verificar tipos
npm run typecheck

# Construir con manifest
npm run build

# Ejecutar tests
npm run test

# Iniciar en desarrollo
npm run dev
```

## 🔍 Nuevas Características Disponibles

### CQRS Mejorado
- Mejor separación de modelos de lectura/escritura
- Mapeo automático de datasources
- Mejor manejo de errores
- **Ver:** [NUEVOS_PACKAGES.md - CQRS](docs/NUEVOS_PACKAGES.md#xtaskjscqrs-mejorado)

### Event Sourcing
- Soporte mejorado para event stores
- Mejor replay de aggregates
- Snapshots automáticos cada N eventos
- Integración mejorada con proyecciones
- **Ver:** [NUEVOS_PACKAGES.md - Event-Source](docs/NUEVOS_PACKAGES.md#xtaskjsevent-source-mejorado)
- **Ejemplos:** [Sample 21](docs/EJEMPLOS_SAMPLES.md#21-event_source_rabbitmq_app) y [Sample 22](docs/EJEMPLOS_SAMPLES.md#22-event_source_cqrs_app)

### Socket.IO Integration ⭐ NUEVO
Acceso a comunicación en tiempo real con decoradores integrados:
```typescript
@SocketGateway({ namespace: "/chat" })
class ChatGateway {
  @OnSocketEvent("message")
  onMessage(payload: any) { }
}
```
- **Ver:** [NUEVOS_PACKAGES.md - Socket.IO](docs/NUEVOS_PACKAGES.md#xtaskjssocket-io)
- **Ejemplo:** [Sample 23](docs/EJEMPLOS_SAMPLES.md#23-socket_io_express_app)

### Throttling/Rate Limiting ⭐ NUEVO
Nueva capacidad de rate limiting para APIs:
```typescript
@Throttle(10, "30s")
@Get("/api/items")
listItems() { }
```
- **Ver:** [NUEVOS_PACKAGES.md - Throttler](docs/NUEVOS_PACKAGES.md#xtaskjsthrottler)
- **Ejemplo:** [Sample 24](docs/EJEMPLOS_SAMPLES.md#24-throttler_app)

### Scheduler ⭐ NUEVO
Programación de tareas mejorada con cron, intervalos y timeouts:
```typescript
@Service()
class ReportsScheduler {
  @Cron("0 */5 * * * *")
  async syncReports() { }

  @Every("10m")
  async compactCache() { }
}
```
- **Ver:** [NUEVOS_PACKAGES.md - Scheduler](docs/NUEVOS_PACKAGES.md#xtaskjsscheduler)
- **Ejemplo:** [Sample 11](docs/EJEMPLOS_SAMPLES.md#11-scheduler_app)

### Caching Mejorado
- Cache invalidation patterns mejorados
- Serialización automática de Date
- Cache warming strategies
- Metrics de hit/miss
- **Ver:** [NUEVOS_PACKAGES.md - Cache](docs/NUEVOS_PACKAGES.md#xtaskjscache-mejorado)
- **Ejemplos:** [Samples 12-15](docs/EJEMPLOS_SAMPLES.md#-caching)

### Queues Mejorado
- Dead-letter queue automático
- Competing consumers mejorado
- Message acknowledgement explícito
- Retry strategies (exponential, linear)
- **Ver:** [NUEVOS_PACKAGES.md - Queues](docs/NUEVOS_PACKAGES.md#xtaskjsqueues-mejorado)
- **Ejemplos:** [Samples 16-17](docs/EJEMPLOS_SAMPLES.md#-queues--messaging)

## 🐛 Cambios Importantes

1. **Pool Imports**: Los imports ahora se procesan con limite de concurrencia. Configura `XTASK_IMPORT_CONCURRENCY` según tu infraestructura.

2. **Manifest Caching**: El primer build genera un manifest para optimizar startups posteriores.

3. **TypeORM**: Actualizado a compatible con las nuevas versiones (0.3.28).

4. **Express**: Actualizado a v5.2.1 - asegúrate de revisar los breaking changes si tienes middlewares personalizados.

## 📚 Recursos

- [xtaskjs Repository](https://github.com/xtaskjs/xtask)
- [Documentación de Samples](https://github.com/xtaskjs/xtask/tree/main/samples)
- [Releases Notes](https://github.com/xtaskjs/xtask/releases)

## 🆘 Troubleshooting

### Problem: "prebuild:manifest not found"
**Solución**: Asegúrate de haber ejecutado `npm install` correctamente.

### Problem: Startup muy lento
**Solución**: Aumenta `XTASK_IMPORT_CONCURRENCY` a 16 o 24 (depende del tamaño de la app).

### Problem: Memory errors durante build
**Solución**: Reduce `XTASK_IMPORT_CONCURRENCY` a 10 o menos en ambientes con restricciones de memoria.

## 🎉 Próximos Pasos

1. ✅ Actualizar dependencias: `npm install`
2. ✅ Configurar `.env`: `cp .env.example .env && nano .env`
3. ✅ Build con manifest: `npm run build`
4. ✅ Ejecutar tests: `npm run test`
5. ✅ Iniciar aplicación: `npm start`

## 📖 Documentación Detallada

Lee la documentación completa para entender las nuevas características:

### 1. **Arquitectura de Mejoras**
[👉 ARQUITECTURA_MEJORAS.md](docs/ARQUITECTURA_MEJORAS.md)

Entiende cómo funcionan internamente:
- Cache Manifest System (40-60% startup más rápido)
- Pool Imports Async (concurrencia controlada)
- Lazy Resolution del DI (mejor rendimiento)
- Hot Manifest Watcher (dev experience mejorado)
- DI Instantiation Metrics (debugging)

### 2. **Nuevos Packages y Características**
[👉 NUEVOS_PACKAGES.md](docs/NUEVOS_PACKAGES.md)

Aprende a usar los nuevos packages:
- **@xtaskjs/throttler** - Rate limiting por IP, usuario, custom keys
- **@xtaskjs/socket-io** - Real-time communication con namespaces y rooms
- **@xtaskjs/scheduler** - Cron jobs, intervalos, timeout, groups
- Mejoras en queues, event-source, cache, CQRS

### 3. **24 Ejemplos Disponibles**
[👉 EJEMPLOS_SAMPLES.md](docs/EJEMPLOS_SAMPLES.md)

Ejecuta ejemplos para aprender:
- **Básicos:** new_app, express_app, fastify_app
- **Base de Datos:** typeorm_app
- **Seguridad:** security_app, security_express_app
- **Email:** email_express_app
- **i18n:** internationalization_app
- **Scheduling:** scheduler_app
- **Caching:** cache_app, cache_redis_app, http_cache_web_app
- **Queues:** queues_memory_app, queues_rabbitmq_app
- **Value Objects:** value_objects_app
- **Arquitecturas Avanzadas:** cqrs_app, event_source_app
- **Real-time:** socket_io_express_app
- **Rate Limiting:** throttler_app

**Guía Rápida por Caso de Uso:** [Ver en EJEMPLOS_SAMPLES.md](docs/EJEMPLOS_SAMPLES.md#-guía-rápida-por-caso-de-uso)

## 🔗 Referencias Externas

- [xTaskJS Repository](https://github.com/xtaskjs/xtask)
- [NPM Packages @xtaskjs](https://www.npmjs.com/search?q=%40xtaskjs)
- [Releases & Changelog](https://github.com/xtaskjs/xtask/releases)
- [GitHub Discussions](https://github.com/xtaskjs/xtask/discussions)

# Nuevos Packages - xTaskJS v1.0.28+

## 📚 Guía de Nuevos Packages

Esta documentación cubre los nuevos packages introducidos recientemente en xTaskJS:
- **@xtaskjs/throttler** - Rate limiting
- **@xtaskjs/socket-io** - Comunicación en tiempo real
- **@xtaskjs/scheduler** - Programación de tareas
- Mejoras en **@xtaskjs/queues**, **@xtaskjs/event-source**, **@xtaskjs/cache**, **@xtaskjs/cqrs**

---

## @xtaskjs/throttler

### ⚡ Descripción

Package para rate limiting con soporte para memoria y Redis, decoradores a nivel de método y clase, y estrategias de identificación de clientes customizables.

**Versión:** 1.0.2 (Agregado hace 1 semana)

### 🎯 Casos de Uso

- Proteger endpoints API contra abuso
- Limitar llamadas por IP, usuario, o key custom
- Diferentes límites para diferentes rutas
- Throttling global vs por-endpoint

### 📦 Instalación

```bash
npm install @xtaskjs/throttler
```

Ya incluído en el proyecto actualizado.

### 🚀 Uso Básico

#### 1. Configurar Throttler (Global)

```typescript
// src/shared/infrastructure/throttler/configure-throttler.ts

import { configureThrottler } from "@xtaskjs/throttler";

export function configureApplicationThrottler(): void {
  configureThrottler({
    // Límite global: 100 requests por minuto
    limit: 100,
    ttl: "1m",
    
    // Storage backend
    driver: "memory", // o "redis"
    
    // Opcional: Storage Redis
    redis: process.env.NODE_ENV === "production" ? {
      url: process.env.REDIS_URL
    } : undefined,
    
    // Identificar cliente (por defecto: IP)
    keyGenerator: ({ request }) => {
      // Usar IP desde X-Forwarded-For (proxies)
      return request?.headers?.["x-forwarded-for"] || 
             request?.ip || 
             "unknown";
    }
  });
}
```

#### 2. Aplicar en Decorador

```typescript
// src/documentation/infrastructure/http/documentation.controller.ts

import { Controller, Get } from "@xtaskjs/express-http";
import { Throttle } from "@xtaskjs/throttler";

@Controller("/docs")
class DocumentationController {
  // Máximo 10 requests cada 30 segundos
  @Throttle(10, "30s")
  @Get("/")
  async listDocumentation() {
    return { documentation: [] };
  }

  // Máximo 5 requests cada minuto (más restrictivo)
  @Throttle(5, "1m")
  @Get("/package/:packageName")
  async getPackageDocumentation(@Param("packageName") name: string) {
    return { packageName: name };
  }
}
```

#### 3. Registrar en Bootstrap

```typescript
// src/app/create-web-application.ts

import { configureApplicationThrottler } from "../shared/infrastructure/throttler/configure-throttler";

export async function createWebApplication(): Promise<XTaskHttpApplication> {
  configureApplicationThrottler();  // ← Llamar antes de CreateApplication
  
  // ... resto de configuración
}
```

### 🔧 Configuración Avanzada

#### Diferentes Límites por Rol

```typescript
import { Throttle } from "@xtaskjs/throttler";

@Controller("/api")
class ItemsController {
  @Throttle(1000, "1h")  // Admin: límite alto
  @Roles("admin")
  @Get("/admin/items")
  async adminList() { }

  @Throttle(50, "1h")    // Regular user: límite bajo
  @Authenticated()
  @Get("/items")
  async userList() { }

  @Throttle(5, "1h")     // Public: muy restrictivo
  @Get("/items/public")
  async publicList() { }
}
```

#### Key Generator Customizado

```typescript
configureThrottler({
  // Por usuario autenticado + endpoint
  keyGenerator: ({ request, context }) => {
    if (context.auth?.user) {
      return `user:${context.auth.user.id}`;
    }
    return `ip:${request.ip}`;
  }
});

// Por tenant (multi-tenant app)
configureThrottler({
  keyGenerator: ({ request, context }) => {
    const tenant = context.tenant?.id || "default";
    const identifier = context.auth?.user?.id || request.ip;
    return `tenant:${tenant}:${identifier}`;
  }
});

// Por API key
configureThrottler({
  keyGenerator: ({ request }) => {
    const apiKey = request.headers["x-api-key"];
    return `key:${apiKey}`;
  }
});
```

#### Respuesta Customizada

```typescript
// Middleware para personalizar respuesta 429 Too Many Requests

import { use } from "@xtaskjs/express-http";

@use((req, res, next) => {
  const original = res.status;
  res.status = function(statusCode) {
    if (statusCode === 429) {
      res.set({
        "Retry-After": req.headers["x-retry-after"] || "60",
        "X-RateLimit-Limit": req.headers["x-ratelimit-limit"],
        "X-RateLimit-Remaining": req.headers["x-ratelimit-remaining"],
        "X-RateLimit-Reset": req.headers["x-ratelimit-reset"]
      });
    }
    return original.call(this, statusCode);
  };
  next();
})
class RateLimitHeadersMiddleware {}
```

#### Redis Storage (Producción)

```typescript
configureThrottler({
  driver: "redis",
  redis: {
    url: process.env.REDIS_URL,
    // Opciones Redis
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    connectTimeoutMs: 5000
  },
  
  // Prefijo para keys Redis
  keyPrefix: "throttle:",
  
  // Habilitar clustering
  cluster: {
    enabled: true,
    nodes: process.env.REDIS_CLUSTER_NODES?.split(",")
  }
});
```

### 📊 Monitoreo

```typescript
import { getThrottlerMetrics } from "@xtaskjs/throttler";

// Después de request
const metrics = getThrottlerMetrics();
console.log({
  totalChecks: metrics.totalChecks,
  throttledRequests: metrics.throttledCount,
  throttleRate: (metrics.throttledCount / metrics.totalChecks * 100).toFixed(2) + "%",
  topThrottledKeys: metrics.topThrottledKeys.slice(0, 5)
});
```

### 🔗 Referencia

- [Sample: 24-throttler_app](https://github.com/xtaskjs/xtask/tree/main/samples/24-throttler_app)
- [Documentación Completa](https://github.com/xtaskjs/xtask/tree/main/packages/throttler#readme)

---

## @xtaskjs/socket-io

### 🔴 Descripción

Package para comunicación bidireccional en tiempo real usando Socket.IO, con soporte para namespaces, rooms, decoradores, e inyección de dependencias.

**Versión:** 1.0.3 (Agregado hace 1 mes)

### 🎯 Casos de Uso

- Chat en tiempo real
- Notificaciones en vivo
- Dashboards colaborativos
- Actualizaciones en vivo
- Multiplayer gaming

### 📦 Instalación

```bash
npm install @xtaskjs/socket-io
```

### 🚀 Uso Básico

#### 1. Crear Gateway

```typescript
// src/shared/infrastructure/socket-io/chat.gateway.ts

import { Service } from "@xtaskjs/core";
import {
  SocketGateway,
  OnSocketConnection,
  OnSocketDisconnect,
  OnSocketEvent,
  SubscribeMessage,
  InjectSocketService
} from "@xtaskjs/socket-io";

interface Message {
  user: string;
  text: string;
  timestamp: Date;
}

@Service()
@SocketGateway({
  namespace: "/chat",
  group: ["realtime", "chat"],
  cors: { origin: process.env.CORS_ORIGIN }
})
class ChatGateway {
  private messages: Message[] = [];

  @OnSocketConnection()
  onConnect(socket: any) {
    console.log(`✓ Cliente conectado: ${socket.id}`);
    socket.emit("connection.status", {
      message: "Conectado al servidor",
      clientCount: 0  // Obtener del servicio
    });
  }

  @OnSocketEvent("chat.message")
  @SubscribeMessage("chat.message")
  onMessage(payload: { user: string; text: string }, context: { socket: any }) {
    const message: Message = {
      user: payload.user,
      text: payload.text,
      timestamp: new Date()
    };
    this.messages.push(message);

    // Broadcast a todos en el namespace
    context.socket.emit("chat.message", message);
    
    return { ok: true, messageId: this.messages.length };
  }

  @OnSocketEvent("chat.history")
  async onHistoryRequest(payload: { limit?: number }, context: { socket: any }) {
    const limit = payload.limit || 50;
    return this.messages.slice(-limit);
  }

  @OnSocketDisconnect()
  onDisconnect(reason: string) {
    console.log(`✗ Cliente desconectado: ${reason}`);
  }
}
```

#### 2. Broadcasting Service

```typescript
// src/shared/infrastructure/socket-io/notifications.service.ts

import { Service } from "@xtaskjs/core";
import { InjectSocketService } from "@xtaskjs/socket-io";
import { SocketIoService } from "@xtaskjs/socket-io";

@Service()
class NotificationsService {
  constructor(
    @InjectSocketService() private readonly sockets: SocketIoService
  ) {}

  // Broadcast a todos en namespace
  broadcastSystemNotice(message: string) {
    this.sockets.emit(
      "system.notice",
      { message, timestamp: new Date() },
      { namespace: "/chat" }
    );
  }

  // Enviar a room específico
  notifyAdmins(notification: any) {
    this.sockets.emit(
      "admin.notification",
      notification,
      { namespace: "/chat", room: "admins" }
    );
  }

  // Enviar a usuario específico
  notifyUser(userId: string, notification: any) {
    this.sockets.emit(
      "user.notification",
      notification,
      { namespace: "/chat", room: `user:${userId}` }
    );
  }

  // Broadcast a todos excepto remitente
  broadcastExcept(eventName: string, data: any, socketId: string) {
    this.sockets.emit(eventName, data, {
      namespace: "/chat",
      excludeSocket: socketId
    });
  }
}
```

#### 3. Registrar en Bootstrap

```typescript
// src/app/create-web-application.ts

import { CreateApplication } from "@xtaskjs/core";
import { createWebApplication } from "./create-web-application";

export async function createWebApplication(): Promise<XTaskHttpApplication> {
  // ... configuración anterior

  return CreateApplication({
    adapter,
    autoListen: true,
    socketIo: {
      enabled: true,
      cors: {
        origin: process.env.CORS_ORIGIN?.split(","),
        methods: ["GET", "POST"]
      }
    }
  });
}
```

#### 4. Cliente Frontend

```html
<!-- public/chat.html -->

<div id="chat"></div>
<input type="text" id="message-input" placeholder="Mensaje..." />
<button id="send-btn">Enviar</button>

<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>

<script>
  const socket = io("http://localhost:3000/chat");

  socket.on("connection.status", (data) => {
    console.log("✓ " + data.message);
  });

  socket.on("chat.message", (message) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${message.user}:</strong> ${message.text}`;
    document.getElementById("chat").appendChild(div);
  });

  document.getElementById("send-btn").addEventListener("click", () => {
    const text = document.getElementById("message-input").value;
    socket.emit("chat.message", {
      user: "Anónimo",
      text: text
    }, (ack) => {
      console.log("Mensaje recibido:", ack);
    });
  });

  socket.on("system.notice", (notice) => {
    alert(`📢 ${notice.message}`);
  });
</script>
```

### 🏗️ Namespaces y Rooms

```typescript
// Múltiples namespaces

@SocketGateway({ namespace: "/chat", group: ["public"] })
class ChatGateway { }

@SocketGateway({ namespace: "/notifications", group: ["notifications"] })
class NotificationsGateway { }

@SocketGateway({ namespace: "/admin", group: ["admin"] })
class AdminGateway { }

// En cliente
const chatSocket = io("/chat");
const notifSocket = io("/notifications");
const adminSocket = io("/admin");
```

### 🔧 Rooms Avanzados

```typescript
@Service()
@SocketGateway({ namespace: "/rooms" })
class RoomsGateway {
  @OnSocketConnection()
  onConnect(socket: any) {
    // Unirse a room basado en query parameter
    const roomId = socket.handshake.query.roomId;
    socket.join(`room:${roomId}`);
    socket.emit("room.joined", { roomId });
  }

  @OnSocketEvent("room.broadcast")
  onRoomBroadcast(
    payload: { roomId: string; message: string },
    context: { socket: any }
  ) {
    // Broadcast solo a room específico
    context.socket.to(`room:${payload.roomId}`)
      .emit("room.message", payload.message);
  }

  @OnSocketDisconnect()
  onDisconnect(socket: any) {
    // Automáticamente se limpia de todos los rooms
  }
}
```

### 📊 Inyección de Dependencias

```typescript
@Service()
@SocketGateway({ namespace: "/events" })
class EventsGateway {
  constructor(
    @InjectSocketService() private sockets: SocketIoService,
    @InjectSocketServer() private server: any,
    @InjectSocketNamespace("/events") private namespace: any,
    @InjectSocketLifecycleManager() private lifecycle: any,
    private eventsService: EventsService,
    private logger: LoggerService
  ) {}

  @OnSocketConnection()
  async onConnect(socket: any) {
    const clientCount = this.server.engine.clientsCount;
    this.logger.info(`Connected: ${socket.id} (${clientCount} total)`);
  }
}
```

### 🔗 Referencia

- [Sample: 23-socket_io_express_app](https://github.com/xtaskjs/xtask/tree/main/samples/23-socket_io_express_app)
- [Socket.IO Documentation](https://socket.io/docs/)

---

## @xtaskjs/scheduler

### ⏰ Descripción

Package para programación de tareas con cron, intervalos, timeouts, retries, y ejecución en boot.

**Versión:** 1.0.9

### 🎯 Casos de Uso

- Tareas cron (nightly reports, limpiezas)
- Polling periódico
- Health checks
- Sincronización de datos
- Tareas de mantenimiento

### 📦 Instalación

```bash
npm install @xtaskjs/scheduler
```

### 🚀 Uso Básico

#### 1. Crear Scheduled Tasks

```typescript
// src/documentation/infrastructure/scheduler/documentation.scheduler.ts

import { Service } from "@xtaskjs/core";
import { Cron, Every, Timeout } from "@xtaskjs/scheduler";

@Service()
class DocumentationScheduler {
  constructor(
    private readonly docService: DocumentationService,
    private readonly logger: LoggerService
  ) {}

  // Ejecutar cada 5 minutos
  @Every("5m", {
    name: "docs.sync",
    group: ["documentation"],
    disabled: false,
    onError: "handleSyncError"
  })
  async syncDocumentation() {
    this.logger.info("📚 Sincronizando documentación...");
    const result = await this.docService.syncPackageApis();
    this.logger.info(`✓ Sincronización completada: ${result.count} cambios`);
  }

  // Ejecutar cada noche a las 2 AM UTC
  @Cron("0 0 2 * * *", {
    name: "docs.cleanup",
    group: ["documentation", "nightly"],
    timeZone: "UTC"
  })
  async cleanupOldDocs() {
    this.logger.info("🧹 Limpiando documentación antigua...");
    const deleted = await this.docService.deleteOldDocs(30);
    this.logger.info(`✓ ${deleted} documentos eliminados`);
  }

  // Ejecutar una vez al iniciar (útil para warmup)
  @Timeout("30s", {
    name: "docs.warmup",
    runOnBoot: true
  })
  async warmupCache() {
    this.logger.info("🔥 Pre-calentando cache de docs...");
    await this.docService.preloadPopularDocs();
    this.logger.info("✓ Cache pre-calentado");
  }

  // Con reintentos
  @Every("15m", {
    name: "docs.validate",
    group: ["documentation"],
    maxRetries: 3,
    retryDelay: "5s",
    onRetry: "handleRetry"
  })
  async validateDocumentation() {
    await this.docService.validateAllDocs();
  }

  private handleSyncError(error: Error) {
    this.logger.error("❌ Error sincronizando docs:", error);
  }

  private handleRetry(attempt: number, error: Error) {
    this.logger.warn(`⚠️ Reintentando validación (${attempt}/3)`, error);
  }
}
```

#### 2. Configuración Avanzada

```typescript
@Service()
class ReportsScheduler {
  @Cron("0 */6 * * * *", {  // Cada 6 horas
    name: "reports.generate",
    group: ["reports", "batch"],
    disabled: process.env.SKIP_REPORTS === "true",
    allowOverlap: false,      // No ejecutar si ya está corriendo
    timeout: "30m",           // Máximo 30 minutos
    maxRetries: 2,
    retryDelay: "10m",
    onError: "handleReportError"
  })
  async generateReports() {
    // Solo una instancia a la vez
  }

  @Every("1h", {
    name: "data.compact",
    group: ["maintenance"],
    runOnBoot: false,         // No ejecutar en startup
    runOnce: true             // Ejecutar una sola vez toda la sesión
  })
  async compactDatabase() {
    // Solo compactar una vez
  }
}
```

#### 3. Scheduler Service - Control Programático

```typescript
// src/shared/infrastructure/scheduler/scheduler-control.service.ts

import { Service } from "@xtaskjs/core";
import { SchedulerService } from "@xtaskjs/scheduler";

@Service()
class SchedulerControlService {
  constructor(private scheduler: SchedulerService) {}

  // Listar todas las tareas
  listAllTasks() {
    return this.scheduler.listJobs();
  }

  // Listar tareas por grupo
  listTasksByGroup(group: string) {
    return this.scheduler.listJobs(group);
  }

  // Iniciar grupo de tareas
  async startReportingTasks() {
    await this.scheduler.startGroup("reports");
  }

  // Parar grupo
  async stopReportingTasks() {
    await this.scheduler.stopGroup("reports");
  }

  // Ejecutar tarea inmediatamente
  async forceSync() {
    await this.scheduler.runJob("docs.sync");
  }

  // Ejecutar todas las tareas de un grupo
  async forceAllReports() {
    await this.scheduler.runGroup("reports");
  }

  // Deshabilitar tarea
  async disableTask(jobName: string) {
    await this.scheduler.disableJob(jobName);
  }
}
```

#### 4. Endpoint para Control

```typescript
// src/documentation/infrastructure/http/scheduler.controller.ts

import { Controller, Get, Post, Param } from "@xtaskjs/express-http";
import { SchedulerControlService } from "../scheduler/scheduler-control.service";

@Controller("/admin/scheduler")
@Roles("admin")
class SchedulerController {
  constructor(
    private readonly scheduler: SchedulerControlService
  ) {}

  @Get("/tasks")
  listTasks() {
    return this.scheduler.listAllTasks();
  }

  @Get("/tasks/:group")
  listByGroup(@Param("group") group: string) {
    return this.scheduler.listTasksByGroup(group);
  }

  @Post("/tasks/:jobName/run")
  async runTask(@Param("jobName") jobName: string) {
    await this.scheduler.scheduler.runJob(jobName);
    return { ok: true, message: `Task ${jobName} executed` };
  }

  @Post("/groups/:group/run")
  async runGroup(@Param("group") group: string) {
    await this.scheduler.scheduler.runGroup(group);
    return { ok: true, message: `Group ${group} executed` };
  }
}
```

### 📊 Formatos de Tiempo

```typescript
// All-time formats

@Cron("0 0 * * * *")                // Cada minuto
@Cron("0 0 12 * * *")               // Cada día al mediodía
@Cron("0 0 0 * * 0")                // Cada domingo a las 12 AM
@Every("500ms")                     // Cada 500 milisegundos
@Every("30s")                       // Cada 30 segundos
@Every("5m")                        // Cada 5 minutos
@Every("1h")                        // Cada hora
@Every("1d")                        // Cada día
@Timeout("100ms")                   // Esperar 100ms, luego ejecutar una vez
```

### 🔗 Referencia

- [Sample: 11-scheduler_app](https://github.com/xtaskjs/xtask/tree/main/samples/11-scheduler_app)
- [node-cron documentation](https://github.com/kelektiv/node-cron)

---

## @xtaskjs/queues (Mejorado)

### 📨 Descripción

Actualización mayor de queue handling con soporte mejorado para RabbitMQ, MQTT, dead-letter routing, y competing consumers.

**Versión:** 1.0.7

### 🎯 Características Nuevas

- Pool imports async (mejora startup)
- Mejor manejo de errores de reconexión
- Dead-letter queue automático
- Competing consumers mejorado
- Message acknowledgement explícito

### 🚀 Ejemplo Mejorado

```typescript
@Service()
class BillingConsumers {
  @QueueHandler("billing.invoice.created", {
    name: "billing.invoice.created.handler",
    group: ["billing"],
    maxRetries: 3,
    retryDelay: "5s",
    retryStrategy: "exponential",        // ← NUEVO
    deadLetterQueue: "billing.dlq",      // ← NUEVO
    deadLetterExchange: "billing.dlx",   // ← NUEVO
    consumerPolicy: "competing",
    consumerGroup: "billing-workers"
  })
  async onInvoiceCreated(
    payload: { invoiceId: string },
    context: { 
      attempt: number;                   // ← NUEVO
      redelivered: boolean;              // ← NUEVO
      deliveryCount: number;             // ← NUEVO
    }
  ) {
    if (context.attempt === 1) {
      // Primera vez
    } else if (context.attempt > 1 && context.attempt <= 3) {
      // Reintentando
    }
  }
}
```

### 🔗 Referencia

- [Sample: 16-queues_memory_app](https://github.com/xtaskjs/xtask/tree/main/samples/16-queues_memory_app)
- [Sample: 17-queues_rabbitmq_app](https://github.com/xtaskjs/xtask/tree/main/samples/17-queues_rabbitmq_app)

---

## @xtaskjs/event-source (Mejorado)

### 🎯 Mejoras v1.0.4

- Mejor replayabilidad de eventos
- Snapshots de agregates para grandes streams
- Event versioning mejorado
- Mejor integración con CQRS

### 💡 Ejemplo Mejorado

```typescript
@EventSourcedAggregate({
  stream: "users",
  snapshotThreshold: 100,    // ← NUEVO: Snapshot cada 100 eventos
  versionCompatibility: true  // ← NUEVO: Manejo de versiones
})
class UserAggregate extends EventSourcedAggregateRoot {
  // ... implementación
}

// Repository con snapshot support
class UserRepository extends EventSourceRepository<UserAggregate> {
  async getById(id: string) {
    // Carga snapshot si existe, luego replays eventos posteriores
    return this.aggregateFactory.reconstitute(id);
  }
}
```

### 🔗 Referencia

- [Sample: 21-event_source_rabbitmq_app](https://github.com/xtaskjs/xtask/tree/main/samples/21-event_source_rabbitmq_app)
- [Sample: 22-event_source_cqrs_app](https://github.com/xtaskjs/xtask/tree/main/samples/22-event_source_cqrs_app)

---

## @xtaskjs/cache (Mejorado)

### 🎯 Mejoras v1.0.7

- Cache invalidation patterns mejorados
- Serialización automática de Date
- Cache warming strategies
- Metrics de hit/miss

### 💡 Ejemplo

```typescript
@CacheModel({
  name: "products",
  ttl: "1h",
  serialize: {          // ← NUEVO
    transformers: [DateTransformer]
  },
  warming: {            // ← NUEVO
    enabled: true,
    strategy: "on-boot"
  }
})
export class ProductCacheModel {}

@Service()
class ProductService {
  @Cacheable({ 
    model: ProductCacheModel,
    key: (id: string) => id,
    metrics: true       // ← NUEVO
  })
  async getProduct(id: string) { }
}

// Acceder métricas
const metrics = this.cacheService.getMetrics();
console.log({
  hits: metrics.hits,
  misses: metrics.misses,
  hitRate: (metrics.hits / (metrics.hits + metrics.misses) * 100).toFixed(2) + "%"
});
```

### 🔗 Referencia

- [Sample: 12-cache_app](https://github.com/xtaskjs/xtask/tree/main/samples/12-cache_app)
- [Sample: 13-cache_redis_app](https://github.com/xtaskjs/xtask/tree/main/samples/13-cache_redis_app)

---

## @xtaskjs/cqrs (Mejorado)

### 🎯 Mejoras v1.1.5

- Idempotency key handling automático
- Better event store integration
- Saga pattern support
- Command correlation IDs

### 💡 Ejemplo

```typescript
@Service()
@IdempotentCommand<CreateUserCommand>({
  key: (cmd) => cmd.email.toLowerCase(),  // Idempotency key
  ttl: "24h"
})
@CommandHandler(CreateUserCommand)
class CreateUserHandler implements ICommandHandler<CreateUserCommand, number> {
  async execute(command: CreateUserCommand, context: any): Promise<number> {
    // Si se ejecuta 2 veces con mismo email, retorna el mismo resultado
    const user = await this.userRepo.save({
      name: command.name,
      email: command.email
    });
    return user.id;
  }
}
```

### 🔗 Referencia

- [Sample: 19-cqrs_app](https://github.com/xtaskjs/xtask/tree/main/samples/19-cqrs_app)
- [Sample: 20-cqrs_postgres_replication_app](https://github.com/xtaskjs/xtask/tree/main/samples/20-cqrs_postgres_replication_app)

---

## 📊 Comparación de Packages

| Feature | Throttler | Socket.IO | Scheduler | Queues | Event-Source | Cache | CQRS |
|---------|-----------|-----------|-----------|--------|--------------|-------|------|
| Rate Limiting | ✅ | - | - | - | - | - | - |
| Real-time | - | ✅ | - | - | - | - | - |
| Task Scheduling | - | - | ✅ | - | - | - | - |
| Async Messaging | - | - | - | ✅ | - | - | - |
| Event Sourcing | - | - | - | - | ✅ | - | - |
| Caching | - | - | - | - | - | ✅ | - |
| CQRS Pattern | - | - | - | - | - | - | ✅ |
| DI Integrated | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 Migración desde Versiones Anteriores

### De 1.0.0 a 1.0.7 (Throttler)
```typescript
// Antes
// Throttler no existía

// Después
import { configureThrottler, Throttle } from "@xtaskjs/throttler";
configureThrottler({ limit: 100, ttl: "1m" });

@Throttle(10, "30s")
@Get("/api/items")
listItems() { }
```

### De 1.0.0 a 1.0.3 (Socket.IO)
```typescript
// Antes
// Socket.IO no era soportado

// Después
@SocketGateway({ namespace: "/chat" })
class ChatGateway {
  @OnSocketEvent("message")
  onMessage(payload: any) { }
}
```

---

## 🔗 Enlaces Útiles

- [xTaskJS Repository](https://github.com/xtaskjs/xtask)
- [Todos los Samples](https://github.com/xtaskjs/xtask/tree/main/samples)
- [Releases/Changelog](https://github.com/xtaskjs/xtask/releases)
- [NPM Package Scope](https://www.npmjs.com/search?q=%40xtaskjs)

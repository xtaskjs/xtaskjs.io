# HTTPS con certificados automáticos (Let's Encrypt)

La web usa **Caddy** como proxy inverso delante de la app. Caddy pide, instala y renueva
solo los certificados TLS de `SITE_DOMAIN` y `SITE_ALIAS`. La app sigue sirviendo HTTP en el
puerto 3000 dentro de la red de Docker y no necesita certificados propios.

## Requisitos

- Registros DNS `A`/`AAAA` de `xtaskjs.io` y `www.xtaskjs.io` apuntando al servidor.
- Puertos **80 y 443** (tcp, y 443/udp para HTTP/3) abiertos hacia el servidor.
- Nada más escuchando en los puertos 80/443 del host.

## Configuración (`.env`)

```env
SITE_DOMAIN=xtaskjs.io            # dominio canónico
SITE_ALIAS=www.xtaskjs.io         # redirige (301) al canónico
ACME_EMAIL=ops@xtaskjs.io         # avisos de caducidad de Let's Encrypt
PUBLIC_URL=https://xtaskjs.io     # debe coincidir con SITE_DOMAIN
SSL_ENABLED=false                 # TLS lo termina Caddy, no la app
APP_PORT_MAPPING=127.0.0.1:3000:3000   # Caddy ocupa 80/443; la app queda solo en local
```

Si prefieres `www` como dominio canónico, intercambia `SITE_DOMAIN` y `SITE_ALIAS` y ajusta `PUBLIC_URL`.

## Arranque

```bash
docker compose --profile https up -d --build
# o: pnpm docker:up:https
```

Sin el perfil `https` el comportamiento es el de siempre (app en HTTP, puerto `APP_PORT_MAPPING`).

## Probar antes sin gastar cuota de Let's Encrypt

Let's Encrypt limita los intentos fallidos. Para una primera prueba usa el entorno de staging
(el navegador mostrará el certificado como no fiable, es lo esperado):

```env
ACME_CA=https://acme-staging-v02.api.letsencrypt.org/directory
```

Cuando funcione, vuelve a la CA de producción, borra el certificado de staging con
`docker compose --profile https down && docker volume rm <proyecto>_caddy_data` y arranca de nuevo.

## Operación

- **Renovación:** automática (Caddy renueva unos 30 días antes de caducar). No hay cron que mantener.
- **Persistencia:** los certificados y la cuenta ACME viven en el volumen `caddy_data`. No lo borres en
  producción: reemitir muchas veces seguidas puede topar con los límites de Let's Encrypt.
- **Logs:** `docker compose logs -f caddy`.
- **Migración desde certificados manuales:** ya no hace falta montar `SSL_CERTS_DIR` ni definir
  `SSL_KEY_PATH`/`SSL_CERT_PATH` en este modo.
- **HSTS:** el `Caddyfile` envía `Strict-Transport-Security` con 1 año. Si necesitas volver a HTTP, los
  navegadores que ya hayan visitado la web seguirán forzando HTTPS hasta que caduque.

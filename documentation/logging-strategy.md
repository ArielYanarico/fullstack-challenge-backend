# Logging Strategy

For this challenge I replaced the default NestJS logger with **Pino** (`nestjs-pino`, `pino-http`) in order to have structured logs, better performance and automatic file rotation.

## Setup and Integration

* **Buffered Startup Logs** - In `src/main.ts`, the app is initializated with `{ bufferLogs: true }` and `app.useLogger(app.get(Logger))` so all NestJS internal boot logs are also captured by Pino.
* **Global Logger Module** - Configured in `src/app-logger/app-logger.module.ts` using `LoggerModule.forRootAsync()` injecting `ConfigService` to read `NODE_ENV` and `LOGGING_LEVEL`.

## Transports (Console & File Rotation)

Pino is configured with two transport targets running at the same time:

* **pino-pretty** - Prints single-line logs in console. Colorize is enabled only when `NODE_ENV === 'development'`.
* **pino-roll** - Saves logs into `./logs/local.log` (in development) or `./logs/prod.log` (in production) with the following rules:
  * **mkdir**: `true` (automatically creates the `./logs` folder if it does not exist)
  * **size**: `20m` max size per log file
  * **interval**: `1d` daily rotation
  * **keep**: `10` old log files kept before deleting older ones

## Log Levels Usage

The minimum log level is controlled by `LOGGING_LEVEL` env variable (`info` by default):

* **log / info** - Used for high-level milestones (e.g. server startup, total makes fetched/upserted, total jobs queued, and stale records cleaned).
* **debug** - Used for high-volume per-item operations (such as fetching and parsing vehicle types for each of the ~12,385 makes) to avoid flooding console and disk in production.
* **warn** - Used for non-critical issues like skipping an already active ingestion run, empty makes list, or a `400 Bad Request` on a single `makeId`.
* **error** - Used when the external API is unavailable, xml parsing fails, or an unexpected ingestion error happens.

## Custom HTTP Serializers

To keep HTTP request logs clean and avoid dumping unnecessary headers or large payloads, custom serializers only log what is needed:

* **req** - Logs `method`, `url`, and `requestId`.
* **res** - Logs `statusCode`.

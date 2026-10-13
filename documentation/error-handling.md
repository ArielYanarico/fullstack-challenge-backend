# Error Handling Strategy

This document describes how errors are handled across configuration, XML ingestion, queue workers, and logging.

## Custom Exceptions

Since the ingester runs in background tasks and queues rather than HTTP controllers, custom exceptions inherit from standard JavaScript `Error` instead of NestJS `HttpException`, and log automatically when instantiated:

* **VehicleMakeBadRequestException** - Thrown when the external API returns `400 Bad Request` for a specific `makeId`. Logs a `warn` message.
* **VehicleApiUnavailableException** - Thrown when the external API is down, times out, or returns an unexpected status error. Logs an `error` with the `makeId` and original error message.
* **XmlParsingException** - Thrown when the xml payload does not match the expected structure or has missing nodes (`AllVehicleMakes` / `VehicleTypesForMakeIds`). Logs an `error`.

## Graceful Fallbacks & Data Protection

* **XML Parser Fallback** - When `VehicleParserService` catches an `XmlParsingException`, it logs the error and returns an empty array `[]` so a single malformed XML response does not crash the worker or ingestion process.
* **Preventing Data Loss** - If `parseMakes()` returns `0` records (e.g., external API returned an empty or broken Xml), `VehicleIngesterService` logs a warning (`No makes to store, keeping previous data`) and stops the run early so existing MongoDB data is not overwritten or deleted.
* **Safe Lock Release** - `ingestAll()` wraps the execution in a try, catch and finally block, ensuring `isIngesting` is always reset to `false` even if an unexpected error happens.

## Queue Fault Isolation & Retries

* **Isolated Jobs** - Each `makeId` is queued as a separate BullMQ job in `vehicle-types`. If fetching vehicle types fails for one make, it does not affect the remaining ~12,385 makes.
* **Automatic Retries** - When `VehicleTypesProcessor` throws an error (such as `VehicleApiUnavailableException`), BullMQ catches it and retries the job up to `INGESTION_MAX_ATTEMPTS` (default `3`) times using exponential backoff (`1000ms` base delay).

## Logging Integration

* All exceptions and application logs are handled by `nestjs-pino`:
  * **Console output** - Formatted with `pino-pretty` for readability.
  * **File rotation** - Saved into `./logs/local.log` (development) or `./logs/prod.log` (production) using `pino-roll` (max `20m` per file, rotated daily, keeping up to `10` files).

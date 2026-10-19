# API Gateway

Routes public traffic to **IMS-BE** with a **token-bucket rate limiter** and **circuit breaker**.

## Proxied paths

| Gateway | Upstream (IMS-BE) |
|---------|-------------------|
| `GET/POST … /api/v1/*` | Same path on `IMS_BE_URL` |
| `GET /api-docs` | Swagger UI |
| `GET /api-docs/openapi.json` | OpenAPI spec |

Gateway-only:

- `GET /healthz` — gateway liveness
- `GET /readyz` — gateway readiness (503 when IMS circuit is open)
- `GET /gateway/status` — circuit state and rate-limit settings

## Run

```bash
cd SarwaAmrit/Backend/gateway
npm install
cp .env.example .env
# Start IMS-BE first (default http://127.0.0.1:5001)
npm run dev
```

Clients (e.g. IMS-FE) should call the gateway (`http://localhost:8080`) instead of IMS-BE directly.

## Resilience

- **Token bucket:** per client IP (`trust proxy` enabled). Default 60 burst, refill 10 tokens/s. **429** when empty.
- **Circuit breaker:** opens after 5 consecutive upstream **5xx** or proxy errors; **503** while open; half-open after 30s.

Tune via `.env` (`RATE_LIMIT_*`, `CIRCUIT_BREAKER_*`).

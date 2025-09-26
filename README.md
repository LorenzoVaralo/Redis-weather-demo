# Redis Weather Cache

TypeScript Express.js application with Redis caching for OpenMeteo weather API data.

## Features

- OpenMeteo weather API integration
- Redis caching layer with configurable TTL
- Dockerized deployment with optimized Redis startup
- Fault tolerance (continues without Redis)

## Quick Start

```bash
docker-compose up --build -d
curl "http://localhost:3000/weather/current/40.7128/-74.0060"
```

## API Endpoints

| Endpoint | Description | Cache TTL |
|----------|-------------|-----------|
| `GET /weather/current/:lat/:lon` | Current weather by coordinates | 10m |
| `GET /health` | Application health check | - |

## Configuration

- `PORT`: Server port (default: 3000)
- `REDIS_URL`: Redis connection string (default: redis://localhost:6379)

## Development

```bash
# Start Redis container first
docker-compose up redis -d

# Then run the app locally
npm install
npm run dev        # Development mode
npm run build      # Production build
```

## Architecture

- Express.js API server with TypeScript
- Redis caching with graceful degradation
- OpenMeteo API integration (no API key required)
- Docker containers with health checks

Redis failures are handled gracefully - the application continues serving weather data directly from the API.
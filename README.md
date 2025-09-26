# Redis Demo Project

A simple TypeScript project demonstrating Redis integration with Express.js, fully containerized with Docker.

## Features

- TypeScript Express.js application
- Redis integration for caching and data storage
- Docker containers for both the application and Redis
- Health checks and graceful shutdowns
- RESTful API endpoints for Redis operations

## Project Structure

```
redisDemo/
├── src/
│   └── index.ts          # Main application file
├── dist/                 # Compiled JavaScript files
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile           # Application Docker image
├── package.json         # Node.js dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

## Quick Start with Docker

1. **Clone and navigate to the project:**
   ```bash
   cd redisDemo
   ```

2. **Start the application with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build the TypeScript application
   - Start a Redis container
   - Start the application container
   - Make the API available at http://localhost:3000

3. **Test the API:**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Set a value
   curl -X POST http://localhost:3000/set/mykey \
     -H "Content-Type: application/json" \
     -d '{"value":"Hello Redis!"}'
   
   # Get a value
   curl http://localhost:3000/get/mykey
   
   # List all keys
   curl http://localhost:3000/keys
   ```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Redis locally (optional - if you want to run Redis outside Docker):**
   ```bash
   docker run -d -p 6379:6379 redis:7-alpine
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /` - API status and Redis connection status
- `GET /health` - Health check endpoint
- `POST /set/:key` - Set a key-value pair
  - Body: `{"value": "your-value"}`
- `GET /get/:key` - Get value by key
- `DELETE /delete/:key` - Delete a key
- `GET /keys` - List all keys

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the compiled application
- `npm run dev` - Start in development mode with ts-node
- `npm test` - Run tests (when implemented)
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run with Docker Compose

## Docker Commands

```bash
# Start services
docker-compose up

# Start services in background
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop services
docker-compose down

# Stop services and remove volumes
docker-compose down -v

# View logs
docker-compose logs app
docker-compose logs redis
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `REDIS_URL` - Redis connection URL (default: redis://localhost:6379)
- `NODE_ENV` - Node environment (development/production)

## Docker Configuration

### Application Container
- Based on Node.js 18 Alpine
- Exposes port 3000
- Includes health checks
- Auto-restarts on failure

### Redis Container
- Uses Redis 7 Alpine
- Persistent data storage
- Health checks with redis-cli ping
- Exposes port 6379

## Stopping the Application

```bash
# Stop Docker Compose services
docker-compose down

# Or use Ctrl+C if running in foreground
```

## Troubleshooting

1. **Port conflicts:** If port 3000 or 6379 are in use, modify the ports in `docker-compose.yml`
2. **Permission issues:** Ensure Docker has proper permissions
3. **Connection errors:** Check that Redis container is healthy using `docker-compose logs redis`

## Next Steps

- Add authentication
- Implement data models
- Add comprehensive tests
- Set up CI/CD pipeline
- Add monitoring and logging
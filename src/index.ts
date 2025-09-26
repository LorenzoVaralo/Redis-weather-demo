import express from 'express';
import { createClient } from 'redis';
import { weatherService } from './weatherService';

const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const CACHE_TTL = 600; // Cache for 10 minutes (600 seconds)

// Middleware
app.use(express.json());

// Redis client setup
const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully!');
});

// Initialize Redis connection
async function initializeRedis() {
  try {
    await redisClient.connect();
    console.log('Redis client connected');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
}

// Weather endpoints
// Get current weather by coordinates
app.get('/weather/current/:lat/:lon', async (req, res) => {
  try {
    const startTime = Date.now();
    const { lat, lon } = req.params;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    // Check if weather data is cached
    const cacheKey = `weather:current:${lat}:${lon}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(10);
    console.log(`Cache hit - response time: ${responseTime}s`);

      return res.json({ 
        ...JSON.parse(cached), 
        source: 'cache' 
      });
    }

    // Fetch fresh data from weather service
    const weatherData = await weatherService.getCurrentWeather(latitude, longitude, 'America/Sao_Paulo');
    
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(weatherData));

    const responseTime = ((Date.now() - startTime) / 1000).toFixed(10);
    console.log(`Cache Miss - response time: ${responseTime}s`);

    res.json({ 
      ...weatherData, 
      source: 'api' 
    });
  } catch (error) {
    console.error('Error getting current weather:', error);
    res.status(500).json({ error: 'Failed to fetch current weather' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await redisClient.ping();
    res.json({ 
      status: 'healthy',
      redis: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      redis: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await redisClient.quit();
  process.exit(0);
});

// Start server
async function startServer() {
  await initializeRedis();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Redis URL: ${REDIS_URL}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
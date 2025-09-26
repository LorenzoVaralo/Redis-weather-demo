import express from 'express';
import { createClient } from 'redis';

const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

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

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Redis Demo API is running!',
    redis_connected: redisClient.isOpen
  });
});

// Set a key-value pair in Redis
app.post('/set/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ error: 'Value is required in request body' });
    }

    await redisClient.set(key, JSON.stringify(value));
    res.json({ 
      success: true, 
      message: `Key '${key}' set successfully`,
      key,
      value
    });
  } catch (error) {
    console.error('Error setting key:', error);
    res.status(500).json({ error: 'Failed to set key in Redis' });
  }
});

// Get a value from Redis by key
app.get('/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await redisClient.get(key);
    
    if (value === null) {
      return res.status(404).json({ error: `Key '${key}' not found` });
    }

    res.json({ 
      key,
      value: JSON.parse(value)
    });
  } catch (error) {
    console.error('Error getting key:', error);
    res.status(500).json({ error: 'Failed to get key from Redis' });
  }
});

// Delete a key from Redis
app.delete('/delete/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await redisClient.del(key);
    
    if (result === 0) {
      return res.status(404).json({ error: `Key '${key}' not found` });
    }

    res.json({ 
      success: true, 
      message: `Key '${key}' deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting key:', error);
    res.status(500).json({ error: 'Failed to delete key from Redis' });
  }
});

// Get all keys
app.get('/keys', async (req, res) => {
  try {
    const keys = await redisClient.keys('*');
    res.json({ keys });
  } catch (error) {
    console.error('Error getting keys:', error);
    res.status(500).json({ error: 'Failed to get keys from Redis' });
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
const redis = require('redis');

module.exports = redis.createClient(process.env.REDIS_URL | 'redis://localhost:6379/1');

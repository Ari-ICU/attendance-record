const redis = require('redis');

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Redis connection configuration
const redisConfig = {
    // Connection options
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,

    // Connection settings
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,

    // Timeout settings
    connectTimeout: 10000,
    commandTimeout: 5000,

    // SSL settings for production
    tls: isProduction ? {} : undefined,

    // Retry settings
    retryDelayOnClusterDown: 300,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,

    // Connection pool settings
    family: 4, // IPv4
    keepAlive: true,
    keepAliveInitialDelay: 0
};

// Redis client instance
let redisClient = null;
let isConnected = false;
let connectionAttempts = 0;
const maxConnectionAttempts = 5;

// Connection event handlers
const connectionHandlers = {
    connect: () => {
        console.log('✅ Redis connected successfully');
        isConnected = true;
        connectionAttempts = 0;
    },

    ready: () => {
        console.log('🚀 Redis client ready');
    },

    error: (error) => {
        console.error('❌ Redis connection error:', error.message);
        isConnected = false;
        connectionAttempts++;

        if (connectionAttempts >= maxConnectionAttempts) {
            console.error('🚨 Maximum Redis connection attempts reached. Please check your Redis configuration.');
        }
    },

    end: () => {
        console.log('⚠️ Redis connection ended');
        isConnected = false;
    },

    reconnecting: () => {
        console.log('🔄 Redis reconnecting...');
    }
};

// Create Redis client
const createRedisClient = () => {
    try {
        const client = redis.createClient({
            socket: {
                host: redisConfig.host,
                port: redisConfig.port,
                connectTimeout: redisConfig.connectTimeout,
                commandTimeout: redisConfig.commandTimeout,
                keepAlive: redisConfig.keepAlive,
                keepAliveInitialDelay: redisConfig.keepAliveInitialDelay,
                family: redisConfig.family
            },
            password: redisConfig.password,
            database: redisConfig.db,
            retryDelayOnFailover: redisConfig.retryDelayOnFailover,
            enableReadyCheck: redisConfig.enableReadyCheck,
            maxRetriesPerRequest: redisConfig.maxRetriesPerRequest,
            lazyConnect: redisConfig.lazyConnect
        });

        // Set up event listeners
        client.on('connect', connectionHandlers.connect);
        client.on('ready', connectionHandlers.ready);
        client.on('error', connectionHandlers.error);
        client.on('end', connectionHandlers.end);
        client.on('reconnecting', connectionHandlers.reconnecting);

        return client;
    } catch (error) {
        console.error('❌ Failed to create Redis client:', error.message);
        throw error;
    }
};

// Connect to Redis
const connectToRedis = async () => {
    try {
        if (!redisClient) {
            redisClient = createRedisClient();
        }

        if (!redisClient.isOpen) {
            console.log('🔄 Connecting to Redis...');
            await redisClient.connect();
        }

        return redisClient;
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error.message);
        throw error;
    }
};

// Disconnect from Redis
const disconnectFromRedis = async () => {
    try {
        if (redisClient && redisClient.isOpen) {
            console.log('🔄 Disconnecting from Redis...');
            await redisClient.quit();
            console.log('✅ Redis disconnected gracefully');
        }
    } catch (error) {
        console.error('❌ Error disconnecting from Redis:', error.message);
        throw error;
    }
};

// Health check function
const checkRedisHealth = () => {
    return {
        isConnected: isConnected && redisClient && redisClient.isOpen,
        host: redisConfig.host,
        port: redisConfig.port,
        db: redisConfig.db,
        readyState: redisClient ? (redisClient.isOpen ? 'open' : 'closed') : 'not_initialized'
    };
};

// Redis utility functions
const redisUtils = {
    // Basic operations
    set: async (key, value, expireInSeconds = null) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

            if (expireInSeconds) {
                await redisClient.setEx(key, expireInSeconds, stringValue);
            } else {
                await redisClient.set(key, stringValue);
            }

            return true;
        } catch (error) {
            console.error('Redis SET error:', error.message);
            return false;
        }
    },

    get: async (key) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const value = await redisClient.get(key);
            if (value === null) return null;

            // Try to parse as JSON, fallback to string
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error('Redis GET error:', error.message);
            return null;
        }
    },

    del: async (key) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const result = await redisClient.del(key);
            return result > 0;
        } catch (error) {
            console.error('Redis DEL error:', error.message);
            return false;
        }
    },

    exists: async (key) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const result = await redisClient.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Redis EXISTS error:', error.message);
            return false;
        }
    },

    expire: async (key, seconds) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const result = await redisClient.expire(key, seconds);
            return result === 1;
        } catch (error) {
            console.error('Redis EXPIRE error:', error.message);
            return false;
        }
    },

    ttl: async (key) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            return await redisClient.ttl(key);
        } catch (error) {
            console.error('Redis TTL error:', error.message);
            return -1;
        }
    },

    // Hash operations
    hset: async (key, field, value) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
            await redisClient.hSet(key, field, stringValue);
            return true;
        } catch (error) {
            console.error('Redis HSET error:', error.message);
            return false;
        }
    },

    hget: async (key, field) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const value = await redisClient.hGet(key, field);
            if (value === null) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error('Redis HGET error:', error.message);
            return null;
        }
    },

    hgetall: async (key) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const hash = await redisClient.hGetAll(key);
            const result = {};

            for (const [field, value] of Object.entries(hash)) {
                try {
                    result[field] = JSON.parse(value);
                } catch {
                    result[field] = value;
                }
            }

            return result;
        } catch (error) {
            console.error('Redis HGETALL error:', error.message);
            return {};
        }
    },

    hdel: async (key, field) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const result = await redisClient.hDel(key, field);
            return result > 0;
        } catch (error) {
            console.error('Redis HDEL error:', error.message);
            return false;
        }
    },

    // List operations
    lpush: async (key, ...values) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const stringValues = values.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v));
            const result = await redisClient.lPush(key, stringValues);
            return result;
        } catch (error) {
            console.error('Redis LPUSH error:', error.message);
            return 0;
        }
    },

    rpop: async (key) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const value = await redisClient.rPop(key);
            if (value === null) return null;

            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        } catch (error) {
            console.error('Redis RPOP error:', error.message);
            return null;
        }
    },

    llen: async (key) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            return await redisClient.lLen(key);
        } catch (error) {
            console.error('Redis LLEN error:', error.message);
            return 0;
        }
    },

    // Set operations
    sadd: async (key, ...members) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const stringMembers = members.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m));
            const result = await redisClient.sAdd(key, stringMembers);
            return result;
        } catch (error) {
            console.error('Redis SADD error:', error.message);
            return 0;
        }
    },

    srem: async (key, ...members) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const stringMembers = members.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m));
            const result = await redisClient.sRem(key, stringMembers);
            return result;
        } catch (error) {
            console.error('Redis SREM error:', error.message);
            return 0;
        }
    },

    smembers: async (key) => {
        try {
            if (!redisClient || !redisClient.isOpen) {
                throw new Error('Redis client not connected');
            }

            const members = await redisClient.sMembers(key);
            return members.map(member => {
                try {
                    return JSON.parse(member);
                } catch {
                    return member;
                }
            });
        } catch (error) {
            console.error('Redis SMEMBERS error:', error.message);
            return [];
        }
    },

    // Cache-specific operations
    cache: {
        // Cache with TTL
        set: async (key, value, ttlSeconds = 3600) => {
            return await redisUtils.set(`cache:${key}`, value, ttlSeconds);
        },

        get: async (key) => {
            return await redisUtils.get(`cache:${key}`);
        },

        del: async (key) => {
            return await redisUtils.del(`cache:${key}`);
        },

        // Cache user data
        setUser: async (userId, userData, ttlSeconds = 1800) => {
            return await redisUtils.set(`user:${userId}`, userData, ttlSeconds);
        },

        getUser: async (userId) => {
            return await redisUtils.get(`user:${userId}`);
        },

        delUser: async (userId) => {
            return await redisUtils.del(`user:${userId}`);
        },

        // Cache session data
        setSession: async (sessionId, sessionData, ttlSeconds = 86400) => {
            return await redisUtils.set(`session:${sessionId}`, sessionData, ttlSeconds);
        },

        getSession: async (sessionId) => {
            return await redisUtils.get(`session:${sessionId}`);
        },

        delSession: async (sessionId) => {
            return await redisUtils.del(`session:${sessionId}`);
        }
    },

    // Rate limiting operations
    rateLimit: {
        // Check and increment rate limit
        checkLimit: async (key, limit, windowSeconds) => {
            try {
                if (!redisClient || !redisClient.isOpen) {
                    throw new Error('Redis client not connected');
                }

                const current = await redisClient.incr(key);

                if (current === 1) {
                    await redisClient.expire(key, windowSeconds);
                }

                return {
                    count: current,
                    limit: limit,
                    remaining: Math.max(0, limit - current),
                    resetTime: Date.now() + (windowSeconds * 1000)
                };
            } catch (error) {
                console.error('Redis rate limit error:', error.message);
                return {
                    count: 0,
                    limit: limit,
                    remaining: limit,
                    resetTime: Date.now() + (windowSeconds * 1000)
                };
            }
        },

        // Reset rate limit
        resetLimit: async (key) => {
            return await redisUtils.del(key);
        }
    }
};

// Connection retry logic
const retryConnection = async (maxRetries = 3, delay = 5000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Redis connection attempt ${attempt}/${maxRetries}`);
            await connectToRedis();
            return true;
        } catch (error) {
            console.error(`❌ Redis connection attempt ${attempt} failed:`, error.message);

            if (attempt === maxRetries) {
                throw new Error(`Failed to connect to Redis after ${maxRetries} attempts`);
            }

            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Process event handlers for graceful shutdown
const setupGracefulShutdown = () => {
    const gracefulShutdown = async (signal) => {
        console.log(`\n🔄 Received ${signal}. Starting graceful Redis shutdown...`);

        try {
            await disconnectFromRedis();
            console.log('✅ Redis graceful shutdown completed');
        } catch (error) {
            console.error('❌ Error during Redis graceful shutdown:', error.message);
        }
    };

    // Handle different termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon
};

// Initialize graceful shutdown handlers
setupGracefulShutdown();

// Export configuration and functions
module.exports = {
    // Configuration
    redisConfig,

    // Connection functions
    connectToRedis,
    disconnectFromRedis,
    retryConnection,

    // Health and status
    checkRedisHealth,
    isConnected: () => isConnected,

    // Redis utilities
    redisUtils,

    // Client instance
    getClient: () => redisClient,

    // Connection state
    connectionState: () => redisClient ? (redisClient.isOpen ? 'open' : 'closed') : 'not_initialized'
};

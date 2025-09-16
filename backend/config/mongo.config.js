const mongoose = require('mongoose');

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// MongoDB connection configuration
const mongoConfig = {
    uri: process.env.MONGODB_URI || process.env.MONGO_URI,
    options: {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        authSource: process.env.MONGODB_AUTH_SOURCE,
        tls: isProduction, // Use TLS for production (replaces ssl)
        retryWrites: true,
        retryReads: true,
        readPreference: 'primary',
        compressors: ['zlib'],
        connectTimeoutMS: 10000,
        heartbeatFrequencyMS: 10000,
        writeConcern: {
            w: 'majority',
            j: true,
            wtimeoutMS: 10000 // Use wtimeoutMS instead of wtimeout
        },
        family: 4 // Prefer IPv4
    }
};

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const maxConnectionAttempts = 5;

// Connection event handlers
const connectionHandlers = {
    connected: () => {
        console.log('✅ MongoDB connected successfully');
        isConnected = true;
        connectionAttempts = 0;
    },
    error: (error) => {
        console.error('❌ MongoDB connection error:', error.message);
        isConnected = false;
        connectionAttempts++;
        if (connectionAttempts >= maxConnectionAttempts) {
            console.error('🚨 Maximum connection attempts reached. Please check your MongoDB configuration.');
            process.exit(1);
        }
    },
    disconnected: () => {
        console.log('⚠️ MongoDB disconnected');
        isConnected = false;
    },
    reconnected: () => {
        console.log('🔄 MongoDB reconnected');
        isConnected = true;
        connectionAttempts = 0;
    },
    close: () => {
        console.log('🔒 MongoDB connection closed');
        isConnected = false;
    }
};

// Set up mongoose connection event listeners
const setupConnectionListeners = () => {
    mongoose.connection.on('connected', connectionHandlers.connected);
    mongoose.connection.on('error', connectionHandlers.error);
    mongoose.connection.on('disconnected', connectionHandlers.disconnected);
    mongoose.connection.on('reconnected', connectionHandlers.reconnected);
    mongoose.connection.on('close', connectionHandlers.close);
};

// Connect to MongoDB
const connectToMongoDB = async () => {
    try {
        setupConnectionListeners();
        mongoose.set('strictQuery', false); // Suppress the warning about strictQuery
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoConfig.uri, mongoConfig.options);
        return mongoose.connection;
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message);
        throw error;
    }
};

// Graceful disconnect
const disconnectFromMongoDB = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            console.log('🔄 Disconnecting from MongoDB...');
            await mongoose.connection.close();
            console.log('✅ MongoDB disconnected gracefully');
        }
    } catch (error) {
        console.error('❌ Error disconnecting from MongoDB:', error.message);
        throw error;
    }
};

// Health check function
const checkMongoDBHealth = () => {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    return {
        status: states[state] || 'unknown',
        isConnected: state === 1,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        readyState: state
    };
};

// Connection retry logic
const retryConnection = async (maxRetries = 3, delay = 5000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Connection attempt ${attempt}/${maxRetries}`);
            await connectToMongoDB();
            return true;
        } catch (error) {
            console.error(`❌ Connection attempt ${attempt} failed:`, error.message);
            if (attempt === maxRetries) {
                throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts`);
            }
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Database operations helpers
const dbHelpers = {
    getStats: async () => {
        try {
            const stats = await mongoose.connection.db.stats();
            return {
                success: true,
                stats: {
                    collections: stats.collections,
                    dataSize: stats.dataSize,
                    storageSize: stats.storageSize,
                    indexes: stats.indexes,
                    indexSize: stats.indexSize,
                    objects: stats.objects
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    listCollections: async () => {
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            return {
                success: true,
                collections: collections.map(col => ({
                    name: col.name,
                    type: col.type,
                    options: col.options
                }))
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },
    dropDatabase: async () => {
        try {
            if (isDevelopment) {
                await mongoose.connection.db.dropDatabase();
                return { success: true, message: 'Database dropped successfully' };
            } else {
                return { success: false, error: 'Database drop not allowed in production' };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// Process event handlers for graceful shutdown
const setupGracefulShutdown = () => {
    const gracefulShutdown = async (signal) => {
        console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
        try {
            await disconnectFromMongoDB();
            console.log('✅ Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during graceful shutdown:', error.message);
            process.exit(1);
        }
    };
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon
};

// Initialize graceful shutdown handlers
setupGracefulShutdown();

// Export configuration and functions
module.exports = {
    mongoConfig,
    connectToMongoDB,
    disconnectFromMongoDB,
    retryConnection,
    checkMongoDBHealth,
    isConnected: () => isConnected,
    dbHelpers,
    connectionState: () => mongoose.connection.readyState,
    mongoose
};
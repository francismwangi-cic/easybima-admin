import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';

// Initialize environment variables first
config();

// Import database configuration
import db from './src/config/database.js';

// Import routes and middleware
import routes from './src/routes/index.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Initialize Sequelize first
    await db.initialize();
    console.log('✅ Database connection has been established successfully.');
    
    // Import models but skip automatic synchronization
    const models = await import('./src/models/index.js');
    console.log('ℹ️  Skipping automatic database model synchronization');
    console.log('ℹ️  Using existing database tables without modification');
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🏥 Health check at http://localhost:${PORT}/health`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
    
    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Unable to start server:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.original) {
      console.error('Original error:', error.original);
    }
    
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    
    process.exit(1);
  }
};

startServer();

export default app;
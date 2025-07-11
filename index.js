// Set default environment to development if not specified
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import database and models
import initializeModels from './src/models/index.js';

// Import Express and other required modules
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Import routes
import apiRoutes from './src/routes/index.js';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Set port
const PORT = process.env.PORT || 3000;

// Initialize database and models
const startServer = async () => {
  try {
    console.log(`Starting server in ${process.env.NODE_ENV} mode...`);
    console.log(`Node.js v${process.versions.node}`);
    
    // Initialize models and database connection
    const { sequelize } = await initializeModels();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync database (set force: false in production)
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synchronized');
    
    // Routes
    app.use('/api', apiRoutes);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'UP' });
    });
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Unable to start the server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

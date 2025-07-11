import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const env = process.env.NODE_ENV || 'development';

// List of required environment variables
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST', 'DB_PORT'];

// Create a Sequelize instance
let sequelize;

async function initializeSequelize() {
  try {
    // Validate required environment variables
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    }

    // Oracle connection configuration
    const connectionString = `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.DB_HOST})(PORT=${process.env.DB_PORT}))(CONNECT_DATA=(SERVICE_NAME=${process.env.DB_NAME})))`;
    
    console.log('Connecting to Oracle with:', {
      username: process.env.DB_USER,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      connectionString: connectionString
    });

    sequelize = new Sequelize({
      dialect: 'oracle',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      logging: env === 'development' ? console.log : false,
      define: {
        schema: process.env.DB_USER.toUpperCase(), // Ensure uppercase for Oracle
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        paranoid: true,
      },
      dialectOptions: {
        connectString: connectionString,
        autoCommit: true,
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
    });

    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to the Oracle database has been established successfully.');

    return sequelize;
  } catch (error) {
    console.error('❌ Error initializing Sequelize:', error.message);
    throw error;
  }
}

// Initialize and export the sequelize instance
let dbInstance = null;

const db = {
  Sequelize,
  get sequelize() {
    if (!dbInstance) {
      throw new Error('Database not initialized. Call db.initialize() first.');
    }
    return dbInstance;
  },
  initialize: async () => {
    if (!dbInstance) {
      dbInstance = await initializeSequelize();
    }
    return dbInstance;
  }
};

export default db;
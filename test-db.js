// Import database connection and models
import { sequelize } from './src/config/database.js';
import User from './src/models/User.js';
import Client from './src/models/Client.js';

async function testConnection() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ All models were synchronized successfully.');
    
    // Test User model
   
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    process.exit(0);
  }
}

testConnection();

import db from '../config/database.js';

// Import all models
import User from './User.js';
import Client from './Client.js';
import Quote from './Quote.js';
import Policy from './Policy.js';
import Document from './Document.js';
import Valuation from './Valuation.js';
import Payment from './Payment.js';
import Commission from './Commission.js';
import Reminder from './Reminder.js';
import Claim from './Claim.js';
import Product from './Product.js';
import Intermediary from './Intermediary.js';

// Initialize database connection
let models = null;

// Function to initialize models
const initModels = (sequelize) => {
  // Initialize models with sequelize
  const initializedModels = {
    // Class-based models (extend BaseModel or Model) - these use .init()
    User: User.init(sequelize),
    Client: Client.init(sequelize),
    Quote: Quote.init(sequelize),
    Policy: Policy.init(sequelize),
    Document: Document.init(sequelize),
    Payment: Payment.init(sequelize),
    
    // Class-based models that also use .init()
    Commission: Commission.init(sequelize),
    Claim: Claim.init(sequelize),
    
    // Factory function models - these are called directly
    Valuation: Valuation(sequelize),
    Reminder: Reminder(sequelize),
    Product: Product(sequelize),
    Intermediary: Intermediary(sequelize)
  };

  // Define associations
  Object.values(initializedModels)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(initializedModels));

  return initializedModels;
};

// Function to sync models with database
export const syncModels = async () => {
  try {
    if (!models) {
      models = initModels(db.sequelize);
    }
    
    // Sync all models with database
    await db.sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('✅ Database models synchronized successfully');
    return models;
  } catch (error) {
    console.error('❌ Failed to sync database models:', error);
    throw error;
  }
};

// Export models and sync function
export default {
  syncModels,
  get models() {
    if (!models) {
      throw new Error('Models have not been initialized. Call syncModels() first.');
    }
    return models;
  }
};

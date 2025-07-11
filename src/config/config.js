import dotenv from 'dotenv';
dotenv.config();

// Load environment variables
const {
  // Test environment
  DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_DIALECT, JWT_SECRET,
  DMVIC_BASE_URL, DMVIC_PASSWORD, DMVIC_USER, DMVIC_CLIENTID,
  AA_USERNAME, AA_PASSWORD, AA_BASE_URL,
  STAGING_REGENT_URL, STAGING_REGENT_USERNAME, STAGING_REGENT_API_KEY,
  RABBITMQ_HOST, RABBITMQ_PORT, RABBITMQ_USER, RABBITMQ_PASSWORD,
  CYBERSOURCE_RUN_ENV, MERCHANT_ID, MERCHANT_KEY, MERCHANT_SECRET, AUTHENTICATION_TYPE,
  ENCRPYTION_KEY,
  MARINE_BASE_URL, MARINE_CLIENTID, MARINE_INTEGRATION_KEY, MARINE_KEY_REFERENCE,
  
  // Production environment
  PROD_JWT_SECRET, PROD_DB_HOSTNAME, PROD_DB_PORT, PROD_DB_NAME, 
  PROD_DB_USERNAME, PROD_DB_PASSWORD, PROD_DB_DIALECT,
  PROD_AA_BASE_URL, PROD_AA_USERNAME, PROD_AA_PASSWORD,
  PROD_DMVIC_BASE_URL, PROD_DMVIC_PASSWORD, PROD_DMVIC_USER, PROD_DMVIC_CLIENTID,
  PROD_REGENT_URL, PROD_REGENT_USERNAME, PROD_REGENT_API_KEY,
  PROD_RABBITMQ_HOST, PROD_RABBITMQ_PORT, PROD_RABBITMQ_USER, PROD_RABBITMQ_PASSWORD,
  PROD_CYBERSOURCE_RUN_ENV, PROD_MERCHANT_ID, PROD_MERCHANT_KEY, 
  PROD_MERCHANT_SECRET, PROD_AUTHENTICATION_TYPE,
  PROD_MARINE_BASE_URL, PROD_MARINE_CLIENTID, 
  PROD_MARINE_INTEGRATION_KEY, PROD_MARINE_KEY_REFERENCE
} = process.env;

// Common Sequelize configuration
const sequelizeConfig = {
  freezeTableName: true,
  underscored: true,
  timestamps: true,
  createdAt: 'CREATED_AT',
  updatedAt: 'UPDATED_AT',
  deletedAt: 'DELETED_AT',
  paranoid: true,
  schema: 'EASYBIMA',
  // Table name mappings with Easy prefix
  tableNameMapping: {
    // Add table mappings here as needed
  }
};

// Test environment configuration
const test = {
  // Database connection
  dbusername: DB_USER,
  dbpassword: DB_PASSWORD,
  database: DB_NAME,
  dbhost: DB_HOST,
  dbport: DB_PORT,
  dbdialect: DB_DIALECT,
  
  // Sequelize configuration
  define: { ...sequelizeConfig },
  
  // Application configuration
  jwtsecret: JWT_SECRET,
  aausername: AA_USERNAME,
  aapassword: AA_PASSWORD,
  aabaseurl: AA_BASE_URL,
  dmvicbaseurl: DMVIC_BASE_URL,
  dmvicpassword: DMVIC_PASSWORD,
  dmvicuser: DMVIC_USER,
  dmvicclientid: DMVIC_CLIENTID,
  regentbaseurl: STAGING_REGENT_URL,
  regentuser: STAGING_REGENT_USERNAME,
  regentapikey: STAGING_REGENT_API_KEY,
  rabbitmqhost: RABBITMQ_HOST,
  rabbitmqport: RABBITMQ_PORT,
  rabbitmquser: RABBITMQ_USER,
  rabbitmqpassword: RABBITMQ_PASSWORD,
  cybersourcerunenv: CYBERSOURCE_RUN_ENV,
  merchantid: MERCHANT_ID,
  merchantkey: MERCHANT_KEY,
  merchantsecret: MERCHANT_SECRET,
  authenticationtype: AUTHENTICATION_TYPE,
  encryptionKey: ENCRPYTION_KEY,
  marineBaseUrl: MARINE_BASE_URL,
  marineClientId: MARINE_CLIENTID,
  marineIntegrationKey: MARINE_INTEGRATION_KEY,
  marineKeyReference: MARINE_KEY_REFERENCE
};

// Production environment configuration
const production = {
  // Database connection
  dbusername: PROD_DB_USERNAME,
  dbpassword: PROD_DB_PASSWORD,
  database: PROD_DB_NAME,
  dbhost: PROD_DB_HOSTNAME,
  dbport: PROD_DB_PORT,
  dbdialect: PROD_DB_DIALECT,
  
  // Sequelize configuration
  define: { ...sequelizeConfig },
  
  // Application configuration
  jwtsecret: PROD_JWT_SECRET,
  aausername: PROD_AA_USERNAME,
  aapassword: PROD_AA_PASSWORD,
  aabaseurl: PROD_AA_BASE_URL,
  dmvicbaseurl: PROD_DMVIC_BASE_URL,
  dmvicpassword: PROD_DMVIC_PASSWORD,
  dmvicuser: PROD_DMVIC_USER,
  dmvicclientid: PROD_DMVIC_CLIENTID,
  regentbaseurl: PROD_REGENT_URL,
  regentuser: PROD_REGENT_USERNAME,
  regentapikey: PROD_REGENT_API_KEY,
  rabbitmqhost: PROD_RABBITMQ_HOST,
  rabbitmqport: PROD_RABBITMQ_PORT,
  rabbitmquser: PROD_RABBITMQ_USER,
  rabbitmqpassword: PROD_RABBITMQ_PASSWORD,
  cybersourcerunenv: PROD_CYBERSOURCE_RUN_ENV,
  merchantid: PROD_MERCHANT_ID,
  merchantkey: PROD_MERCHANT_KEY,
  merchantsecret: PROD_MERCHANT_SECRET,
  authenticationtype: PROD_AUTHENTICATION_TYPE,
  encryptionKey: ENCRPYTION_KEY,
  marineBaseUrl: PROD_MARINE_BASE_URL,
  marineClientId: PROD_MARINE_CLIENTID,
  marineIntegrationKey: PROD_MARINE_INTEGRATION_KEY,
  marineKeyReference: PROD_MARINE_KEY_REFERENCE
};

export { test, production };

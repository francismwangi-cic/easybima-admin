import { Sequelize } from 'sequelize';
import { test } from './src/config/config.js';

async function testConnection() {
  const sequelize = new Sequelize({
    dialect: 'oracle',
    host: test.dbhost,
    port: test.dbport,
    database: test.database,
    username: test.dbusername,
    password: test.dbpassword,
    dialectOptions: {
      connectString: `${test.dbhost}:${test.dbport}/${test.database}`
    },
    logging: console.log
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testConnection();

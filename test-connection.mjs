import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

console.log('Testing Oracle connection...');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
};

console.log('Connection config:', {
  ...dbConfig,
  password: '***' // Don't log the actual password
});

async function testConnection() {
  let connection;
  
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Successfully connected to Oracle Database');
    
    const result = await connection.execute('SELECT 1 AS test FROM DUAL');
    console.log('Query result:', result.rows);
    
  } catch (err) {
    console.error('❌ Error connecting to Oracle Database:');
    console.error('Error:', err.message);
    console.error('Error code:', err.errorNum);
    console.error('Error offset:', err.offset);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Connection closed');
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

testConnection();

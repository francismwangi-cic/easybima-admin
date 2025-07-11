import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import User from '../models/User.js';

async function seedAdmin() {
  try {
    // Initialize database connection
    await db.initialize();
    
    const sequelize = db.sequelize();
    
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({
        where: { email: 'francis.mwangi@ke.cicinsurancegroup.com' },
        transaction
      });
      
      if (existingAdmin) {
        console.log('Admin user already exists');
        await transaction.rollback();
        await sequelize.close();
        return;
      }
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Abcd,1234.', salt);
      
      // Create admin user
      await User.create({
        username: 'francis',
        email: 'francis.mwangi@ke.cicinsurancegroup.com',
        password: hashedPassword,
        firstName: 'Francis',
        lastName: 'Admin',
        role: 'admin',
        isActive: true,
        emailVerified: true,
        lastLogin: new Date()
      }, { transaction });
      
      // Commit the transaction
      await transaction.commit();
      console.log('Admin user created successfully');
      
    } catch (error) {
      // If anything goes wrong, rollback the transaction
      await transaction.rollback();
      console.error('Error creating admin user:', error);
      throw error;
    } finally {
      // Close the connection
      await sequelize.close();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

// Run the seeder
seedAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

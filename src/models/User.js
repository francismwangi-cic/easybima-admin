import { DataTypes, Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import BaseModel from './BaseModel.js';

/**
 * User model representing system users (admins, agents, customers)
 * @extends BaseModel
 */
class User extends BaseModel {
  /**
   * Hooks for the User model
   * @returns {Object} Object containing model hooks
   */
  static hooks() {
    return {
      beforeCreate: async (user) => {
        // Ensure email is always lowercase
        if (user.email) {
          user.email = user.email.toLowerCase().trim();
        }
        
        // Ensure username is always lowercase
        if (user.username) {
          user.username = user.username.toLowerCase().trim();
        }
      },
      beforeUpdate: async (user) => {
        // Update timestamps
        user.updatedAt = new Date();
      }
    };
  }

  /**
   * Initialize the User model
   * @param {Object} sequelize - Sequelize instance
   * @returns {Model} Initialized User model
   */
  static init(sequelize) {
    const attributes = {
      // Primary Key
      id: {
        field: 'USER_ID',
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Unique identifier for the user'
      },
      
      // Authentication
      username: {
        field: 'USERNAME',
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Username is required'
          },
          len: {
            args: [3, 50],
            msg: 'Username must be between 3 and 50 characters'
          }
        },
        set(value) {
          this.setDataValue('username', value ? value.trim().toLowerCase() : value);
        },
        comment: 'Unique username for login'
      },
      
      email: {
        field: 'EMAIL',
        type: DataTypes.STRING(100),
        unique: {
          name: 'UK_USER_EMAIL',
          msg: 'Email already exists'
        },
        allowNull: false,
        validate: {
          isEmail: {
            msg: 'Please provide a valid email address'
          },
          notEmpty: {
            msg: 'Email is required'
          },
          len: {
            args: [5, 100],
            msg: 'Email must be between 5 and 100 characters'
          }
        },
        set(value) {
          this.setDataValue('email', value ? value.toLowerCase().trim() : value);
        },
        comment: 'User email address'
      },
      
      password: {
        field: 'PASSWORD',
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Password is required'
          },
          len: {
            args: [8, 255],
            msg: 'Password must be at least 8 characters long'
          }
        },
        set(value) {
          if (value) {
            const salt = bcrypt.genSaltSync(10);
            this.setDataValue('password', bcrypt.hashSync(value, salt));
          }
        },
        comment: 'Hashed password'
      },
      
      // User Details
      firstName: {
        field: 'FIRST_NAME',
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'First name is required'
          },
          len: {
            args: [2, 50],
            msg: 'First name must be between 2 and 50 characters'
          }
        },
        set(value) {
          this.setDataValue('firstName', value ? value.trim() : value);
        },
        comment: 'User first name'
      },
      
      middleName: {
        field: 'MIDDLE_NAME',
        type: DataTypes.STRING(50),
        allowNull: true,
        set(value) {
          this.setDataValue('middleName', value ? value.trim() : value);
        },
        comment: 'User middle name (optional)'
      },
      
      lastName: {
        field: 'LAST_NAME',
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Last name is required'
          },
          len: {
            args: [2, 50],
            msg: 'Last name must be between 2 and 50 characters'
          }
        },
        set(value) {
          this.setDataValue('lastName', value ? value.trim() : value);
        },
        comment: 'User last name'
      },
      
      phoneNumber: {
        field: 'PHONE_NUMBER',
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: {
          name: 'UK_USER_PHONE',
          msg: 'Phone number already exists'
        },
        validate: {
          is: {
            args: /^[0-9+\-\s()]*$/,
            msg: 'Please provide a valid phone number'
          }
        },
        comment: 'User contact phone number'
      },
      
      // Role and Status
      role: {
        field: 'ROLE',
        type: DataTypes.ENUM('admin', 'agent', 'customer'),
        allowNull: false,
        defaultValue: 'customer',
        validate: {
          isIn: {
            args: [['admin', 'agent', 'customer']],
            msg: 'Invalid user role'
          }
        },
        comment: 'User role in the system'
      },
      
      isActive: {
        field: 'IS_ACTIVE',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the user account is active'
      },
      
      isVerified: {
        field: 'IS_VERIFIED',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the user email is verified'
      },
      
      // Authentication tokens
      verificationToken: {
        field: 'VERIFICATION_TOKEN',
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Token for email verification'
      },
      
      resetPasswordToken: {
        field: 'RESET_PASSWORD_TOKEN',
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Token for password reset'
      },
      
      resetPasswordExpires: {
        field: 'RESET_PASSWORD_EXPIRES',
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Expiration time for password reset token'
      },
      
      // Timestamps
      lastLogin: {
        field: 'LAST_LOGIN',
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last login timestamp'
      },
      
      lastPasswordReset: {
        field: 'LAST_PASSWORD_RESET',
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last password reset timestamp'
      },
      
      // Audit fields
      createdBy: {
        field: 'CREATED_BY',
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'User who created this record'
      },
      
      updatedBy: {
        field: 'UPDATED_BY',
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'User who last updated this record'
      },
      
      deletedAt: {
        field: 'DELETED_AT',
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp when record was soft deleted'
      }
    };
    const options = {
      modelName: 'User',
      tableName: 'EASY_USER',
      hooks: this.hooks(),
      indexes: [
        {
          name: 'IDX_USER_EMAIL',
          fields: ['EMAIL'],
          unique: true
        },
        {
          name: 'IDX_USER_USERNAME',
          fields: ['USERNAME'],
          unique: true
        },
        {
          name: 'IDX_USER_ROLE',
          fields: ['ROLE']
        },
        {
          name: 'IDX_USER_IS_ACTIVE',
          fields: ['IS_ACTIVE']
        }
      ],
      defaultScope: {
        attributes: { 
          exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] 
        }
      },
      scopes: {
        withSensitiveData: {
          attributes: { 
            include: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] 
          }
        }
      }
    };

    return super.initModel(attributes, options, sequelize);
  }

  /**
   * Validate the provided password against the stored hash
   * @param {string} password - The password to validate
   * @returns {Promise<boolean>} True if password is valid, false otherwise
   */
  async validatePassword(password) {
    if (!password || !this.password) return false;
    return await bcrypt.compare(password, this.password);
  }

  /**
   * Update the user's password with a new one
   * @param {string} newPassword - The new password
   * @returns {Promise<void>}
   */
  async updatePassword(newPassword) {
    if (!newPassword) {
      throw new Error('New password is required');
    }
    
    this.password = newPassword;
    this.lastPasswordReset = new Date();
    await this.save();
  }

  /**
   * Mark the user's email as verified
   * @returns {Promise<void>}
   */
  async verifyEmail() {
    this.isVerified = true;
    this.verificationToken = null;
    await this.save();
  }

  /**
   * Generate a password reset token
   * @returns {string} The generated token
   */
  generatePasswordResetToken() {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresIn = new Date();
    expiresIn.setHours(expiresIn.getHours() + 1); // Token expires in 1 hour
    
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    this.resetPasswordExpires = expiresIn;
    
    return token;
  }

  /**
   * Check if the user has a specific role
   * @param {string} role - The role to check
   * @returns {boolean} True if user has the role, false otherwise
   */
  hasRole(role) {
    return this.role === role;
  }

  /**
   * Check if the user has any of the specified roles
   * @param {string[]} roles - Array of roles to check
   * @returns {boolean} True if user has any of the roles, false otherwise
   */
  hasAnyRole(roles) {
    if (!Array.isArray(roles)) return false;
    return roles.includes(this.role);
  }

  /**
   * Get the user's full name
   * @returns {string} The user's full name
   */
  getFullName() {
    return [this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Get a sanitized version of the user object (without sensitive data)
   * @returns {Object} Sanitized user object
   */
  toJSON() {
    const values = Object.assign({}, this.get());
    
    // Remove sensitive data
    delete values.password;
    delete values.verificationToken;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpires;
    
    return values;
  }

  /**
   * Search for users with pagination
   * @param {Object} options - Search options
   * @param {string} options.searchTerm - Term to search in name, email, or phone
   * @param {number} options.limit - Maximum number of results to return
   * @param {number} options.offset - Number of results to skip
   * @param {string} options.role - Filter by user role
   * @param {boolean} options.isActive - Filter by active status
   * @returns {Promise<{count: number, rows: Array}>} Search results with total count
   */
  static async search({ 
    searchTerm = '', 
    limit = 10, 
    offset = 0,
    role = null,
    isActive = null
  } = {}) {
    const { sequelize } = this.sequelize;
    
    const whereClause = {
      [Op.and]: []
    };

    // Add search term conditions
    if (searchTerm) {
      whereClause[Op.and].push({
        [Op.or]: [
          {
            firstName: {
              [Op.iLike]: `%${searchTerm}%`
            }
          },
          {
            lastName: {
              [Op.iLike]: `%${searchTerm}%`
            }
          },
          {
            email: {
              [Op.iLike]: `%${searchTerm}%`
            }
          },
          {
            phoneNumber: {
              [Op.iLike]: `%${searchTerm}%`
            }
          }
        ]
      });
    }

    // Add role filter if provided
    if (role) {
      whereClause[Op.and].push({ role });
    }

    // Add active status filter if provided
    if (isActive !== null) {
      whereClause[Op.and].push({ isActive });
    }

    // If no conditions, remove the AND operator
    if (whereClause[Op.and].length === 0) {
      delete whereClause[Op.and];
    }

    return await this.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit, 10) || 10,
      offset: parseInt(offset, 10) || 0,
      order: [['CREATED_AT', 'DESC']]
    });
  }

  /**
   * Define associations between this model and others
   * @param {Object} models - All defined models
   */
  static associate(models) {
    // A user can create many policies
    this.hasMany(models.Policy, {
      foreignKey: 'CREATED_BY',
      as: 'policies',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can have many claims
    this.hasMany(models.Claim, {
      foreignKey: 'USER_ID',
      as: 'claims',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can process many claims (as an agent/admin)
    this.hasMany(models.Claim, {
      foreignKey: 'PROCESSED_BY',
      as: 'processedClaims',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can have many payments
    this.hasMany(models.Payment, {
      foreignKey: 'CUSTOMER_ID',
      as: 'payments',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can process many payments (as an agent/admin)
    this.hasMany(models.Payment, {
      foreignKey: 'PROCESSED_BY',
      as: 'processedPayments',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can create many documents
    this.hasMany(models.Document, {
      foreignKey: 'UPLOADED_BY',
      as: 'uploadedDocuments',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can be assigned to many documents
    this.hasMany(models.Document, {
      foreignKey: 'ASSIGNED_TO',
      as: 'assignedDocuments',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can create many quotes
    this.hasMany(models.Quote, {
      foreignKey: 'CREATED_BY',
      as: 'quotes',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can approve many quotes (as an agent/admin)
    this.hasMany(models.Quote, {
      foreignKey: 'APPROVED_BY',
      as: 'approvedQuotes',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can convert many quotes to policies (as an agent/admin)
    this.hasMany(models.Quote, {
      foreignKey: 'CONVERTED_BY',
      as: 'convertedQuotes',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can be referenced as a creator in other models
    this.hasMany(models.User, {
      foreignKey: 'CREATED_BY',
      as: 'createdUsers',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // A user can be referenced as an updater in other models
    this.hasMany(models.User, {
      foreignKey: 'UPDATED_BY',
      as: 'updatedUsers',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
}

export { User as default };

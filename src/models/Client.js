import { DataTypes } from 'sequelize';
import BaseModel from './BaseModel.js';

/**
 * Client model representing insurance policyholders
 * @extends BaseModel
 */
class Client extends BaseModel {
  /**
   * Initialize the Client model
   * @param {Object} sequelize - Sequelize instance
   * @returns {Model} Initialized Client model
   */
  static init(sequelize) {
    const hooks = {
      beforeCreate: async (client) => {
        if (client.email) {
          client.email = client.email.toLowerCase().trim();
        }
        if (client.phone) {
          client.phone = client.phone.replace(/[^\d+]/g, '');
        }
      },
      beforeUpdate: async (client) => {
        if (client.changed('email') && client.email) {
          client.email = client.email.toLowerCase().trim();
        }
        if (client.changed('phone') && client.phone) {
          client.phone = client.phone.replace(/[^\d+]/g, '');
        }
      }
    };

    const attributes = {
      // Primary Key
      id: {
        field: 'CLIENT_ID',
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Primary key for the client record'
      },
      
      // Personal Information
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
        comment: 'Client first name'
      },
      
      middleName: {
        field: 'MIDDLE_NAME',
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Client middle name or initial'
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
        comment: 'Client last name'
      },
      
      // Contact Information
      email: {
        field: 'EMAIL',
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          name: 'UK_CLIENT_EMAIL',
          msg: 'Email already exists'
        },
        validate: {
          isEmail: {
            msg: 'Please provide a valid email address'
          },
          notEmpty: {
            msg: 'Email is required'
          }
        },
        set(value) {
          if (value) {
            this.setDataValue('email', value.toLowerCase().trim());
          }
        },
        comment: 'Client email address (unique)'
      },
      
      phone: {
        field: 'PHONE',
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          is: {
            args: /^[0-9+\-\s()]*$/,
            msg: 'Please provide a valid phone number'
          }
        },
        set(value) {
          if (value) {
            this.setDataValue('phone', value.replace(/[^\d+]/g, ''));
          } else {
            this.setDataValue('phone', null);
          }
        },
        comment: 'Client phone number'
      },
      
      address: {
        field: 'ADDRESS',
        type: DataTypes.TEXT,
        comment: 'Street address',
        allowNull: true
      },
      
      city: {
        field: 'CITY',
        type: DataTypes.STRING(50),
        comment: 'City',
        allowNull: true
      },
      
      state: {
        field: 'STATE',
        type: DataTypes.STRING(50),
        comment: 'State/Province/Region',
        allowNull: true
      },
      
      postalCode: {
        field: 'POSTAL_CODE',
        type: DataTypes.STRING(20),
        comment: 'Postal/ZIP code',
        allowNull: true
      },
      
      country: {
        field: 'COUNTRY',
        type: DataTypes.STRING(50),
        defaultValue: 'Kenya',
        comment: 'Country',
        allowNull: false
      },
        
      // Identification
      dateOfBirth: {
        field: 'DATE_OF_BIRTH',
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: {
            msg: 'Please provide a valid date of birth'
          },
          isBefore: {
            args: new Date().toISOString(),
            msg: 'Date of birth must be in the past'
          }
        },
        comment: 'Client date of birth'
      },
      
      gender: {
        field: 'GENDER',
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true,
        comment: 'Client gender'
      },
      
      idNumber: {
        field: 'ID_NUMBER',
        type: DataTypes.STRING(50),
        unique: {
          name: 'UK_CLIENT_ID_NUMBER',
          msg: 'ID number already exists'
        },
        allowNull: true,
        comment: 'Government-issued ID number'
      },
      
      idType: {
        field: 'ID_TYPE',
        type: DataTypes.ENUM('national_id', 'passport', 'alien_id', 'military_id', 'other'),
        allowNull: true,
        comment: 'Type of identification document'
      },
      
      // Status
      status: {
        field: 'STATUS',
        type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending_verification'),
        allowNull: false,
        defaultValue: 'pending_verification',
        comment: 'Client account status'
      },
      
      // Additional contact information
      alternatePhone: {
        field: 'ALTERNATE_PHONE',
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Alternate contact number'
      },
      
      // Audit Fields
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
      
      // Soft delete
      deletedAt: {
        field: 'DELETED_AT',
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp when record was soft deleted'
      },
      
      // Additional Metadata
      metadata: {
        field: 'METADATA',
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional client metadata in JSON format',
        get() {
          const value = this.getDataValue('metadata');
          return value || {};
        },
        set(value) {
          this.setDataValue('metadata', value || {});
        }
      }
    };

    const options = {
      modelName: 'Client',
      tableName: 'CLIENTS',
      schema: 'EASYBIMA',
      indexes: [
        {
          name: 'IDX_CLIENT_EMAIL',
          fields: ['EMAIL'],
          unique: true
        },
        {
          name: 'IDX_CLIENT_PHONE',
          fields: ['PHONE']
        },
        {
          name: 'IDX_CLIENT_STATUS',
          fields: ['STATUS']
        },
        {
          name: 'IDX_CLIENT_NAME',
          fields: ['FIRST_NAME', 'LAST_NAME']
        }
      ],
      defaultScope: {
        attributes: {
          exclude: ['metadata']
        }
      },
      scopes: {
        withMetadata: {
          attributes: { include: ['metadata'] }
        },
        active: {
          where: { status: 'active' }
        },
        inactive: {
          where: { status: 'inactive' }
        }
      },
      hooks: hooks
    };

    return super.initModel(attributes, options, sequelize);
  }

  /**
   * Define associations between this model and others
   * @param {Object} models - All defined models
   */
  static associate(models) {
    // A client can have many quotes
    this.hasMany(models.Quote, {
      foreignKey: 'CLIENT_ID',
      as: 'quotes',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    
    // A client can have many policies
    this.hasMany(models.Policy, {
      foreignKey: 'CLIENT_ID',
      as: 'policies',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    
    // A client can have many payments
    this.hasMany(models.Payment, {
      foreignKey: 'CLIENT_ID',
      as: 'payments',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    
    // A client can have many claims
    this.hasMany(models.Claim, {
      foreignKey: 'CLIENT_ID',
      as: 'claims',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    
    // A client is created by a user
    this.belongsTo(models.User, {
      foreignKey: 'CREATED_BY',
      as: 'creator',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    
    // A client is updated by a user
    this.belongsTo(models.User, {
      foreignKey: 'UPDATED_BY',
      as: 'updater',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
  
  /**
   * Get the client's full name
   * @returns {string} The client's full name
   */
  getFullName() {
    return [this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(' ');
  }
  
  /**
   * Get a sanitized version of the client object (without sensitive data)
   * @returns {Object} Sanitized client object
   */
  toJSON() {
    const values = super.toJSON ? super.toJSON() : this.get({ plain: true });
    
    // Remove sensitive or unnecessary data
    delete values.metadata;
    
    return values;
  }
}

export { Client as default };

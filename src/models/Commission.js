import { DataTypes } from 'sequelize';
import BaseModel from './BaseModel.js';

/**
 * Commission model representing commission payments to intermediaries
 * @extends BaseModel
 */
class Commission extends BaseModel {
  /**
   * Initialize the Commission model
   * @param {Object} sequelize - Sequelize instance
   * @returns {Model} Initialized Commission model
   */
  static init(sequelize) {
    const attributes = {
      // Primary Key
      id: {
        field: 'COMMISSION_ID',
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Primary key for the commission record'
      },

      // References
      intermediaryId: {
        field: 'INTERMEDIARY_ID',
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'The intermediary who earned the commission'
      },
      
      productId: {
        field: 'PRODUCT_ID',
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'The product this commission is for'
      },
      
      policyId: {
        field: 'POLICY_ID',
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'The policy this commission is for (if applicable)'
      },

      // Financial Details
      amount: {
        field: 'AMOUNT',
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01
        },
        comment: 'The commission amount in the base currency'
      },
      
      rate: {
        field: 'RATE',
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
          min: 0,
          max: 100
        },
        comment: 'The commission rate as a percentage'
      },

      // Commission Details
      commissionType: {
        field: 'COMMISSION_TYPE',
        type: DataTypes.ENUM(
          'NEW_BUSINESS',
          'RENEWAL',
          'BONUS',
          'OVERRIDE',
          'ADJUSTMENT',
          'CLAWBACK'
        ),
        defaultValue: 'NEW_BUSINESS',
        allowNull: false,
        comment: 'Type of commission being paid'
      },
      
      period: {
        field: 'PERIOD',
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'The accounting period this commission belongs to (e.g., "2023-Q1")'
      },

      // Payment Details
      dueDate: {
        field: 'DUE_DATE',
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'When this commission is due to be paid'
      },
      
      paidDate: {
        field: 'PAID_DATE',
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'When this commission was actually paid'
      },
      
      status: {
        field: 'STATUS',
        type: DataTypes.ENUM(
          'PENDING',
          'APPROVED',
          'PROCESSING',
          'PAID',
          'CANCELLED',
          'DISPUTED'
        ),
        defaultValue: 'PENDING',
        allowNull: false,
        comment: 'Current status of the commission payment'
      },
      
      paymentReference: {
        field: 'PAYMENT_REFERENCE',
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Reference number from the payment system'
      },

      // Additional Information
      notes: {
        field: 'NOTES',
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Any additional notes about this commission'
      },

      // Audit Fields
      processedBy: {
        field: 'PROCESSED_BY',
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'User who processed this commission'
      }
    };

    const options = {
      modelName: 'Commission',
      tableName: 'COMMISSIONS',
      schema: 'EASYBIMA',
      paranoid: true,
      hooks: {
        beforeCreate: async (commission) => {
          // Ensure amount is positive
          if (commission.amount < 0) {
            throw new Error('Commission amount cannot be negative');
          }

          // Set default due date if not provided (30 days from now)
          if (!commission.dueDate) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            commission.dueDate = dueDate;
          }
          
          // Round amount to 2 decimal places
          if (commission.amount) {
            commission.amount = Math.round(commission.amount * 100) / 100;
          }
        }
      },
      scopes: {
        pending: {
          where: { status: 'PENDING' }
        },
        paid: {
          where: { status: 'PAID' }
        },
        approved: {
          where: { status: 'APPROVED' }
        },
        processing: {
          where: { status: 'PROCESSING' }
        },
        byIntermediary: (intermediaryId) => ({
          where: { INTERMEDIARY_ID: intermediaryId }
        }),
        byPeriod: (period) => ({
          where: { PERIOD: period }
        })
      },
      indexes: [
        {
          name: 'IDX_COMMISSION_INTERMEDIARY',
          fields: ['INTERMEDIARY_ID']
        },
        {
          name: 'IDX_COMMISSION_POLICY',
          fields: ['POLICY_ID']
        },
        {
          name: 'IDX_COMMISSION_STATUS',
          fields: ['STATUS']
        },
        {
          name: 'IDX_COMMISSION_TYPE',
          fields: ['COMMISSION_TYPE']
        },
        {
          name: 'IDX_COMMISSION_PAID_DATE',
          fields: ['PAID_DATE']
        },
        {
          name: 'IDX_COMMISSION_DUE_DATE',
          fields: ['DUE_DATE']
        }
      ]
    };

    return super.initModel(attributes, options, sequelize);
  }

  /**
   * Define model associations
   * @param {Object} models - The models object containing all models
   */
  static associate(models) {
    // Commission belongs to an Intermediary
    this.belongsTo(models.Intermediary, {
      foreignKey: 'INTERMEDIARY_ID',
      as: 'intermediary',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    // Commission belongs to a Product
    this.belongsTo(models.Product, {
      foreignKey: 'PRODUCT_ID',
      as: 'product',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    // Commission belongs to a Policy
    this.belongsTo(models.Policy, {
      foreignKey: 'POLICY_ID',
      as: 'policy',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    // Commission is processed by a User
    this.belongsTo(models.User, {
      foreignKey: 'PROCESSED_BY',
      as: 'processor',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Commission is created by a User
    this.belongsTo(models.User, {
      foreignKey: 'CREATED_BY',
      as: 'creator',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // Commission is updated by a User
    this.belongsTo(models.User, {
      foreignKey: 'UPDATED_BY',
      as: 'updater',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
  
  /**
   * Mark the commission as approved
   * @param {string} userId - ID of the user approving the commission
   * @returns {Promise<Commission>} The updated commission
   */
  async approve(userId) {
    return this.update({
      status: 'APPROVED',
      processedBy: userId,
      updatedBy: userId
    });
  }
  
  /**
   * Mark the commission as paid
   * @param {string} paymentReference - Reference for the payment
   * @param {string} userId - ID of the user processing the payment
   * @param {Date} [paymentDate] - Optional date of payment (defaults to now)
   * @returns {Promise<Commission>} The updated commission
   */
  async markAsPaid(paymentReference, userId, paymentDate) {
    return this.update({
      status: 'PAID',
      paymentReference,
      paidDate: paymentDate || new Date(),
      processedBy: userId,
      updatedBy: userId
    });
  }
  
  /**
   * Calculate the commission amount based on a premium and rate
   * @param {number} premium - The premium amount
   * @param {number} rate - The commission rate as a percentage
   * @returns {number} The calculated commission amount
   */
  static calculateCommission(premium, rate) {
    return Math.round((premium * (rate / 100)) * 100) / 100;
  }
  
  /**
   * Get a sanitized version of the commission object
   * @returns {Object} Sanitized commission object
   */
  toJSON() {
    const values = super.toJSON ? super.toJSON() : this.get({ plain: true });
    
    // Remove sensitive or unnecessary data
    delete values.updatedBy;
    
    return values;
  }
}

export { Commission as default };

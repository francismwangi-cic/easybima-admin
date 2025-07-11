import { DataTypes, Model, Op } from "sequelize";

/**
 * Payment model representing payment transactions in the system
 */
class Payment extends Model {
  /**
   * Initialize the Payment model
   * @param {Object} sequelize - Sequelize instance
   * @returns {Model} Initialized Payment model
   */
  static init(sequelize) {
    return super.init(
      {
        // Primary Key
        id: {
          field: "PAYMENT_ID",
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },

        // References
        customerCode: {
          field: "CUSTOMER_CODE",
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: "Unique customer identifier",
        },
        policyId: {
          field: "POLICY_ID",
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: "Policy reference",
        },

        // Payment Details
        amount: {
          field: "AMOUNT",
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          validate: {
            min: 0.01,
          },
        },
        paymentMethod: {
          field: "PAYMENT_METHOD",
          type: DataTypes.ENUM("MPESA", "BANK_TRANSFER", "CASH", "CHEQUE", "CARD"),
          allowNull: false,
        },
        transactionId: {
          field: "TRANSACTION_ID",
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        mpesaCode: {
          field: "MPESA_CODE",
          type: DataTypes.STRING(20),
          allowNull: true,
        },

        // Dates
        paymentDate: {
          field: "PAYMENT_DATE",
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        dueDate: {
          field: "DUE_DATE",
          type: DataTypes.DATE,
          allowNull: true,
        },

        // Status and Type
        status: {
          field: "STATUS",
          type: DataTypes.ENUM(
            "PENDING",
            "COMPLETED",
            "FAILED",
            "CANCELLED",
            "REFUNDED"
          ),
          defaultValue: "PENDING",
        },
        paymentType: {
          field: "PAYMENT_TYPE",
          type: DataTypes.ENUM(
            "DOWN_PAYMENT",
            "INSTALLMENT",
            "FULL_PAYMENT",
            "ADJUSTMENT"
          ),
          defaultValue: "INSTALLMENT",
        },

        // Installment Info
        installmentNumber: {
          field: "INSTALLMENT_NUMBER",
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        // Validation
        validatedBy: {
          field: "VALIDATED_BY",
          type: DataTypes.UUID,
          allowNull: true,
        },
        validatedAt: {
          field: "VALIDATED_AT",
          type: DataTypes.DATE,
          allowNull: true,
        },

        // Notes
        notes: {
          field: "NOTES",
          type: DataTypes.TEXT,
          allowNull: true,
        },

        // Audit Fields
        createdBy: {
          field: "CREATED_BY",
          type: DataTypes.UUID,
          allowNull: false,
        },
        updatedBy: {
          field: "UPDATED_BY",
          type: DataTypes.UUID,
          allowNull: true,
        },
        deletedAt: {
          field: "DELETED_AT",
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        tableName: "VW_PAYMENT",
        schema: "EASYBIMA",
        timestamps: false,
        paranoid: false,
        underscored: true,
        defaultScope: {
          where: {
            INIT: 1, // Only include paid payments
          },
        },
        indexes: [
          {
            name: "IDX_PAYMENTS_TRANSACTION_ID",
            fields: ["TRANSACTION_ID"],
            unique: true,
          },
          {
            name: "IDX_PAYMENTS_MPESA_CODE",
            fields: ["MPESA_CODE"],
          },
          {
            name: "IDX_PAYMENTS_DATE",
            fields: ["PAYMENT_DATE"],
          },
          {
            name: "IDX_PAYMENTS_STATUS",
            fields: ["STATUS"],
          },
        ],
        sequelize,
      }
    );
  }

  /**
   * Define model associations
   * @param {Object} models - Object containing all models
   */
  static associate(models) {
    // Payment belongs to a User (validator)
    this.belongsTo(models.User, {
      foreignKey: "VALIDATED_BY",
      as: "validator",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Payment belongs to a User (creator)
    this.belongsTo(models.User, {
      foreignKey: "CREATED_BY",
      as: "creator",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    // Payment belongs to a User (updater)
    this.belongsTo(models.User, {
      foreignKey: "UPDATED_BY",
      as: "updater",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  }

  /**
   * Find payments by customer code
   * @param {string} customerCode - Customer code to search for
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} Array of payment records
   */
  static async findByCustomerCode(customerCode, options = {}) {
    return await this.findAll({
      where: {
        CUSTOMER_CODE: customerCode,
        INIT: 1, // Ensure only paid payments are returned
      },
      ...options,
    });
  }

  /**
   * Get payment summary for a customer
   * @param {string} customerCode - Customer code to get summary for
   * @returns {Promise<Object>} Payment summary object
   */
  static async getCustomerPaymentSummary(customerCode) {
    const result = await this.findOne({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('PAYMENT_ID')), 'totalPayments'],
        [sequelize.fn('SUM', sequelize.col('AMOUNT')), 'totalAmount'],
      ],
      where: {
        CUSTOMER_CODE: customerCode,
        INIT: 1,
      },
      raw: true,
    });

    return {
      totalPayments: parseInt(result?.totalPayments) || 0,
      totalAmount: parseFloat(result?.totalAmount) || 0,
    };
  }

  /**
   * Mark payment as completed
   * @param {string} transactionId - Transaction ID
   * @param {string} mpesaCode - M-Pesa code (if applicable)
   * @returns {Promise<boolean>} Whether the update was successful
   */
  static async markAsCompleted(transactionId, mpesaCode = null) {
    const [updated] = await this.update(
      {
        status: 'COMPLETED',
        mpesaCode: mpesaCode || undefined,
      },
      {
        where: {
          TRANSACTION_ID: transactionId,
          status: 'PENDING',
        },
      }
    );
    return updated > 0;
  }
}

export default Payment;

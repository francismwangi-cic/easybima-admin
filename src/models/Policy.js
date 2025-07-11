import { DataTypes } from "sequelize";
import BaseModel from "./BaseModel.js";

/**
 * Policy model representing insurance policies in the system
 */
class Policy extends BaseModel {
  /**
   * Initialize the Policy model
   * @param {Object} sequelize - Sequelize instance
   * @returns {Model} Initialized Policy model
   */
  /**
   * Initialize the Policy model
   * @param {Object} sequelize - Sequelize instance
   * @returns {Model} Initialized Policy model
   */
  static init(sequelize) {
    const attributes = {
      // Policy Identification
      id: {
        field: "POLICY_ID",
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: "Unique identifier for the policy"
      },
      policyNumber: {
        field: "POLICY_NUMBER",
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Policy number is required" },
          len: { args: [1, 50], msg: "Policy number must be between 1 and 50 characters" }
        },
        comment: "Unique policy number"
      },

      // References
      quoteId: {
        field: "QUOTE_ID",
        type: DataTypes.UUID,
        allowNull: true,
        comment: "Reference to the original quote"
      },
      clientId: {
        field: "CLIENT_ID",
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Reference to the client who owns this policy"
      },
      productId: {
        field: "PRODUCT_ID",
        type: DataTypes.UUID,
        allowNull: false,
        comment: "Reference to the insurance product"
      },
      intermediaryId: {
        field: "INTERMEDIARY_ID",
        type: DataTypes.UUID,
        allowNull: true,
        comment: "Reference to the intermediary/agent who sold the policy"
      },

      // Financial Details
      sumInsured: {
        field: "SUM_INSURED",
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          min: { args: [0], msg: "Sum insured cannot be negative" },
          isNumeric: { msg: "Sum insured must be a valid number" }
        },
        comment: "Total sum insured amount"
      },
      annualPremium: {
        field: "ANNUAL_PREMIUM",
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: { args: [0], msg: "Annual premium cannot be negative" },
          isNumeric: { msg: "Annual premium must be a valid number" }
        },
        comment: "Total annual premium amount"
      },
      adjustedPremium: {
        field: "ADJUSTED_PREMIUM",
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: { args: [0], msg: "Adjusted premium cannot be negative" },
          isNumeric: { msg: "Adjusted premium must be a valid number" }
        },
        comment: "Premium after any adjustments or discounts"
      },

      // Payment Details
      downPayment: {
        field: "DOWN_PAYMENT",
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
          min: { args: [0], msg: "Down payment cannot be negative" },
          isNumeric: { msg: "Down payment must be a valid number" }
        },
        comment: "Initial down payment amount"
      },
      installmentAmount: {
        field: "INSTALLMENT_AMOUNT",
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: { args: [0], msg: "Installment amount cannot be negative" },
          isNumeric: { msg: "Installment amount must be a valid number" }
        },
        comment: "Amount per installment"
      },
      installmentFrequency: {
        field: "INSTALLMENT_FREQUENCY",
        type: DataTypes.ENUM("MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"),
        defaultValue: "MONTHLY",
        comment: "Frequency of installment payments"
      },

      // Installment Tracking
      totalInstallments: {
        field: "TOTAL_INSTALLMENTS",
        type: DataTypes.INTEGER,
        defaultValue: 12,
        validate: {
          min: { args: [1], msg: "Total installments must be at least 1" },
          isInt: { msg: "Total installments must be an integer" }
        },
        comment: "Total number of installments"
      },
      paidInstallments: {
        field: "PAID_INSTALLMENTS",
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: { args: [0], msg: "Paid installments cannot be negative" },
          isInt: { msg: "Paid installments must be an integer" }
        },
        comment: "Number of installments paid"
      },
      pendingInstallments: {
        field: "PENDING_INSTALLMENTS",
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: { args: [0], msg: "Pending installments cannot be negative" },
          isInt: { msg: "Pending installments must be an integer" }
        },
        comment: "Number of installments pending payment"
      },
      overdueInstallments: {
        field: "OVERDUE_INSTALLMENTS",
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: { args: [0], msg: "Overdue installments cannot be negative" },
          isInt: { msg: "Overdue installments must be an integer" }
        },
        comment: "Number of installments that are overdue"
      },

      // Policy Period
      policyStartDate: {
        field: "POLICY_START_DATE",
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "Policy start date must be a valid date" },
          isBeforeEndDate(value) {
            if (this.policyEndDate && new Date(value) >= new Date(this.policyEndDate)) {
              throw new Error("Policy start date must be before end date");
            }
          }
        },
        comment: "Date when the policy coverage starts"
      },
      policyEndDate: {
        field: "POLICY_END_DATE",
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "Policy end date must be a valid date" },
          isAfterStartDate(value) {
            if (this.policyStartDate && new Date(value) <= new Date(this.policyStartDate)) {
              throw new Error("Policy end date must be after start date");
            }
          }
        },
        comment: "Date when the policy coverage ends"
      },

      // Status and Metadata
      status: {
        field: "STATUS",
        type: DataTypes.ENUM(
          "ACTIVE",
          "LAPSED",
          "CANCELLED",
          "EXPIRED",
          "SUSPENDED"
        ),
        defaultValue: "ACTIVE",
        comment: "Current status of the policy"
      },
      cancellationDate: {
        field: "CANCELLATION_DATE",
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: { msg: "Cancellation date must be a valid date" },
          isAfterStartDate(value) {
            if (this.policyStartDate && new Date(value) < new Date(this.policyStartDate)) {
              throw new Error("Cancellation date cannot be before policy start date");
            }
          }
        },
        comment: "Date when the policy was cancelled"
      },
      cancellationReason: {
        field: "CANCELLATION_REASON",
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Reason for policy cancellation"
      },
      isValued: {
        field: "IS_VALUED",
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Indicates if the policy has been valued"
      },

      // Audit Fields
      createdBy: {
        field: "CREATED_BY",
        type: DataTypes.UUID,
        allowNull: false,
        comment: "User who created the policy"
      },
      updatedBy: {
        field: "UPDATED_BY",
        type: DataTypes.UUID,
        allowNull: true,
        comment: "User who last updated the policy"
      },
      deletedAt: {
        field: "DELETED_AT",
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Timestamp when the policy was soft-deleted"
      }
    };

    const options = {
      modelName: 'Policy',
      tableName: 'POLICIES',
      schema: 'EASYBIMA',
      timestamps: true,
      createdAt: 'CREATED_AT',
      updatedAt: 'UPDATED_AT',
      deletedAt: 'DELETED_AT',
      paranoid: true,
      freezeTableName: true,
      hooks: {
        beforeValidate: (policy) => {
          // Ensure policy number is trimmed and uppercase
          if (policy.policyNumber) {
            policy.policyNumber = policy.policyNumber.trim().toUpperCase();
          }
          
          // Calculate pending installments
          if (policy.totalInstallments !== undefined && policy.paidInstallments !== undefined) {
            policy.pendingInstallments = policy.totalInstallments - policy.paidInstallments;
          }
        },
        beforeUpdate: (policy) => {
          // If status is being updated to CANCELLED, set cancellation date
          if (policy.changed('status') && policy.status === 'CANCELLED' && !policy.cancellationDate) {
            policy.cancellationDate = new Date();
          }
        }
      },
      scopes: {
        active: {
          where: { status: 'ACTIVE' }
        },
        expired: {
          where: { status: 'EXPIRED' }
        },
        cancelled: {
          where: { status: 'CANCELLED' }
        },
        withClient: {
          include: ['client']
        },
        withProduct: {
          include: ['product']
        },
        withPayments: {
          include: ['payments']
        }
      }
    };

    return super.initModel(attributes, options, sequelize);
  }

  /**
   * Define model associations
   * @param {Object} models - Object containing all models
   */
  static associate(models) {
    // Policy belongs to a Client
    this.belongsTo(models.Client, {
      foreignKey: "CLIENT_ID",
      as: "client",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    // Policy belongs to a Product
    this.belongsTo(models.Product, {
      foreignKey: "PRODUCT_ID",
      as: "product",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    // Policy may belong to an Intermediary
    this.belongsTo(models.Intermediary, {
      foreignKey: "INTERMEDIARY_ID",
      as: "intermediary",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Policy may be associated with a Quote
    this.belongsTo(models.Quote, {
      foreignKey: "QUOTE_ID",
      as: "quote",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Policy belongs to a User (creator)
    this.belongsTo(models.User, {
      foreignKey: "CREATED_BY",
      as: "creator",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Policy belongs to a User (updater)
    this.belongsTo(models.User, {
      foreignKey: "UPDATED_BY",
      as: "updater",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Policy has many Documents
    this.hasMany(models.Document, {
      foreignKey: "POLICY_ID",
      as: "documents",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Policy has many Claims
    this.hasMany(models.Claim, {
      foreignKey: "POLICY_ID",
      as: "claims",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Policy has many Payments
    this.hasMany(models.Payment, {
      foreignKey: "POLICY_ID",
      as: "payments",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Policy has many Commissions
    this.hasMany(models.Commission, {
      foreignKey: "POLICY_ID",
      as: "commissions",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }

  /**
   * Instance Methods
   */
  
  /**
   * Calculate the total amount paid for this policy
   * @returns {Promise<number>} Total amount paid
   */
  async calculateTotalPaid() {
    const payments = await this.getPayments({
      where: { status: 'COMPLETED' }
    });
    return payments.reduce((total, payment) => total + parseFloat(payment.amount), 0);
  }

  /**
   * Calculate the outstanding balance for this policy
   * @returns {Promise<number>} Outstanding balance
   */
  async calculateOutstandingBalance() {
    const totalPremium = this.adjustedPremium || this.annualPremium;
    const totalPaid = await this.calculateTotalPaid();
    return Math.max(0, totalPremium - totalPaid);
  }

  /**
   * Check if the policy is active
   * @returns {boolean} True if the policy is active and within the policy period
   */
  isActive() {
    const now = new Date();
    return this.status === 'ACTIVE' && 
           new Date(this.policyStartDate) <= now && 
           new Date(this.policyEndDate) >= now;
  }

  /**
   * Get a safe JSON representation of the policy
   * @returns {Object} Safe policy data
   */
  toJSON() {
    const values = super.toJSON();
    
    // Calculate derived fields
    const totalPremium = this.adjustedPremium || this.annualPremium;
    const totalPaid = this.payments ? 
      this.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0) : 0;
    
    // Add calculated fields
    values.outstandingBalance = Math.max(0, totalPremium - totalPaid);
    values.paymentProgress = totalPremium > 0 ? (totalPaid / totalPremium) * 100 : 0;
    
    // Format dates
    if (values.policyStartDate) values.policyStartDate = values.policyStartDate.toISOString().split('T')[0];
    if (values.policyEndDate) values.policyEndDate = values.policyEndDate.toISOString().split('T')[0];
    if (values.cancellationDate) values.cancellationDate = values.cancellationDate.toISOString().split('T')[0];
    
    // Remove sensitive or unnecessary fields
    delete values.deletedAt;
    
    return values;
  }
}

export { Policy as default };

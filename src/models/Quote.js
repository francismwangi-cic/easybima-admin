import { DataTypes, Model, Op } from "sequelize";
import moment from "moment";

/**
 * Quote model representing insurance quotes in the system
 */
class Quote extends Model {
  static init(sequelize) {
    return super.init(
      {
        // Primary Key
        id: {
          field: "QUOTE_ID",
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          comment: "Unique identifier for the quote",
        },

    // Quote Identification
    quoteNumber: {
      field: "QUOTE_NUMBER",
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
      comment: "Unique quote reference number",
    },

    // References
    clientId: {
      field: "CLIENT_ID",
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "EasyClient",
        key: "CLIENT_ID",
      },
      comment: "Client this quote is for",
    },
    productId: {
      field: "PRODUCT_ID",
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "EasyProduct",
        key: "PRODUCT_ID",
      },
      comment: "Insurance product being quoted",
    },
    intermediaryId: {
      field: "INTERMEDIARY_ID",
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "EasyIntermediary",
        key: "INTERMEDIARY_ID",
      },
      comment: "Intermediary who generated the quote (if any)",
    },

    // Coverage Details
    sumInsured: {
      field: "SUM_INSURED",
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: "Total sum insured for the quote",
    },

    // Premium Calculation
    basePremium: {
      field: "BASE_PREMIUM",
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: "Base premium before adjustments",
    },
    totalPremium: {
      field: "TOTAL_PREMIUM",
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: "Final premium after all adjustments",
    },
    rate: {
      field: "RATE",
      type: DataTypes.DECIMAL(10, 6),
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
      comment: "Rate used for premium calculation (percentage)",
    },

    // Adjustments
    loadings: {
      field: "LOADINGS",
      type: DataTypes.JSON,
      defaultValue: [],
      comment: "Array of loading objects {type, amount, description}",
    },
    discounts: {
      field: "DISCOUNTS",
      type: DataTypes.JSON,
      defaultValue: [],
      comment: "Array of discount objects {type, amount, description}",
    },
    taxes: {
      field: "TAXES",
      type: DataTypes.JSON,
      defaultValue: [],
      comment: "Array of tax objects {type, rate, amount, description}",
    },
    fees: {
      field: "FEES",
      type: DataTypes.JSON,
      defaultValue: [],
      comment: "Array of fee objects {type, amount, description}",
    },

    // Validity Period
    validFrom: {
      field: "VALID_FROM",
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Date when the quote becomes valid",
    },
    validTo: {
      field: "VALID_TO",
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "Date when the quote expires",
    },

    // Status & Lifecycle
    status: {
      field: "STATUS",
      type: DataTypes.ENUM("COMPLETED", "PENDING"),
      defaultValue: "DRAFT",
      allowNull: false,
      comment: "Current status of the quote",
    },

    // Additional Information
    notes: {
      field: "NOTES",
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Internal notes about the quote",
    },
    clientNotes: {
      field: "CLIENT_NOTES",
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notes visible to the client",
    },
    declineReason: {
      field: "DECLINE_REASON",
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Reason for declining the quote (if applicable)",
    },

    // Audit Fields
    convertedAt: {
      field: "CONVERTED_AT",
      type: DataTypes.DATE,
      allowNull: true,
      comment: "When the quote was converted to a policy",
    },
    convertedById: {
      field: "CONVERTED_BY_ID",
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "EasyUser",
        key: "USER_ID",
      },
      comment: "User who converted the quote to a policy",
    },
    approvedAt: {
      field: "APPROVED_AT",
      type: DataTypes.DATE,
      allowNull: true,
      comment: "When the quote was approved",
    },
    approvedById: {
      field: "APPROVED_BY_ID",
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "EasyUser",
        key: "USER_ID",
      },
      comment: "User who approved the quote",
    },
    createdAt: {
      field: "CREATED_AT",
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      field: "UPDATED_AT",
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      field: "DELETED_AT",
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdBy: {
      field: "CREATED_BY",
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "EasyUser",
        key: "USER_ID",
      },
      comment: "User who created the quote",
    },
    updatedBy: {
      field: "UPDATED_BY",
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "EasyUser",
        key: "USER_ID",
      },
      comment: "User who last updated the quote",
    },
      },
      {
        tableName: "EasyQuote",
        schema: "EASYBIMA",
        timestamps: true,
        paranoid: true,
        underscored: true,
        createdAt: "CREATED_AT",
        updatedAt: "UPDATED_AT",
        deletedAt: "DELETED_AT",
        freezeTableName: true,
        sequelize,
        hooks: {
          beforeCreate: async (quote) => {
            // Ensure quote number is uppercase
            if (quote.quoteNumber) {
              quote.quoteNumber = quote.quoteNumber.toUpperCase().trim();
            }

            // Set default validity period (30 days) if not provided
            if (quote.validFrom && !quote.validTo) {
              const validTo = new Date(quote.validFrom);
              validTo.setDate(validTo.getDate() + 30);
              quote.validTo = validTo;
            }

            // Ensure total premium is calculated if not provided
            if (quote.basePremium && !quote.totalPremium) {
              quote.totalPremium = quote.basePremium;

              // Apply discounts
              if (quote.discounts && quote.discounts.length > 0) {
                const totalDiscount = quote.discounts.reduce((sum, discount) => {
                  return sum + (discount.amount || 0);
                }, 0);
                quote.totalPremium = Math.max(0, quote.totalPremium - totalDiscount);
              }

              // Apply loadings
              if (quote.loadings && quote.loadings.length > 0) {
                const totalLoading = quote.loadings.reduce((sum, loading) => {
                  return sum + (loading.amount || 0);
                }, 0);
                quote.totalPremium += totalLoading;
              }

              // Apply taxes
              if (quote.taxes && quote.taxes.length > 0) {
                const totalTax = quote.taxes.reduce((sum, tax) => {
                  if (tax.amount) return sum + tax.amount;
                  if (tax.rate) return sum + quote.totalPremium * (tax.rate / 100);
                  return sum;
                }, 0);
                quote.totalPremium += totalTax;
              }

              // Apply fees
              if (quote.fees && quote.fees.length > 0) {
                const totalFees = quote.fees.reduce((sum, fee) => {
                  return sum + (fee.amount || 0);
                }, 0);
                quote.totalPremium += totalFees;
              }
            }
          }
        }
      });
  }

  /**
   * Define associations
   */
  static associate(models) {
    this.belongsTo(models.Client, {
      foreignKey: "CLIENT_ID",
      as: "client",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    this.belongsTo(models.Product, {
      foreignKey: "PRODUCT_ID",
      as: "product",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    this.belongsTo(models.User, {
      foreignKey: "CREATED_BY",
      as: "creator",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    this.belongsTo(models.User, {
      foreignKey: "APPROVED_BY_ID",
      as: "approver",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    this.belongsTo(models.User, {
      foreignKey: "CONVERTED_BY_ID",
      as: "converter",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    this.hasOne(models.Policy, {
      foreignKey: "QUOTE_ID",
      as: "policy",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  }

  /**
   * Instance method to check if quote is still valid
   * @returns {boolean} Whether the quote is currently valid
   */
  isValid() {
    if (!this.validFrom || !this.validTo) return false;
    
    const now = new Date();
    const validFrom = new Date(this.validFrom);
    const validTo = new Date(this.validTo);
    
    return now >= validFrom && now <= validTo && this.status === 'PENDING';
  }

  /**
   * Instance method to convert quote to policy
   * @param {Object} options - Conversion options
   * @param {string} options.convertedById - ID of user performing the conversion
   * @returns {Promise<Policy>} The newly created policy
   */
  async convertToPolicy({ convertedById } = {}) {
    if (this.status !== 'PENDING') {
      throw new Error('Only pending quotes can be converted to policies');
    }

    if (!this.isValid()) {
      throw new Error('Cannot convert expired or invalid quote');
    }

    // Get models to avoid circular dependency
    const Policy = this.constructor.sequelize.models.Policy;
    
    // Start a transaction
    const transaction = await this.sequelize.transaction();
    
    try {
      // Create the policy
      const policy = await Policy.create(
        {
          clientId: this.clientId,
          productId: this.productId,
          quoteId: this.id,
          policyNumber: `POL-${this.quoteNumber}`,
          startDate: new Date(),
          endDate: this.validTo,
          sumInsured: this.sumInsured,
          basePremium: this.basePremium,
          totalPremium: this.totalPremium,
          status: 'ACTIVE',
          createdBy: convertedById,
        },
        { transaction }
      );

      // Update the quote
      this.status = 'CONVERTED';
      this.convertedAt = new Date();
      this.convertedById = convertedById;
      await this.save({ transaction });

      // Commit the transaction
      await transaction.commit();

      return policy;
    } catch (error) {
      // Rollback the transaction in case of error
      await transaction.rollback();
      throw error;
    }
  }
}

export default Quote;

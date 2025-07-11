import { DataTypes } from "sequelize";

/**
 * Product model factory function
 * @param {Sequelize} sequelize - The Sequelize instance
 * @returns {Model} The Product model
 */
const Product = (sequelize) => {
  const ProductModel = sequelize.define("Product", {
      // Primary Key
      id: {
        field: "PRODUCT_ID",
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: "Unique identifier for the product",
      },

      // Basic Information
      name: {
        field: "NAME",
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
        comment: "Name of the insurance product",
      },
      code: {
        field: "CODE",
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
        validate: {
          isUppercase: true,
          notEmpty: true,
        },
        comment:
          'Unique product code (e.g., "MOTOR-COMP" for Motor Comprehensive)',
      },

      // Categorization
      category: {
        field: "CATEGORY",
        type: DataTypes.ENUM(
          "MOTOR",
          "HEALTH",
          "LIFE",
          "PROPERTY",
          "TRAVEL",
          "MARINE",
          "PERSONAL_ACCIDENT",
          "LIABILITY",
          "BUSINESS_INTERRUPTION",
          "ENGINEERING",
          "AGRICULTURE",
          "CYBER",
          "BOND",
          "FIDELITY",
          "CREDIT",
          "SURETY",
          "MISCELLANEOUS"
        ),
        allowNull: false,
        comment: "Main category of the insurance product",
      },
      subCategory: {
        field: "SUB_CATEGORY",
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Sub-category for more specific classification",
      },

      // Product Details
      description: {
        field: "DESCRIPTION",
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Detailed description of the product",
      },
      shortDescription: {
        field: "SHORT_DESCRIPTION",
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "Brief description for listings and previews",
      },

      // Pricing Information
      baseRate: {
        field: "BASE_RATE",
        type: DataTypes.DECIMAL(10, 4),
        defaultValue: 0,
        validate: {
          min: 0,
        },
        comment: "Base rate used for premium calculation (percentage)",
      },
      minimumPremium: {
        field: "MINIMUM_PREMIUM",
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        validate: {
          min: 0,
        },
        comment: "Minimum premium amount in base currency",
      },
      maximumCover: {
        field: "MAXIMUM_COVER",
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        validate: {
          min: 0,
        },
        comment: "Maximum cover amount in base currency (if applicable)",
      },

      // Coverage Details
      sumInsuredType: {
        field: "SUM_INSURED_TYPE",
        type: DataTypes.ENUM("FIXED", "VARIABLE", "CUSTOM"),
        defaultValue: "VARIABLE",
        allowNull: false,
        comment: "How the sum insured is determined",
      },
      defaultSumInsured: {
        field: "DEFAULT_SUM_INSURED",
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: "Default sum insured for this product",
      },

      // Product Features
      features: {
        field: "FEATURES",
        type: DataTypes.JSON,
        defaultValue: [],
        comment: "Array of feature objects with title and description",
      },
      benefits: {
        field: "BENEFITS",
        type: DataTypes.JSON,
        defaultValue: [],
        comment: "Array of benefit objects with title and description",
      },
      exclusions: {
        field: "EXCLUSIONS",
        type: DataTypes.JSON,
        defaultValue: [],
        comment: "Array of exclusion objects with title and description",
      },
      termsAndConditions: {
        field: "TERMS_AND_CONDITIONS",
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Full terms and conditions for this product",
      },

      // Commission & Pricing
      commissionRate: {
        field: "COMMISSION_RATE",
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
        comment: "Default commission rate for intermediaries (% of premium)",
      },
      taxInclusive: {
        field: "TAX_INCLUSIVE",
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Whether prices include tax",
      },
      taxRate: {
        field: "TAX_RATE",
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
        comment: "Tax rate applicable to this product (% of premium)",
      },

      // Product Lifecycle
      status: {
        field: "STATUS",
        type: DataTypes.ENUM(
          "DRAFT",
          "PENDING_APPROVAL",
          "ACTIVE",
          "INACTIVE",
          "DISCONTINUED",
          "ARCHIVED"
        ),
        defaultValue: "DRAFT",
        allowNull: false,
        comment: "Current status of the product",
      },
      effectiveDate: {
        field: "EFFECTIVE_DATE",
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Date when the product becomes active",
      },
      expiryDate: {
        field: "EXPIRY_DATE",
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: "Date when the product expires or is discontinued",
      },

      // Audit Fields
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
        allowNull: true,
        references: {
          model: "USERS",
          key: "USER_ID",
        },
        comment: "User who created the product",
      },
      updatedBy: {
        field: "UPDATED_BY",
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "USERS",
          key: "USER_ID",
        },
        comment: "User who last updated the product",
      },
      approvedBy: {
        field: "APPROVED_BY",
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "USERS",
          key: "USER_ID",
        },
        comment: "User who approved the product",
      },
      approvedAt: {
        field: "APPROVED_AT",
        type: DataTypes.DATE,
        allowNull: true,
        comment: "When the product was approved",
      },
    },
    {
      tableName: "PRODUCTS",
      timestamps: true,
      paranoid: true,
      underscored: true,
      indexes: [
        { fields: ["CODE"], unique: true },
        { fields: ["CATEGORY"] },
        { fields: ["STATUS"] },
        { fields: ["CREATED_AT"] },
        { fields: ["EFFECTIVE_DATE", "EXPIRY_DATE"] }
      ]
    }
  );

  // Add hooks
  ProductModel.beforeCreate((product) => {
    // Ensure product code is uppercase
    if (product.code) {
      product.code = product.code.toUpperCase().trim();
    }

    // Set default effective date if not provided
    if (!product.effectiveDate) {
      product.effectiveDate = new Date();
    }
  });

  ProductModel.beforeUpdate((product) => {
    // If status is being set to ACTIVE, set approvedAt timestamp
    if (product.status === "ACTIVE" && !product.approvedAt) {
      product.approvedAt = new Date();
    }
  });

  // Add instance method
  ProductModel.prototype.isAvailable = function() {
    const now = new Date();
    const isEffective = !this.effectiveDate || new Date(this.effectiveDate) <= now;
    const isNotExpired = !this.expiryDate || new Date(this.expiryDate) >= now;
    
    return this.status === "ACTIVE" && isEffective && isNotExpired;
  };

  // Define associations
  ProductModel.associate = (models) => {
    // Has many relationships
    ProductModel.hasMany(models.Quote, {
      foreignKey: "PRODUCT_ID",
      as: "quotes"
    });

    ProductModel.hasMany(models.Policy, {
      foreignKey: "PRODUCT_ID",
      as: "policies"
    });

    ProductModel.hasMany(models.Commission, {
      foreignKey: "PRODUCT_ID",
      as: "commissions"
    });

    // Belongs to relationships
    ProductModel.belongsTo(models.User, {
      foreignKey: "CREATED_BY",
      as: "creator"
    });

    ProductModel.belongsTo(models.User, {
      foreignKey: "UPDATED_BY",
      as: "updater"
    });

    ProductModel.belongsTo(models.User, {
      foreignKey: "APPROVED_BY",
      as: "approver"
    });
  };

  return ProductModel;
};

export default Product;

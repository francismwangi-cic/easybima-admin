import { DataTypes } from 'sequelize';
import BaseModel from './BaseModel.js';

/**
 * Claim model representing insurance claims in the system
 * @extends BaseModel
 */
class Claim extends BaseModel {
  /**
   * Initialize the Claim model
   * @param {Object} sequelize - Sequelize instance
   * @returns {Model} Initialized Claim model
   */
  static init(sequelize) {
    const attributes = {
      // Primary Key
      id: {
        field: 'CLAIM_ID',
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Primary key for the claim record'
      },

      // Claim Identification
      claimNumber: {
        field: 'CLAIM_NUMBER',
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        comment: 'Unique claim reference number'
      },
      
      policyId: {
        field: 'POLICY_ID',
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Reference to the policy this claim is for'
      },
      
      clientId: {
        field: 'CLIENT_ID',
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Reference to the client making the claim'
      },

      // Claim Details
      dateOfLoss: {
        field: 'DATE_OF_LOSS',
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Date when the loss/damage occurred'
      },
      
      dateReported: {
        field: 'DATE_REPORTED',
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Date when the claim was first reported'
      },
      
      description: {
        field: 'DESCRIPTION',
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Detailed description of the claim'
      },
      
      location: {
        field: 'LOCATION',
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Location where the incident occurred'
      },

      // Claim Amounts
      estimatedAmount: {
        field: 'ESTIMATED_AMOUNT',
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Initial estimated claim amount'
      },
      
      approvedAmount: {
        field: 'APPROVED_AMOUNT',
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Amount approved for payment'
      },
      
      paidAmount: {
        field: 'PAID_AMOUNT',
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Amount that has been paid out'
      },

      // Claim Status
      status: {
        field: 'STATUS',
        type: DataTypes.ENUM(
          'DRAFT',
          'SUBMITTED',
          'UNDER_REVIEW',
          'APPROVED',
          'REJECTED',
          'PAID',
          'CLOSED'
        ),
        defaultValue: 'DRAFT',
        allowNull: false,
        comment: 'Current status of the claim'
      },
      
      rejectionReason: {
        field: 'REJECTION_REASON',
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for claim rejection if applicable'
      },

      // Claim Processing
      assignedTo: {
        field: 'ASSIGNED_TO',
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'User assigned to handle this claim'
      },
      
      dateAssigned: {
        field: 'DATE_ASSIGNED',
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date when claim was assigned for processing'
      },
      
      dateCompleted: {
        field: 'DATE_COMPLETED',
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date when claim processing was completed'
      },

      // Additional Information
      policeReportNumber: {
        field: 'POLICE_REPORT_NUMBER',
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Police report number if applicable'
      },
      
      isPoliceReport: {
        field: 'IS_POLICE_REPORT',
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether a police report was filed'
      },
      
      metadata: {
        field: 'METADATA',
        type: DataTypes.JSONB,
        allowNull: true,
        comment: 'Additional claim metadata in JSON format',
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
      modelName: 'Claim',
      tableName: 'CLAIMS',
      schema: 'EASYBIMA',
      paranoid: true,
      hooks: {
        beforeCreate: async (claim) => {
          // Generate claim number if not provided
          if (!claim.claimNumber) {
            const prefix = 'CLM-';
            const timestamp = new Date().getTime().toString().slice(-6);
            const random = Math.floor(1000 + Math.random() * 9000);
            claim.claimNumber = `${prefix}${timestamp}${random}`;
          }
          
          // Set default dates if not provided
          if (!claim.dateReported) {
            claim.dateReported = new Date();
          }
        },
        beforeUpdate: async (claim) => {
          // Update date assigned when claim is first assigned
          if (claim.changed('assignedTo') && claim.assignedTo && !claim.dateAssigned) {
            claim.dateAssigned = new Date();
          }
          
          // Update date completed when status changes to CLOSED
          if (claim.changed('status') && claim.status === 'CLOSED' && !claim.dateCompleted) {
            claim.dateCompleted = new Date();
          }
        }
      },
      scopes: {
        // Status-based scopes
        draft: { where: { status: 'DRAFT' } },
        submitted: { where: { status: 'SUBMITTED' } },
        underReview: { where: { status: 'UNDER_REVIEW' } },
        approved: { where: { status: 'APPROVED' } },
        rejected: { where: { status: 'REJECTED' } },
        paid: { where: { status: 'PAID' } },
        closed: { where: { status: 'CLOSED' } },
        
        // Other useful scopes
        byClient: (clientId) => ({ where: { CLIENT_ID: clientId } }),
        byPolicy: (policyId) => ({ where: { POLICY_ID: policyId } }),
        byAssignedUser: (userId) => ({ where: { ASSIGNED_TO: userId } }),
        
        // Date-based scopes
        recent: { order: [['createdAt', 'DESC']], limit: 10 },
        
        // Include related models
        withDetails: {
          include: [
            { association: 'policy' },
            { association: 'client' },
            { association: 'assignedToUser' },
            { association: 'documents' }
          ]
        }
      },
      indexes: [
        {
          name: 'IDX_CLAIM_NUMBER',
          fields: ['CLAIM_NUMBER'],
          unique: true
        },
        {
          name: 'IDX_CLAIM_POLICY',
          fields: ['POLICY_ID']
        },
        {
          name: 'IDX_CLAIM_CLIENT',
          fields: ['CLIENT_ID']
        },
        {
          name: 'IDX_CLAIM_STATUS',
          fields: ['STATUS']
        },
        {
          name: 'IDX_CLAIM_DATE_LOSS',
          fields: ['DATE_OF_LOSS']
        },
        {
          name: 'IDX_CLAIM_DATE_REPORTED',
          fields: ['DATE_REPORTED']
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
    // Claim belongs to a Policy
    this.belongsTo(models.Policy, {
      foreignKey: 'POLICY_ID',
      as: 'policy',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
    
    // Claim belongs to a Client
    this.belongsTo(models.Client, {
      foreignKey: 'CLIENT_ID',
      as: 'client',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
    
    // Claim is assigned to a User (adjuster/processor)
    this.belongsTo(models.User, {
      foreignKey: 'ASSIGNED_TO',
      as: 'assignedToUser',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    
    // Claim has many Documents
    this.hasMany(models.Document, {
      foreignKey: 'CLAIM_ID',
      as: 'documents',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    
    // Claim has many Payments
    this.hasMany(models.Payment, {
      foreignKey: 'CLAIM_ID',
      as: 'payments',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
    
    // Claim is created by a User
    this.belongsTo(models.User, {
      foreignKey: 'CREATED_BY',
      as: 'creator',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    
    // Claim is updated by a User
    this.belongsTo(models.User, {
      foreignKey: 'UPDATED_BY',
      as: 'updater',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
  
  /**
   * Submit the claim for review
   * @param {string} userId - ID of the user submitting the claim
   * @returns {Promise<Claim>} The updated claim
   */
  async submit(userId) {
    if (this.status !== 'DRAFT') {
      throw new Error('Only draft claims can be submitted');
    }
    
    return this.update({
      status: 'SUBMITTED',
      updatedBy: userId
    });
  }
  
  /**
   * Approve the claim
   * @param {number} approvedAmount - The approved claim amount
   * @param {string} userId - ID of the user approving the claim
   * @returns {Promise<Claim>} The updated claim
   */
  async approve(approvedAmount, userId) {
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(this.status)) {
      throw new Error('Only submitted or under review claims can be approved');
    }
    
    return this.update({
      status: 'APPROVED',
      approvedAmount: approvedAmount || this.estimatedAmount,
      assignedTo: userId, // Auto-assign to approver
      updatedBy: userId
    });
  }
  
  /**
   * Reject the claim
   * @param {string} reason - Reason for rejection
   * @param {string} userId - ID of the user rejecting the claim
   * @returns {Promise<Claim>} The updated claim
   */
  async reject(reason, userId) {
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(this.status)) {
      throw new Error('Only submitted or under review claims can be rejected');
    }
    
    if (!reason) {
      throw new Error('Rejection reason is required');
    }
    
    return this.update({
      status: 'REJECTED',
      rejectionReason: reason,
      updatedBy: userId
    });
  }
  
  /**
   * Record a payment against this claim
   * @param {number} amount - The payment amount
   * @param {string} paymentMethod - The payment method used
   * @param {string} reference - Payment reference number
   * @param {string} userId - ID of the user recording the payment
   * @param {string} [notes] - Optional payment notes
   * @returns {Promise<Object>} The created payment record
   */
  async recordPayment(amount, paymentMethod, reference, userId, notes) {
    if (this.status !== 'APPROVED' && this.status !== 'PAID') {
      throw new Error('Only approved or paid claims can receive payments');
    }
    
    const payment = await this.sequelize.models.Payment.create({
      claimId: this.id,
      clientId: this.clientId,
      amount,
      paymentMethod,
      reference,
      notes,
      status: 'COMPLETED',
      createdBy: userId,
      updatedBy: userId
    });
    
    // Update claim's paid amount and status
    const newPaidAmount = (this.paidAmount || 0) + amount;
    let newStatus = this.status;
    
    if (newPaidAmount >= (this.approvedAmount || 0)) {
      newStatus = 'PAID';
    }
    
    await this.update({
      paidAmount: newPaidAmount,
      status: newStatus,
      updatedBy: userId
    });
    
    return payment;
  }
  
  /**
   * Get a sanitized version of the claim object
   * @returns {Object} Sanitized claim object
   */
  toJSON() {
    const values = super.toJSON ? super.toJSON() : this.get({ plain: true });
    
    // Remove sensitive or unnecessary data
    delete values.updatedBy;
    
    return values;
  }
}

export { Claim as default };

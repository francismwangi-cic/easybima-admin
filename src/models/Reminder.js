import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Reminder = sequelize.define('Reminder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    reminderType: {
      type: DataTypes.ENUM('payment_due', 'policy_expiry', 'document_required', 'cancellation_warning'),
      allowNull: false
    },
    triggerDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Days before event to trigger reminder'
    },
    emailEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    smsEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    emailSubject: {
      type: DataTypes.STRING(255)
    },
    emailTemplate: {
      type: DataTypes.TEXT
    },
    smsTemplate: {
      type: DataTypes.TEXT
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  Reminder.associate = (models) => {
    Reminder.belongsTo(models.Product, { foreignKey: 'productId' });
    Reminder.belongsTo(models.User, { foreignKey: 'createdBy' });
  };

  return Reminder;
};

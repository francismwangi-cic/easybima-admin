import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Valuation = sequelize.define('Valuation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    policyId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    valuationDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    valuationAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    valuationType: {
      type: DataTypes.ENUM('market_value', 'replacement_value', 'depreciated_value', 'agreed_value'),
      allowNull: false
    },
    valuerId: {
      type: DataTypes.STRING(100)
    },
    valuerName: {
      type: DataTypes.STRING(100)
    },
    valuerContact: {
      type: DataTypes.STRING(100)
    },
    reportNumber: {
      type: DataTypes.STRING(50)
    },
    reportPath: {
      type: DataTypes.STRING(500)
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'rejected', 'expired'),
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT
    },
    expiryDate: {
      type: DataTypes.DATE
    },
    updatedBy: {
      type: DataTypes.UUID
    }
  });

  Valuation.associate = (models) => {
    Valuation.belongsTo(models.Policy, { foreignKey: 'policyId' });
    Valuation.belongsTo(models.User, { foreignKey: 'updatedBy' });
  };

  return Valuation;
};

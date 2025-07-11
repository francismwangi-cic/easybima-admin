import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Intermediary = sequelize.define('Intermediary', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('agent', 'broker', 'bancassurance', 'direct'),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true
      }
    },
    phoneNumber: {
      type: DataTypes.STRING(20)
    },
    address: {
      type: DataTypes.TEXT
    },
    licenseNumber: {
      type: DataTypes.STRING(50)
    },
    licenseExpiryDate: {
      type: DataTypes.DATE
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    }
  });

  Intermediary.associate = (models) => {
    Intermediary.hasMany(models.Quote, { foreignKey: 'intermediaryId' });
    Intermediary.hasMany(models.Policy, { foreignKey: 'intermediaryId' });
    Intermediary.hasMany(models.Commission, { foreignKey: 'intermediaryId' });
  };

  return Intermediary;
};

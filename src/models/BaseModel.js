import { Model } from 'sequelize';

/**
 * Base model that all other models will extend
 * Provides common functionality and configuration
 */
class BaseModel extends Model {
  /**
   * Initialize the model with common configuration
   * @param {Object} attributes - Model attributes/fields
   * @param {Object} options - Model options
   * @param {Object} sequelize - Sequelize instance
   */
  static initModel(attributes, options, sequelize) {
    const defaultOptions = {
      timestamps: true,
      paranoid: true,
      underscored: true,
      freezeTableName: true,
      schema: process.env.DB_USER, // Use the DB_USER as schema
      ...options,
    };

    return super.init(attributes, {
      ...defaultOptions,
      sequelize,
    });
  }

  /**
   * Find a record by ID or throw an error if not found
   * @param {string|number} id - The ID to find
   * @param {Object} options - Additional query options
   * @returns {Promise<Model>} The found record
   * @throws {Error} If record not found
   */
  static async findByIdOrFail(id, options = {}) {
    const record = await this.findByPk(id, options);
    if (!record) {
      const modelName = this.name;
      throw new Error(`${modelName} with ID ${id} not found`);
    }
    return record;
  }
}

export default BaseModel;

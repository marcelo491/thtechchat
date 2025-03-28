import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tasks", "completed", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tasks", "completed");
  }
};

import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Queues", "startTime"),
      queryInterface.removeColumn("Queues", "endTime"),
      queryInterface.removeColumn("Queues", "lunchTime"),
      queryInterface.removeColumn("Queues", "afterLunchTime"),
      queryInterface.removeColumn("Queues", "outOfHoursMessage")
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Queues", "startTime", {
        type: DataTypes.STRING,
        defaultValue: null
      }),
      queryInterface.addColumn("Queues", "endTime", {
        type: DataTypes.STRING,
        defaultValue: null
      }),
      queryInterface.addColumn("Queues", "lunchTime", {
        type: DataTypes.STRING,
        defaultValue: null
      }),
      queryInterface.addColumn("Queues", "afterLunchTime", {
        type: DataTypes.STRING,
        defaultValue: null
      }),
      queryInterface.addColumn("Queues", "outOfHoursMessage", {
        type: DataTypes.TEXT,
        defaultValue: null
      })
    ]);
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("password_resets", "expiresAt", {
      type: Sequelize.DataTypes.STRING,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("password_resets", "expiresAt");
  },
};

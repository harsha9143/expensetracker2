const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "full_stack_expense_tracker",
  "root",
  "vm4udte@W",
  {
    host: "localhost",
    dialect: "mysql",
  }
);

(async () => {
  try {
    await sequelize.authenticate();

    console.log("database connected successfully");
  } catch (error) {
    console.log("error occured", error.message);
  }
})();

module.exports = sequelize;

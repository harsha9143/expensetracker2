const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
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

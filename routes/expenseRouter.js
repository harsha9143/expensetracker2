const express = require("express");

const expensesController = require("../controllers/expenseController");
const { authenticationToken } = require("../middleware/authenticateToken");

const expenseRouter = express.Router();

expenseRouter.get("/", expensesController.getHomePage);
expenseRouter.post("/", authenticationToken, expensesController.addExpense);
expenseRouter.get(
  "/items",
  authenticationToken,
  expensesController.getExpenses
);
expenseRouter.get(
  "/user-type",
  authenticationToken,
  expensesController.getUserType
);
expenseRouter.get(
  "/user-wise-expenses",
  authenticationToken,
  expensesController.getUserWiseExpenses
);

expenseRouter.delete(
  "/remove-expense",
  authenticationToken,
  expensesController.removeExpense
);

expenseRouter.post(
  "/download",
  authenticationToken,
  expensesController.downloadExpenses
);

module.exports = expenseRouter;

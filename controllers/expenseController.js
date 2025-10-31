const path = require("path");
const Expense = require("../models/expense");
const { getCategory } = require("../services/genaiService");
const User = require("../models/user");
const { literal } = require("sequelize");
const sequelize = require("../utils/databaseUtil");
const { uploadToS3 } = require("../services/s3Service");
const Download = require("../models/download");

exports.getHomePage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "expenses.html"));
};

exports.addExpense = async (req, res) => {
  const { price, description } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const category = await getCategory(description);

    const expense = await Expense.create(
      {
        price,
        description,
        category,
        userId: req.user.id,
      },
      { transaction }
    );

    if (!expense) {
      await transaction.rollback();
      return res.status(401).json({ message: "Failed to add expense" });
    }

    const user = await User.findByPk(req.user.id);
    user.totalExpenses = Number(user.totalExpenses) + Number(price);

    await user.save({ transaction });
    await transaction.commit();
    res.status(201).json({ message: "expense added successfully" });
  } catch (error) {
    await transaction.rollback();
    console.log("Error while adding expense>>>>>", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 5;
    const offset = (page - 1) * limit;
    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: {
        userId: req.user.id,
      },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    if (!expenses) {
      return res
        .status(400)
        .json({ message: "Items cannot be fetched at this moment" });
    }

    res.status(200).json({
      expenses,
      pagination: {
        currentPage: page,
        hasNextPage: page * limit < count,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        nextPage: page + 1,
        lastPage: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.downloadExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: {
        userId: req.user.id,
      },
    });
    const stringifiedExpenses = JSON.stringify(expenses);
    const fileName = `expenses${req.user.id}/${new Date()}.txt`;
    const fileURL = await uploadToS3(stringifiedExpenses, fileName);
    if (fileURL) {
      await Download.create({ url: fileURL, userId: req.user.id });
      return res.status(200).json({ url: fileURL, success: true });
    }
    res.status(400).json({ message: "Error occured......cannot download" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server not responding. Cannot download file" });
  }
};

exports.removeExpense = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const remove_expense = await Expense.findOne({
      where: { id: req.body.id, userId: req.user.id },
    });

    if (!remove_expense) {
      return res
        .status(400)
        .json({ message: "item cannot be deleted at the moment" });
    }

    const user = await User.findByPk(req.user.id);

    user.totalExpenses =
      Number(user.totalExpenses) - Number(remove_expense.price);

    await user.save({ transaction });

    await remove_expense.destroy({ transaction });
    await transaction.commit();

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.getUserType = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
  }
};

exports.getUserWiseExpenses = async (req, res) => {
  try {
    const userExpenses = await User.findAll({
      attributes: ["id", "name", "totalExpenses"],
      order: [[literal("totalExpenses"), "DESC"]],
    });

    if (!userExpenses || userExpenses.length === 0) {
      return res.status(400).json({ message: "leaderboard cannot be fetched" });
    }

    res.status(200).json(userExpenses);
  } catch (error) {
    console.log("error occured>>>>>", error.message);
  }
};

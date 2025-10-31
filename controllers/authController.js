//core modules
const path = require("path");

//third party modules
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4 } = require("uuid");
require("dotenv").config();

//local modules
const User = require("../models/user");
const { resetPasswordUtil } = require("../utils/resetPasswordUtil");
const PasswordReset = require("../models/passwordReset");
const sequelize = require("../utils/databaseUtil");

exports.signupPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "signup.html"));
};

exports.addUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const transaction = await sequelize.transaction();

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "password does not match" });
    }

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (user) {
      return res
        .status(401)
        .json({ message: "User with email already exists" });
    }

    const hashedPassowrd = await bcrypt.hash(password, 10);

    const newUser = await User.create(
      {
        name,
        email,
        password: hashedPassowrd,
      },
      { transaction }
    );

    if (!newUser) {
      return res.status(502).json({ message: "User creation failed" });
    }
    await transaction.commit();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    await transaction.rollback();
    console.log("error creating user", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.loginPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "login.html"));
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("backend started");

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User does not exist/invalid email" });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    console.log("backend started 2");

    console.log(
      "API keys",
      process.env.JWT_SECRET_KEY,
      process.env.JWT_EXPIRES_IN
    );

    const token = jwt.sign(
      { id: user.id, email, name: user.name },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.log("login failed>>>>>>>>", error.message);
    res.status(500).json({ message: "login failed due to server error" });
  }
};

exports.forgotPasswordPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "resetPasswordLink.html"));
};

exports.resetPassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    const uuid = v4();

    const trans = await resetPasswordUtil(uuid, user.name, user.email);

    if (!trans) {
      return res.status(500).json({ message: "Internal server error" });
    }

    await PasswordReset.create(
      {
        uuid,
        userId: user.id,
        isActive: "YES",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    await transaction.rollback();
    console.log(error.message);
  }
};

exports.resetPasswordPage = async (req, res) => {
  try {
    const resetData = await PasswordReset.findByPk(req.query.uuid);

    if (!resetData) {
      return res
        .status(401)
        .send(`<h1 style="color: blue;">Reset Link Expired</h1>`);
    }

    res.sendFile(path.join(__dirname, "../views", "resetPassword.html"));
  } catch (error) {
    res.status(500).send("Server Error!! try again later");
  }
};

exports.setNewPassword = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { password, confirmPassword, uuid } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password does not match!!!" });
    }

    const active = await PasswordReset.findByPk(uuid);

    if (!active) {
      return res.status(419).send("Session Timeout");
    }

    const user = await User.findByPk(active.userId);

    if (!user) {
      return res.status(400).send("User not found");
    }

    const sameAsOld = await bcrypt.compare(password, user.password);

    if (sameAsOld) {
      return res
        .status(400)
        .json({ message: "password cannot be same as old password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save({ transaction });

    await active.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).send("Internal server error");
  }
};

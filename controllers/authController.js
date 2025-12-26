//core modules
const path = require("path");

//third party modules
const bcrypt = require("bcrypt");
const mongodb = require("mongodb");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//local modules
const User = require("../models/user");
const { resetPasswordUtil } = require("../utils/resetPasswordUtil");
const sequelize = require("../utils/databaseUtil");
const PasswordReset = require("../models/passwordReset");

exports.signupPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "signup.html"));
};

exports.addUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "password does not match" });
    }

    const user = await User.findOne({ email: email });

    if (user) {
      return res
        .status(401)
        .json({ message: "User with email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
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

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User does not exist/invalid email" });
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

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
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    const trans = await resetPasswordUtil(
      user._id.toString(),
      user.name,
      user.email
    );

    if (!trans) {
      return res.status(500).json({ message: "Internal server error" });
    }

    const passwordReset = new PasswordReset({
      userId: new mongodb.ObjectId(user._id.toString()),
    });
    await passwordReset.save();

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.log(error.message);
  }
};

exports.resetPasswordPage = async (req, res) => {
  try {
    const resetData = await PasswordReset.find({
      _id: new mongodb.ObjectId(req.query.uuid),
    });

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
  try {
    const { password, confirmPassword, uuid } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password does not match!!!" });
    }

    const resetData = await PasswordReset.find({
      _id: new mongodb.ObjectId(req.query.uuid),
    });

    if (!resetData) {
      return res.status(419).send("Session Timeout");
    }

    const user = await User.find(resetData.userId);

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

    await user.save();

    await resetData.destroy();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};

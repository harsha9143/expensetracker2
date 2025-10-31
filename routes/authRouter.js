const express = require("express");

const authController = require("../controllers/authController");

const authRouter = express.Router();

authRouter.get("/sign-up", authController.signupPage);
authRouter.post("/sign-up", authController.addUser);
authRouter.get("/login", authController.loginPage);
authRouter.post("/login", authController.loginUser);
authRouter.get("/forgot-password", authController.forgotPasswordPage);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.get("/password-reset", authController.resetPasswordPage);
authRouter.put("/set-new-password", authController.setNewPassword);

module.exports = authRouter;

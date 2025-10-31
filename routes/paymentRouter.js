const express = require("express");

const paymentController = require("../controllers/paymentController");
const { authenticationToken } = require("../middleware/authenticateToken");

const paymentRouter = express.Router();

paymentRouter.get("/", paymentController.paymentPage);
paymentRouter.post("/", authenticationToken, paymentController.processPayment);
paymentRouter.get("/payment-status/:orderId", paymentController.paymentStatus);

module.exports = paymentRouter;

const path = require("path");
const mongodb = require("mongodb");
const Payment = require("../models/payment");
const {
  createOrder,
  getPaymentStatus,
} = require("../services/cashfreeService");
const User = require("../models/user");

exports.paymentPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "payments.html"));
};

exports.processPayment = async (req, res) => {
  try {
    const orderId = "ORDER-" + Date.now();
    const orderAmount = 2000;
    const orderCurrency = "INR";
    const customerId = "1";
    const customerPhone = "9876543210";

    const paymentSessionId = await createOrder(
      orderId,
      orderAmount,
      orderCurrency,
      customerId,
      customerPhone
    );

    const payment = new Payment({
      orderId,
      paymentSessionId,
      orderAmount,
      orderCurrency,
      paymentStatus: "PENDING",
      userId: new mongodb.ObjectId(req.user.id),
    });

    if (!payment) {
      console.log("Error Occured");
      return;
    }

    res.status(201).json({ paymentSessionId, orderId });
  } catch (error) {
    console.log(error.message);
  }
};

exports.paymentStatus = async (req, res) => {
  try {
    const payment_status = await getPaymentStatus(req.params.orderId);

    const payment = await Payment.findOne({
      orderId: req.params.orderId,
    });

    payment.paymentStatus = payment_status;

    const statusUpdate = await payment.save();

    if (!statusUpdate) {
      return res.status(400).send(`<h2>Payment Status</h2>
      <p>Order ID: ${req.params.orderId}</p>
      <p>Status: ${payment_status}</p>
      <a href="http://13.233.234.203/expenses">Back to Home</a>`);
    }

    if (payment_status === "Success") {
      const user = await User.findById({
        _id: new mongodb.ObjectId(payment.userId),
      });
      user.isPremium = "YES";
      await user.save();
    }

    return res.status(200).send(`<h2>Payment Status</h2>
      <p>Order ID: ${req.params.orderId}</p>
      <p>Status: ${payment_status}</p>
      <a href="http://13.233.234.203/expenses">Back to Home</a>`);
  } catch (error) {
    console.log(error.message);
  }
};

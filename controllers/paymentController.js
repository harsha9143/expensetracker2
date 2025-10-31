const path = require("path");
const Payment = require("../models/payment");
const {
  createOrder,
  getPaymentStatus,
} = require("../services/cashfreeService");
const User = require("../models/user");
const sequelize = require("../utils/databaseUtil");

exports.paymentPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "payments.html"));
};

exports.processPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
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

    console.log(paymentSessionId);

    const payment = await Payment.create(
      {
        orderId,
        paymentSessionId,
        orderAmount,
        orderCurrency,
        paymentStatus: "PENDING",
        userId: req.user.id,
      },
      { transaction }
    );

    if (!payment) {
      console.log("Error Occured");
      await transaction.rollback();
      return;
    }

    await transaction.commit();

    res.status(201).json({ paymentSessionId, orderId });
  } catch (error) {
    await transaction.rollback();
    console.log(error.message);
  }
};

exports.paymentStatus = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const payment_status = await getPaymentStatus(req.params.orderId);

    const payment = await Payment.findOne({
      where: {
        orderId: req.params.orderId,
      },
    });

    payment.paymentStatus = payment_status;

    const statusUpdate = await payment.save({ transaction });

    if (!statusUpdate) {
      await transaction.rollback();
      return res.status(400).send(`<h2>Payment Status</h2>
      <p>Order ID: ${req.params.orderId}</p>
      <p>Status: ${payment_status}</p>
      <a href="a href="http://localhost:${process.env.PORT}/expenses">Back to Home</a>`);
    }

    if (payment_status === "Success") {
      await User.update(
        { isPremiumUser: "YES" },
        {
          where: {
            id: payment.userId,
          },
          transaction,
        }
      );
    }

    await transaction.commit();

    return res.status(200).send(`<h2>Payment Status</h2>
      <p>Order ID: ${req.params.orderId}</p>
      <p>Status: ${payment_status}</p>
      <a href="http://localhost:${process.env.PORT}/expenses">Back to Home</a>`);
  } catch (error) {
    await transaction.rollback();
    console.log(error.message);
  }
};

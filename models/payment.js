const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  paymentSessionId: {
    type: String,
    required: true,
  },
  orderAmount: {
    type: Number,
    required: true,
  },
  orderCurrency: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

module.exports = mongoose.model("Payment", paymentSchema);

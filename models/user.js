const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isPremiumUser: {
    type: String,
    required: true,
    default: "NO",
  },
  totalExpenses: {
    type: Number,
    min: 0,
  },
});

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const PasswordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  isActive: {
    type: String,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("PasswordReset", PasswordResetSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verifyOTP: {
      type: String
    },
    verifyOTPExpires: {
      type: Date
    }
  },
  { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
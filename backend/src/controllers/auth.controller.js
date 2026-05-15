const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const foodPartnerModel = require("../models/foodpartner.model");
const {sendOTPByEmail} = require("../services/email.service");

async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "User Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    //otp will expire in 10 mins
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const user = await userModel.create({
      fullName,
      email,
      password: hashedPassword,
      verifyOTP: otp,
      verifyOTPExpires: otpExpires,
    });

    // Send OTP to user's email
    await sendOTPByEmail(email, otp);

    res.status(201).json({
      message: "Registration successful. Please verify your email to login",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}


// Shared OTP verification logic
async function _verifyEmail(model, req, res) {
  const { email, otp } = req.body;
  try {
    const account = await model.findOne({ email });
    if (!account) {
      return res.status(400).json({ message: "Account not found" });
    }
    if (account.verifyOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (account.verifyOTPExpires < Date.now()) {
      return res.status(400).json({ message: "OTP has expired. Please resend a new one." });
    }
    account.isEmailVerified = true;
    account.verifyOTP = undefined;
    account.verifyOTPExpires = undefined;
    await account.save();
    return res.status(200).json({ message: "Email verified successfully. You can now login." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

// Shared OTP resend logic
async function _resendOTP(model, req, res) {
  const { email } = req.body;
  try {
    const account = await model.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    if (account.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    account.verifyOTP = otp;
    account.verifyOTPExpires = otpExpires;
    await account.save();
    await sendOTPByEmail(email, otp);
    return res.status(200).json({ message: "A new OTP has been sent to your email." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

async function verifyUserEmail(req, res)    { return _verifyEmail(userModel, req, res); }
async function verifyPartnerEmail(req, res) { return _verifyEmail(foodPartnerModel, req, res); }
async function resendUserOTP(req, res)      { return _resendOTP(userModel, req, res); }
async function resendPartnerOTP(req, res)   { return _resendOTP(foodPartnerModel, req, res); }

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email first",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true, // JS cannot read cookie
      secure: true,
      sameSite: "none", // required for cross-domain
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });

    res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

function logoutUser(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({
      message: "User Logged Out Successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

async function registerFoodPartner(req, res) {
  try {
    const { businessName, ownerName, phone, address, email, password } = req.body;

    const isPartnerAlreadyExists = await foodPartnerModel.findOne({ email });
    if (isPartnerAlreadyExists) {
      return res.status(400).json({
        message: "Food Partner Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const foodPartner = await foodPartnerModel.create({
      businessName,
      ownerName,
      phone,
      address,
      email,
      password: hashedPassword,
      verifyOTP: otp,
      verifyOTPExpires: otpExpires,
    });

    await sendOTPByEmail(email, otp);

    res.status(201).json({
      message: "Registration successful. Please verify your email to login.",
      foodPartner: {
        id: foodPartner._id,
        businessName: foodPartner.businessName,
        email: foodPartner.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

async function loginFoodPartner(req, res) {
  try {
    const { email, password } = req.body;

    const foodPartner = await foodPartnerModel.findOne({ email });
    if (!foodPartner) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    if (!foodPartner.isEmailVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email first",
      });
    }

    if (!foodPartner.password) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, foodPartner.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const token = jwt.sign({ id: foodPartner._id }, process.env.JWT_SECRET);

    res.cookie("token", token, {
      httpOnly: true, // JS cannot read cookie
      secure: true,
      sameSite: "none", // required for cross-domain
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });

    res.status(200).json({
      message: "Logged in successfully",
      foodPartner: {
        id: foodPartner._id,
        email: foodPartner.email,
        name: foodPartner.name,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

//Google OAuth login/signup
function googleAuthCallback(req, res) {
  try {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, //1 week
    });
    res.redirect(`${process.env.FRONTEND_URL}/saved`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

function logoutFoodPartner(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.status(200).json({
      message: "Food Partner Logged Out Successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

module.exports = {
  registerUser,
  verifyUserEmail,
  resendUserOTP,
  loginUser,
  logoutUser,
  registerFoodPartner,
  verifyPartnerEmail,
  resendPartnerOTP,
  loginFoodPartner,
  logoutFoodPartner,
  googleAuthCallback,
};

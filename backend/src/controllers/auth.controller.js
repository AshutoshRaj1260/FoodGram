const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const foodPartnerModel = require("../models/foodpartner.model");

const accessTokenOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

const refreshTokenOptions = {
  ...accessTokenOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function issueTokens(res, id) {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);
}

async function registerUser(req, res, next) {
  try {
  const { fullName, email, password } = req.body;

  const isUserAlreadyExists = await userModel.findOne({
    email,
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "User Already Exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    fullName,
    email,
    password: hashedPassword,
  });

  issueTokens(res, user._id);

  res.status(201).json({
    message: "User Registered Successfully",
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
  } catch (error) {
    next(error);
  }
}

async function loginUser(req, res, next) {
  try {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email,
  });
  if (!user) {
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
  issueTokens(res, user._id);

  res.status(200).json({
    message: "User Logged In Successfully",
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
  } catch (error) {
    next(error);
  }
}

function logoutUser(req, res, next) {
  try {
  res.clearCookie("token", accessTokenOptions);
  res.clearCookie("refreshToken", refreshTokenOptions);
  res.status(200).json({
    message: "User Logged Out Successfully",
  });
  } catch (error) {
    next(error);
  }
}

async function registerFoodPartner(req, res, next) {
  try {
  const { businessName, ownerName, phone, address, email, password } = req.body;

  const isPartnerAlreadyExists = await foodPartnerModel.findOne({
    email,
  });
  if (isPartnerAlreadyExists) {
    return res.status(400).json({
      message: "Food Partner Already Exists",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const foodPartner = await foodPartnerModel.create({
    businessName,
    ownerName,
    phone,
    address,
    email,
    password: hashedPassword,
  });

  issueTokens(res, foodPartner._id);

  res.status(201).json({
    message: "Food Partner Registered Successfully",
    foodPartner: {
      id: foodPartner._id,
      businessName: foodPartner.businessName,
      email: foodPartner.email,
    },
  });
  } catch (error) {
    next(error);
  }
}

async function loginFoodPartner(req, res, next) {
  try {
  const { email, password } = req.body;
  const foodPartner = await foodPartnerModel.findOne({
    email,
  });
  if (!foodPartner) {
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
  issueTokens(res, foodPartner._id);

  res.status(200).json({
    message: "Food Partner Logged In Successfully",
    foodPartner: {
      id: foodPartner._id,
      email: foodPartner.email,
      name: foodPartner.name,
    },
  });
  } catch (error) {
    next(error);
  }
}

//Google OAuth login/signup
function googleAuthCallback(req, res, next) {
  try {
  issueTokens(res, req.user._id);
  const frontendUrl = process.env.FRONTEND_URL || "";
  res.redirect(`${frontendUrl}/home`);
  } catch (error) {
    next(error);
  }
}

function logoutFoodPartner(req, res, next) {
  try {
  res.clearCookie("token", accessTokenOptions);
  res.clearCookie("refreshToken", refreshTokenOptions);
  res.status(200).json({
    message: "Food Partner Logged Out Successfully",
  });
  } catch (error) {
    next(error);
  }
}

function refreshToken(req, res) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("token", accessToken, accessTokenOptions);
    return res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  registerFoodPartner,
  loginFoodPartner,
  logoutFoodPartner,
  googleAuthCallback,
  refreshToken,
};

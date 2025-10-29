const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const foodPartnerModel = require("../models/foodpartner.model");

async function registerUser(req, res) {
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

  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("token", token, {
    httpOnly: true, // JS cannot read cookie
    secure: true,
    sameSite: "none", // required for cross-domain
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  });

  res.status(201).json({
    message: "User Registered Successfully",
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
}

async function loginUser(req, res) {
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
  const token = jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET
  );
  res.cookie("token", token, {
    httpOnly: true, // JS cannot read cookie
    secure: true,
    sameSite: "none", // required for cross-domain
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  });
  res.status(200).json({
    message: "User Logged In Successfully",
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
    },
  });
}

function logoutUser(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({
    message: "User Logged Out Successfully",
  });
}

async function registerFoodPartner(req, res) {
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

  const token = jwt.sign(
    {
      id: foodPartner._id,
    },
    process.env.JWT_SECRET
  );

  res.cookie("token", token, {
    httpOnly: true, // JS cannot read cookie
    secure: true,
    sameSite: "none", // required for cross-domain
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  });
  res.status(201).json({
    message: "Food Partner Registered Successfully",
    foodPartner: {
      id: foodPartner._id,
      businessName: foodPartner.businessName,
      email: foodPartner.email,
    },
  });
}

async function loginFoodPartner(req, res) {
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
  const token = jwt.sign(
    {
      id: foodPartner._id,
    },
    process.env.JWT_SECRET
  );
  res.cookie("token", token, {
    httpOnly: true, // JS cannot read cookie
    secure: true,
    sameSite: "none", // required for cross-domain
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  });
  res.status(200).json({
    message: "Food Partner Logged In Successfully",
    foodPartner: {
      id: foodPartner._id,
      email: foodPartner.email,
      name: foodPartner.name,
    },
  });
}

function logoutFoodPartner(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({
    message: "Food Partner Logged Out Successfully",
  });
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  registerFoodPartner,
  loginFoodPartner,
  logoutFoodPartner,
};

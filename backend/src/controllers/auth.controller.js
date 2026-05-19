const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const foodPartnerModel = require("../models/foodpartner.model");

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

const setCookies = (res, accessToken, refreshToken) => {
  // Use HTTPS if FRONTEND_URL starts with https:// OR if NODE_ENV is production
  const isSecure = process.env.FRONTEND_URL?.startsWith('https') || process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000,
  };
  
  res.cookie('accessToken', accessToken, cookieOptions);
  
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

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

  const { accessToken, refreshToken } = generateTokens(user._id);
  setCookies(res, accessToken, refreshToken);

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
  const { accessToken, refreshToken } = generateTokens(user._id);
  setCookies(res, accessToken, refreshToken);

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
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
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

  const { accessToken, refreshToken } = generateTokens(foodPartner._id);
  setCookies(res, accessToken, refreshToken);

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
  const { accessToken, refreshToken } = generateTokens(foodPartner._id);
  setCookies(res, accessToken, refreshToken);

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
function googleAuthCallback(req, res) {
  const token = jwt.sign(
    {
      id: req.user._id,
    },
    process.env.JWT_SECRET
  );
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //1 week
  });
  
  const frontendUrl = process.env.FRONTEND_URL || "";
  res.redirect(`${frontendUrl}/saved`);
}

function logoutFoodPartner(req, res, next) {
  try {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({
    message: "Food Partner Logged Out Successfully",
  });
  } catch (error) {
    next(error);
  }
}

async function refreshToken(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    next(error);
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

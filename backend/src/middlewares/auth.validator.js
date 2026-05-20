const { body, validationResult } = require("express-validator");

const passwordValidation = body("password")
  .trim()
  .isLength({ min: 8, max: 64 })
  .withMessage("Password must be between 8 and 64 characters long")
  .matches(/[A-Z]/)
  .withMessage("Password must contain at least one uppercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must contain at least one number")
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage("Password must contain at least one special character");

const emailValidation = body("email")
  .trim()
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Enter a valid email address")
  .normalizeEmail();

const loginValidation = [
  emailValidation,
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
];

const userRegisterValidation = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  emailValidation,
  passwordValidation,
];

const foodPartnerRegisterValidation = [
  body("businessName")
    .trim()
    .notEmpty()
    .withMessage("Business name is required"),
  body("ownerName")
    .trim()
    .notEmpty()
    .withMessage("Owner name is required"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage("Enter a valid phone number"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),
  emailValidation,
  passwordValidation,
];

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorList = errors.array();

    return res.status(400).json({
      success: false,
      message: errorList[0].msg,
      errors: errorList,
    });
  }

  next();
};

module.exports = {
  userRegisterValidation,
  foodPartnerRegisterValidation,
  loginValidation,
  validate,
};

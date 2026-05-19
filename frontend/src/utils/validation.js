export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^[0-9+\-\s()]{7,15}$/;

export const passwordRules = [
  {
    test: (value) => value.length >= 8,
    message: "Password must be at least 8 characters.",
  },
  {
    test: (value) => /[A-Z]/.test(value),
    message: "Password must include an uppercase letter.",
  },
  {
    test: (value) => /[0-9]/.test(value),
    message: "Password must include a number.",
  },
  {
    test: (value) => /[^A-Za-z0-9]/.test(value),
    message: "Password must include a special character.",
  },
];

export const validateRequired = (value, label) =>
  value.trim() ? "" : `${label} is required.`;

export const validateEmail = (value) => {
  if (!value.trim()) return "Email is required.";
  return emailPattern.test(value.trim()) ? "" : "Enter a valid email address.";
};

export const validatePassword = (value, { strict = false } = {}) => {
  if (!value) return "Password is required.";
  if (!strict) return "";

  const failedRule = passwordRules.find((rule) => !rule.test(value));
  return failedRule?.message || "";
};

export const validatePhone = (value) => {
  if (!value.trim()) return "Phone number is required.";
  return phonePattern.test(value.trim())
    ? ""
    : "Enter a valid phone number.";
};

export const hasErrors = (errors) => Object.values(errors).some(Boolean);

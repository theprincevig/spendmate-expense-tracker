import { validateEmail, validatePassword } from "../lib/validators";

export const validateSignup = (formData) => {
  const errors = {
    username: "",
    email: "",
    password: "",
  };

  // Email
  if (!formData.email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (!validatePassword(formData.password)) {
    errors.password = "Password must be at least 8 characters long";
  }

  return errors;
};

export const validateLogin = (formData) => {
  const errors = {
    email: "",
    password: "",
  };

  if (!validateEmail(formData.email)) {
    errors.email = "Email is required";
  }

  if (!validatePassword(formData.password)) {
    errors.password = "Password is required";
  }

  return errors;
};

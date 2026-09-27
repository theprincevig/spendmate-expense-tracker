import { validatePassword } from "../lib/validators";

export const validateChangePassword = (passwordData) => {
  const errors = {
    current: "",
    new: "",
    confirm: "",
  };

  // Current
  if (!passwordData.current.trim()) {
    errors.current = "Current password is required";
  }

  // New
  if (!passwordData.new.trim()) {
    errors.new = "New password is required";
  } else if (!validatePassword(passwordData.new)) {
    errors.new = "Password must be at least 8 characters";
  }

  // Confirm
  if (!passwordData.confirm.trim()) {
    errors.confirm = "Please confirm your password";
  } else if (passwordData.new !== passwordData.confirm) {
    errors.confirm = "Passwords doesn't match";
  }

  // Prevent same password reuse
  if (
    passwordData.current &&
    passwordData.new &&
    passwordData.current === passwordData.new
  ) {
    errors.new = "New password must be different";
  }

  return errors;
};

export const validateResetPassword = (passwordData) => {
  const errors = {
    new: "",
    confirm: "",
  };

  // New
  if (!passwordData.new.trim()) {
    errors.new = "New password is required";
  } else if (!validatePassword(passwordData.new)) {
    errors.new = "Password must be at least 8 characters";
  }

  // Confirm
  if (!passwordData.confirm.trim()) {
    errors.confirm = "Please confirm your password";
  } else if (passwordData.new !== passwordData.confirm) {
    errors.confirm = "Passwords doesn't match";
  }

  return errors;
};

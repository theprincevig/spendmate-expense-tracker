// ==============================
//   REGEX VALIDATIONS
// ==============================
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const passwordRegex = /^.{8,64}$/;
const phoneRegex = /^[6-9]\d{9}$/;

// ==============================
//   HELPER VALIDATION FUNCTIONS
// ==============================
export const validateEmail = (email) => emailRegex.test(email);
export const validatePassword = (password) => passwordRegex.test(password);
export const validatePhone = (phone) => phoneRegex.test(phone);
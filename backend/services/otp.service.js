const crypto = require("crypto");
const { redis } = require("../config/redis.Config.js");

const OTP_EXPIRY = 2 * 60; // 2 minutes
const RESET_TOKEN_EXPIRY = 4 * 60; // 4 minutes

const OTP_COOLDOWN = 30; // 30 seconds
const OTP_MAX_SENDS = 5; // Maximum 5 emails
const OTP_LIMIT_WINDOW = 15 * 60; // 15 minutes

module.exports.generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

module.exports.saveOtp = async (email, otp, purpose) => {
  const hashedOtp = hashOtp(otp);
  const key = `otp:${purpose}:${email}`;

  await redis.set(key, hashedOtp, "EX", OTP_EXPIRY);
};

module.exports.verifyOtp = async (email, otp, purpose) => {
  const key = `otp:${purpose}:${email}`;
  const storedOtp = await redis.get(key);

  if (!storedOtp) {
    return false;
  }

  const hashedOtp = hashOtp(otp);

  if (hashedOtp !== storedOtp) {
    return false;
  }

  await redis.del(key);
  return true;
};

module.exports.deleteOtp = async (email, purpose) => {
  const key = `otp:${purpose}:${email}`;
  await redis.del(key);
};

// Check verification OTP cooldown and send limit
module.exports.checkOtpSendLimit = async (email) => {
  const cooldownKey = `otp:verify:cooldown:${email}`;
  const attemptsKey = `otp:verify:attempts:${email}`;

  // Check 60 seconds cooldown
  const cooldownTtl = await redis.ttl(cooldownKey);

  if (cooldownTtl > 0) {
    return {
      allowed: false,
      reason: "cooldown",
      retryAfter: cooldownTtl,
    };
  }

  // Check 5-email limit
  const attempts = await redis.get(attemptsKey);
  const sendCount = Number(attempts || 0);

  if (sendCount >= OTP_MAX_SENDS) {
    const limitTtl = await redis.ttl(attemptsKey);

    return {
      allowed: false,
      reason: "limit",
      retryAfter: limitTtl,
    };
  }

  return {
    allowed: true,
  };
};

// Record a successful verification OTP email
module.exports.recordOtpSend = async (email) => {
  const cooldownKey = `otp:verify:cooldown:${email}`;
  const attemptsKey = `otp:verify:attempts:${email}`;

  // Start 60-second cooldown
  await redis.set(cooldownKey, "1", "EX", OTP_COOLDOWN);

  // Increment email send count
  const sendCount = await redis.incr(attemptsKey);

  // Start the 15-minute window on first send
  if (sendCount === 1) {
    await redis.expire(attemptsKey, OTP_LIMIT_WINDOW);
  }

  return sendCount;
};

// Create token for resetting password
module.exports.createResetToken = async (email) => {
  const token = crypto.randomBytes(32).toString("hex");
  const key = `password-reset:${token}`;

  await redis.set(key, email, "EX", RESET_TOKEN_EXPIRY);

  return token;
};

module.exports.verifyResetToken = async (token) => {
  const key = `password-reset:${token}`;
  const email = await redis.get(key);

  if (!email) {
    return null;
  }

  return email;
};

module.exports.deleteResetToken = async (token) => {
  const key = `password-reset:${token}`;
  await redis.del(key);
};

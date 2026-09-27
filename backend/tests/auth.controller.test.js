// Adjust these require paths if your folder layout differs.
// Assumes: backend/controllers/auth.controller.js, backend/tests/auth.controller.test.js
const authController = require("../controller/auth.controller.js");
const User = require("../models/user.js");
const { generateTokenAndCookie } = require("../utils/generateToken.js");
const { sendOtpEmail } = require("../services/email.service.js");
const {
  generateOtp,
  saveOtp,
  verifyOtp,
  checkOtpSendLimit,
  recordOtpSend,
} = require("../services/otp.service.js");

// jest.mock(path, factory) swaps out a REAL module for a fake one, but only
// inside this test file. Note: Jest hoists every jest.mock() call to the very
// top of the file automatically (even above the requires above), so by the
// time `const User = require(...)` runs, it's already receiving this fake
// object below instead of the real Mongoose model. This is what stops these
// tests from touching a real database.
jest.mock("../models/user.js", () => ({
  // Each of these becomes a jest.fn(): a fake function with no real logic
  // that just records how it was called, so we can control its return value
  // per-test and later assert things like `expect(User.findOne).toHaveBeenCalledWith(...)`.
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
}));

// This must mirror the SHAPE the controller actually expects. The controller
// does `currencyConfig[currency] ? currency : "INR"` — a plain object lookup,
// not a function call — so the mock has to be a plain object keyed by
// currency code, not something like `{ isSupportedCurrency: fn }`.
jest.mock("../config/currency.Config.js", () => ({
  INR: { symbol: "₹" },
  USD: { symbol: "$" },
}));

jest.mock("../utils/generateToken.js", () => ({
  generateTokenAndCookie: jest.fn(),
  cookieOptions: { httpOnly: true },
}));

jest.mock("../services/email.service.js", () => ({
  sendOtpEmail: jest.fn(),
}));

jest.mock("../services/otp.service.js", () => ({
  generateOtp: jest.fn(),
  saveOtp: jest.fn(),
  verifyOtp: jest.fn(),
  checkOtpSendLimit: jest.fn(),
  recordOtpSend: jest.fn(),
}));

// A fake Express `res` object. Real Express lets you chain
// `res.status(200).json({...})` because `res.status()` returns `res` itself —
// `.mockReturnValue(res)` recreates that exact chaining behavior so the
// controller code doesn't need to know it's talking to a fake.
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
}

// Runs before every single `it(...)` below. Without this, a mock's recorded
// calls/return values from one test would leak into the next test and cause
// confusing false passes/failures. (If jest.config.js has `clearMocks: true`,
// this block is redundant — Jest does it automatically — but it's harmless
// to leave in, and useful to see explicitly while you're still learning.)
beforeEach(() => {
  jest.clearAllMocks();
});

// Tests the authenticated-user lookup helper: it should return the logged-in user,
// excluding sensitive fields like the password, or a server error if the database fails.
//
// Pattern used in almost every test below:
//   1. Build a fake `req` (and `res` via mockRes()).
//   2. Tell the relevant mock what to return/resolve/reject, so the
//      controller's `await SomeModel.find(...)` gets a controlled fake result
//      instead of hitting a real database.
//   3. `await` the controller call itself — it's an async function, so
//      without `await` the test would finish and assert BEFORE the
//      controller's internal promises resolve, giving false failures.
//   4. Assert on `res.status` / `res.json` to check what the controller sent back.
describe("checkAuth", () => {
  it("returns the logged-in user without password", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();
    const fakeUser = { _id: "u1", email: "a@a.com" };
    // findById(id) isn't awaited directly in the controller — .select(...) is.
    // So findById must SYNCHRONOUSLY return an object with a .select method,
    // and .select() is what resolves asynchronously with the user.
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    await authController.checkAuth(req, res);

    expect(User.findById).toHaveBeenCalledWith("u1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, user: fakeUser });
  });

  it("returns 500 on db error", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();
    User.findById.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("boom")),
    });

    await authController.checkAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: "boom" });
  });
});

describe("registerUser", () => {
  it("400s when email or password missing", async () => {
    const req = { body: { email: "", password: "" } };
    const res = mockRes();

    await authController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it("400s when email already exists", async () => {
    const req = { body: { email: "a@a.com", password: "pw" } };
    const res = mockRes();
    User.findOne.mockResolvedValue({ _id: "existing" });

    await authController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Email already in use",
    });
  });

  it("defaults to INR for an unsupported currency", async () => {
    const req = {
      body: { email: "a@a.com", password: "pw", currency: "ZZZ" },
    };
    const res = mockRes();
    User.findOne.mockResolvedValue(null);
    generateOtp.mockReturnValue("123456");
    User.create.mockResolvedValue({ _id: "u1", currency: "INR" });

    await authController.registerUser(req, res);

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ currency: "INR" }),
    );
    expect(saveOtp).toHaveBeenCalledWith("a@a.com", "123456", "verify");
    expect(sendOtpEmail).toHaveBeenCalledWith("a@a.com", "123456");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("keeps a supported currency as given", async () => {
    const req = {
      body: { email: "a@a.com", password: "pw", currency: "USD" },
    };
    const res = mockRes();
    User.findOne.mockResolvedValue(null);
    generateOtp.mockReturnValue("111111");
    User.create.mockResolvedValue({ _id: "u1", currency: "USD" });

    await authController.registerUser(req, res);

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ currency: "USD" }),
    );
  });

  it("500s on unexpected error", async () => {
    const req = { body: { email: "a@a.com", password: "pw" } };
    const res = mockRes();
    User.findOne.mockRejectedValue(new Error("db down"));

    await authController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("verifyEmail", () => {
  const baseReq = () => ({ body: { email: "a@a.com", otp: "123456" } });

  it("400s when email or otp missing", async () => {
    const req = { body: { email: "" } };
    const res = mockRes();

    await authController.verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404s when user not found", async () => {
    const req = baseReq();
    const res = mockRes();
    User.findOne.mockResolvedValue(null);

    await authController.verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("400s when already verified", async () => {
    const req = baseReq();
    const res = mockRes();
    User.findOne.mockResolvedValue({ isVerified: true });

    await authController.verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Email is already verified.",
    });
  });

  it("400s on invalid otp", async () => {
    const req = baseReq();
    const res = mockRes();
    User.findOne.mockResolvedValue({ isVerified: false, save: jest.fn() });
    verifyOtp.mockResolvedValue(false);

    await authController.verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid or expired OTP.",
    });
  });

  it("verifies the user, saves, and issues a token on success", async () => {
    const req = baseReq();
    const res = mockRes();
    const user = {
      _id: "u1",
      isVerified: false,
      save: jest.fn().mockResolvedValue(),
    };
    User.findOne.mockResolvedValue(user);
    verifyOtp.mockResolvedValue(true);

    await authController.verifyEmail(req, res);

    expect(user.isVerified).toBe(true);
    expect(user.save).toHaveBeenCalled();
    expect(generateTokenAndCookie).toHaveBeenCalledWith("u1", res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500s on unexpected error", async () => {
    const req = baseReq();
    const res = mockRes();
    User.findOne.mockRejectedValue(new Error("db down"));

    await authController.verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// That unblocks real coverage of the cooldown / rate-limit / success logic
// below, which had zero tests before
// since nothing past the ReferenceError was ever reachable.
describe("resendVerifyEmail", () => {
  // A small local helper, scoped to just this describe block, since this
  // endpoint's request shape ({ email }) is different from verifyEmail's
  // ({ email, otp }) — reusing that describe block's baseReq() wouldn't be
  // accurate here even if it were in scope.
  const baseReq = () => ({ body: { email: "a@a.com" } });

  it("400s when email is missing", async () => {
    const req = { body: { email: "" } };
    const res = mockRes();

    await authController.resendVerifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("404s when user not found", async () => {
    const req = baseReq();
    const res = mockRes();
    User.findOne.mockResolvedValue(null);

    await authController.resendVerifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("400s when already verified", async () => {
    const req = baseReq();
    const res = mockRes();
    User.findOne.mockResolvedValue({ isVerified: true });

    await authController.resendVerifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Email is already verified.",
    });
  });

  it("429s when still in the cooldown window", async () => {
    const req = baseReq();
    const res = mockRes();
    User.findOne.mockResolvedValue({ isVerified: false });
    checkOtpSendLimit.mockResolvedValue({
      allowed: false,
      reason: "cooldown",
      retryAfter: 30,
    });

    await authController.resendVerifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Please wait 30s before requesting another OTP.",
      retryAfter: 30,
    });
    // Should never get as far as generating a new OTP while cooling down.
    expect(generateOtp).not.toHaveBeenCalled();
  });

  it("429s when the max OTP requests have been reached", async () => {
    const req = baseReq();
    const res = mockRes();
    User.findOne.mockResolvedValue({ isVerified: false });
    checkOtpSendLimit.mockResolvedValue({
      allowed: false,
      reason: "max_reached",
      retryAfter: 120, // seconds — controller converts this to minutes in the message
    });

    await authController.resendVerifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    // The controller builds this message with a multi-line template literal,
    // so we check for the meaningful substring rather than matching the
    // exact whitespace/formatting.
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toEqual(
      expect.stringContaining("Maximum OTP requests reached"),
    );
    expect(responseBody.retryAfter).toBe(120);
  });

  it("sends a new OTP and records the send on success", async () => {
    const req = baseReq();
    const res = mockRes();
    User.findOne.mockResolvedValue({ isVerified: false });
    checkOtpSendLimit.mockResolvedValue({ allowed: true });
    generateOtp.mockReturnValue("654321");

    await authController.resendVerifyEmail(req, res);

    expect(saveOtp).toHaveBeenCalledWith("a@a.com", "654321", "verify");
    expect(sendOtpEmail).toHaveBeenCalledWith("a@a.com", "654321");
    expect(recordOtpSend).toHaveBeenCalledWith("a@a.com");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "A new OTP has been sent to your email.",
    });
  });

  it("500s on unexpected error", async () => {
    const req = baseReq();
    const res = mockRes();
    User.findOne.mockRejectedValue(new Error("db down"));

    await authController.resendVerifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("loginUser", () => {
  it("400s when email or password missing", async () => {
    const req = { body: { email: "" } };
    const res = mockRes();

    await authController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("400s on unknown email", async () => {
    const req = { body: { email: "a@a.com", password: "pw" } };
    const res = mockRes();
    User.findOne.mockResolvedValue(null);

    await authController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid credentials.",
    });
  });

  it("400s on wrong password", async () => {
    const req = { body: { email: "a@a.com", password: "wrong" } };
    const res = mockRes();
    User.findOne.mockResolvedValue({
      comparePassword: jest.fn().mockResolvedValue(false),
    });

    await authController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("403s when the account isn't verified", async () => {
    const req = { body: { email: "a@a.com", password: "pw" } };
    const res = mockRes();
    User.findOne.mockResolvedValue({
      isVerified: false,
      comparePassword: jest.fn().mockResolvedValue(true),
    });

    await authController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("logs in and issues a token on success", async () => {
    const req = { body: { email: "a@a.com", password: "pw" } };
    const res = mockRes();
    const user = {
      _id: "u1",
      isVerified: true,
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(user);

    await authController.loginUser(req, res);

    expect(generateTokenAndCookie).toHaveBeenCalledWith("u1", res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500s on unexpected error", async () => {
    const req = { body: { email: "a@a.com", password: "pw" } };
    const res = mockRes();
    User.findOne.mockRejectedValue(new Error("db down"));

    await authController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("logoutUser", () => {
  it("clears the auth cookie", async () => {
    const req = {};
    const res = mockRes();

    await authController.logoutUser(req, res);

    expect(res.cookie).toHaveBeenCalledWith("jwt", "", expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500s if clearing the cookie throws", async () => {
    const req = {};
    const res = mockRes();
    res.cookie.mockImplementation(() => {
      throw new Error("cookie fail");
    });

    await authController.logoutUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

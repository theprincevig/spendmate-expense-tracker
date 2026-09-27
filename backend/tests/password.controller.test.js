// Adjust these require paths if your folder layout differs.
// Assumes: backend/controllers/password.controller.js, backend/tests/password.controller.test.js
const passwordController = require("../controller/password.controller.js");
const User = require("../models/user.js");
const {
  sendPasswordResetEmail,
  sendSuccessEmail,
} = require("../services/email.service.js");
const {
  createResetToken,
  verifyResetToken,
  deleteResetToken,
} = require("../services/otp.service.js");

// jest.mock(path, factory) swaps the REAL User model for a fake one, only
// inside this test file. Jest hoists this call above the requires above, so
// `const User = require(...)` is already getting this fake instead of the
// real Mongoose model — meaning these tests never touch a real database.
jest.mock("../models/user.js", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
}));

// This controller only calls these two functions from email.service.js, so
// that's all the fake module needs to expose.
jest.mock("../services/email.service.js", () => ({
  sendPasswordResetEmail: jest.fn(),
  sendSuccessEmail: jest.fn(),
}));

// otp.service.js is shared with auth.controller.js in the real project, but
// THIS controller only uses the reset-token functions — so the mock here
// only needs to cover what password.controller.js actually imports.
jest.mock("../services/otp.service.js", () => ({
  createResetToken: jest.fn(),
  verifyResetToken: jest.fn(),
  deleteResetToken: jest.fn(),
}));

// A fake Express `res` object. Real Express lets you chain
// `res.status(200).json({...})` because `res.status()` returns `res` itself —
// `.mockReturnValue(res)` recreates that exact chaining behavior so the
// controller code doesn't need to know it's talking to a fake.
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// Runs before every single `it(...)` below, wiping recorded calls/return
// values so one test's setup can't leak into the next.
beforeEach(() => {
  jest.clearAllMocks();
});

// Covers changing a password while logged in: field validation, wrong old
// password, and a successful update. Note: we're not testing whether the
// password actually gets HASHED — that logic almost certainly lives in a
// Mongoose pre-save hook on the User model itself, which is a separate unit
// to test on its own, not something the controller is responsible for.
describe("changePassword", () => {
  it("400s when oldPassword or newPassword is missing", async () => {
    const req = { user: { _id: "u1" }, body: { oldPassword: "" } };
    const res = mockRes();

    await passwordController.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("400s when the new password is shorter than 8 characters", async () => {
    const req = {
      user: { _id: "u1" },
      body: { oldPassword: "oldpass1", newPassword: "short" },
    };
    const res = mockRes();

    await passwordController.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "New password must be at least 8 characters.",
    });
  });

  it("404s when the user doesn't exist", async () => {
    const req = {
      user: { _id: "u1" },
      body: { oldPassword: "oldpass1", newPassword: "newpass1" },
    };
    const res = mockRes();
    User.findById.mockResolvedValue(null);

    await passwordController.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("400s when the old password doesn't match", async () => {
    const req = {
      user: { _id: "u1" },
      body: { oldPassword: "wrongpass", newPassword: "newpass1" },
    };
    const res = mockRes();
    User.findById.mockResolvedValue({
      comparePassword: jest.fn().mockResolvedValue(false),
    });

    await passwordController.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Old password is incorrect.",
    });
  });

  it("updates the password on success", async () => {
    const req = {
      user: { _id: "u1" },
      body: { oldPassword: "oldpass1", newPassword: "newpass1" },
    };
    const res = mockRes();
    const user = {
      password: "oldpass1",
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(),
    };
    User.findById.mockResolvedValue(user);

    await passwordController.changePassword(req, res);

    expect(user.password).toBe("newpass1");
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500s on unexpected error", async () => {
    const req = {
      user: { _id: "u1" },
      body: { oldPassword: "oldpass1", newPassword: "newpass1" },
    };
    const res = mockRes();
    User.findById.mockRejectedValue(new Error("db down"));

    await passwordController.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Covers requesting a password reset link: missing email, unknown email, and
// the success path where a reset token is generated and emailed out.
describe("forgotPassword", () => {
  it("400s when email is missing", async () => {
    const req = { body: {} };
    const res = mockRes();

    await passwordController.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it("404s when no user has that email", async () => {
    const req = { body: { email: "a@a.com" } };
    const res = mockRes();
    User.findOne.mockResolvedValue(null);

    await passwordController.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("generates and emails a reset token on success", async () => {
    const req = { body: { email: "a@a.com" } };
    const res = mockRes();
    User.findOne.mockResolvedValue({ email: "a@a.com" });
    createResetToken.mockResolvedValue("reset-token-123");

    await passwordController.forgotPassword(req, res);

    expect(createResetToken).toHaveBeenCalledWith("a@a.com");
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      "a@a.com",
      "reset-token-123",
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500s on unexpected error", async () => {
    const req = { body: { email: "a@a.com" } };
    const res = mockRes();
    User.findOne.mockRejectedValue(new Error("db down"));

    await passwordController.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Covers completing a password reset using the token from the email link:
// missing fields, an invalid/expired token, and the success path.
// Note: the controller responds with a "message" key on some error branches
// and an "error" key on others — that's inconsistent, but these tests match
// what the controller ACTUALLY sends today, not what might be "ideal".
describe("resetPassword", () => {
  it("400s when token or newPassword is missing", async () => {
    const req = { params: {}, body: {} };
    const res = mockRes();

    await passwordController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(verifyResetToken).not.toHaveBeenCalled();
  });

  it("400s when the reset token is invalid or expired", async () => {
    const req = {
      params: { token: "bad-token" },
      body: { newPassword: "newpass1" },
    };
    const res = mockRes();
    verifyResetToken.mockResolvedValue(null);

    await passwordController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid or expired reset token.",
    });
  });

  it("404s when the token is valid but the user no longer exists", async () => {
    const req = {
      params: { token: "good-token" },
      body: { newPassword: "newpass1" },
    };
    const res = mockRes();
    verifyResetToken.mockResolvedValue("a@a.com");
    User.findOne.mockResolvedValue(null);

    await passwordController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("resets the password, clears the token, and emails confirmation on success", async () => {
    const req = {
      params: { token: "good-token" },
      body: { newPassword: "newpass1" },
    };
    const res = mockRes();
    verifyResetToken.mockResolvedValue("a@a.com");
    const user = { password: "oldpass1", save: jest.fn().mockResolvedValue() };
    User.findOne.mockResolvedValue(user);

    await passwordController.resetPassword(req, res);

    expect(user.password).toBe("newpass1");
    expect(user.save).toHaveBeenCalled();
    expect(deleteResetToken).toHaveBeenCalledWith("good-token");
    expect(sendSuccessEmail).toHaveBeenCalledWith("a@a.com");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500s on unexpected error", async () => {
    const req = {
      params: { token: "good-token" },
      body: { newPassword: "newpass1" },
    };
    const res = mockRes();
    verifyResetToken.mockRejectedValue(new Error("token service down"));

    await passwordController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

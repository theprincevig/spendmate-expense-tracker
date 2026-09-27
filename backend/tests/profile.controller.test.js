// Adjust these require paths if your folder layout differs.
// Assumes: backend/controllers/profile.controller.js, backend/tests/profile.controller.test.js
const profileController = require("../controllers/profile.controller.js");
const User = require("../models/user");

// jest.mock(path, factory) swaps the REAL User model for a fake one, only
// inside this test file. Jest hoists this call above the requires above, so
// `const User = require(...)` is already getting this fake instead of the
// real Mongoose model — meaning these tests never touch a real database.
jest.mock("../models/user", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
}));

// The controller reaches into Cloudinary to delete old profile pictures.
// We never want a real test to make a real network call to a real Cloudinary
// account, so the whole config module is faked.
jest.mock("../config/cloud.Config.js", () => ({
  cloudinary: { uploader: { destroy: jest.fn() } },
}));

// The controller does `currencyConfig[currency]` — a plain object lookup —
// so the mock has to be a plain object keyed by currency code, matching the
// same pattern used in auth.controller.test.js.
jest.mock("../config/currency.Config.js", () => ({
  INR: { symbol: "₹" },
  USD: { symbol: "$" },
}));

// A plain placeholder id. Earlier versions of this controller validated that
// req.user._id looked like a real Mongo ObjectId, but that check has been
// removed — so any string works fine here now.
const USER_ID = "u1";

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

beforeEach(() => {
  jest.clearAllMocks();
});

// Covers fetching the logged-in user's own profile: a user that no longer
// exists, the success path, and an unexpected database failure.
describe("viewProfile", () => {
  it("404s when the user no longer exists", async () => {
    const req = { user: { _id: USER_ID } };
    const res = mockRes();
    // findById(id).select(fields) — findById must synchronously return
    // something with a .select method, same pattern as checkAuth in
    // auth.controller.test.js.
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await profileController.viewProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns the user's profile on success", async () => {
    const req = { user: { _id: USER_ID } };
    const res = mockRes();
    const fakeUser = { fullName: "Jane Doe", email: "jane@a.com" };
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });

    await profileController.viewProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, user: fakeUser });
  });

  it("500s on unexpected error", async () => {
    const req = { user: { _id: USER_ID } };
    const res = mockRes();
    User.findById.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("db down")),
    });

    await profileController.viewProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Covers updating the logged-in user's profile: bad JSON input, a missing
// user, a successful update, a duplicate-email conflict, and a currency change.
describe("updateProfile", () => {
  // JSON.parse now lives INSIDE the try block, so malformed input is caught
  // and turned into a normal (if generic) 500 response instead of crashing
  // the request the way it did before the fix.
  it("500s gracefully when profileData is missing or invalid JSON", async () => {
    const req = { user: { _id: USER_ID }, body: {} }; // no profileData field at all
    const res = mockRes();

    await profileController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    // User.findById is never reached because JSON.parse throws first.
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("404s when the user doesn't exist", async () => {
    const req = {
      user: { _id: USER_ID },
      body: { profileData: JSON.stringify({ fullName: "Jane" }) },
    };
    const res = mockRes();
    User.findById.mockResolvedValue(null);

    await profileController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates simple fields and returns the updated profile on success", async () => {
    const req = {
      user: { _id: USER_ID },
      body: {
        profileData: JSON.stringify({ fullName: "Jane Doe", phone: "12345" }),
      },
    };
    const res = mockRes();
    const user = {
      _id: USER_ID,
      email: "jane@a.com",
      fullName: "Old Name",
      save: jest.fn().mockResolvedValue(),
    };
    const updatedUser = { fullName: "Jane Doe", phone: "12345" };
    // findById is called TWICE in this controller: once (no chaining) to load
    // the document to update, then again (with .select) to return a clean
    // copy afterwards. mockReturnValueOnce lets us give two different fake
    // answers for those two calls, in order.
    User.findById
      .mockReturnValueOnce(user)
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(updatedUser),
      });

    await profileController.updateProfile(req, res);

    expect(user.fullName).toBe("Jane Doe");
    expect(user.phone).toBe("12345");
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, user: updatedUser }),
    );
  });

  // Now that the thrown message ("Email has been already taken") and the
  // caught message match exactly, this is a real passing test of the
  // INTENDED behavior — not a "known bug" test like before the fix.
  it("400s when the new email is already taken by another user", async () => {
    const req = {
      user: { _id: USER_ID },
      body: { profileData: JSON.stringify({ email: "taken@a.com" }) },
    };
    const res = mockRes();
    const user = { _id: USER_ID, email: "old@a.com", save: jest.fn() };
    User.findById.mockReturnValueOnce(user);
    User.findOne.mockResolvedValue({ _id: "someone-else" }); // email already in use

    await profileController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Email has been already taken",
    });
    expect(user.save).not.toHaveBeenCalled();
  });

  it("sets a valid currency", async () => {
    const req = {
      user: { _id: USER_ID },
      body: { profileData: JSON.stringify({ currency: "USD" }) },
    };
    const res = mockRes();
    const user = {
      _id: USER_ID,
      email: "jane@a.com",
      save: jest.fn().mockResolvedValue(),
    };
    User.findById
      .mockReturnValueOnce(user)
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ currency: "USD" }),
      });

    await profileController.updateProfile(req, res);

    expect(user.currency).toBe("USD");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500s on unexpected error", async () => {
    const req = {
      user: { _id: USER_ID },
      body: { profileData: JSON.stringify({ fullName: "Jane" }) },
    };
    const res = mockRes();
    User.findById.mockRejectedValue(new Error("db down"));

    await profileController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Covers the dedicated "change currency" endpoint: missing/invalid currency,
// user not found, and a successful update.
describe("changeCurrency", () => {
  it("400s when currency is missing", async () => {
    const req = { user: { _id: USER_ID }, body: {} };
    const res = mockRes();

    await profileController.changeCurrency(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("400s when currency isn't supported", async () => {
    const req = { user: { _id: USER_ID }, body: { currency: "ZZZ" } };
    const res = mockRes();

    await profileController.changeCurrency(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid currency",
    });
  });

  it("404s when the user doesn't exist", async () => {
    const req = { user: { _id: USER_ID }, body: { currency: "USD" } };
    const res = mockRes();
    User.findById.mockResolvedValue(null);

    await profileController.changeCurrency(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("updates the currency on success", async () => {
    const req = { user: { _id: USER_ID }, body: { currency: "USD" } };
    const res = mockRes();
    const user = {
      _id: USER_ID,
      currency: "INR",
      save: jest.fn().mockResolvedValue(),
    };
    const updatedUser = { currency: "USD" };
    User.findById
      .mockResolvedValueOnce(user) // first call: plain findById, no chaining
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(updatedUser),
      }); // second call: with .select

    await profileController.changeCurrency(req, res);

    expect(user.currency).toBe("USD");
    expect(user.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, user: updatedUser }),
    );
  });

  it("500s on unexpected error", async () => {
    const req = { user: { _id: USER_ID }, body: { currency: "USD" } };
    const res = mockRes();
    User.findById.mockRejectedValue(new Error("db down"));

    await profileController.changeCurrency(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

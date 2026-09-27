// Adjust these require paths if your folder layout differs.
// Assumes: backend/controllers/income.controller.js, backend/tests/income.controller.test.js
const incomeController = require("../controllers/income.controller.js");
const Income = require("../models/income.js");

// jest.mock(path, factory) swaps the REAL Income model for a fake one, only
// inside this test file. Jest hoists this call above the requires above, so
// `const Income = require(...)` is already getting this fake instead of the
// real Mongoose model — meaning these tests never touch a real database.
jest.mock("../models/income", () => {
  // The controller uses Income TWO different ways, so the mock has to
  // support both:
  //   1. As a constructor:  `new Income({...})`      (in addIncome)
  //   2. As a static object: `Income.find(...)`,
  //                          `Income.findByIdAndDelete(...)`
  //
  // jest.fn().mockImplementation(function (data) {...}) creates a fake
  // constructor function. Using a regular `function` (not an arrow function)
  // matters here because `new MockIncome({...})` needs its own `this` to
  // attach properties to — arrow functions don't have their own `this`.
  const MockIncome = jest.fn().mockImplementation(function (data) {
    Object.assign(this, data); // copies { userId, source, amount, date } onto the new instance
    this.save = jest.fn().mockResolvedValue(this); // fakes the real Mongoose `.save()` call
  });

  // Static methods (called directly on the model, not on `new Income()`)
  // are attached separately, since MockIncome itself is just a jest.fn().
  MockIncome.find = jest.fn();
  MockIncome.findByIdAndDelete = jest.fn();

  return MockIncome;
});

// pdfkit is a real PDF-generation library — we don't want tests to actually
// generate PDF binary data, just to check the controller CALLS it correctly.
// So `new PDFDocument()` is mocked to return a fake object with the same
// method names the controller calls, each one chainable via .mockReturnThis()
// (mirrors how the real pdfkit lets you write doc.fontSize(20).text(...)).
jest.mock("pdfkit", () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    end: jest.fn(),
    y: 0,
  }));
});

// A fake Express `res` object. Real Express lets you chain
// `res.status(200).json({...})` because `res.status()` returns `res` itself —
// `.mockReturnValue(res)` recreates that exact chaining behavior so the
// controller code doesn't need to know it's talking to a fake.
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
}

// Runs before every single `it(...)` below. Without this, a mock's recorded
// calls/return values from one test would leak into the next test and cause
// confusing false passes/failures. (If jest.config.js has `clearMocks: true`,
// this is redundant — Jest does it automatically — but harmless to keep.)
beforeEach(() => {
  jest.clearAllMocks();
});

// Covers adding a new income entry: required-field validation, a successful
// save that returns the created document, and a database failure during save.
describe("addIncome", () => {
  it("400s when source, amount, or date is missing", async () => {
    const req = {
      user: { _id: "u1" },
      body: { source: "", amount: "", date: "" },
    };
    const res = mockRes();

    await incomeController.addIncome(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("saves and returns the new income on success", async () => {
    const req = {
      user: { _id: "u1" },
      body: {
        icon: "💰",
        source: "Salary",
        amount: 50000,
        date: "2026-01-01",
      },
    };
    const res = mockRes();

    await incomeController.addIncome(req, res);

    // Because Income is mocked as a jest.fn() constructor, we can assert on
    // it directly, the same way we'd assert on any other mock function —
    // checking what arguments `new Income(...)` was called with.
    expect(Income).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        source: "Salary",
        amount: 50000,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it("500s when saving fails", async () => {
    const req = {
      user: { _id: "u1" },
      body: { source: "Salary", amount: 50000, date: "2026-01-01" },
    };
    const res = mockRes();
    // .mockImplementationOnce overrides the constructor's behavior for just
    // this ONE next call, so this test's failure doesn't affect any other
    // test that also creates a `new Income(...)`.
    Income.mockImplementationOnce(function () {
      this.save = jest.fn().mockRejectedValue(new Error("save failed"));
    });

    await incomeController.addIncome(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Covers fetching every income entry for the current user, sorted by date,
// and the 500 response when the database read fails.
describe("getAllIncome", () => {
  it("returns the user's income sorted by date", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();
    const list = [{ source: "Salary" }];
    // Income.find(...) isn't awaited directly in the controller — .sort(...)
    // is. So find() must SYNCHRONOUSLY return an object with a .sort method,
    // and .sort() is what resolves asynchronously with the income list.
    Income.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(list) });

    await incomeController.getAllIncome(req, res);

    expect(Income.find).toHaveBeenCalledWith({ userId: "u1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(list);
  });

  it("500s on db error", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();
    Income.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error("boom")),
    });

    await incomeController.getAllIncome(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Covers the PDF export endpoint. We're not checking the actual PDF bytes
// (that's pdfkit's job to get right, not ours) — just that the controller
// sets the right response headers and handles a failed database read.
describe("downloadIncomePdf", () => {
  it("streams a PDF with the correct headers", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();
    Income.find.mockReturnValue({
      sort: jest
        .fn()
        .mockResolvedValue([
          { source: "Salary", amount: 50000, date: "2026-01-01" },
        ]),
    });

    await incomeController.downloadIncomePdf(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Type",
      "application/pdf",
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      "attachment; filename=incomes.pdf",
    );
  });

  it("500s if fetching income fails", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();
    Income.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error("boom")),
    });

    await incomeController.downloadIncomePdf(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Covers deleting an income entry by id, and the 500 response when the delete
// fails. Note: the controller doesn't check that the income being deleted
// actually belongs to req.user._id — that's a separate concern from these
// tests, but worth fixing in the controller itself.
describe("deleteIncome", () => {
  it("deletes the income by id", async () => {
    const req = { params: { id: "i1" } };
    const res = mockRes();
    Income.findByIdAndDelete.mockResolvedValue({});

    await incomeController.deleteIncome(req, res);

    expect(Income.findByIdAndDelete).toHaveBeenCalledWith("i1");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500s on db error", async () => {
    const req = { params: { id: "i1" } };
    const res = mockRes();
    Income.findByIdAndDelete.mockRejectedValue(new Error("boom"));

    await incomeController.deleteIncome(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

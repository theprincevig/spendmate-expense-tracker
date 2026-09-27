// Adjust these require paths if your folder layout differs.
// Assumes: backend/controllers/ai.controller.js, backend/tests/ai.controller.test.js
const aiController = require("../controller/ai.controller.js");
const Expense = require("../models/expense");
const AiChat = require("../models/aiChat.js");
const AiChatSession = require("../models/aiChatSession.js");
const {
  getAIResponse,
  getOverspendingWarning,
} = require("../services/ai.service.js");
const { analyzeOverspending } = require("../utils/overSpending.js");
const { detectIntent } = require("../utils/intent.utils.js");
const { generateChatTitle } = require("../utils/chatTitleGenerator.js");

// jest.mock(path, factory) swaps each REAL module for a fake one, only inside
// this test file. Jest hoists every jest.mock() call above the requires
// above, so by the time `const Expense = require(...)` runs, it's already
// getting these fakes instead of the real Mongoose models / services —
// meaning these tests never touch a real database or the real OpenAI API.
jest.mock("../models/expense", () => ({
  find: jest.fn(),
}));

jest.mock("../models/aiChat.js", () => ({
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  deleteMany: jest.fn(),
}));

jest.mock("../models/aiChatSession.js", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
}));

// This is where the AI assistant differs from every controller you've tested
// so far: instead of faking a database call, we're faking a call to an AI
// service (which, in the real code, ultimately talks to the OpenAI API).
// Same idea though — the test never wants to make a real, slow, costly API
// call, so `getAIResponse`/`getOverspendingWarning` become plain jest.fn()s
// that we tell exactly what to return.
jest.mock("../services/ai.service.js", () => ({
  getAIResponse: jest.fn(),
  getOverspendingWarning: jest.fn(),
}));

jest.mock("../utils/overSpending.js", () => ({
  analyzeOverspending: jest.fn(),
}));

jest.mock("../utils/intent.utils.js", () => ({
  detectIntent: jest.fn(),
}));

jest.mock("../utils/chatTitleGenerator.js", () => ({
  generateChatTitle: jest.fn(),
}));

// The controller does `currencyConfig[req.user.currency] || currencyConfig.INR`
// — a plain object lookup — so the mock has to be a plain object keyed by
// currency code, same pattern as auth.controller.test.js.
jest.mock("../config/currency.Config.js", () => ({
  INR: { symbol: "₹" },
  USD: { symbol: "$" },
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

beforeEach(() => {
  jest.clearAllMocks();
});

// Covers sending a message to the AI assistant: starting a new chat vs.
// continuing an existing one, the "no expenses yet" canned reply, picking
// between a normal reply and an overspending warning based on detected
// intent, auto-generating a chat title after a few messages, and the two
// distinct failure paths (AI quota exceeded vs. any other error).
describe("chatWithAi", () => {
  it("400s when message is missing", async () => {
    const req = { user: { _id: "u1" }, body: {} };
    const res = mockRes();

    await aiController.chatWithAi(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(AiChatSession.create).not.toHaveBeenCalled();
  });

  it("starts a new chat and returns the canned reply when the user has no expenses", async () => {
    const req = {
      user: { _id: "u1", currency: "USD" },
      body: { message: "Hi there" },
    };
    const res = mockRes();
    const session = {
      _id: "s1",
      isAutoTitle: false,
      save: jest.fn().mockResolvedValue(),
    };
    AiChatSession.create.mockResolvedValue(session);
    AiChat.create.mockResolvedValue({});
    Expense.find.mockResolvedValue([]); // no expenses yet

    await aiController.chatWithAi(req, res);

    // No chatId in the request body means a brand-new session gets created,
    // titled with the first 40 characters of the message.
    expect(AiChatSession.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", title: "Hi there" }),
    );
    expect(getAIResponse).not.toHaveBeenCalled(); // skipped — no expenses to analyze
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        chatId: "s1",
        reply: expect.stringContaining("don’t have any expenses"),
      }),
    );
  });

  it("continues an existing chat owned by this user and uses the normal AI reply", async () => {
    const req = {
      user: { _id: "u1", currency: "USD" },
      body: { message: "How much did I spend on food?", chatId: "s1" },
    };
    const res = mockRes();
    const session = {
      _id: "s1",
      isAutoTitle: false,
      save: jest.fn().mockResolvedValue(),
    };
    // findOne filters by BOTH the chat id and the requesting user's id, so a
    // user can never continue someone else's chat session just by guessing
    // its id — this is the correct pattern (matches getAiChatMessages and
    // deleteAiChat below).
    AiChatSession.findOne.mockResolvedValue(session);
    AiChat.create.mockResolvedValue({});
    Expense.find.mockResolvedValue([{ category: "Food", amount: 100 }]);
    detectIntent.mockReturnValue("GENERAL");
    getAIResponse.mockResolvedValue("You spent ₹100 on food this month.");

    await aiController.chatWithAi(req, res);

    expect(AiChatSession.findOne).toHaveBeenCalledWith({
      _id: "s1",
      userId: "u1",
    });
    expect(getAIResponse).toHaveBeenCalledWith(
      [{ category: "Food", amount: 100 }],
      "How much did I spend on food?",
      { symbol: "$" },
    );
    expect(getOverspendingWarning).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ reply: "You spent ₹100 on food this month." }),
    );
  });

  it("uses the overspending warning path when intent detection says OVERSPENDING", async () => {
    const req = {
      user: { _id: "u1", currency: "USD" },
      body: { message: "Am I overspending?", chatId: "s1" },
    };
    const res = mockRes();
    const session = {
      _id: "s1",
      isAutoTitle: false,
      save: jest.fn().mockResolvedValue(),
    };
    AiChatSession.findOne.mockResolvedValue(session);
    AiChat.create.mockResolvedValue({});
    const expenses = [{ category: "Shopping", amount: 5000 }];
    Expense.find.mockResolvedValue(expenses);
    detectIntent.mockReturnValue("OVERSPENDING");
    analyzeOverspending.mockReturnValue({ overspent: true });
    getOverspendingWarning.mockResolvedValue(
      "You're overspending on Shopping!",
    );

    await aiController.chatWithAi(req, res);

    expect(analyzeOverspending).toHaveBeenCalledWith(expenses);
    expect(getOverspendingWarning).toHaveBeenCalledWith(
      { overspent: true },
      { symbol: "$" },
    );
    expect(getAIResponse).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ reply: "You're overspending on Shopping!" }),
    );
  });

  it("404s when the given chatId doesn't match a chat owned by this user", async () => {
    const req = {
      user: { _id: "u1" },
      body: { message: "Hello", chatId: "missing" },
    };
    const res = mockRes();
    AiChatSession.findOne.mockResolvedValue(null);

    await aiController.chatWithAi(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(AiChat.create).not.toHaveBeenCalled();
  });

  it("auto-generates a chat title once the conversation reaches 3 messages", async () => {
    const req = {
      user: { _id: "u1", currency: "INR" },
      body: { message: "Hi", chatId: "s1" },
    };
    const res = mockRes();
    const session = {
      _id: "s1",
      isAutoTitle: true,
      title: "Hi",
      save: jest.fn().mockResolvedValue(),
    };
    AiChatSession.findOne.mockResolvedValue(session);
    AiChat.create.mockResolvedValue({});
    Expense.find.mockResolvedValue([]); // keeps this test focused on the titling logic
    AiChat.countDocuments.mockResolvedValue(4); // >= 3, so titling kicks in
    const recentMessages = [{ role: "user", content: "Hi" }];
    // AiChat.find(...).sort(...).limit(...) is a 3-step chain here (different
    // from getAiChatMessages below, which chains .select() instead of .limit()).
    AiChat.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(recentMessages),
      }),
    });
    generateChatTitle.mockReturnValue("Quick chat about spending");

    await aiController.chatWithAi(req, res);

    expect(generateChatTitle).toHaveBeenCalledWith(recentMessages);
    expect(session.title).toBe("Quick chat about spending");
    expect(session.isAutoTitle).toBe(false);
    expect(session.save).toHaveBeenCalled();
  });

  it("returns 429 with a quota-exceeded code when the AI service reports the limit was hit", async () => {
    const req = {
      user: { _id: "u1", currency: "USD" },
      body: { message: "Hi", chatId: "s1" },
    };
    const res = mockRes();
    const session = { _id: "s1", isAutoTitle: false, save: jest.fn() };
    AiChatSession.findOne.mockResolvedValue(session);
    AiChat.create.mockResolvedValue({});
    Expense.find.mockResolvedValue([{ category: "Food", amount: 100 }]);
    detectIntent.mockReturnValue("GENERAL");
    // The AI service layer signals a quota problem via a specific error
    // message string, which the controller checks for explicitly.
    getAIResponse.mockRejectedValue(new Error("AI_QUOTA_EXCEEDED"));

    await aiController.chatWithAi(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, code: "AI_QUOTA_EXCEEDED" }),
    );
  });

  it("500s on any other unexpected error", async () => {
    const req = { user: { _id: "u1" }, body: { message: "Hi" } };
    const res = mockRes();
    AiChatSession.create.mockRejectedValue(new Error("db down"));

    await aiController.chatWithAi(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Covers listing all of the user's past chat sessions, most recently updated
// first, and the 500 response when that read fails.
describe("getAiChatHistory", () => {
  it("returns the user's chat sessions sorted by most recently updated", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();
    const sessions = [{ _id: "s1", title: "Chat 1" }];
    // .find(...).sort(...) — find must synchronously return something with a
    // .sort method, same pattern used for Expense.find(...).sort(...) in
    // expense.controller.test.js.
    AiChatSession.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(sessions),
    });

    await aiController.getAiChatHistory(req, res);

    expect(AiChatSession.find).toHaveBeenCalledWith({ userId: "u1" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(sessions);
  });

  it("500s on db error", async () => {
    const req = { user: { _id: "u1" } };
    const res = mockRes();
    AiChatSession.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error("boom")),
    });

    await aiController.getAiChatHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Covers loading the messages inside one specific chat: rejecting a chat that
// doesn't belong to (or doesn't exist for) the current user, the success
// path, and an unexpected database failure.
describe("getAiChatMessages", () => {
  it("404s when the chat doesn't exist or isn't owned by this user", async () => {
    const req = { params: { chatId: "s1" }, user: { _id: "u1" } };
    const res = mockRes();
    AiChatSession.findOne.mockResolvedValue(null);

    await aiController.getAiChatMessages(req, res);

    expect(AiChatSession.findOne).toHaveBeenCalledWith({
      _id: "s1",
      userId: "u1",
    });
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns the chat's messages in order on success", async () => {
    const req = { params: { chatId: "s1" }, user: { _id: "u1" } };
    const res = mockRes();
    AiChatSession.findOne.mockResolvedValue({ _id: "s1" });
    const messages = [{ role: "user", content: "Hi" }];
    // .find(...).sort(...).select(...) — a three-step chain, so each link
    // must synchronously return the next one, with only the last (.select)
    // resolving asynchronously.
    AiChat.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(messages),
      }),
    });

    await aiController.getAiChatMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(messages);
  });

  it("500s on db error", async () => {
    const req = { params: { chatId: "s1" }, user: { _id: "u1" } };
    const res = mockRes();
    AiChatSession.findOne.mockRejectedValue(new Error("boom"));

    await aiController.getAiChatMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// Covers deleting a chat session and all of its messages: rejecting a chat
// that doesn't belong to the current user, the success path, and an
// unexpected database failure.
describe("deleteAiChat", () => {
  it("404s when the chat doesn't exist or isn't owned by this user", async () => {
    const req = { params: { chatId: "s1" }, user: { _id: "u1" } };
    const res = mockRes();
    AiChatSession.findOne.mockResolvedValue(null);

    await aiController.deleteAiChat(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(AiChat.deleteMany).not.toHaveBeenCalled();
  });

  it("deletes the chat's messages and the session itself on success", async () => {
    const req = { params: { chatId: "s1" }, user: { _id: "u1" } };
    const res = mockRes();
    const session = { _id: "s1", deleteOne: jest.fn().mockResolvedValue() };
    AiChatSession.findOne.mockResolvedValue(session);
    AiChat.deleteMany.mockResolvedValue({});

    await aiController.deleteAiChat(req, res);

    expect(AiChat.deleteMany).toHaveBeenCalledWith({ chatId: "s1" });
    expect(session.deleteOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("500s on db error", async () => {
    const req = { params: { chatId: "s1" }, user: { _id: "u1" } };
    const res = mockRes();
    AiChatSession.findOne.mockRejectedValue(new Error("boom"));

    await aiController.deleteAiChat(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

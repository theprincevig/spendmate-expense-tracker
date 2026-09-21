export const API_PATHS = {
  AUTH: {
    CHECK_AUTH: "/api/auth/session",
    REGISTER: "/api/auth/register",
    EMAIL_VERIFY: "/api/auth/email/verify",
    RESEND_EMAIL_VERIFY: "/api/auth/email/verify/resend",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
  },
  PASSWORD: {
    CHANGE: "/api/password/change",
    FORGOT: "/api/password/forgot",
    RESET: (token) => `/api/password/reset/${token}`,
  },
  DASHBOARD: {
    GET_DATA: "/api/dashboard",
  },
  PROFILE: {
    ME: "/api/profile/me",
    CHANGE_CURRENCY: "/api/profile/me/currency",
  },
  INCOME: {
    ADD_INCOME: "/api/income/add",
    GET_ALL_INCOME: "/api/income/get",
    DELETE_INCOME: (id) => `/api/income/delete/${id}`,
    DOWNLOAD_INCOME_PDF: "/api/income/pdf",
  },
  EXPENSE: {
    ADD_EXPENSE: "/api/expense/add",
    GET_ALL_EXPENSE: "/api/expense/get",
    DELETE_EXPENSE: (id) => `/api/expense/delete/${id}`,
    DOWNLOAD_EXPENSE_PDF: "/api/expense/pdf",
  },
  AI: {
    CHAT: "/api/ai/chat",
    CHAT_HISTORY: "/api/ai/history",
    GET_CHAT_MESSAGES: (chatId) => `/api/ai/chat/${chatId}`,
    DELETE_CHAT_HISTORY: (chatId) => `/api/ai/chat/delete/${chatId}`,
  },
  RATES: {
    EXCHANGE: "/api/exchange-rates",
  },
};

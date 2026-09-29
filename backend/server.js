if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const port = process.env.PORT || 3030;

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const { connectDB } = require("./config/db");
const AppError = require("./errors/AppError.js");

const authRouter = require("./routes/auth.routes.js");
const profileRouter = require("./routes/profile.routes.js");
const incomeRouter = require("./routes/income.routes.js");
const expenseRouter = require("./routes/expense.routes.js");
const dashboardRouter = require("./routes/dashboard.routes.js");
const aiRouter = require("./routes/ai.routes.js");
const exchangeRateRouter = require("./routes/exchangeRate.routes.js");
const passwordRouter = require("./routes/password.routes.js");

const app = express();

// Middleware to handle CORS
const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

connectDB();

app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/ai", aiRouter);
app.use("/api/expense", expenseRouter);
app.use("/api/income", incomeRouter);
app.use("/api/profile", profileRouter);
app.use("/api/exchange-rates", exchangeRateRouter);
app.use("/api/password", passwordRouter);

app.all("/files{/*path}", (req, res, next) => {
  next(new AppError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong.",
  });
});

// Health check route (important for Render)
app.get("/", (req, res) => {
  res.send("SpendMate API is running...");
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

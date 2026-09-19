const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const { success } = require("./utils/response");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const campaignRoutes = require("./routes/campaign.routes");
const donationRoutes = require("./routes/donation.routes");
const allocationRoutes = require("./routes/allocation.routes");
const expenseRoutes = require("./routes/expense.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const path = require("path");
const db = require("./config/db");
const LedgerService = require("./services/ledger.service");
const ledgerRoutes = require("./routes/ledger.routes");

const app = express();

const allowedOrigins = [
  env.frontendUrl,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev to avoid CORS linking breakage
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static receipt files
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), env.uploadDir))
);

app.get("/api/health", (req, res) => {
  return success(res, {
    status: "ok",
    service: "transparent-fund-ledger-backend",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api", donationRoutes);
app.use("/api", allocationRoutes);
app.use("/api", expenseRoutes);
app.use("/api", dashboardRoutes);

// Ledger endpoints
const ledgerService = new LedgerService(db.pool);
app.use("/api", ledgerRoutes(ledgerService));

app.use(errorHandler);

module.exports = app;
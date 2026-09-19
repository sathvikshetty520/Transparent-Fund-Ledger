 
const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const { success } = require("./utils/response");

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  return success(res, {
    status: "ok",
    service: "transparent-fund-ledger-backend",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Routes will be mounted here as we build them.
// Auth
// Users
// Campaigns
// Donations
// Allocations
// Expenses
// Dashboard
// Ledger - owned by Member 4

app.use(errorHandler);

module.exports = app;
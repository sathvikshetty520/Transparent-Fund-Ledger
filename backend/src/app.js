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
const expenseRoutes = require("./routes/expense.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api", donationRoutes);
app.use("/api", allocationRoutes);
app.use("/api", expenseRoutes);
<<<<<<< HEAD
app.use("/api", dashboardRoutes);

=======

// Dashboard
>>>>>>> 9254c7f (feat(dev-b): add expense management)
// Ledger - owned by Member 4

app.use(errorHandler);

module.exports = app;
const dotenv = require("dotenv");
const path = require("path");

// .env lives in the project root, not inside backend/
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  port: Number(process.env.PORT) || 5000,

  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/transparent_fund_ledger",

  jwtSecret:
    process.env.JWT_SECRET || "transparent-fund-ledger-development-secret",

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  frontendUrl:
    process.env.FRONTEND_URL || "http://localhost:5173",

  uploadDir:
    process.env.UPLOAD_DIR || "uploads",

  maxFileSize:
    Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
};

module.exports = env;
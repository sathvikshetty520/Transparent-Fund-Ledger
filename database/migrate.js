
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const CONTAINER = "transparent-fund-ledger-db";
const DATABASE = "transparent_fund";
const USER = "fund_admin";
const PASSWORD = "fund_password";

const migrationsDir = path.join(__dirname, "migrations");

function runPsql(sql) {
  return execFileSync(
    "docker",
    [
      "exec",
      "-i",
      "-e",
      "PGPASSWORD=" + PASSWORD,
      CONTAINER,
      "psql",
      "-U",
      USER,
      "-d",
      DATABASE,
      "-v",
      "ON_ERROR_STOP=1",
      "-t",
      "-A",
      "-c",
      sql
    ],
    { encoding: "utf8" }
  ).trim();
}

function runMigrationFile(filePath) {
  const sql = fs.readFileSync(filePath, "utf8");

  const fullSql =
    "BEGIN;\n" +
    sql +
    "\nCOMMIT;\n";

  execFileSync(
    "docker",
    [
      "exec",
      "-i",
      "-e",
      "PGPASSWORD=" + PASSWORD,
      CONTAINER,
      "psql",
      "-U",
      USER,
      "-d",
      DATABASE,
      "-v",
      "ON_ERROR_STOP=1"
    ],
    {
      input: fullSql,
      stdio: ["pipe", "inherit", "inherit"]
    }
  );
}

console.log("Starting database migration...");

const createTableSql =
  "CREATE TABLE IF NOT EXISTS schema_migrations (" +
  "id SERIAL PRIMARY KEY, " +
  "migration_name TEXT NOT NULL UNIQUE, " +
  "applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()" +
  ");";

runPsql(createTableSql);

const files = fs
  .readdirSync(migrationsDir)
  .filter(function (file) {
    return /^\d+.*\.sql$/i.test(file);
  })
  .sort(function (a, b) {
    return a.localeCompare(b, undefined, { numeric: true });
  });

if (files.length === 0) {
  console.log("No migration files found.");
  process.exit(0);
}

const appliedSql =
  "SELECT migration_name " +
  "FROM schema_migrations " +
  "ORDER BY migration_name;";

const applied = runPsql(appliedSql);

const appliedMigrations = new Set(
  applied ? applied.split("\n").filter(Boolean) : []
);

for (const file of files) {
  if (appliedMigrations.has(file)) {
    console.log("Already applied: " + file);
    continue;
  }

  console.log("Applying: " + file);

  const filePath = path.join(migrationsDir, file);

  runMigrationFile(filePath);

  const escapedFile = file.replace(/'/g, "''");

  const recordSql =
    "INSERT INTO schema_migrations (migration_name) " +
    "VALUES ('" +
    escapedFile +
    "');";

  runPsql(recordSql);

  console.log("Applied: " + file);
}

console.log("Migration process completed.");


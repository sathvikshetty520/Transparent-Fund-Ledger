 
# Database Migrations

This directory contains ordered PostgreSQL database migrations for the Transparent Fund Ledger project.

## Naming Convention

Migration files should use numeric ordering:

```text
001_initial_schema.sql
002_add_example_change.sql
003_another_change.sql
```

## Rules

* Migrations are executed in numeric order.
* Each migration is executed inside a database transaction.
* Successfully applied migrations are recorded in `schema_migrations`.
* An already-applied migration is never executed again.
* Do not modify an already-applied migration.
* Create a new migration for schema changes.
* Keep `database/schema.sql` synchronized with the final database schema.

`000_README.md` is documentation only and is not executed as a migration.

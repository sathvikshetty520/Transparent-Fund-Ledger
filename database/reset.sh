 


set -e

echo "Resetting Transparent Fund Ledger database..."

docker compose down -v

echo "Starting PostgreSQL with a fresh database..."

docker compose up -d

echo "Waiting for PostgreSQL..."

until docker exec transparent-fund-ledger-db pg_isready -U fund_admin -d transparent_fund > /dev/null 2>&1
do
    sleep 1
done

echo "PostgreSQL is ready."

echo "Database reset completed."
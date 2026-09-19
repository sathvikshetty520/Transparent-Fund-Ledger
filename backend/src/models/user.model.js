const selectFields = `
  id,
  name,
  email,
  password_hash,
  role,
  created_at,
  updated_at
`;

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function findByEmail(db, email) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return mapUserRow(result.rows[0]);
}

async function findById(db, id) {
  const result = await db.query(
    `
      SELECT ${selectFields}
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return mapUserRow(result.rows[0]);
}

async function create(db, {
  name,
  email,
  passwordHash,
  role
}) {
  const result = await db.query(
    `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4)
      RETURNING ${selectFields}
    `,
    [
      name,
      email,
      passwordHash,
      role
    ]
  );

  return mapUserRow(result.rows[0]);
}

async function findAll(db) {
  const result = await db.query(
    `
      SELECT
        id,
        name,
        email,
        role,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

module.exports = {
  findByEmail,
  findById,
  create,
  findAll
};
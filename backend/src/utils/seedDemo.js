const bcrypt = require("bcryptjs");

const db = require("../config/db");

const DEMO_ADMIN_EMAIL =
  "admin.test@transparentfund.local";

const DEMO_ADMIN_PASSWORD =
  "Admin@123";

const ORGANIZER_ID =
  "dfe28291-3495-4162-9f23-8555d82d2b3d";

const CONTRIBUTOR_ID =
  "281cf663-8c14-40c4-8a1e-9c6f60361348";

async function ensureUserExists(
  id,
  role,
  label
) {
  const result = await db.query(
    `
      SELECT id, name, email, role
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error(
      `${label} with ID ${id} was not found`
    );
  }

  const user = result.rows[0];

  if (user.role !== role) {
    throw new Error(
      `${label} has role ${user.role}, expected ${role}`
    );
  }

  return user;
}

async function ensureTestAdmin() {
  const existingAdmin =
    await db.query(
      `
        SELECT id, name, email, role
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
      [DEMO_ADMIN_EMAIL]
    );

  if (existingAdmin.rows.length > 0) {
    const admin = existingAdmin.rows[0];

    if (admin.role !== "ADMIN") {
      throw new Error(
        `${DEMO_ADMIN_EMAIL} already exists with role ${admin.role}`
      );
    }

    return {
      created: false,
      user: admin
    };
  }

  const passwordHash =
    await bcrypt.hash(
      DEMO_ADMIN_PASSWORD,
      10
    );

  const result =
    await db.query(
      `
        INSERT INTO users (
          name,
          email,
          password_hash,
          role
        )
        VALUES (
          $1,
          $2,
          $3,
          'ADMIN'
        )
        RETURNING
          id,
          name,
          email,
          role
      `,
      [
        "Demo Test Admin",
        DEMO_ADMIN_EMAIL,
        passwordHash
      ]
    );

  return {
    created: true,
    user: result.rows[0]
  };
}

async function seedDemo() {
  console.log(
    "Starting demo seed..."
  );

  const organizer =
    await ensureUserExists(
      ORGANIZER_ID,
      "ORGANIZER",
      "Organizer"
    );

  const contributor =
    await ensureUserExists(
      CONTRIBUTOR_ID,
      "CONTRIBUTOR",
      "Contributor"
    );

  const admin =
    await ensureTestAdmin();

  console.log("");
  console.log(
    "Demo seed completed successfully."
  );

  console.log("");
  console.log("Organizer:");
  console.log(
    `${organizer.name} <${organizer.email}>`
  );

  console.log("");
  console.log("Contributor:");
  console.log(
    `${contributor.name} <${contributor.email}>`
  );

  console.log("");
  console.log("Test Admin:");

  if (admin.created) {
    console.log(
      "Created new test admin account."
    );
    console.log(
      `Email: ${DEMO_ADMIN_EMAIL}`
    );
    console.log(
      `Password: ${DEMO_ADMIN_PASSWORD}`
    );
  } else {
    console.log(
      "Test admin already exists. Existing account was not modified."
    );
    console.log(
      `Email: ${DEMO_ADMIN_EMAIL}`
    );
    console.log(
      "Password: Use the password originally created for this test account."
    );
  }

  console.log("");
}

if (require.main === module) {
  seedDemo()
    .catch((error) => {
      console.error("");
      console.error(
        "Demo seed failed:"
      );
      console.error(error.message);
      process.exitCode = 1;
    })
    .finally(() => {
  process.exit();
});
}

module.exports = seedDemo;
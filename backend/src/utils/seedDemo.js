const bcrypt = require("bcryptjs");

const db = require("../config/db");

const USERS = [
  {
    email: "admin.test@transparentfund.local",
    password: "Admin@123",
    name: "Demo Test Admin",
    role: "ADMIN"
  },
  {
    email: "organizer@example.com",
    password: "password123",
    name: "Demo Organizer",
    role: "ORGANIZER"
  },
  {
    email: "bhavish@example.com",
    password: "password123",
    name: "Demo Contributor",
    role: "CONTRIBUTOR"
  }
];

async function ensureUserExists(userDef) {
  const existingUser = await db.query(
    `SELECT id, name, email, role FROM users WHERE email = $1 LIMIT 1`,
    [userDef.email]
  );

  if (existingUser.rows.length > 0) {
    const user = existingUser.rows[0];
    if (user.role !== userDef.role) {
      throw new Error(`${userDef.email} already exists with role ${user.role}, expected ${userDef.role}`);
    }
    return { created: false, user };
  }

  const passwordHash = await bcrypt.hash(userDef.password, 10);

  const result = await db.query(
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
        $4
      )
      RETURNING
        id,
        name,
        email,
        role
    `,
    [userDef.name, userDef.email, passwordHash, userDef.role]
  );

  return { created: true, user: result.rows[0], password: userDef.password };
}

async function seedDemo() {
  console.log("Starting demo seed...");

  for (const userDef of USERS) {
    const { created, user, password } = await ensureUserExists(userDef);
    console.log(`\n${user.role}:`);
    if (created) {
      console.log("Created new account.");
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${password}`);
    } else {
      console.log("Account already exists.");
      console.log(`Email: ${user.email}`);
    }
  }

  console.log("\nDemo seed completed successfully.\n");
}

if (require.main === module) {
  seedDemo()
    .catch((error) => {
      console.error("\nDemo seed failed:");
      console.error(error.message);
      process.exitCode = 1;
    })
    .finally(() => {
      process.exit();
    });
}

module.exports = seedDemo;
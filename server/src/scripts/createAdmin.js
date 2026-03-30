const path = require("path");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const pool = require("../config/db");

async function createAdmin() {
  const email = process.argv[2] || "admin@marketplace.com";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Admin User";

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await pool.execute(
    `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password), role = 'admin'`,
    [name, email, hashedPassword]
  );

  console.log(`Admin user ready: ${email}`);
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

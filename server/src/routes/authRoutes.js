const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");
const { formatUserPayload } = require("../utils/helpers");

const router = express.Router();

async function createUserAccount({ name, email, password, role }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length) {
      throw new Error("EMAIL_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.execute(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    let sellerId = null;
    let approved = 0;

    if (role === "seller") {
      const [sellerResult] = await connection.execute(
        "INSERT INTO sellers (user_id, approved) VALUES (?, 0)",
        [userResult.insertId]
      );
      sellerId = sellerResult.insertId;
    }

    await connection.commit();

    return {
      user: {
        id: userResult.insertId,
        name,
        email,
        role,
        seller_id: sellerId,
        approved,
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

router.post("/register", async (req, res) => {
  const { name, email, password, role = "buyer" } = req.body;
  const requestedRole = role === "seller" ? "seller" : "buyer";

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    const { user } = await createUserAccount({
      name,
      email,
      password,
      role: requestedRole,
    });

    return res.status(201).json({
      message:
        requestedRole === "seller"
          ? "Seller registered successfully. Awaiting admin approval."
          : "Buyer registered successfully.",
      user: formatUserPayload(user),
    });
  } catch (error) {
    if (error.message === "EMAIL_EXISTS") {
      return res.status(409).json({ message: "Email is already registered." });
    }

    return res.status(500).json({ message: "Failed to create account." });
  }
});

router.post("/seller-register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    const { user } = await createUserAccount({
      name,
      email,
      password,
      role: "seller",
    });

    return res.status(201).json({
      message: "Seller registered successfully. Awaiting admin approval.",
      user: formatUserPayload(user),
    });
  } catch (error) {
    if (error.message === "EMAIL_EXISTS") {
      return res.status(409).json({ message: "Email is already registered." });
    }

    return res.status(500).json({ message: "Failed to create seller account." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const [users] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.password, u.role, s.id AS seller_id, s.approved
       FROM users u
       LEFT JOIN sellers s ON s.user_id = u.id
       WHERE u.email = ?
       LIMIT 1`,
      [email]
    );

    if (!users.length) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.role === "seller" && user.approved !== 1) {
      return res.status(403).json({ message: "Seller account is pending admin approval." });
    }

    const payload = formatUserPayload(user);
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({ token, user: payload });
  } catch (error) {
    return res.status(500).json({ message: "Login failed." });
  }
});

module.exports = router;


const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const cors = require("cors");
const express = require("express");

const authRoutes = require("./routes/authRoutes");
const buyerRoutes = require("./routes/buyerRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(authRoutes);
app.use(buyerRoutes);
app.use(adminRoutes);
app.use(sellerRoutes);

app.use((err, _req, res, _next) => {
  return res.status(500).json({
    message: err.message || "Unexpected server error.",
  });
});

module.exports = app;

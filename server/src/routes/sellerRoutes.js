const express = require("express");

const pool = require("../config/db");
const { authenticate, requireApprovedSeller } = require("../middleware/auth");
const { groupBy, roundMoney } = require("../utils/helpers");

const router = express.Router();
const sellerGuard = [authenticate, requireApprovedSeller];

router.get("/seller/dashboard", sellerGuard, async (req, res) => {
  try {
    const sellerId = req.user.sellerId;
    const [[revenueRows], [orderRows], [payoutRows]] = await Promise.all([
      pool.execute("SELECT COALESCE(SUM(total), 0) AS total_revenue FROM sub_orders WHERE seller_id = ?", [sellerId]),
      pool.execute("SELECT COUNT(*) AS total_orders FROM sub_orders WHERE seller_id = ?", [sellerId]),
      pool.execute(
        "SELECT COALESCE(SUM(amount), 0) AS pending_payouts FROM payouts WHERE seller_id = ? AND status = 'pending'",
        [sellerId]
      ),
    ]);

    return res.json({
      totalRevenue: revenueRows[0].total_revenue,
      totalOrders: orderRows[0].total_orders,
      pendingPayouts: payoutRows[0].pending_payouts,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load seller dashboard." });
  }
});

router.get("/seller/products", sellerGuard, async (req, res) => {
  try {
    const [products] = await pool.execute(
      "SELECT id, name, description, price, stock, created_at FROM products WHERE seller_id = ? ORDER BY id DESC",
      [req.user.sellerId]
    );

    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load products." });
  }
});

router.post("/products", sellerGuard, async (req, res) => {
  const { name, description = "", price, stock } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "Name, price, and stock are required." });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO products (seller_id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)",
      [req.user.sellerId, name, description, Number(price), Number(stock)]
    );

    return res.status(201).json({
      message: "Product created successfully.",
      productId: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create product." });
  }
});

router.put("/products/:id", sellerGuard, async (req, res) => {
  const { id } = req.params;
  const { name, description = "", price, stock } = req.body;

  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ message: "Name, price, and stock are required." });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE products
       SET name = ?, description = ?, price = ?, stock = ?
       WHERE id = ? AND seller_id = ?`,
      [name, description, Number(price), Number(stock), id, req.user.sellerId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.json({ message: "Product updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product." });
  }
});

router.delete("/products/:id", sellerGuard, async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM products WHERE id = ? AND seller_id = ?", [
      req.params.id,
      req.user.sellerId,
    ]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.json({ message: "Product deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product." });
  }
});

router.get("/seller/orders", sellerGuard, async (req, res) => {
  try {
    const [subOrders] = await pool.execute(
      `SELECT so.id, so.order_id, so.total, so.status, so.created_at,
              u.name AS buyer_name, u.email AS buyer_email
       FROM sub_orders so
       INNER JOIN orders o ON o.id = so.order_id
       INNER JOIN users u ON u.id = o.buyer_id
       WHERE so.seller_id = ?
       ORDER BY so.id DESC`,
      [req.user.sellerId]
    );

    const [items] = await pool.execute(
      `SELECT soi.sub_order_id, soi.product_id, soi.quantity, soi.unit_price, soi.total, p.name AS product_name
       FROM sub_order_items soi
       INNER JOIN products p ON p.id = soi.product_id
       INNER JOIN sub_orders so ON so.id = soi.sub_order_id
       WHERE so.seller_id = ?`,
      [req.user.sellerId]
    );

    const itemsBySubOrder = groupBy(items, (item) => item.sub_order_id);

    return res.json({
      orders: subOrders.map((subOrder) => ({
        ...subOrder,
        items: itemsBySubOrder[subOrder.id] || [],
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load seller orders." });
  }
});

router.put("/seller/orders/:id/status", sellerGuard, async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "processing", "shipped", "completed", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE sub_orders SET status = ? WHERE id = ? AND seller_id = ?",
      [status, req.params.id, req.user.sellerId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Sub-order not found." });
    }

    return res.json({ message: "Order status updated." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order status." });
  }
});

router.get("/seller-analytics", sellerGuard, async (req, res) => {
  try {
    const sellerId = req.user.sellerId;
    const [[summaryRows], [refundRows], [topProducts]] = await Promise.all([
      pool.execute(
        `SELECT COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS order_count
         FROM sub_orders
         WHERE seller_id = ?`,
        [sellerId]
      ),
      pool.execute(
        `SELECT COUNT(*) AS refunded_orders
         FROM sub_orders
         WHERE seller_id = ? AND status = 'refunded'`,
        [sellerId]
      ),
      pool.execute(
        `SELECT p.name, SUM(soi.quantity) AS units_sold, SUM(soi.total) AS revenue
         FROM sub_order_items soi
         INNER JOIN products p ON p.id = soi.product_id
         INNER JOIN sub_orders so ON so.id = soi.sub_order_id
         WHERE so.seller_id = ?
         GROUP BY p.id, p.name
         ORDER BY units_sold DESC
         LIMIT 5`,
        [sellerId]
      ),
    ]);

    const orderCount = Number(summaryRows[0].order_count || 0);
    const refundedOrders = Number(refundRows[0].refunded_orders || 0);

    return res.json({
      revenue: summaryRows[0].revenue,
      orderCount,
      returnRate: orderCount ? roundMoney((refundedOrders / orderCount) * 100) : 0,
      topProducts,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load analytics." });
  }
});

router.get("/seller/payouts", sellerGuard, async (req, res) => {
  try {
    const [payouts] = await pool.execute(
      `SELECT p.id, p.sub_order_id, p.amount, p.status, p.created_at, so.total AS sub_order_total, c.amount AS commission_amount
       FROM payouts p
       LEFT JOIN sub_orders so ON so.id = p.sub_order_id
       LEFT JOIN commissions c ON c.sub_order_id = p.sub_order_id
       WHERE p.seller_id = ?
       ORDER BY p.id DESC`,
      [req.user.sellerId]
    );

    return res.json({ payouts });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load payouts." });
  }
});

module.exports = router;

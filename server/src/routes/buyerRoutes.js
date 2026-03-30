const express = require("express");

const pool = require("../config/db");
const { authenticate, requireRole } = require("../middleware/auth");
const { groupBy, roundMoney } = require("../utils/helpers");

const router = express.Router();

router.get("/products", async (_req, res) => {
  try {
    const [[settings], [products]] = await Promise.all([
      pool.execute("SELECT commission_rate FROM platform_settings WHERE id = 1"),
      pool.execute(
        `SELECT p.id, p.name, p.price, p.stock, p.description, p.created_at,
                s.id AS seller_id, u.name AS seller_name
         FROM products p
         INNER JOIN sellers s ON s.id = p.seller_id AND s.approved = 1
         INNER JOIN users u ON u.id = s.user_id
         ORDER BY p.id DESC`
      ),
    ]);

    return res.json({
      commissionRate: settings.length ? Number(settings[0].commission_rate) : 0.1,
      products,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load products." });
  }
});

router.post("/cart/checkout", authenticate, requireRole("buyer"), async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: "Cart items are required." });
  }

  const normalizedItems = items
    .map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }))
    .filter((item) => item.productId && item.quantity > 0);

  if (!normalizedItems.length) {
    return res.status(400).json({ message: "Cart items are invalid." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const productIds = normalizedItems.map((item) => item.productId);
    const [productRows] = await connection.query(
      `SELECT p.id, p.name, p.price, p.stock, p.seller_id, u.name AS seller_name
       FROM products p
       INNER JOIN sellers s ON s.id = p.seller_id AND s.approved = 1
       INNER JOIN users u ON u.id = s.user_id
       WHERE p.id IN (?)`,
      [productIds]
    );

    const productMap = productRows.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});

    const lineItems = [];
    for (const item of normalizedItems) {
      const product = productMap[item.productId];
      if (!product) {
        throw new Error(`Product ${item.productId} is unavailable.`);
      }
      if (item.quantity > product.stock) {
        throw new Error(`Insufficient stock for ${product.name}.`);
      }

      const lineTotal = roundMoney(product.price * item.quantity);
      lineItems.push({
        ...item,
        productName: product.name,
        sellerId: product.seller_id,
        sellerName: product.seller_name,
        unitPrice: Number(product.price),
        lineTotal,
      });
    }

    const [[settings]] = await connection.execute(
      "SELECT commission_rate FROM platform_settings WHERE id = 1"
    );
    const commissionRate = Number(settings.length ? settings[0].commission_rate : 0.1);
    const orderTotal = roundMoney(lineItems.reduce((sum, item) => sum + item.lineTotal, 0));

    const [orderResult] = await connection.execute(
      "INSERT INTO orders (buyer_id, total, status) VALUES (?, ?, 'paid')",
      [req.user.id, orderTotal]
    );

    for (const item of lineItems) {
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, seller_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)",
        [orderResult.insertId, item.productId, item.sellerId, item.quantity, item.unitPrice, item.lineTotal]
      );

      await connection.execute("UPDATE products SET stock = stock - ? WHERE id = ?", [
        item.quantity,
        item.productId,
      ]);
    }

    const itemsBySeller = groupBy(lineItems, (item) => item.sellerId);
    const subOrders = [];

    for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
      const subOrderTotal = roundMoney(
        sellerItems.reduce((sum, item) => sum + item.lineTotal, 0)
      );
      const commissionAmount = roundMoney(subOrderTotal * commissionRate);
      const payoutAmount = roundMoney(subOrderTotal - commissionAmount);

      const [subOrderResult] = await connection.execute(
        "INSERT INTO sub_orders (order_id, seller_id, total, status) VALUES (?, ?, ?, 'pending')",
        [orderResult.insertId, Number(sellerId), subOrderTotal]
      );

      for (const item of sellerItems) {
        await connection.execute(
          "INSERT INTO sub_order_items (sub_order_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)",
          [subOrderResult.insertId, item.productId, item.quantity, item.unitPrice, item.lineTotal]
        );
      }

      await connection.execute(
        "INSERT INTO commissions (sub_order_id, rate, amount) VALUES (?, ?, ?)",
        [subOrderResult.insertId, commissionRate, commissionAmount]
      );

      await connection.execute(
        "INSERT INTO payouts (seller_id, sub_order_id, amount, status) VALUES (?, ?, ?, 'pending')",
        [Number(sellerId), subOrderResult.insertId, payoutAmount]
      );

      subOrders.push({
        id: subOrderResult.insertId,
        sellerId: Number(sellerId),
        sellerName: sellerItems[0].sellerName,
        total: subOrderTotal,
        commission: commissionAmount,
        payout: payoutAmount,
        status: "pending",
      });
    }

    await connection.commit();

    return res.status(201).json({
      message: "Order placed successfully.",
      order: {
        id: orderResult.insertId,
        total: orderTotal,
        status: "paid",
        commissionRate,
        subOrders,
      },
    });
  } catch (error) {
    await connection.rollback();
    return res.status(400).json({ message: error.message || "Checkout failed." });
  } finally {
    connection.release();
  }
});

router.get("/orders", authenticate, requireRole("buyer"), async (req, res) => {
  try {
    const [[orders], [subOrders], [subOrderItems], [disputes]] = await Promise.all([
      pool.execute(
        "SELECT id, total, status, created_at FROM orders WHERE buyer_id = ? ORDER BY id DESC",
        [req.user.id]
      ),
      pool.execute(
        `SELECT so.id, so.order_id, so.seller_id, so.total, so.status, so.created_at,
                u.name AS seller_name, c.amount AS commission_amount, p.amount AS payout_amount
         FROM sub_orders so
         INNER JOIN sellers s ON s.id = so.seller_id
         INNER JOIN users u ON u.id = s.user_id
         LEFT JOIN commissions c ON c.sub_order_id = so.id
         LEFT JOIN payouts p ON p.sub_order_id = so.id
         INNER JOIN orders o ON o.id = so.order_id
         WHERE o.buyer_id = ?
         ORDER BY so.id DESC`,
        [req.user.id]
      ),
      pool.execute(
        `SELECT soi.sub_order_id, soi.product_id, soi.quantity, soi.unit_price, soi.total, pr.name AS product_name
         FROM sub_order_items soi
         INNER JOIN sub_orders so ON so.id = soi.sub_order_id
         INNER JOIN orders o ON o.id = so.order_id
         INNER JOIN products pr ON pr.id = soi.product_id
         WHERE o.buyer_id = ?`,
        [req.user.id]
      ),
      pool.execute(
        `SELECT d.id, d.sub_order_id, d.reason, d.status, d.created_at
         FROM disputes d
         INNER JOIN sub_orders so ON so.id = d.sub_order_id
         INNER JOIN orders o ON o.id = so.order_id
         WHERE o.buyer_id = ?`,
        [req.user.id]
      ),
    ]);

    const orderMap = new Map(
      orders.map((order) => [
        order.id,
        {
          ...order,
          subOrders: [],
        },
      ])
    );

    const itemsBySubOrder = groupBy(subOrderItems, (item) => item.sub_order_id);
    const disputesBySubOrder = groupBy(disputes, (item) => item.sub_order_id);

    for (const subOrder of subOrders) {
      const parent = orderMap.get(subOrder.order_id);
      if (!parent) {
        continue;
      }

      parent.subOrders.push({
        ...subOrder,
        items: itemsBySubOrder[subOrder.id] || [],
        disputes: disputesBySubOrder[subOrder.id] || [],
      });
    }

    return res.json({ orders: Array.from(orderMap.values()) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load order history." });
  }
});

router.post("/dispute", authenticate, requireRole("buyer"), async (req, res) => {
  const { subOrderId, reason } = req.body;

  if (!subOrderId || !reason) {
    return res.status(400).json({ message: "Sub-order and reason are required." });
  }

  try {
    const [subOrders] = await pool.execute(
      `SELECT so.id
       FROM sub_orders so
       INNER JOIN orders o ON o.id = so.order_id
       WHERE so.id = ? AND o.buyer_id = ?`,
      [subOrderId, req.user.id]
    );

    if (!subOrders.length) {
      return res.status(404).json({ message: "Sub-order not found." });
    }

    const [existingDisputes] = await pool.execute(
      "SELECT id FROM disputes WHERE sub_order_id = ? AND status = 'open'",
      [subOrderId]
    );

    if (existingDisputes.length) {
      return res.status(409).json({ message: "An open dispute already exists for this sub-order." });
    }

    await pool.execute(
      "INSERT INTO disputes (sub_order_id, reason, status) VALUES (?, ?, 'open')",
      [subOrderId, reason]
    );

    return res.status(201).json({ message: "Dispute raised successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to raise dispute." });
  }
});

module.exports = router;

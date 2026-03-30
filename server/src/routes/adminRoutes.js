const express = require("express");

const pool = require("../config/db");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
const adminGuard = [authenticate, requireRole("admin")];

router.get("/admin/dashboard", adminGuard, async (_req, res) => {
  try {
    const [[sellerRows], [revenueRows], [disputeRows]] = await Promise.all([
      pool.execute("SELECT COUNT(*) AS total_sellers FROM sellers WHERE approved = 1"),
      pool.execute("SELECT COALESCE(SUM(total), 0) AS total_revenue FROM orders"),
      pool.execute("SELECT COUNT(*) AS pending_disputes FROM disputes WHERE status = 'open'"),
    ]);

    return res.json({
      totalSellers: sellerRows[0].total_sellers,
      totalRevenue: revenueRows[0].total_revenue,
      pendingDisputes: disputeRows[0].pending_disputes,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load admin dashboard." });
  }
});

router.get("/admin/sellers", adminGuard, async (_req, res) => {
  try {
    const [sellers] = await pool.execute(
      `SELECT s.id, s.user_id, s.approved, s.created_at, u.name, u.email
       FROM sellers s
       INNER JOIN users u ON u.id = s.user_id
       WHERE s.approved = 0
       ORDER BY s.id ASC`
    );

    return res.json({ sellers });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load pending sellers." });
  }
});

router.put("/admin/sellers/:id/approve", adminGuard, async (req, res) => {
  const { approved = true } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [sellerRows] = await connection.execute(
      "SELECT id, user_id FROM sellers WHERE id = ? FOR UPDATE",
      [req.params.id]
    );

    if (!sellerRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Seller not found." });
    }

    const seller = sellerRows[0];

    if (approved) {
      await connection.execute("UPDATE sellers SET approved = 1 WHERE id = ?", [seller.id]);
    } else {
      await connection.execute("DELETE FROM sellers WHERE id = ?", [seller.id]);
      await connection.execute("DELETE FROM users WHERE id = ? AND role = 'seller'", [seller.user_id]);
    }

    await connection.commit();

    return res.json({
      message: approved ? "Seller approved successfully." : "Seller rejected successfully.",
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: "Failed to update seller approval." });
  } finally {
    connection.release();
  }
});

router.get("/admin/commission", adminGuard, async (_req, res) => {
  try {
    const [settings] = await pool.execute(
      "SELECT id, commission_rate, updated_at FROM platform_settings WHERE id = 1"
    );

    return res.json({
      commissionRate: settings.length ? settings[0].commission_rate : 0.1,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load commission settings." });
  }
});

router.put("/admin/commission", adminGuard, async (req, res) => {
  const { rate } = req.body;
  const numericRate = Number(rate);

  if (Number.isNaN(numericRate) || numericRate < 0 || numericRate > 1) {
    return res.status(400).json({ message: "Commission rate must be between 0 and 1." });
  }

  try {
    await pool.execute(
      "UPDATE platform_settings SET commission_rate = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
      [numericRate]
    );

    return res.json({ message: "Commission rate updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update commission." });
  }
});

router.get("/admin/disputes", adminGuard, async (_req, res) => {
  try {
    const [disputes] = await pool.execute(
      `SELECT d.id, d.reason, d.status, d.created_at, so.id AS sub_order_id, so.total AS sub_order_total,
              buyer.name AS buyer_name, seller_user.name AS seller_name
       FROM disputes d
       INNER JOIN sub_orders so ON so.id = d.sub_order_id
       INNER JOIN orders o ON o.id = so.order_id
       INNER JOIN users buyer ON buyer.id = o.buyer_id
       INNER JOIN sellers seller ON seller.id = so.seller_id
       INNER JOIN users seller_user ON seller_user.id = seller.user_id
       ORDER BY d.id DESC`
    );

    return res.json({ disputes });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load disputes." });
  }
});

router.put("/dispute/:id", adminGuard, async (req, res) => {
  const { action } = req.body;

  if (!["refund", "dismiss"].includes(action)) {
    return res.status(400).json({ message: "Action must be refund or dismiss." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [disputeRows] = await connection.execute(
      "SELECT id, sub_order_id FROM disputes WHERE id = ? FOR UPDATE",
      [req.params.id]
    );

    if (!disputeRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Dispute not found." });
    }

    const dispute = disputeRows[0];
    const newDisputeStatus = action === "refund" ? "refunded" : "dismissed";
    const newSubOrderStatus = action === "refund" ? "refunded" : "completed";

    await connection.execute("UPDATE disputes SET status = ? WHERE id = ?", [
      newDisputeStatus,
      dispute.id,
    ]);
    await connection.execute("UPDATE sub_orders SET status = ? WHERE id = ?", [
      newSubOrderStatus,
      dispute.sub_order_id,
    ]);

    if (action === "refund") {
      await connection.execute("UPDATE payouts SET status = 'reversed' WHERE sub_order_id = ?", [
        dispute.sub_order_id,
      ]);
    }

    await connection.commit();
    return res.json({ message: `Dispute ${newDisputeStatus}.` });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: "Failed to resolve dispute." });
  } finally {
    connection.release();
  }
});

router.get("/admin-analytics", adminGuard, async (_req, res) => {
  try {
    const [[sellers], [commissionRows]] = await Promise.all([
      pool.execute(
        `SELECT s.id AS seller_id, u.name AS seller_name,
                COALESCE(SUM(so.total), 0) AS gross_revenue,
                COALESCE(SUM(c.amount), 0) AS commission_earned,
                COUNT(so.id) AS order_count
         FROM sellers s
         INNER JOIN users u ON u.id = s.user_id
         LEFT JOIN sub_orders so ON so.seller_id = s.id
         LEFT JOIN commissions c ON c.sub_order_id = so.id
         WHERE s.approved = 1
         GROUP BY s.id, u.name
         ORDER BY gross_revenue DESC`
      ),
      pool.execute("SELECT COALESCE(SUM(amount), 0) AS total_commission FROM commissions"),
    ]);

    return res.json({
      revenuePerSeller: sellers,
      totalCommission: commissionRows[0].total_commission,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load admin analytics." });
  }
});

module.exports = router;

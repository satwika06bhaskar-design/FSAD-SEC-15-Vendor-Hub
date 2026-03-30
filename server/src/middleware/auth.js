const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this resource." });
    }

    return next();
  };
}

function requireApprovedSeller(req, res, next) {
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Seller access only." });
  }

  if (!req.user.sellerApproved) {
    return res.status(403).json({ message: "Seller account is pending admin approval." });
  }

  return next();
}

module.exports = {
  authenticate,
  requireApprovedSeller,
  requireRole,
};


import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function defaultRoute(role) {
  if (role === "buyer") return "/buyer/products";
  if (role === "seller") return "/seller/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/login";
}

export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={defaultRoute(user.role)} replace />;
  }

  return children;
}

export { defaultRoute };

import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import ProtectedRoute, { defaultRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProductListPage from "./pages/buyer/ProductListPage";
import CartPage from "./pages/buyer/CartPage";
import CheckoutPage from "./pages/buyer/CheckoutPage";
import OrderHistoryPage from "./pages/buyer/OrderHistoryPage";
import SellerDashboardHome from "./pages/seller/SellerDashboardHome";
import ProductManagementPage from "./pages/seller/ProductManagementPage";
import SellerOrdersPage from "./pages/seller/SellerOrdersPage";
import SellerAnalyticsPage from "./pages/seller/SellerAnalyticsPage";
import SellerPayoutPage from "./pages/seller/SellerPayoutPage";
import AdminDashboardHome from "./pages/admin/AdminDashboardHome";
import SellerVerificationPage from "./pages/admin/SellerVerificationPage";
import CommissionSettingsPage from "./pages/admin/CommissionSettingsPage";
import DisputeManagementPage from "./pages/admin/DisputeManagementPage";
import PlatformAnalyticsPage from "./pages/admin/PlatformAnalyticsPage";

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={defaultRoute(user?.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute roles={["buyer", "seller", "admin"]}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/buyer/products"
          element={
            <ProtectedRoute roles={["buyer"]}>
              <ProductListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/cart"
          element={
            <ProtectedRoute roles={["buyer"]}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/checkout"
          element={
            <ProtectedRoute roles={["buyer"]}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/orders"
          element={
            <ProtectedRoute roles={["buyer"]}>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute roles={["seller"]}>
              <SellerDashboardHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute roles={["seller"]}>
              <ProductManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute roles={["seller"]}>
              <SellerOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/analytics"
          element={
            <ProtectedRoute roles={["seller"]}>
              <SellerAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/payouts"
          element={
            <ProtectedRoute roles={["seller"]}>
              <SellerPayoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboardHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sellers"
          element={
            <ProtectedRoute roles={["admin"]}>
              <SellerVerificationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/commission"
          element={
            <ProtectedRoute roles={["admin"]}>
              <CommissionSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disputes"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DisputeManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute roles={["admin"]}>
              <PlatformAnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

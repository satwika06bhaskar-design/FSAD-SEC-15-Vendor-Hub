import { useEffect, useMemo, useState } from "react";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { Alert, Box } from "@mui/material";
import { Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Header from "./Header";
import Sidebar from "./Sidebar";

const roleLinks = {
  buyer: [
    {
      to: "/buyer/products",
      label: "Catalog",
      description: "Browse products",
      icon: <ShoppingBagOutlinedIcon />,
    },
    {
      to: "/buyer/cart",
      label: "Cart",
      description: "Unified seller cart",
      icon: <SellOutlinedIcon />,
    },
    {
      to: "/buyer/checkout",
      label: "Checkout",
      description: "Place split orders",
      icon: <LocalAtmOutlinedIcon />,
    },
    {
      to: "/buyer/orders",
      label: "Orders",
      description: "Orders and disputes",
      icon: <ReceiptLongOutlinedIcon />,
    },
  ],
  seller: [
    {
      to: "/seller/dashboard",
      label: "Dashboard",
      description: "Performance overview",
      icon: <DashboardOutlinedIcon />,
    },
    {
      to: "/seller/products",
      label: "Products",
      description: "Inventory management",
      icon: <Inventory2OutlinedIcon />,
    },
    {
      to: "/seller/orders",
      label: "Orders",
      description: "Fulfillment status",
      icon: <ReceiptLongOutlinedIcon />,
    },
    {
      to: "/seller/analytics",
      label: "Analytics",
      description: "Revenue insights",
      icon: <InsightsOutlinedIcon />,
    },
    {
      to: "/seller/payouts",
      label: "Payouts",
      description: "Net earnings",
      icon: <LocalAtmOutlinedIcon />,
    },
  ],
  admin: [
    {
      to: "/admin/dashboard",
      label: "Dashboard",
      description: "Platform metrics",
      icon: <DashboardOutlinedIcon />,
    },
    {
      to: "/admin/sellers",
      label: "Sellers",
      description: "Verification queue",
      icon: <RuleOutlinedIcon />,
    },
    {
      to: "/admin/commission",
      label: "Commission",
      description: "Revenue settings",
      icon: <LocalAtmOutlinedIcon />,
    },
    {
      to: "/admin/disputes",
      label: "Disputes",
      description: "Conflict handling",
      icon: <SupportAgentOutlinedIcon />,
    },
    {
      to: "/admin/analytics",
      label: "Analytics",
      description: "Seller breakdown",
      icon: <InsightsOutlinedIcon />,
    },
  ],
};

export default function AppLayout() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar-collapsed") === "true");
  const [approvalBanner, setApprovalBanner] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (user?.role === "seller" && user?.sellerApproved) {
      const key = `seller-approval-seen-${user.id}`;
      if (!localStorage.getItem(key)) {
        notify({ title: "Seller approved", message: "Seller account approved", severity: "success" });
        localStorage.setItem(key, "true");
        setApprovalBanner(true);
      }
    }
  }, [notify, user]);

  const links = useMemo(() => roleLinks[user?.role] || [], [user?.role]);
  const sidebarWidth = collapsed ? 88 : 264;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={links}
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((current) => !current)}
      />
      <Box sx={{ flexGrow: 1, ml: { md: `${sidebarWidth}px` }, p: { xs: 2, md: 3 }, transition: "margin-left 180ms ease" }}>
        <Header onMenuClick={() => setMobileOpen(true)} user={user} />
        {approvalBanner ? (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setApprovalBanner(false)}>
            Your seller account has been approved. You can now start selling.
          </Alert>
        ) : null}
        <Outlet />
      </Box>
    </Box>
  );
}

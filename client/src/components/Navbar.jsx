import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const routeTitles = {
  "/buyer/products": "Browse Products",
  "/buyer/cart": "Your Cart",
  "/buyer/checkout": "Checkout",
  "/buyer/orders": "Orders & Disputes",
  "/seller/dashboard": "Seller Dashboard",
  "/seller/products": "Product Management",
  "/seller/orders": "Seller Orders",
  "/seller/analytics": "Seller Analytics",
  "/seller/payouts": "Payout History",
  "/admin/dashboard": "Admin Dashboard",
  "/admin/sellers": "Seller Verification",
  "/admin/commission": "Commission Settings",
  "/admin/disputes": "Dispute Management",
  "/admin/analytics": "Platform Analytics",
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { notifications, unreadCount, markAllRead } = useToast();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [cartAnimate, setCartAnimate] = useState(false);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  useEffect(() => {
    if (cartCount) {
      setCartAnimate(true);
      const timer = window.setTimeout(() => setCartAnimate(false), 500);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [cartCount]);

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 2,
        borderRadius: 5,
        mb: 3,
        bgcolor: "background.paper",
        boxShadow: "0 14px 40px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton onClick={onMenuClick} sx={{ display: { md: "none" } }}>
            <MenuOutlinedIcon />
          </IconButton>
          <Box>
            <Typography variant="h6">{routeTitles[location.pathname] || "Marketplace"}</Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back, {user?.name}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          {user?.role === "buyer" ? (
            <Tooltip title="Cart">
              <IconButton
                component={Link}
                to="/buyer/cart"
                sx={{
                  transform: cartAnimate ? "scale(1.08)" : "scale(1)",
                  transition: "transform 180ms ease",
                }}
              >
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          ) : null}

          <Tooltip title="Notifications">
            <IconButton
              onClick={(event) => {
                setNotificationAnchor(event.currentTarget);
                markAllRead();
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Account">
            <IconButton onClick={(event) => setProfileAnchor(event.currentTarget)}>
              <Avatar sx={{ bgcolor: "primary.main" }}>{user?.name?.[0] || "U"}</Avatar>
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{ sx: { width: 320, borderRadius: 4, mt: 1.5 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Recent marketplace activity
          </Typography>
        </Box>
        <Divider />
        {notifications.length ? (
          notifications.map((item) => (
            <MenuItem key={item.id} onClick={() => setNotificationAnchor(null)} sx={{ whiteSpace: "normal", py: 1.5 }}>
              <Stack spacing={0.25}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.message}
                </Typography>
              </Stack>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No notifications yet</MenuItem>
        )}
      </Menu>

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        PaperProps={{ sx: { width: 220, borderRadius: 4, mt: 1.5 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: "secondary.main" }}>{user?.name?.[0] || "U"}</Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Divider />
        <MenuItem onClick={() => setProfileAnchor(null)}>
          <ListItemIcon>
            <PersonOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            logout();
          }}
        >
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import {
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  IconButton,
  InputAdornment,
  Link,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const rootLinks = {
  buyer: "/buyer/products",
  seller: "/seller/dashboard",
  admin: "/admin/dashboard",
};

const routeMap = {
  buyer: {
    products: "Product Catalog",
    cart: "Cart",
    checkout: "Checkout",
    orders: "Orders",
  },
  seller: {
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    analytics: "Analytics",
    payouts: "Payouts",
  },
  admin: {
    dashboard: "Dashboard",
    sellers: "Sellers",
    commission: "Commission",
    disputes: "Disputes",
    analytics: "Analytics",
  },
};

export default function Header({ onMenuClick, user }) {
  const location = useLocation();
  const { logout } = useAuth();
  const { items } = useCart();
  const { notifications, unreadCount, markAllRead } = useToast();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  const crumbs = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts.map((part, index) => {
      if (index === 0) {
        return { label: part.charAt(0).toUpperCase() + part.slice(1), to: rootLinks[part] || `/${part}` };
      }
      return {
        label: routeMap[parts[0]]?.[part] || part,
        to: `/${parts.slice(0, index + 1).join("/")}`,
      };
    });
  }, [location.pathname]);

  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
        <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton sx={{ display: { md: "none" } }} onClick={onMenuClick}>
              <MenuOutlinedIcon />
            </IconButton>
            <Breadcrumbs separator={<NavigateNextOutlinedIcon fontSize="small" />}>
              {crumbs.map((crumb, index) => (
                <Link key={crumb.to} component={RouterLink} to={crumb.to} color={index === crumbs.length - 1 ? "text.primary" : "text.secondary"} underline="hover" sx={{ fontWeight: index === crumbs.length - 1 ? 600 : 400 }}>
                  {crumb.label}
                </Link>
              ))}
            </Breadcrumbs>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {crumbs[crumbs.length - 1]?.label || "Marketplace"}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: "100%", md: "auto" } }}>
          <TextField
            size="small"
            placeholder="Search"
            sx={{ minWidth: { xs: 0, md: 260 }, flex: { xs: 1, md: "unset" } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {user?.role === "buyer" ? (
            <IconButton component={RouterLink} to="/buyer/cart">
              <Badge badgeContent={cartCount} color="primary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
          ) : null}

          <IconButton onClick={(event) => { setNotificationAnchor(event.currentTarget); markAllRead(); }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsOutlinedIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={(event) => setProfileAnchor(event.currentTarget)}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>{user?.name?.[0] || "U"}</Avatar>
          </IconButton>
        </Stack>
      </Stack>

      <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={() => setNotificationAnchor(null)} PaperProps={{ sx: { width: 320, borderRadius: 3, mt: 1 } }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 600 }}>Notifications</Typography>
          <Typography variant="body2" color="text.secondary">Recent updates</Typography>
        </Box>
        {notifications.length ? notifications.map((item) => (
          <MenuItem key={item.id} onClick={() => setNotificationAnchor(null)} sx={{ whiteSpace: "normal", alignItems: "flex-start", py: 1.5 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
              <Typography variant="caption" color="text.secondary">{item.message}</Typography>
            </Box>
          </MenuItem>
        )) : <MenuItem disabled>No notifications</MenuItem>}
      </Menu>

      <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)} PaperProps={{ sx: { width: 220, borderRadius: 3, mt: 1 } }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 600 }}>{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>{user?.role}</Typography>
        </Box>
        <MenuItem onClick={() => setProfileAnchor(null)}>
          <PersonOutlineOutlinedIcon fontSize="small" style={{ marginRight: 10 }} />
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            logout();
          }}
        >
          <LogoutOutlinedIcon fontSize="small" style={{ marginRight: 10 }} />
          Logout
        </MenuItem>
      </Menu>
    </Paper>
  );
}

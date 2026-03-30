import ChevronLeftOutlinedIcon from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlinedIcon from "@mui/icons-material/ChevronRightOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const expandedWidth = 264;
const collapsedWidth = 88;

export default function Sidebar({ mobileOpen, onClose, links, user, collapsed, onToggleCollapse }) {
  const location = useLocation();
  const width = collapsed ? collapsedWidth : expandedWidth;

  const content = (
    <Box sx={{ height: "100%", bgcolor: "background.paper", color: "text.primary", borderRight: "1px solid", borderColor: "divider" }}>
      <Stack spacing={2} sx={{ height: "100%", p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main" }}>
              <StorefrontOutlinedIcon fontSize="small" />
            </Avatar>
            {!collapsed ? (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  VendorHub
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Marketplace OS
                </Typography>
              </Box>
            ) : null}
          </Stack>
          <IconButton sx={{ display: { xs: "none", md: "inline-flex" } }} onClick={onToggleCollapse}>
            {collapsed ? <ChevronRightOutlinedIcon /> : <ChevronLeftOutlinedIcon />}
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: collapsed ? 0.5 : 1.5, py: 1.25, borderRadius: 3, bgcolor: "grey.50" }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main" }}>{user?.name?.[0] || "U"}</Avatar>
          {!collapsed ? (
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600 }} noWrap>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                {user?.role}
              </Typography>
            </Box>
          ) : null}
        </Stack>

        <Divider />

        <List sx={{ flexGrow: 1, px: 0.5 }}>
          {links.map((link) => {
            const active = location.pathname === link.to;
            const button = (
              <ListItemButton
                key={link.to}
                component={Link}
                to={link.to}
                onClick={onClose}
                sx={{
                  mb: 0.75,
                  borderRadius: 3,
                  minHeight: 48,
                  px: collapsed ? 1.5 : 1.75,
                  justifyContent: collapsed ? "center" : "flex-start",
                  position: "relative",
                  bgcolor: active ? "rgba(79, 70, 229, 0.08)" : "transparent",
                  color: active ? "primary.main" : "text.secondary",
                  '&:hover': { bgcolor: "rgba(15, 23, 42, 0.04)", color: "text.primary" },
                  '&::before': active
                    ? {
                        content: '""',
                        position: "absolute",
                        left: 4,
                        top: 8,
                        bottom: 8,
                        width: 3,
                        borderRadius: 999,
                        bgcolor: "primary.main",
                      }
                    : undefined,
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 0 : 38, color: "inherit", justifyContent: "center" }}>
                  {link.icon}
                </ListItemIcon>
                {!collapsed ? (
                  <ListItemText
                    primary={link.label}
                    secondary={link.description}
                    primaryTypographyProps={{ fontWeight: active ? 600 : 500 }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                  />
                ) : null}
              </ListItemButton>
            );

            return collapsed ? <Tooltip title={link.label} placement="right" key={link.to}>{button}</Tooltip> : button;
          })}
        </List>
      </Stack>
    </Box>
  );

  return (
    <>
      <Drawer
        open={mobileOpen}
        onClose={onClose}
        variant="temporary"
        sx={{ display: { xs: "block", md: "none" }, '& .MuiDrawer-paper': { width: expandedWidth, border: 0 } }}
      >
        {content}
      </Drawer>
      <Drawer
        open
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          '& .MuiDrawer-paper': { width, border: 0, transition: "width 180ms ease" },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}

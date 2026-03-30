import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import DonutLargeOutlinedIcon from "@mui/icons-material/DonutLargeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppCard from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { sellerApi } from "../../services/api";
import { currency, formatDate } from "../../utils/format";

const pieColors = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];
const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

function buildSalesTrend(orders) {
  const bucket = orders.reduce((map, order) => {
    const key = formatDate(order.created_at);
    if (!map[key]) {
      map[key] = { label: key, sales: 0, orders: 0 };
    }
    map[key].sales += Number(order.total || 0);
    map[key].orders += 1;
    return map;
  }, {});

  return Object.values(bucket).slice(-7);
}

function buildTopProducts(products) {
  return [...products]
    .map((product) => ({
      ...product,
      inventoryValue: Number(product.price || 0) * Number(product.stock || 0),
    }))
    .sort((left, right) => right.inventoryValue - left.inventoryValue)
    .slice(0, 4);
}

function MetricCard({ label, value, icon, accent = "#FFFFFF", dark = false, caption }) {
  return (
    <AppCard
      sx={{
        bgcolor: dark ? "#171717" : "background.paper",
        color: dark ? "common.white" : "text.primary",
        boxShadow: dark ? "0 18px 45px rgba(15, 23, 42, 0.14)" : undefined,
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: dark ? alpha("#FFFFFF", 0.72) : "text.secondary" }}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              bgcolor: dark ? alpha("#FFFFFF", 0.12) : alpha(accent, 0.12),
              color: dark ? "common.white" : accent,
            }}
          >
            {icon}
          </Box>
        </Stack>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: dark ? "common.white" : "text.primary" }}>
            {value}
          </Typography>
          {caption ? (
            <Typography variant="body2" sx={{ mt: 1, color: dark ? alpha("#FFFFFF", 0.7) : "text.secondary" }}>
              {caption}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </AppCard>
  );
}

export default function SellerDashboardHome() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0, pendingPayouts: 0 });
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const [dashboardResponse, ordersResponse, productsResponse] = await Promise.all([
        sellerApi.dashboard(),
        sellerApi.orders(),
        sellerApi.products(),
      ]);

      const nextOrders = ordersResponse.data.orders || [];
      setSummary(dashboardResponse.data);
      setOrders(nextOrders);
      setProducts(productsResponse.data.products || []);

      const storageKey = `seller-order-count-${user?.id}`;
      const previousCount = Number(localStorage.getItem(storageKey) || 0);
      if (nextOrders.length > previousCount && previousCount !== 0) {
        notify({ title: "Orders", message: "New order received", severity: "info" });
      }
      localStorage.setItem(storageKey, String(nextOrders.length));
      setLoading(false);
    };

    loadDashboard();
  }, [notify, user?.id]);

  const pendingOrders = useMemo(
    () => orders.filter((order) => ["pending", "processing", "shipped"].includes(order.status)).length,
    [orders]
  );

  const averageOrderValue = useMemo(() => {
    const count = Number(summary.totalOrders || 0);
    if (!count) {
      return 0;
    }
    return Number(summary.totalRevenue || 0) / count;
  }, [summary.totalOrders, summary.totalRevenue]);

  const salesTrend = useMemo(() => buildSalesTrend(orders), [orders]);
  const orderDistribution = useMemo(() => {
    const counts = orders.reduce((map, order) => {
      const key = order.status || "pending";
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const topProducts = useMemo(() => buildTopProducts(products), [products]);
  const latestOrders = useMemo(
    () => [...orders].sort((left, right) => new Date(right.created_at) - new Date(left.created_at)).slice(0, 5),
    [orders]
  );

  if (loading) {
    return <LoadingSkeleton variant="dashboard" />;
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Seller"
        title={`Welcome back, ${user?.name || "Seller"}`}
        description="Here is your current sales overview, product performance snapshot, and latest order activity."
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.35fr 0.65fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <AppCard
          sx={{
            bgcolor: "#F8FAFC",
            background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
            color: "common.white",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
          }}
        >
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 52, height: 52, bgcolor: alpha("#FFFFFF", 0.12), color: "common.white" }}>
                  {user?.name?.[0] || "S"}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ color: "common.white", fontWeight: 700 }}>
                    {user?.name || "Seller Workspace"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.68) }}>
                    {user?.email || "seller@vendorhub.com"}
                  </Typography>
                </Box>
              </Stack>
              <Chip
                icon={<StorefrontOutlinedIcon />}
                label={user?.sellerApproved ? "Approved seller" : "Pending approval"}
                sx={{
                  bgcolor: alpha("#FFFFFF", 0.12),
                  color: "common.white",
                  border: "1px solid",
                  borderColor: alpha("#FFFFFF", 0.15),
                  width: "fit-content",
                }}
              />
            </Stack>

            <Typography sx={{ maxWidth: 560, color: alpha("#FFFFFF", 0.76), lineHeight: 1.8 }}>
              Monitor revenue, order flow, pending payouts, and catalog movement from one seller workspace using the
              same marketplace logic already connected to your account.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Chip label={`${products.length} active products`} sx={{ bgcolor: alpha("#FFFFFF", 0.08), color: "common.white" }} />
              <Chip label={`${pendingOrders} pending orders`} sx={{ bgcolor: alpha("#FFFFFF", 0.08), color: "common.white" }} />
              <Chip label={`${compactNumber.format(summary.totalRevenue || 0)} gross revenue`} sx={{ bgcolor: alpha("#FFFFFF", 0.08), color: "common.white" }} />
            </Stack>
          </Stack>
        </AppCard>

        <AppCard>
          <Stack spacing={2.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Store summary
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Seller role</Typography>
                <Typography sx={{ fontWeight: 600, textTransform: "capitalize" }}>{user?.role || "seller"}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Approval status</Typography>
                <StatusChip status={user?.sellerApproved ? "approved" : "pending"} />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Catalog size</Typography>
                <Typography sx={{ fontWeight: 600 }}>{products.length} products</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Orders handled</Typography>
                <Typography sx={{ fontWeight: 600 }}>{summary.totalOrders || 0}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </AppCard>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2.5, mb: 3 }}>
        <MetricCard
          label="Average order value"
          value={currency.format(averageOrderValue)}
          icon={<TrendingUpOutlinedIcon />}
          dark
          caption="Based on seller sub-orders in your account"
        />
        <MetricCard
          label="Total orders"
          value={summary.totalOrders || 0}
          icon={<ShoppingBagOutlinedIcon />}
          accent="#06B6D4"
          caption="All seller orders received so far"
        />
        <MetricCard
          label="Revenue"
          value={currency.format(summary.totalRevenue || 0)}
          icon={<AttachMoneyOutlinedIcon />}
          accent="#10B981"
          caption="Gross revenue before payout settlement"
        />
        <MetricCard
          label="Pending payouts"
          value={currency.format(summary.pendingPayouts || 0)}
          icon={<MonetizationOnOutlinedIcon />}
          accent="#F59E0B"
          caption="Amount currently awaiting payout"
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "1.25fr 0.75fr" },
          gap: 3,
          mb: 3,
        }}
      >
        <AppCard>
          <Stack spacing={2.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">Sales overtime</Typography>
                <Typography variant="body2" color="text.secondary">
                  Revenue and order activity from your recent seller orders.
                </Typography>
              </Box>
              <Chip icon={<LocalShippingOutlinedIcon />} label={`${pendingOrders} pending`} />
            </Stack>
            <Box sx={{ height: 320 }}>
              {salesTrend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" name="Revenue" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="orders" name="Orders" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="No order activity yet"
                  description="As new seller orders arrive, your revenue trend will appear here."
                  icon={<TrendingUpOutlinedIcon fontSize="large" />}
                />
              )}
            </Box>
          </Stack>
        </AppCard>

        <Stack spacing={3}>
          <AppCard>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Order status mix</Typography>
                <DonutLargeOutlinedIcon color="action" />
              </Stack>
              <Box sx={{ height: 240 }}>
                {orderDistribution.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={orderDistribution} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3}>
                        {orderDistribution.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState title="No statuses yet" description="Order states will appear here once your first seller orders are created." />
                )}
              </Box>
            </Stack>
          </AppCard>

          <AppCard>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">Top listed products</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ranked by current inventory value.
                  </Typography>
                </Box>
                <Chip icon={<Inventory2OutlinedIcon />} label={`${products.length} items`} />
              </Stack>
              {topProducts.length ? (
                <List disablePadding>
                  {topProducts.map((product, index) => (
                    <Box key={product.id}>
                      <ListItem disableGutters sx={{ py: 1.25 }}>
                        <ListItemAvatar>
                          <Avatar variant="rounded" sx={{ width: 52, height: 52, bgcolor: alpha("#4F46E5", 0.1), color: "primary.main", fontWeight: 700 }}>
                            {product.name?.charAt(0)?.toUpperCase() || "P"}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography sx={{ fontWeight: 600 }}>{product.name}</Typography>}
                          secondary={`${currency.format(product.price)} each • ${product.stock} in stock`}
                        />
                        <StatusChip status={Number(product.stock) > 0 ? "In Stock" : "Out of Stock"} />
                      </ListItem>
                      {index !== topProducts.length - 1 ? <Divider /> : null}
                    </Box>
                  ))}
                </List>
              ) : (
                <EmptyState
                  title="No products yet"
                  description="Add products to your seller catalog and they will show up here."
                  icon={<Inventory2OutlinedIcon fontSize="large" />}
                />
              )}
            </Stack>
          </AppCard>
        </Stack>
      </Box>

      <AppCard>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={1.5}>
            <Box>
              <Typography variant="h6">Latest orders</Typography>
              <Typography variant="body2" color="text.secondary">
                Your most recent seller orders with buyer and fulfillment status details.
              </Typography>
            </Box>
            <Chip icon={<ShoppingBagOutlinedIcon />} label={`${latestOrders.length} recent orders`} />
          </Stack>

          {latestOrders.length ? (
            <TableContainer>
              <Table sx={{ minWidth: 680 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Buyer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>#{order.id}</TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>{order.buyer_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.buyer_email}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell>{currency.format(order.total)}</TableCell>
                      <TableCell>
                        <StatusChip status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <EmptyState
              title="No orders available"
              description="Once buyers place orders that include your products, they will appear in this table."
              icon={<ShoppingBagOutlinedIcon fontSize="large" />}
            />
          )}
        </Stack>
      </AppCard>
    </Box>
  );
}

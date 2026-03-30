import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  LinearProgress,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppCard from "../../components/Card";
import DataTable from "../../components/DataTable";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import SummaryCard from "../../components/SummaryCard";
import { adminApi, buyerApi } from "../../services/api";
import { currency, formatDate } from "../../utils/format";

export default function AdminDashboardHome() {
  const [summary, setSummary] = useState({ totalSellers: 0, totalRevenue: 0, pendingDisputes: 0 });
  const [pendingSellers, setPendingSellers] = useState([]);
  const [analytics, setAnalytics] = useState({ revenuePerSeller: [], totalCommission: 0 });
  const [products, setProducts] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboardResponse, sellersResponse, analyticsResponse, productsResponse] = await Promise.all([
          adminApi.dashboard(),
          adminApi.sellers(),
          adminApi.analytics(),
          buyerApi.products(),
        ]);

        setSummary(dashboardResponse.data || {});
        setPendingSellers(sellersResponse.data.sellers || []);
        setAnalytics(analyticsResponse.data || { revenuePerSeller: [], totalCommission: 0 });
        setProducts(productsResponse.data.products || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load admin dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const approvedSellerRows = useMemo(() => {
    const productCounts = products.reduce((map, product) => {
      map[product.seller_id] = (map[product.seller_id] || 0) + 1;
      return map;
    }, {});

    return (analytics.revenuePerSeller || []).map((seller) => ({
      id: seller.seller_id,
      sellerName: seller.seller_name,
      email: "Unavailable from current API",
      storeName: seller.seller_name,
      status: "Approved",
      joinedDate: null,
      totalProducts: productCounts[seller.seller_id] || 0,
      totalOrders: Number(seller.order_count || 0),
      revenue: Number(seller.gross_revenue || 0),
      commission: Number(seller.commission_earned || 0),
    }));
  }, [analytics.revenuePerSeller, products]);

  const totalOrders = useMemo(
    () => approvedSellerRows.reduce((sum, seller) => sum + seller.totalOrders, 0),
    [approvedSellerRows]
  );

  const topSeller = approvedSellerRows[0] || null;

  const revenueTrend = useMemo(
    () => approvedSellerRows.slice(0, 6).map((seller) => ({ name: seller.sellerName, revenue: seller.revenue })),
    [approvedSellerRows]
  );

  const sellerGrowth = useMemo(
    () => approvedSellerRows.slice(0, 6).map((seller) => ({ name: seller.sellerName, orders: seller.totalOrders })),
    [approvedSellerRows]
  );

  if (loading) {
    return <LoadingSkeleton variant="dashboard" />;
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Admin"
        title="Platform command center"
        description="Monitor marketplace health, seller approvals, platform earnings, and approved seller performance from one dashboard."
      />

      {error ? (
        <Typography color="error.main" sx={{ mb: 3 }}>
          {error}
        </Typography>
      ) : null}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1.5fr 1fr" }, gap: 3, mb: 3 }}>
        <AppCard
          sx={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            color: "common.white",
            borderColor: "transparent",
          }}
        >
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="overline" sx={{ color: alpha("#FFFFFF", 0.64), letterSpacing: 1.2 }}>
                  Marketplace overview
                </Typography>
                <Typography variant="h4" sx={{ color: "common.white", mb: 1 }}>
                  Marketplace activity is under control
                </Typography>
                <Typography sx={{ color: alpha("#FFFFFF", 0.72), maxWidth: 520, lineHeight: 1.7 }}>
                  Approved sellers, pending verifications, platform revenue, orders, and disputes are all visible here using your existing admin data.
                </Typography>
              </Box>

              <Box
                sx={{
                  minWidth: { xs: "100%", md: 220 },
                  p: 2.5,
                  borderRadius: 4,
                  bgcolor: alpha("#FFFFFF", 0.08),
                  border: "1px solid",
                  borderColor: alpha("#FFFFFF", 0.08),
                }}
              >
                <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.7) }}>
                  Commission earned
                </Typography>
                <Typography variant="h4" sx={{ color: "common.white", mt: 0.75, mb: 0.5 }}>
                  {currency.format(analytics.totalCommission || 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.68) }}>
                  Across approved seller sub-orders.
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
              <Box sx={{ p: 2.25, borderRadius: 3, bgcolor: alpha("#FFFFFF", 0.06) }}>
                <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.68) }}>
                  Pending disputes
                </Typography>
                <Typography variant="h5" sx={{ color: "common.white", mt: 0.75 }}>
                  {summary.pendingDisputes || 0}
                </Typography>
              </Box>
              <Box sx={{ p: 2.25, borderRadius: 3, bgcolor: alpha("#FFFFFF", 0.06) }}>
                <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.68) }}>
                  Pending sellers
                </Typography>
                <Typography variant="h5" sx={{ color: "common.white", mt: 0.75 }}>
                  {pendingSellers.length}
                </Typography>
              </Box>
              <Box sx={{ p: 2.25, borderRadius: 3, bgcolor: alpha("#FFFFFF", 0.06) }}>
                <Typography variant="body2" sx={{ color: alpha("#FFFFFF", 0.68) }}>
                  Top seller
                </Typography>
                <Typography variant="h6" sx={{ color: "common.white", mt: 0.75 }}>
                  {topSeller?.sellerName || "No seller data"}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </AppCard>

        <AppCard>
          <Stack spacing={2.25}>
            <Typography variant="h6">Verification queue</Typography>
            {pendingSellers.length ? (
              pendingSellers.slice(0, 4).map((seller) => (
                <Stack key={seller.id} direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 42, height: 42, bgcolor: "warning.light", color: "warning.dark" }}>
                    {seller.name?.[0] || "S"}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }} noWrap>
                      {seller.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {seller.email}
                    </Typography>
                  </Box>
                  <StatusChip status="Pending" />
                </Stack>
              ))
            ) : (
              <Typography color="text.secondary">No sellers are waiting for review right now.</Typography>
            )}

            <Divider />

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Approval progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={summary.totalSellers + pendingSellers.length ? (summary.totalSellers / (summary.totalSellers + pendingSellers.length)) * 100 : 0}
                sx={{ height: 10, borderRadius: 999 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {summary.totalSellers} approved out of {summary.totalSellers + pendingSellers.length} total sellers
              </Typography>
            </Box>
          </Stack>
        </AppCard>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 2.5, mb: 3 }}>
        <SummaryCard label="Total Sellers" value={summary.totalSellers + pendingSellers.length} icon={<GroupsOutlinedIcon />} accent="primary.main" />
        <SummaryCard label="Approved Sellers" value={summary.totalSellers} icon={<CheckCircleOutlineOutlinedIcon />} accent="success.main" />
        <SummaryCard label="Pending Sellers" value={pendingSellers.length} icon={<PendingActionsOutlinedIcon />} accent="warning.main" />
        <SummaryCard label="Total Revenue" value={currency.format(summary.totalRevenue || 0)} icon={<AttachMoneyOutlinedIcon />} accent="secondary.main" />
        <SummaryCard label="Total Orders" value={totalOrders} icon={<ShoppingBagOutlinedIcon />} accent="primary.main" />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" }, gap: 3, mb: 4 }}>
        <AppCard>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ width: 40, height: 40, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: alpha("#4F46E5", 0.08), color: "primary.main" }}>
                <AttachMoneyOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6">Revenue by seller</Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved sellers ranked by revenue.
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip formatter={(value) => currency.format(value)} />
                  <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </AppCard>

        <AppCard>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ width: 40, height: 40, borderRadius: 3, display: "grid", placeItems: "center", bgcolor: alpha("#06B6D4", 0.12), color: "secondary.main" }}>
                <TimelineOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6">Order volume</Typography>
                <Typography variant="body2" color="text.secondary">
                  Current order count across approved sellers.
                </Typography>
              </Box>
            </Stack>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sellerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </AppCard>
      </Box>

      <PageHeader
        eyebrow="Approved sellers"
        title="Seller performance"
        description="Search, sort, and inspect the approved sellers currently returned by your analytics endpoint."
      />

      <DataTable
        columns={[
          {
            id: "sellerName",
            label: "Seller Name",
            renderCell: (row) => (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.50", color: "primary.main" }}>
                  {row.sellerName?.[0] || "S"}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{row.sellerName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.storeName}
                  </Typography>
                </Box>
              </Stack>
            ),
            getSearchValue: (row) => `${row.sellerName} ${row.storeName}`,
          },
          { id: "email", label: "Email" },
          { id: "storeName", label: "Store Name" },
          {
            id: "status",
            label: "Status",
            renderCell: (row) => <StatusChip status={row.status} />,
            searchable: false,
          },
          {
            id: "joinedDate",
            label: "Joined Date",
            getValue: (row) => (row.joinedDate ? formatDate(row.joinedDate) : "Unavailable"),
            getSortValue: (row) => row.joinedDate || "",
          },
          { id: "totalProducts", label: "Total Products" },
          { id: "totalOrders", label: "Total Orders" },
          {
            id: "revenue",
            label: "Revenue",
            getValue: (row) => currency.format(row.revenue),
            getSortValue: (row) => row.revenue,
          },
          {
            id: "actions",
            label: "Actions",
            sortable: false,
            searchable: false,
            renderCell: (row) => (
              <Button size="small" variant="outlined" startIcon={<VisibilityOutlinedIcon />} onClick={() => setSelectedSeller(row)}>
                View
              </Button>
            ),
          },
        ]}
        rows={approvedSellerRows}
        initialSortBy="revenue"
        initialSortDirection="desc"
        searchPlaceholder="Search approved sellers"
        emptyTitle="No approved seller data"
        emptyDescription="Approved seller analytics will appear here when seller revenue data is available."
      />

      <Drawer anchor="right" open={Boolean(selectedSeller)} onClose={() => setSelectedSeller(null)}>
        <Box sx={{ width: { xs: 320, sm: 380 }, p: 3 }}>
          {selectedSeller ? (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 52, height: 52, bgcolor: "primary.main" }}>
                  {selectedSeller.sellerName?.[0] || "S"}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedSeller.sellerName}</Typography>
                  <Typography color="text.secondary">{selectedSeller.email}</Typography>
                </Box>
              </Stack>

              <Divider />

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: "grey.50" }}>
                  <Typography variant="body2" color="text.secondary">Products</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>{selectedSeller.totalProducts}</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: "grey.50" }}>
                  <Typography variant="body2" color="text.secondary">Orders</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>{selectedSeller.totalOrders}</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: "grey.50" }}>
                  <Typography variant="body2" color="text.secondary">Revenue</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>{currency.format(selectedSeller.revenue)}</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: "grey.50" }}>
                  <Typography variant="body2" color="text.secondary">Commission</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>{currency.format(selectedSeller.commission)}</Typography>
                </Box>
              </Box>

              <Divider />

              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Store Name</Typography>
                  <Typography sx={{ mt: 0.5 }}>{selectedSeller.storeName}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Approval Status</Typography>
                  <Box sx={{ mt: 0.75 }}>
                    <StatusChip status={selectedSeller.status} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Joined Date</Typography>
                  <Typography sx={{ mt: 0.5 }}>
                    {selectedSeller.joinedDate ? formatDate(selectedSeller.joinedDate) : "Unavailable from current API"}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          ) : null}
        </Box>
      </Drawer>
    </Box>
  );
}

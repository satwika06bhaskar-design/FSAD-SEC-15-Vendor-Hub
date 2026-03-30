import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { Box, Stack, TableCell, TableRow } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppCard from "../../components/Card";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import SummaryCard from "../../components/SummaryCard";
import { adminApi } from "../../services/api";
import { currency } from "../../utils/format";

export default function PlatformAnalyticsPage() {
  const [analytics, setAnalytics] = useState({ revenuePerSeller: [], totalCommission: 0 });

  useEffect(() => {
    adminApi.analytics().then(({ data }) => setAnalytics(data));
  }, []);

  const topSellers = useMemo(
    () => (analytics.revenuePerSeller || []).slice(0, 6).map((seller) => ({
      name: seller.seller_name,
      revenue: Number(seller.gross_revenue || 0),
    })),
    [analytics.revenuePerSeller]
  );

  return (
    <Box>
      <PageHeader
        eyebrow="Admin"
        title="Platform analytics"
        description="Review revenue, seller contribution, and marketplace commission in responsive analytics cards."
      />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2.5, mb: 3 }}>
        <SummaryCard label="Total Commission" value={currency.format(analytics.totalCommission || 0)} icon={<MonetizationOnOutlinedIcon />} accent="primary.main" />
        <SummaryCard label="Tracked Sellers" value={analytics.revenuePerSeller?.length || 0} icon={<StorefrontOutlinedIcon />} accent="secondary.main" />
        <SummaryCard label="Leaderboard Entries" value={topSellers.length} icon={<LeaderboardOutlinedIcon />} accent="success.main" />
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "0.95fr 1.05fr" }, gap: 3, mb: 3 }}>
        <AppCard>
          <Stack spacing={2}>
            <PageHeader title="Revenue" description="Gross revenue per seller" />
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellers}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </AppCard>

        <DataTable
          columns={[
            { key: "seller", label: "Seller" },
            { key: "gross", label: "Gross Revenue" },
            { key: "commission", label: "Commission" },
            { key: "orders", label: "Orders" },
          ]}
          rows={analytics.revenuePerSeller || []}
          emptyTitle="No data available"
          emptyDescription="Seller revenue data will appear once orders are processed."
          renderRow={(seller) => (
            <TableRow key={seller.seller_id} hover>
              <TableCell>{seller.seller_name}</TableCell>
              <TableCell>{currency.format(seller.gross_revenue)}</TableCell>
              <TableCell>{currency.format(seller.commission_earned)}</TableCell>
              <TableCell>{seller.order_count}</TableCell>
            </TableRow>
          )}
        />
      </Box>
    </Box>
  );
}

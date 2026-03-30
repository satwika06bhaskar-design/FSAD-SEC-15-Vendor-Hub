import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ShoppingCartCheckoutOutlinedIcon from "@mui/icons-material/ShoppingCartCheckoutOutlined";
import { Box, Stack, TableCell, TableRow } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppCard from "../../components/Card";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import SummaryCard from "../../components/SummaryCard";
import { sellerApi } from "../../services/api";
import { currency, formatPercent } from "../../utils/format";

const pieColors = ["#4F46E5", "#06B6D4", "#10B981"];

export default function SellerAnalyticsPage() {
  const [analytics, setAnalytics] = useState({ revenue: 0, orderCount: 0, returnRate: 0, topProducts: [] });

  useEffect(() => {
    sellerApi.analytics().then(({ data }) => setAnalytics(data));
  }, []);

  const returnData = useMemo(
    () => [
      { name: "Returned", value: Number(analytics.returnRate || 0) },
      { name: "Kept", value: Math.max(100 - Number(analytics.returnRate || 0), 0) },
    ],
    [analytics.returnRate]
  );

  return (
    <Box>
      <PageHeader
        eyebrow="Seller"
        title="Performance analytics"
        description="Revenue, orders, returns, and top products presented in responsive chart cards."
      />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2.5, mb: 3 }}>
        <SummaryCard label="Revenue" value={currency.format(analytics.revenue || 0)} icon={<MonetizationOnOutlinedIcon />} accent="primary.main" />
        <SummaryCard label="Order Count" value={analytics.orderCount || 0} icon={<ShoppingCartCheckoutOutlinedIcon />} accent="secondary.main" />
        <SummaryCard label="Return Rate" value={formatPercent(analytics.returnRate || 0)} icon={<AssignmentReturnOutlinedIcon />} accent="warning.main" />
        <SummaryCard label="Top Product Count" value={analytics.topProducts?.length || 0} icon={<LocalFireDepartmentOutlinedIcon />} accent="success.main" />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1.2fr 0.8fr" }, gap: 3, mb: 3 }}>
        <AppCard>
          <Stack spacing={2}>
            <PageHeader title="Top products" description="Revenue contribution by top-selling items" />
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topProducts || []}>
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

        <AppCard>
          <Stack spacing={2}>
            <PageHeader title="Returns" description="Returned vs kept orders" />
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={returnData} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={4}>
                    {returnData.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Stack>
        </AppCard>
      </Box>

      <DataTable
        columns={[
          { key: "product", label: "Product" },
          { key: "units", label: "Units Sold" },
          { key: "revenue", label: "Revenue" },
        ]}
        rows={analytics.topProducts || []}
        emptyTitle="No data available"
        emptyDescription="Analytics will populate after orders are placed."
        renderRow={(product) => (
          <TableRow key={product.name} hover>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.units_sold}</TableCell>
            <TableCell>{currency.format(product.revenue)}</TableCell>
          </TableRow>
        )}
      />
    </Box>
  );
}

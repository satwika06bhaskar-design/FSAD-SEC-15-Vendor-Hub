import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import {
  Box,
  MenuItem,
  Select,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { sellerApi } from "../../services/api";
import { currency, formatDate } from "../../utils/format";

const statuses = ["pending", "processing", "shipped", "completed", "cancelled"];

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    const { data } = await sellerApi.orders();
    const nextOrders = data.orders || [];
    setOrders(nextOrders);
    setLoading(false);

    const key = `seller-order-notify-${user?.id}`;
    const previousCount = Number(localStorage.getItem(key) || 0);
    if (nextOrders.length > previousCount && previousCount !== 0) {
      notify({ title: "Orders", message: "New order received", severity: "info" });
    }
    localStorage.setItem(key, String(nextOrders.length));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changeStatus = async (id, status) => {
    await sellerApi.updateOrderStatus(id, status);
    notify({ title: "Orders", message: "Order status updated", severity: "success" });
    loadOrders();
  };

  return (
    <Box>
      <PageHeader
        eyebrow="Seller"
        title="Seller orders"
        description="Update seller-specific order statuses with clearer badges and a cleaner table layout."
      />
      <DataTable
        loading={loading}
        columns={[
          { key: "id", label: "Order ID" },
          { key: "buyer", label: "Buyer" },
          { key: "amount", label: "Amount" },
          { key: "status", label: "Status" },
          { key: "date", label: "Date" },
        ]}
        rows={orders}
        emptyTitle="No data available"
        emptyDescription="Incoming seller sub-orders will appear here."
        renderRow={(order) => (
          <TableRow key={order.id} hover>
            <TableCell>
              <Stack direction="row" spacing={1} alignItems="center">
                <ReceiptLongOutlinedIcon fontSize="small" color="action" />
                <Typography fontWeight={600}>#{order.id}</Typography>
              </Stack>
            </TableCell>
            <TableCell>
              <Typography fontWeight={600}>{order.buyer_name}</Typography>
              <Typography variant="body2" color="text.secondary">{order.buyer_email}</Typography>
            </TableCell>
            <TableCell>{currency.format(order.total)}</TableCell>
            <TableCell>
              <Stack spacing={1}>
                <StatusChip status={order.status} />
                <Select size="small" value={order.status} onChange={(event) => changeStatus(order.id, event.target.value)}>
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </Stack>
            </TableCell>
            <TableCell>{formatDate(order.created_at)}</TableCell>
          </TableRow>
        )}
      />
    </Box>
  );
}

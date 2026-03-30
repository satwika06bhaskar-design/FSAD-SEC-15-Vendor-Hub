import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import { useEffect, useState } from "react";

import AppCard from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { useToast } from "../../context/ToastContext";
import { buyerApi } from "../../services/api";
import { currency } from "../../utils/format";

export default function OrderHistoryPage() {
  const { notify } = useToast();
  const [orders, setOrders] = useState([]);
  const [reasonById, setReasonById] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const { data } = await buyerApi.orders();
      setOrders(data.orders || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const submitDispute = async (subOrderId) => {
    if (!reasonById[subOrderId]) {
      return;
    }

    try {
      const { data } = await buyerApi.dispute({
        subOrderId,
        reason: reasonById[subOrderId],
      });
      setMessage(data.message);
      notify({ title: "Dispute submitted", message: data.message, severity: "warning" });
      setReasonById((current) => ({ ...current, [subOrderId]: "" }));
      loadOrders();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to raise dispute.");
    }
  };

  if (!loading && !orders.length) {
    return <EmptyState title="No data available" description="Placed orders will appear here with seller-specific breakdowns." />;
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Buyer"
        title="Orders and disputes"
        description="Track the master order, each seller sub-order, and raise disputes without changing the original flow."
      />
      {message ? <Alert severity="success" sx={{ mb: 3, borderRadius: 4 }}>{message}</Alert> : null}
      {error ? <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>{error}</Alert> : null}

      <Stack spacing={2.5}>
        {orders.map((order) => (
          <AppCard key={order.id}>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h6">Order #{order.id}</Typography>
                  <Typography color="text.secondary">{order.subOrders.length} seller shipments in this order</Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="center">
                  <StatusChip status={order.status} />
                  <Typography variant="h6" color="primary.main">{currency.format(order.total)}</Typography>
                </Stack>
              </Stack>

              <Divider />

              {order.subOrders.map((subOrder) => (
                <Accordion key={subOrder.id} disableGutters elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", '&:before': { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreOutlinedIcon />}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" width="100%" spacing={2}>
                      <Box>
                        <Typography fontWeight={600}>Sub-order #{subOrder.id} · {subOrder.seller_name}</Typography>
                        <Typography variant="body2" color="text.secondary">Commission {currency.format(subOrder.commission_amount || 0)}</Typography>
                      </Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <StatusChip status={subOrder.status} />
                        <Typography fontWeight={600}>{currency.format(subOrder.total)}</Typography>
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {subOrder.items.map((item) => (
                        <Stack key={`${subOrder.id}-${item.product_id}`} direction="row" justifyContent="space-between">
                          <Typography color="text.secondary">{item.product_name} x {item.quantity}</Typography>
                          <Typography>{currency.format(item.total)}</Typography>
                        </Stack>
                      ))}

                      <Box sx={{ p: 2, borderRadius: 4, bgcolor: "grey.50" }}>
                        <Stack spacing={1.5}>
                          <Typography fontWeight={600}>Raise dispute</Typography>
                          <TextField
                            multiline
                            minRows={3}
                            placeholder="Explain the issue with this seller order"
                            value={reasonById[subOrder.id] || ""}
                            onChange={(event) =>
                              setReasonById((current) => ({ ...current, [subOrder.id]: event.target.value }))
                            }
                          />
                          <Button startIcon={<FlagOutlinedIcon />} variant="outlined" sx={{ alignSelf: "flex-start" }} onClick={() => submitDispute(subOrder.id)}>
                            Raise dispute
                          </Button>
                        </Stack>
                      </Box>

                      {subOrder.disputes?.length ? (
                        <Stack spacing={1}>
                          {subOrder.disputes.map((dispute) => (
                            <Box key={dispute.id} sx={{ p: 2, borderRadius: 4, bgcolor: "warning.50" }}>
                              <Typography fontWeight={600}>Dispute #{dispute.id}</Typography>
                              <Typography variant="body2" color="text.secondary">{dispute.reason}</Typography>
                              <Box sx={{ mt: 1 }}>
                                <StatusChip status={dispute.status} />
                              </Box>
                            </Box>
                          ))}
                        </Stack>
                      ) : null}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </AppCard>
        ))}
      </Stack>
    </Box>
  );
}

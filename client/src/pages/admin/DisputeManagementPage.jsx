import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import {
  Box,
  Button,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../services/api";
import { currency } from "../../utils/format";

export default function DisputeManagementPage() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState(null);

  const loadDisputes = async () => {
    const { data } = await adminApi.disputes();
    const nextDisputes = data.disputes || [];
    setDisputes(nextDisputes);
    setLoading(false);

    const key = `admin-dispute-count-${user?.id}`;
    const previousCount = Number(localStorage.getItem(key) || 0);
    if (nextDisputes.length > previousCount && previousCount !== 0) {
      notify({ title: "Admin", message: "Dispute created", severity: "warning" });
    }
    localStorage.setItem(key, String(nextDisputes.length));
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  const resolve = async () => {
    await adminApi.resolveDispute(confirmState.id, confirmState.action);
    notify({ title: "Disputes", message: `Dispute ${confirmState.action}ed successfully`, severity: "success" });
    setConfirmState(null);
    loadDisputes();
  };

  return (
    <Box>
      <PageHeader
        eyebrow="Admin"
        title="Dispute management"
        description="Review disputes in a clearer table and confirm resolve or dismiss actions safely."
      />
      <DataTable
        loading={loading}
        columns={[
          { key: "order", label: "Order ID" },
          { key: "buyer", label: "Buyer" },
          { key: "seller", label: "Seller" },
          { key: "reason", label: "Reason" },
          { key: "status", label: "Status" },
          { key: "actions", label: "Actions" },
        ]}
        rows={disputes}
        emptyTitle="No data available"
        emptyDescription="Marketplace disputes will appear here when buyers open them."
        renderRow={(dispute) => (
          <TableRow key={dispute.id} hover>
            <TableCell>#{dispute.sub_order_id}</TableCell>
            <TableCell>{dispute.buyer_name}</TableCell>
            <TableCell>{dispute.seller_name}</TableCell>
            <TableCell>{dispute.reason}</TableCell>
            <TableCell>
              <Stack spacing={1}>
                <StatusChip status={dispute.status} />
                <Box component="span" sx={{ color: "text.secondary", fontSize: 13 }}>
                  {currency.format(dispute.sub_order_total)}
                </Box>
              </Stack>
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" startIcon={<GavelOutlinedIcon />} onClick={() => setConfirmState({ id: dispute.id, action: "refund" })}>
                  Resolve
                </Button>
                <Button variant="outlined" color="error" startIcon={<ReportProblemOutlinedIcon />} onClick={() => setConfirmState({ id: dispute.id, action: "dismiss" })}>
                  Dismiss
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        )}
      />

      <ConfirmDialog
        open={Boolean(confirmState)}
        onClose={() => setConfirmState(null)}
        onConfirm={resolve}
        title={confirmState?.action === "refund" ? "Resolve dispute" : "Dismiss dispute"}
        description={confirmState?.action === "refund" ? "This keeps the same refund endpoint and dispute logic, but adds a safer confirmation step." : "Dismiss this dispute using the existing endpoint?"}
        confirmLabel={confirmState?.action === "refund" ? "Resolve" : "Dismiss"}
        confirmColor={confirmState?.action === "refund" ? "success" : "error"}
      />
    </Box>
  );
}

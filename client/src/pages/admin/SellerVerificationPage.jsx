import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  Box,
  Button,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog";
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../services/api";
import { formatDate } from "../../utils/format";

export default function SellerVerificationPage() {
  const { notify } = useToast();
  const [sellers, setSellers] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSellers = async () => {
    const { data } = await adminApi.sellers();
    setSellers(data.sellers || []);
    setLoading(false);
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const updateStatus = async () => {
    const { id, approved } = confirmState;
    await adminApi.approveSeller(id, approved);
    notify({
      title: "Seller verification",
      message: approved ? "Seller approved successfully" : "Seller rejected successfully",
      severity: approved ? "success" : "info",
    });
    setConfirmState(null);
    loadSellers();
  };

  return (
    <Box>
      <PageHeader
        eyebrow="Admin"
        title="Seller verification"
        description="Review pending sellers, confirm actions, and keep the approval workflow untouched."
      />
      <DataTable
        loading={loading}
        columns={[
          { key: "seller", label: "Seller Name" },
          { key: "email", label: "Email" },
          { key: "status", label: "Status" },
          { key: "requested", label: "Requested" },
          { key: "actions", label: "Actions" },
        ]}
        rows={sellers}
        emptyTitle="No data available"
        emptyDescription="There are no sellers waiting for review right now."
        renderRow={(seller) => (
          <TableRow key={seller.id} hover>
            <TableCell>
              <Typography fontWeight={600}>{seller.name}</Typography>
            </TableCell>
            <TableCell>{seller.email}</TableCell>
            <TableCell><StatusChip status="Pending" /></TableCell>
            <TableCell>{formatDate(seller.created_at)}</TableCell>
            <TableCell>
              <Stack direction="row" spacing={1}>
                <Button color="success" variant="contained" startIcon={<CheckCircleOutlineOutlinedIcon />} onClick={() => setConfirmState({ id: seller.id, approved: true, name: seller.name })}>
                  Approve
                </Button>
                <Button color="error" variant="outlined" startIcon={<CloseOutlinedIcon />} onClick={() => setConfirmState({ id: seller.id, approved: false, name: seller.name })}>
                  Reject
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        )}
      />

      <ConfirmDialog
        open={Boolean(confirmState)}
        onClose={() => setConfirmState(null)}
        onConfirm={updateStatus}
        title={confirmState?.approved ? "Approve seller" : "Reject seller"}
        description={confirmState ? `Confirm the ${confirmState.approved ? "approval" : "rejection"} for ${confirmState.name}.` : ""}
        confirmLabel={confirmState?.approved ? "Approve" : "Reject"}
        confirmColor={confirmState?.approved ? "success" : "error"}
      />
    </Box>
  );
}

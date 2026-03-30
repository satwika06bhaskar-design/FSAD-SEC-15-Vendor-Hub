import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Box, Stack, TableCell, TableRow } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import SummaryCard from "../../components/SummaryCard";
import { sellerApi } from "../../services/api";
import { currency, formatDate } from "../../utils/format";

export default function SellerPayoutPage() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerApi.payouts().then(({ data }) => {
      setPayouts(data.payouts || []);
      setLoading(false);
    });
  }, []);

  const totals = useMemo(() => ({
    net: payouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0),
    commission: payouts.reduce((sum, payout) => sum + Number(payout.commission_amount || 0), 0),
    pending: payouts.filter((payout) => payout.status === "pending").reduce((sum, payout) => sum + Number(payout.amount || 0), 0),
  }), [payouts]);

  return (
    <Box>
      <PageHeader
        eyebrow="Seller"
        title="Payout history"
        description="View earnings after commission, payout status, and historical net totals."
      />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2.5, mb: 3 }}>
        <SummaryCard label="Net Earnings" value={currency.format(totals.net)} icon={<AccountBalanceWalletOutlinedIcon />} accent="primary.main" />
        <SummaryCard label="Commission Paid" value={currency.format(totals.commission)} icon={<PaidOutlinedIcon />} accent="warning.main" />
        <SummaryCard label="Pending Payouts" value={currency.format(totals.pending)} icon={<TrendingUpOutlinedIcon />} accent="success.main" />
      </Box>
      <DataTable
        loading={loading}
        columns={[
          { key: "payout", label: "Payout" },
          { key: "suborder", label: "Sub-order" },
          { key: "gross", label: "Gross" },
          { key: "commission", label: "Commission" },
          { key: "net", label: "Net" },
          { key: "status", label: "Status" },
          { key: "date", label: "Date" },
        ]}
        rows={payouts}
        emptyTitle="No data available"
        emptyDescription="Payouts will show after checkout creates seller earnings."
        renderRow={(payout) => (
          <TableRow key={payout.id} hover>
            <TableCell>#{payout.id}</TableCell>
            <TableCell>#{payout.sub_order_id}</TableCell>
            <TableCell>{currency.format(payout.sub_order_total || 0)}</TableCell>
            <TableCell>{currency.format(payout.commission_amount || 0)}</TableCell>
            <TableCell>{currency.format(payout.amount)}</TableCell>
            <TableCell><StatusChip status={payout.status} /></TableCell>
            <TableCell>{formatDate(payout.created_at)}</TableCell>
          </TableRow>
        )}
      />
    </Box>
  );
}

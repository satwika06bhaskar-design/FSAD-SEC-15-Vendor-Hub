import { Chip } from "@mui/material";

const colorMap = {
  pending: "warning",
  processing: "info",
  shipped: "secondary",
  completed: "success",
  approved: "success",
  paid: "success",
  refunded: "error",
  dismissed: "default",
  cancelled: "error",
  reversed: "error",
  open: "warning",
  "in stock": "success",
  "low stock": "warning",
  "out of stock": "error",
};

export default function StatusChip({ status }) {
  const normalized = String(status || "unknown").toLowerCase();
  return <Chip size="small" label={status} color={colorMap[normalized] || "default"} />;
}

import { Chip } from "@mui/material";

export default function AppBadge({ label, color = "default", icon, sx }) {
  return <Chip size="small" label={label} color={color} icon={icon} sx={sx} />;
}

import { Box, Stack, Typography } from "@mui/material";

import AppCard from "./Card";

export default function SummaryCard({ label, value, icon, subtitle, accent = "primary.main" }) {
  return (
    <AppCard>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {icon ? (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              color: accent,
              bgcolor: "rgba(79, 70, 229, 0.08)",
            }}
          >
            {icon}
          </Box>
        ) : null}
      </Stack>
    </AppCard>
  );
}

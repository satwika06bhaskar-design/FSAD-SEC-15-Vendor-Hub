import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { Box, Button, Stack, Typography } from "@mui/material";

import AppCard from "./Card";

export default function EmptyState({ title = "No data available", description, actionLabel, onAction, icon }) {
  return (
    <AppCard>
      <Stack spacing={2} alignItems="center" textAlign="center" sx={{ py: 7 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 4,
            display: "grid",
            placeItems: "center",
            bgcolor: "grey.100",
            color: "text.secondary",
          }}
        >
          {icon || <InboxOutlinedIcon fontSize="large" />}
        </Box>
        <Typography variant="h6">{title}</Typography>
        {description ? (
          <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
            {description}
          </Typography>
        ) : null}
        {actionLabel && onAction ? (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </AppCard>
  );
}

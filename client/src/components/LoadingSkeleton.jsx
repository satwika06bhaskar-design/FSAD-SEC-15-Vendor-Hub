import { Box, Skeleton, Stack } from "@mui/material";

import AppCard from "./Card";

export default function LoadingSkeleton({ variant = "cards", rows = 4 }) {
  if (variant === "table") {
    return (
      <AppCard>
        <Stack spacing={1.25}>
          <Skeleton variant="rounded" height={44} />
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={56} />
          ))}
        </Stack>
      </AppCard>
    );
  }

  if (variant === "dashboard") {
    return (
      <Stack spacing={3}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 2 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <AppCard key={index}>
              <Stack spacing={1.5}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="55%" height={42} />
              </Stack>
            </AppCard>
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1fr 1fr" }, gap: 2 }}>
          <AppCard><Skeleton variant="rounded" height={320} /></AppCard>
          <AppCard><Skeleton variant="rounded" height={320} /></AppCard>
        </Box>
      </Stack>
    );
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 2 }}>
      {Array.from({ length: rows }).map((_, index) => (
        <AppCard key={index}>
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={180} />
            <Skeleton variant="text" width="70%" height={28} />
            <Skeleton variant="text" width="50%" height={20} />
            <Skeleton variant="rounded" height={40} />
          </Stack>
        </AppCard>
      ))}
    </Box>
  );
}

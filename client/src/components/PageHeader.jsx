import { Box, Stack, Typography } from "@mui/material";

export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      mb={3}
    >
      <Box>
        {eyebrow ? (
          <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        {description ? <Typography color="text.secondary">{description}</Typography> : null}
      </Box>
      {action ? <Box>{action}</Box> : null}
    </Stack>
  );
}

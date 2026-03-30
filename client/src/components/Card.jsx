import { Box, Card, CardContent } from "@mui/material";

export default function AppCard({ children, contentSx, sx, ...props }) {
  return (
    <Card sx={{ overflow: "hidden", ...sx }} {...props}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, ...contentSx }}>{children}</CardContent>
    </Card>
  );
}

import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import AppCard from "../../components/Card";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../context/ToastContext";
import { adminApi } from "../../services/api";

export default function CommissionSettingsPage() {
  const { notify } = useToast();
  const [rate, setRate] = useState(0.1);

  useEffect(() => {
    adminApi.commission().then(({ data }) => setRate(data.commissionRate || 0.1));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await adminApi.updateCommission(rate);
    notify({ title: "Commission", message: "Commission rate saved.", severity: "success" });
  };

  return (
    <Box>
      <PageHeader
        eyebrow="Admin"
        title="Commission settings"
        description="Set the flat platform commission rate with better guidance and clearer form styling."
      />
      <AppCard sx={{ maxWidth: 720 }}>
        <Stack component="form" spacing={3} onSubmit={handleSubmit}>
          <Typography color="text.secondary">
            This updates the same commission endpoint and keeps all commission calculations untouched.
          </Typography>
          <TextField
            label="Commission rate"
            type="number"
            inputProps={{ step: "0.01", min: 0, max: 1 }}
            value={rate}
            onChange={(event) => setRate(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PercentOutlinedIcon color="action" />
                </InputAdornment>
              ),
            }}
            helperText="Example: 0.10 means a 10% platform commission."
          />
          <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />} sx={{ alignSelf: "flex-start" }}>
            Save changes
          </Button>
        </Stack>
      </AppCard>
    </Box>
  );
}

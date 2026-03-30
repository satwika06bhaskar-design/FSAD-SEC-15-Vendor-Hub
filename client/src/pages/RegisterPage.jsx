import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from "@mui/material";

import { useToast } from "../context/ToastContext";
import { authApi } from "../services/api";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "buyer",
};

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 35;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;
  return Math.min(score, 100);
}

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 999,
    minHeight: 58,
    bgcolor: "#FFFFFF",
    "& fieldset": { borderColor: "#D6DEEB" },
    "&:hover fieldset": { borderColor: "#A5B4FC" },
    "&.Mui-focused fieldset": { borderColor: "#4F46E5" },
  },
  "& .MuiOutlinedInput-input:-webkit-autofill": {
    WebkitTextFillColor: "#0F172A",
    caretColor: "#0F172A",
    WebkitBoxShadow: "0 0 0 100px #FFFFFF inset",
    boxShadow: "0 0 0 100px #FFFFFF inset",
    borderRadius: 999,
    transition: "background-color 9999s ease-in-out 0s",
  },
};

export default function RegisterPage() {
  const { notify } = useToast();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const emailValid = !form.email || /\S+@\S+\.\S+/.test(form.email);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const apiCall = form.role === "seller" ? authApi.sellerRegister : authApi.register;
      const payload = form.role === "seller" ? form : { ...form, role: "buyer" };
      const { data } = await apiCall(payload);
      setMessage(data.message);
      notify({ title: "Registration successful", message: data.message, severity: "success" });
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)",
        px: { xs: 1.5, md: 3 },
        py: { xs: 1.5, md: 3 },
        display: "grid",
        placeItems: "center",
      }}
    >
      <Grid
        container
        sx={{
          width: "100%",
          maxWidth: 1500,
          minHeight: { xs: "calc(100vh - 24px)", md: "calc(100vh - 48px)" },
          borderRadius: { xs: 4, md: 6 },
          overflow: "hidden",
          border: "1px solid #DDE5F3",
          boxShadow: "0 28px 70px rgba(15, 23, 42, 0.08)",
          bgcolor: "#FFFFFF",
        }}
      >
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            px: { xs: 3, sm: 5, md: 8 },
            py: { xs: 4, md: 6 },
            display: "flex",
            alignItems: "center",
            background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 640 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha("#4F46E5", 0.08),
                  border: "1px solid",
                  borderColor: alpha("#4F46E5", 0.12),
                  color: "primary.main",
                }}
              >
                <StorefrontOutlinedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  VendorHub
                </Typography>
              </Box>
            </Stack>

            <Typography
              variant="h2"
              sx={{
                maxWidth: 620,
                fontSize: { xs: "2.15rem", md: "3.2rem" },
                lineHeight: 1.04,
                letterSpacing: "-0.05em",
                mb: 4,
              }}
            >
              Create your marketplace account.
            </Typography>

            <Box sx={{ position: "relative", width: { xs: 320, sm: 430, md: 520 }, maxWidth: "100%", mx: { xs: "auto", md: 0 } }}>
              <Box
                sx={{
                  position: "absolute",
                  top: -16,
                  left: 24,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  bgcolor: "#4F46E5",
                  opacity: 0.16,
                }}
              />
              <Box sx={{ position: "absolute", top: 18, left: 58, width: 6, height: 6, borderRadius: "50%", bgcolor: alpha("#4F46E5", 0.25) }} />
              <Box sx={{ position: "absolute", top: 8, right: 78, width: 8, height: 8, borderRadius: "50%", bgcolor: alpha("#06B6D4", 0.26) }} />

              <Box
                sx={{
                  position: "relative",
                  mt: 4,
                  borderRadius: 6,
                  overflow: "hidden",
                  bgcolor: "#FFFFFF",
                  border: "1px solid",
                  borderColor: "#E2E8F0",
                  p: { xs: 2.5, md: 3 },
                  boxShadow: "0 18px 36px rgba(15, 23, 42, 0.06)",
                }}
              >
                <Typography variant="overline" sx={{ color: "primary.main", letterSpacing: "0.18em", display: "block", textAlign: "center" }}>
                  VENDORHUB
                </Typography>
                <Typography variant="h5" sx={{ textAlign: "center", mb: 2.5 }}>
                  Marketplace Access
                </Typography>

                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 180, md: 220 },
                    borderRadius: 5,
                    background: "linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ position: "absolute", left: 24, right: 24, bottom: 24, height: 72, borderRadius: 4, bgcolor: "#FFFFFF", border: "4px solid #4F46E5" }} />
                  <Box sx={{ position: "absolute", left: 44, bottom: 24, width: 80, height: 104, borderTopLeftRadius: 20, borderTopRightRadius: 20, bgcolor: "#FFFFFF", border: "4px solid #4F46E5", borderBottom: 0 }} />
                  <Box sx={{ position: "absolute", right: 44, bottom: 24, width: 80, height: 104, borderTopLeftRadius: 20, borderTopRightRadius: 20, bgcolor: "#FFFFFF", border: "4px solid #4F46E5", borderBottom: 0 }} />
                  <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: 24, width: 96, height: 66, borderTopLeftRadius: 16, borderTopRightRadius: 16, bgcolor: "#FFE58F", border: "4px solid #4F46E5", borderBottom: 0 }} />
                  <Box sx={{ position: "absolute", left: 52, right: 52, bottom: 98, height: 24, borderRadius: 2.5, bgcolor: "#FFFFFF", border: "4px solid #4F46E5" }} />
                  <Box sx={{ position: "absolute", left: 60, right: 60, bottom: 72, height: 18, borderRadius: 999, background: "repeating-linear-gradient(90deg, #FFFFFF 0 18px, #6E64F5 18px 36px)" }} />
                  <Box sx={{ position: "absolute", left: 76, bottom: 40, width: 30, height: 30, borderRadius: 2, bgcolor: "#FDBA74", border: "4px solid #4F46E5" }} />
                  <Box sx={{ position: "absolute", right: 76, bottom: 40, width: 30, height: 30, borderRadius: 2, bgcolor: "#FDBA74", border: "4px solid #4F46E5" }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={5}
          sx={{
            px: { xs: 3, sm: 5, md: 6 },
            py: { xs: 4, md: 6 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(180deg, #FCFCFF 0%, #F8FAFC 100%)",
          }}
        >
          <Card
            sx={{
              width: "100%",
              maxWidth: 500,
              bgcolor: "transparent",
              border: "none",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Stack spacing={3.25} component="form" onSubmit={handleSubmit}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Register
                </Typography>

                {message ? <Alert severity="success">{message}</Alert> : null}
                {error ? <Alert severity="error">{error}</Alert> : null}

                <ToggleButtonGroup
                  exclusive
                  value={form.role}
                  onChange={(_, value) => value && setForm((current) => ({ ...current, role: value }))}
                  fullWidth
                  sx={{
                    bgcolor: "#F8FAFC",
                    p: 0.5,
                    borderRadius: 999,
                    border: "1px solid #D6DEEB",
                    "& .MuiToggleButton-root": {
                      border: 0,
                      borderRadius: 999,
                      py: 1.2,
                      fontWeight: 700,
                      color: "text.secondary",
                    },
                    "& .Mui-selected": {
                      bgcolor: "#4F46E5 !important",
                      color: "#FFFFFF !important",
                      boxShadow: "0 8px 18px rgba(79, 70, 229, 0.2)",
                    },
                  }}
                >
                  <ToggleButton value="buyer">Buyer</ToggleButton>
                  <ToggleButton value="seller">Seller</ToggleButton>
                </ToggleButtonGroup>

                <Stack spacing={1.25}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Full name
                  </Typography>
                  <TextField
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineOutlinedIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldStyles}
                    required
                    fullWidth
                  />
                </Stack>

                <Stack spacing={1.25}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Email
                  </Typography>
                  <TextField
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    error={!emailValid}
                    helperText={!emailValid ? "Enter a valid email address" : " "}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldStyles}
                    required
                    fullWidth
                  />
                </Stack>

                <Stack spacing={1.25}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Password
                  </Typography>
                  <TextField
                    type={showPassword ? "text" : "password"}
                    placeholder="Create your password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => setShowPassword((visible) => !visible)}>
                            {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldStyles}
                    required
                    fullWidth
                  />
                  <Box>
                    <LinearProgress variant="determinate" value={passwordStrength} sx={{ height: 8, borderRadius: 999, bgcolor: "#E5E7EB" }} />
                  </Box>
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.4,
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  {loading ? "Submitting..." : `Register as ${form.role}`}
                </Button>

                <Typography color="text.secondary">
                  Already registered?{" "}
                  <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 700 }}>
                    Back to login
                  </Link>
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

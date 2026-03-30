import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";

import { defaultRoute } from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authApi } from "../services/api";

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    color: "text.primary",
    bgcolor: "#FFFFFF",
    borderRadius: 999,
    minHeight: 58,
    "& fieldset": { borderColor: "#D8E0EC" },
    "&:hover fieldset": { borderColor: "#B8C3D9" },
    "&.Mui-focused fieldset": { borderColor: "#4F46E5" },
  },
  "& .MuiOutlinedInput-input": {
    color: "text.primary",
    px: 0,
  },
  "& .MuiInputAdornment-root": {
    color: "#64748B",
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

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await authApi.login({ email: form.email, password: form.password });
      saveSession(data);
      notify({ title: "Login successful", message: `Welcome back, ${data.user.name}.`, severity: "success" });
      navigate(defaultRoute(data.user.role));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 100%)",
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
          border: "1px solid #DCE4F0",
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
                fontSize: { xs: "2.2rem", md: "3.35rem" },
                lineHeight: 1.02,
                letterSpacing: "-0.05em",
                mb: 4,
              }}
            >
              Sign in to your marketplace workspace.
            </Typography>

            <Box sx={{ position: "relative", width: { xs: 320, sm: 430, md: 520 }, maxWidth: "100%", mx: { xs: "auto", md: 0 } }}>
              <Box
                sx={{
                  position: "absolute",
                  top: -18,
                  left: 22,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  bgcolor: alpha("#4F46E5", 0.12),
                }}
              />
              <Box sx={{ position: "absolute", top: 18, left: 56, width: 6, height: 6, borderRadius: "50%", bgcolor: alpha("#4F46E5", 0.18) }} />
              <Box sx={{ position: "absolute", top: 8, right: 76, width: 8, height: 8, borderRadius: "50%", bgcolor: alpha("#06B6D4", 0.2) }} />
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
                  Marketplace Center
                </Typography>

                <Box
                  sx={{
                    position: "relative",
                    height: { xs: 180, md: 220 },
                    borderRadius: 5,
                    bgcolor: "#F6F8FC",
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
              maxWidth: 480,
              bgcolor: "transparent",
              border: "none",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Stack spacing={3.25} component="form" onSubmit={handleSubmit}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Welcome back
                </Typography>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <Stack spacing={1.25}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Email
                  </Typography>
                  <TextField
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon />
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
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" onClick={() => setShowPassword((visible) => !visible)} sx={{ color: "#64748B" }}>
                            {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldStyles}
                    required
                    fullWidth
                  />
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.remember}
                        onChange={(event) => setForm((current) => ({ ...current, remember: event.target.checked }))}
                        sx={{ color: "#64748B" }}
                      />
                    }
                    label="Remember me"
                    sx={{ color: "text.secondary" }}
                  />
                  <Link component="button" type="button" underline="hover" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    Forgot password?
                  </Link>
                </Stack>

                <Button
                  type="submit"
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={loading}
                  endIcon={loading ? null : <ArrowForwardRoundedIcon />}
                  sx={{
                    py: 1.4,
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  {loading ? <CircularProgress color="inherit" size={22} /> : "Sign in"}
                </Button>

                <Typography color="text.secondary">
                  Don&apos;t have an account yet?{" "}
                  <Link component={RouterLink} to="/register" underline="hover" sx={{ fontWeight: 700 }}>
                    Create one
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

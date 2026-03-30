import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppCard from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { buyerApi } from "../../services/api";
import { currency, sellerGroups } from "../../utils/format";

function getProductTheme(name = "") {
  const value = name.toLowerCase();

  if (/(coffee|tea|beans|drink|juice|cola|water)/.test(value)) {
    return { bg1: "#F3E8D7", bg2: "#FFF8F0", accent: "#9A5B3D", label: "Roasted pick" };
  }
  if (/(apple|orange|banana|fruit|grape|mango|avocado)/.test(value)) {
    return { bg1: "#D9F99D", bg2: "#F7FEE7", accent: "#65A30D", label: "Fresh fruit" };
  }
  if (/(tomato|potato|onion|carrot|spinach|cabbage|vegetable|broccoli)/.test(value)) {
    return { bg1: "#FED7AA", bg2: "#FFF7ED", accent: "#EA580C", label: "Farm fresh" };
  }
  if (/(milk|cheese|butter|yogurt|cream)/.test(value)) {
    return { bg1: "#DBEAFE", bg2: "#F8FAFC", accent: "#2563EB", label: "Dairy" };
  }
  if (/(keyboard|mouse|phone|laptop|watch|camera|headphone)/.test(value)) {
    return { bg1: "#E9D5FF", bg2: "#FAF5FF", accent: "#7C3AED", label: "Tech" };
  }
  if (/(shirt|shoe|bag|dress|fashion|jacket)/.test(value)) {
    return { bg1: "#FBCFE8", bg2: "#FDF2F8", accent: "#DB2777", label: "Style" };
  }

  return { bg1: "#E2E8F0", bg2: "#F8FAFC", accent: "#475569", label: "Featured" };
}

function buildProductImage(product) {
  const theme = getProductTheme(product.name);
  const title = (product.name || "Product").slice(0, 26);
  const seller = (product.seller_name || "Seller").slice(0, 18);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 420">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${theme.bg1}" />
          <stop offset="100%" stop-color="${theme.bg2}" />
        </linearGradient>
      </defs>
      <rect width="520" height="420" rx="36" fill="url(#g)" />
      <circle cx="430" cy="94" r="66" fill="${theme.accent}" fill-opacity="0.08" />
      <circle cx="102" cy="342" r="84" fill="${theme.accent}" fill-opacity="0.08" />
      <rect x="66" y="54" width="126" height="34" rx="17" fill="#ffffff" fill-opacity="0.78" />
      <text x="129" y="76" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="${theme.accent}">${theme.label}</text>
      <rect x="128" y="112" width="264" height="214" rx="30" fill="#ffffff" />
      <rect x="154" y="136" width="212" height="28" rx="14" fill="${theme.accent}" fill-opacity="0.12" />
      <rect x="154" y="184" width="168" height="112" rx="20" fill="${theme.accent}" fill-opacity="0.18" />
      <rect x="334" y="184" width="32" height="112" rx="16" fill="${theme.accent}" fill-opacity="0.28" />
      <text x="66" y="374" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#111827">${title}</text>
      <text x="66" y="402" font-family="Arial, sans-serif" font-size="18" fill="#475569">${seller}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const inputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    bgcolor: "#FFFFFF",
  },
};

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  shippingMethod: "free",
  cardName: "",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { notify } = useToast();
  const [commissionRate, setCommissionRate] = useState(0);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await buyerApi.products();
        setCommissionRate(Number(data.commissionRate || 0));
      } catch (_error) {
        setCommissionRate(0.1);
      }
    };

    loadSettings();
  }, []);

  const groups = Object.values(sellerGroups(items));
  const shippingCost = form.shippingMethod === "express" ? 12 : 0;
  const commissionTotal = total * commissionRate;
  const displayTotal = total + shippingCost;

  const orderPreview = useMemo(
    () => items.map((item) => ({ ...item, image: buildProductImage(item) })),
    [items]
  );

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };
      const { data } = await buyerApi.checkout(payload);
      setPlacedOrder(data.order);
      notify({ title: "Order placed", message: "Order placed successfully", severity: "success" });
      clearCart();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <AppCard>
        <Stack spacing={3} alignItems="center" textAlign="center" sx={{ py: 5 }}>
          <CheckCircleRoundedIcon color="success" sx={{ fontSize: 78 }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              Checkout complete
            </Typography>
            <Typography color="text.secondary">Order ID #{placedOrder.id} has been created and split by seller.</Typography>
          </Box>
          <Stack spacing={1.5} sx={{ width: "100%", maxWidth: 620 }}>
            {placedOrder.subOrders?.map((subOrder) => (
              <Box key={subOrder.id} sx={{ p: 2.25, borderRadius: 4, bgcolor: "grey.50", textAlign: "left" }}>
                <Typography fontWeight={700}>{subOrder.sellerName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Sub-order #{subOrder.id}   Total {currency.format(subOrder.total)}   Commission {currency.format(subOrder.commission)}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button variant="contained" onClick={() => navigate("/buyer/products")}>Continue shopping</Button>
            <Button variant="outlined" onClick={() => navigate("/buyer/orders")}>View orders</Button>
          </Stack>
        </Stack>
      </AppCard>
    );
  }

  if (!items.length) {
    return <EmptyState title="No data available" description="Add products before checking out." icon={<LocalMallOutlinedIcon fontSize="large" />} />;
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Buyer"
        title="Checkout"
        description="A payment-style checkout layout using your current order API and split-order logic underneath."
      />

      {error ? <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>{error}</Alert> : null}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 4 }}>
        This checkout now looks like a payment page, but it still uses your current order API. No live payment gateway was added.
      </Alert>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) 360px" }, gap: 3, alignItems: "start" }}>
        <Stack spacing={3}>
          <AppCard>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <PlaceOutlinedIcon color="primary" />
                <Typography variant="h6">Shipping address</Typography>
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <TextField label="First name" value={form.firstName} onChange={(event) => handleChange("firstName", event.target.value)} sx={inputStyles} fullWidth />
                <TextField label="Last name" value={form.lastName} onChange={(event) => handleChange("lastName", event.target.value)} sx={inputStyles} fullWidth />
                <TextField label="Email" value={form.email} onChange={(event) => handleChange("email", event.target.value)} sx={inputStyles} fullWidth />
                <TextField label="Phone number" value={form.phone} onChange={(event) => handleChange("phone", event.target.value)} sx={inputStyles} fullWidth />
                <TextField label="Address" value={form.address} onChange={(event) => handleChange("address", event.target.value)} sx={{ ...inputStyles, gridColumn: { md: "1 / span 2" } }} fullWidth />
                <TextField label="City" value={form.city} onChange={(event) => handleChange("city", event.target.value)} sx={inputStyles} fullWidth />
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <TextField label="State" value={form.state} onChange={(event) => handleChange("state", event.target.value)} sx={inputStyles} fullWidth />
                  <TextField label="Zip code" value={form.zipCode} onChange={(event) => handleChange("zipCode", event.target.value)} sx={inputStyles} fullWidth />
                </Box>
              </Box>
            </Stack>
          </AppCard>

          <AppCard>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <LocalShippingOutlinedIcon color="primary" />
                <Typography variant="h6">Shipping method</Typography>
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => handleChange("shippingMethod", "free")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleChange("shippingMethod", "free");
                    }
                  }}
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: form.shippingMethod === "free" ? "primary.main" : "divider",
                    bgcolor: form.shippingMethod === "free" ? alpha("#4F46E5", 0.04) : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Free shipping</Typography>
                  <Typography variant="body2" color="text.secondary">Delivery in 5-7 days</Typography>
                  <Typography sx={{ mt: 1.5, fontWeight: 700 }}>$0</Typography>
                </Box>
                <Box
                  role="button"
                  tabIndex={0}
                  onClick={() => handleChange("shippingMethod", "express")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleChange("shippingMethod", "express");
                    }
                  }}
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: form.shippingMethod === "express" ? "primary.main" : "divider",
                    bgcolor: form.shippingMethod === "express" ? alpha("#4F46E5", 0.04) : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Express shipping</Typography>
                  <Typography variant="body2" color="text.secondary">Delivery in 1-2 days</Typography>
                  <Typography sx={{ mt: 1.5, fontWeight: 700 }}>$12</Typography>
                </Box>
              </Box>
            </Stack>
          </AppCard>

          <AppCard>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <CreditCardRoundedIcon color="primary" />
                <Typography variant="h6">Payment details</Typography>
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <TextField label="Name on card" value={form.cardName} onChange={(event) => handleChange("cardName", event.target.value)} sx={{ ...inputStyles, gridColumn: { md: "1 / span 2" } }} fullWidth />
                <TextField label="Card number" value={form.cardNumber} onChange={(event) => handleChange("cardNumber", event.target.value)} sx={{ ...inputStyles, gridColumn: { md: "1 / span 2" } }} fullWidth />
                <TextField label="Expiry" value={form.expiry} onChange={(event) => handleChange("expiry", event.target.value)} sx={inputStyles} fullWidth />
                <TextField label="CVC" value={form.cvc} onChange={(event) => handleChange("cvc", event.target.value)} sx={inputStyles} fullWidth />
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <LockOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Secure payment-style UI only. Current checkout still runs through the existing marketplace order endpoint.
                </Typography>
              </Stack>
            </Stack>
          </AppCard>

          <AppCard>
            <Stack spacing={2.25}>
              <Typography variant="h6">Seller split preview</Typography>
              {groups.map((group) => (
                <Box key={group.sellerId} sx={{ p: 2.25, borderRadius: 3, bgcolor: "grey.50" }}>
                  <Typography sx={{ fontWeight: 700, mb: 1.25 }}>{group.sellerName}</Typography>
                  <Stack spacing={1}>
                    {group.items.map((item) => (
                      <Stack key={item.id} direction="row" justifyContent="space-between" spacing={2}>
                        <Typography color="text.secondary">{item.name} x {item.quantity}</Typography>
                        <Typography sx={{ fontWeight: 600 }}>{currency.format(item.price * item.quantity)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </AppCard>
        </Stack>

        <Box sx={{ position: { xl: "sticky" }, top: { xl: 24 } }}>
          <AppCard sx={{ bgcolor: "#FFFFFF" }}>
            <Stack spacing={2.5}>
              <Typography variant="h6">Your cart</Typography>
              <Stack spacing={1.75}>
                {orderPreview.map((item) => (
                  <Stack key={item.id} direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 68, height: 68, borderRadius: 3, overflow: "hidden", flexShrink: 0, bgcolor: "grey.100" }}>
                      <Box component="img" src={item.image} alt={item.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700 }} noWrap>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>{item.seller_name}</Typography>
                      <Typography variant="body2" color="text.secondary">Qty {item.quantity}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700 }}>{currency.format(item.price * item.quantity)}</Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider />

              <Stack spacing={1.2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Subtotal</Typography>
                  <Typography>{currency.format(total)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Shipping</Typography>
                  <Typography>{currency.format(shippingCost)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Platform commission</Typography>
                  <Typography>{currency.format(commissionTotal)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Tax</Typography>
                  <Typography>$0.00</Typography>
                </Stack>
              </Stack>

              <Divider />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Total</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{currency.format(displayTotal)}</Typography>
              </Stack>

              <Button variant="contained" size="large" onClick={handleCheckout} disabled={loading} fullWidth sx={{ py: 1.35, borderRadius: 2.5, fontWeight: 700 }}>
                {loading ? "Processing order..." : "Complete order"}
              </Button>
            </Stack>
          </AppCard>
        </Box>
      </Box>
    </Box>
  );
}

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import AppCard from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import PageHeader from "../../components/PageHeader";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { buyerApi } from "../../services/api";
import { currency, stockStatus } from "../../utils/format";

function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getProductTheme(name = "") {
  const value = name.toLowerCase();

  if (/(headphone|earphone|headset|speaker|keyboard|mouse|phone|laptop|watch|camera)/.test(value)) {
    return { bg1: "#F3F0FF", bg2: "#FAF8FF", accent: "#8B5CF6", label: "Tech" };
  }
  if (/(coffee|tea|beans|drink|juice|cola|water)/.test(value)) {
    return { bg1: "#F3E8D7", bg2: "#FFF8F0", accent: "#9A5B3D", label: "Drinks" };
  }
  if (/(apple|orange|banana|fruit|grape|mango|avocado)/.test(value)) {
    return { bg1: "#D9F99D", bg2: "#F7FEE7", accent: "#65A30D", label: "Fresh" };
  }
  if (/(tomato|potato|onion|carrot|spinach|cabbage|vegetable|broccoli)/.test(value)) {
    return { bg1: "#FED7AA", bg2: "#FFF7ED", accent: "#EA580C", label: "Farm" };
  }
  if (/(milk|cheese|butter|yogurt|cream)/.test(value)) {
    return { bg1: "#DBEAFE", bg2: "#F8FAFC", accent: "#2563EB", label: "Dairy" };
  }

  return { bg1: "#E2E8F0", bg2: "#F8FAFC", accent: "#475569", label: "Featured" };
}

function buildProductShape(type, accent) {
  if (type === "headphones") {
    return `
      <defs>
        <linearGradient id="headband" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#DDD6E8" />
          <stop offset="100%" stop-color="#B9B0C8" />
        </linearGradient>
        <linearGradient id="earcup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F3EFF7" />
          <stop offset="100%" stop-color="#CFC6DA" />
        </linearGradient>
      </defs>
      <path d="M126 224c0-70 44-130 106-130s106 60 106 130" fill="none" stroke="url(#headband)" stroke-width="22" stroke-linecap="round"/>
      <path d="M155 108c14-20 42-38 77-38 34 0 64 16 79 38" fill="none" stroke="#EAE4F0" stroke-width="12" stroke-linecap="round"/>
      <rect x="108" y="182" width="54" height="110" rx="27" fill="url(#earcup)" stroke="#C0B7CB" stroke-width="6"/>
      <rect x="302" y="182" width="54" height="110" rx="27" fill="url(#earcup)" stroke="#C0B7CB" stroke-width="6"/>
      <ellipse cx="136" cy="236" rx="34" ry="48" fill="#E7E1EC" stroke="#BDB2CA" stroke-width="5"/>
      <ellipse cx="328" cy="236" rx="34" ry="48" fill="#E7E1EC" stroke="#BDB2CA" stroke-width="5"/>
      <ellipse cx="136" cy="236" rx="20" ry="28" fill="#D5CADF" />
      <ellipse cx="328" cy="236" rx="20" ry="28" fill="#D5CADF" />
      <circle cx="324" cy="240" r="4" fill="#9D93AC" />
      <path d="M126 186c0-26 18-48 44-54" fill="none" stroke="#D9D1E4" stroke-width="8" stroke-linecap="round"/>
      <path d="M338 186c0-26-18-48-44-54" fill="none" stroke="#D9D1E4" stroke-width="8" stroke-linecap="round"/>
    `;
  }

  if (type === "keyboard") {
    return `
      <rect x="88" y="164" width="244" height="120" rx="26" fill="#FFFFFF" stroke="#C8B9F2" stroke-width="10"/>
      ${Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const x = 108 + col * 25;
          const y = 182 + row * 19;
          return `<rect x="${x}" y="${y}" width="16" height="10" rx="3" fill="#D9CEF7"/>`;
        }).join("")
      ).join("")}
      <rect x="152" y="250" width="112" height="12" rx="6" fill="#C8B9F2" />
      <rect x="84" y="292" width="252" height="14" rx="7" fill="#E7E0F7" />
    `;
  }

  if (type === "phone") {
    return `
      <defs>
        <linearGradient id="phoneBack" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#F8FBFF" />
          <stop offset="100%" stop-color="#DDEBF6" />
        </linearGradient>
        <linearGradient id="screenGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="50%" stop-color="#CFE5F6" />
          <stop offset="100%" stop-color="#A9C9E5" />
        </linearGradient>
      </defs>
      <rect x="110" y="112" width="116" height="186" rx="26" fill="url(#phoneBack)" stroke="#D4E3EF" stroke-width="6"/>
      <circle cx="134" cy="134" r="10" fill="#A3BFD4" />
      <circle cx="160" cy="134" r="10" fill="#A3BFD4" />
      <circle cx="147" cy="154" r="8" fill="#A3BFD4" />
      <rect x="176" y="102" width="136" height="198" rx="30" fill="#101418" />
      <rect x="186" y="112" width="116" height="178" rx="24" fill="#EEF7FE" />
      <ellipse cx="244" cy="196" rx="50" ry="68" fill="url(#screenGlow)" />
      <ellipse cx="238" cy="190" rx="34" ry="46" fill="#D5EBFA" fill-opacity="0.92" />
      <rect x="228" y="120" width="34" height="12" rx="6" fill="#101418" />
      <circle cx="252" cy="126" r="3" fill="#1F2937" />
    `;
  }

  if (type === "drink") {
    return `
      <path d="M170 112h86l-12 62v96c0 16-13 28-28 28h-30c-15 0-28-12-28-28v-96z" fill="#fff" stroke="${accent}" stroke-width="12"/>
      <path d="M214 112c0-20 10-34 24-46" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
      <rect x="176" y="188" width="74" height="18" rx="9" fill="${accent}" fill-opacity="0.16"/>
      <rect x="184" y="218" width="58" height="64" rx="16" fill="${accent}" fill-opacity="0.22"/>
    `;
  }

  return `
    <rect x="124" y="122" width="178" height="168" rx="30" fill="#fff" stroke="${accent}" stroke-width="12"/>
    <rect x="152" y="150" width="122" height="22" rx="11" fill="${accent}" fill-opacity="0.14"/>
    <rect x="152" y="188" width="98" height="84" rx="20" fill="${accent}" fill-opacity="0.2"/>
    <rect x="260" y="188" width="22" height="84" rx="11" fill="${accent}" fill-opacity="0.3"/>
  `;
}

function buildProductImage(product) {
  const name = product.name || "Product";
  const theme = getProductTheme(name);
  const value = name.toLowerCase();
  let type = "generic";

  if (/(headphone|earphone|headset|speaker)/.test(value)) type = "headphones";
  else if (/(keyboard|keypad)/.test(value)) type = "keyboard";
  else if (/(phone|mobile|iphone|android)/.test(value)) type = "phone";
  else if (/(coffee|tea|juice|drink|cola|water)/.test(value)) type = "drink";

  const title = escapeXml(name.slice(0, 24));
  const seller = escapeXml((product.seller_name || "Seller").slice(0, 20));
  const price = escapeXml(currency.format(product.price || 0));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 360">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${theme.bg1}" />
          <stop offset="100%" stop-color="${theme.bg2}" />
        </linearGradient>
      </defs>
      <rect width="420" height="360" rx="32" fill="url(#g)" />
      <circle cx="336" cy="78" r="54" fill="${theme.accent}" fill-opacity="0.08" />
      <circle cx="92" cy="292" r="68" fill="${theme.accent}" fill-opacity="0.08" />
      <rect x="30" y="24" width="96" height="30" rx="15" fill="#fff" fill-opacity="0.82" />
      <text x="78" y="44" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${theme.accent}">${theme.label}</text>
      ${buildProductShape(type, theme.accent)}
      <text x="30" y="300" font-family="Arial, sans-serif" font-size="18" letter-spacing="2" fill="#64748B">${seller}</text>
      <text x="30" y="328" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#0F172A">${title}</text>
      <text x="30" y="350" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#0F172A">${price}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export default function ProductListPage() {
  const { addToCart } = useCart();
  const { notify } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsResponse = await buyerApi.products();
        setProducts(productsResponse.data.products || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const heroProduct = products[0] || null;
  const sideProducts = useMemo(() => products.slice(1, 3), [products]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedId(product.id);
    notify({ title: "Cart updated", message: "Product added to cart", severity: "success" });
    window.setTimeout(() => setAddedId(null), 700);
  };

  if (loading) {
    return <LoadingSkeleton variant="dashboard" />;
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Buyer"
        title="Product catalog"
        description="A cleaner storefront with product illustrations and the same cart behavior already working underneath."
      />

      {error ? (
        <Typography color="error.main" sx={{ mb: 3 }}>
          {error}
        </Typography>
      ) : null}

      {!products.length ? (
        <EmptyState title="No data available" description="Products will appear here when approved sellers publish inventory." />
      ) : (
        <>
          {heroProduct ? (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1.45fr 0.55fr" }, gap: 3, mb: 4 }}>
              <AppCard sx={{ bgcolor: "#F8EEE8" }} contentSx={{ p: { xs: 2.5, md: 3 } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "0.34fr 0.66fr" }, gap: 3, alignItems: "stretch" }}>
                  <Stack spacing={2.5} justifyContent="space-between">
                    <Box>
                      <Chip label={stockStatus(heroProduct.stock)} size="small" sx={{ mb: 2, bgcolor: "#FFFFFF" }} />
                      <Typography variant="body2" sx={{ letterSpacing: "0.16em", textTransform: "uppercase", color: "text.secondary", mb: 1.5 }}>
                        {heroProduct.seller_name}
                      </Typography>
                      <Typography variant="h3" sx={{ mb: 1.5 }}>
                        {heroProduct.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ lineHeight: 1.8, mb: 2.5 }}>
                        {heroProduct.description || "Featured item from the marketplace catalog with the same add-to-cart flow and split checkout behavior."}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {currency.format(heroProduct.price)}
                      </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Button variant="contained" size="large" onClick={() => handleAddToCart(heroProduct)} disabled={!heroProduct.stock} sx={{ borderRadius: 999, px: 3.5 }}>
                        {addedId === heroProduct.id ? "Added" : "Add to cart"}
                      </Button>
                      <Button variant="outlined" size="large" sx={{ borderRadius: 999, px: 3.5 }}>
                        Save item
                      </Button>
                    </Stack>
                  </Stack>

                  <Box sx={{ borderRadius: 5, bgcolor: "#F5E7DF", minHeight: { xs: 320, md: 520 }, display: "grid", placeItems: "center", overflow: "hidden" }}>
                    <Box component="img" src={buildProductImage(heroProduct)} alt={heroProduct.name} sx={{ width: "100%", maxWidth: 560, objectFit: "contain" }} />
                  </Box>
                </Box>
              </AppCard>

              <Stack spacing={3}>
                {sideProducts.map((product) => (
                  <AppCard key={product.id} sx={{ bgcolor: "#FAFAF9" }}>
                    <Stack spacing={2}>
                      <Box sx={{ borderRadius: 4, overflow: "hidden", bgcolor: "#F7F7F5" }}>
                        <Box component="img" src={buildProductImage(product)} alt={product.name} sx={{ width: "100%", height: 220, objectFit: "cover" }} />
                      </Box>
                      <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                        <Box>
                          <Typography variant="h6">{product.name}</Typography>
                          <Typography color="text.secondary">{product.seller_name}</Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {currency.format(product.price)}
                        </Typography>
                      </Stack>
                      <Button variant="outlined" onClick={() => handleAddToCart(product)} disabled={!product.stock} sx={{ borderRadius: 999 }}>
                        {addedId === product.id ? "Added" : "Add to cart"}
                      </Button>
                    </Stack>
                  </AppCard>
                ))}
              </Stack>
            </Box>
          ) : null}

          <PageHeader
            eyebrow="All products"
            title="Shop the catalog"
            description="Product cards with seller labels, stock status, and clearer visual artwork for each item."
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }, gap: 3 }}>
            {products.map((product) => (
              <AppCard
                key={product.id}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 180ms ease, box-shadow 180ms ease",
                  transform: addedId === product.id ? "translateY(-4px)" : "none",
                  "&:hover": { transform: "translateY(-6px)", boxShadow: "0 18px 34px rgba(15, 23, 42, 0.08)" },
                }}
                contentSx={{ p: 2.25 }}
              >
                <Stack spacing={2} sx={{ height: "100%" }}>
                  <Box sx={{ position: "relative", borderRadius: 4, overflow: "hidden", bgcolor: "#F8FAFC" }}>
                    <Box component="img" src={buildProductImage(product)} alt={product.name} sx={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
                    <Chip label={stockStatus(product.stock)} size="small" sx={{ position: "absolute", top: 12, right: 12, bgcolor: "rgba(255,255,255,0.94)", fontWeight: 700 }} />
                  </Box>

                  <Stack spacing={1.25} sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                      <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 700 }}>
                        {product.name}
                      </Typography>
                      <IconButton size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
                        <FavoriteBorderRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip size="small" icon={<StorefrontOutlinedIcon />} label={product.seller_name} sx={{ bgcolor: "grey.100" }} />
                      <Chip size="small" icon={<VerifiedRoundedIcon />} label="Approved" color="success" variant="outlined" />
                    </Stack>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {currency.format(product.price)}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Inventory2OutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.stock}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    variant={addedId === product.id ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.stock}
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ borderRadius: 999, py: 1.15, fontWeight: 700 }}
                  >
                    {addedId === product.id ? "Added" : "Add to cart"}
                  </Button>
                </Stack>
              </AppCard>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

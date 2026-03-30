import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import AppCard from "../../components/Card";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { currency, sellerGroups } from "../../utils/format";

export default function CartPage() {
  const { items, total, removeFromCart, updateQuantity } = useCart();
  const { notify } = useToast();
  const groups = Object.values(sellerGroups(items));

  if (!items.length) {
    return (
      <EmptyState
        title="No data available"
        description="Your cart is empty. Add products to start a split checkout."
        icon={<ShoppingBagOutlinedIcon fontSize="large" />}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Buyer"
        title="Unified cart"
        description="Products are grouped by seller so your checkout can create separate sub-orders automatically."
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 320px" }, gap: 3, alignItems: "start" }}>
        <Stack spacing={3}>
          {groups.map((group) => {
            const subtotal = group.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
            return (
              <AppCard key={group.sellerId}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography variant="h6">{group.sellerName}</Typography>
                      <Typography color="text.secondary">Seller-specific items for split checkout</Typography>
                    </Box>
                    <StatusChip status="Pending" />
                  </Stack>
                  <DataTable
                    columns={[
                      { key: "product", label: "Product" },
                      { key: "seller", label: "Seller" },
                      { key: "price", label: "Price" },
                      { key: "quantity", label: "Quantity" },
                      { key: "total", label: "Total" },
                      { key: "actions", label: "Actions" },
                    ]}
                    rows={group.items}
                    renderRow={(item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography fontWeight={600}>{item.name}</Typography>
                        </TableCell>
                        <TableCell>{group.sellerName}</TableCell>
                        <TableCell>{currency.format(item.price)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <RemoveRoundedIcon fontSize="small" />
                            </IconButton>
                            <Typography minWidth={24} textAlign="center">{item.quantity}</Typography>
                            <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <AddRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                        <TableCell>{currency.format(item.price * item.quantity)}</TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => {
                              removeFromCart(item.id);
                              notify({ title: "Cart updated", message: `${item.name} removed from cart`, severity: "info" });
                            }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )}
                    emptyTitle="No data available"
                    emptyDescription="This seller group is empty."
                  />
                  <Typography textAlign="right" sx={{ fontWeight: 600 }}>
                    Seller subtotal: {currency.format(subtotal)}
                  </Typography>
                </Stack>
              </AppCard>
            );
          })}
        </Stack>

        <Box sx={{ position: { lg: "sticky" }, top: { lg: 24 } }}>
          <AppCard>
            <Stack spacing={2.5}>
              <Typography variant="h6">Cart summary</Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Total items</Typography>
                <Typography>{items.length}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Grand total</Typography>
                <Typography variant="h5" color="primary.main">{currency.format(total)}</Typography>
              </Stack>
              <Button component={RouterLink} to="/buyer/checkout" size="large" variant="contained" fullWidth>
                Proceed to checkout
              </Button>
              <Button component={RouterLink} to="/buyer/products" size="large" variant="outlined" fullWidth>
                Continue shopping
              </Button>
            </Stack>
          </AppCard>
        </Box>
      </Box>
    </Box>
  );
}

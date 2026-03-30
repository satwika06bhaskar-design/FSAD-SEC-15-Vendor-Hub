import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import {
  Avatar,
  Box,
  Button,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import ConfirmDialog from "../../components/ConfirmDialog";
import DataTable from "../../components/DataTable";
import AppModal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { useToast } from "../../context/ToastContext";
import { sellerApi } from "../../services/api";
import { currency, stockStatus } from "../../utils/format";

const emptyForm = { name: "", description: "", price: "", stock: "" };

export default function ProductManagementPage() {
  const { notify } = useToast();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    const { data } = await sellerApi.products();
    setProducts(data.products || []);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await sellerApi.updateProduct(editingId, form);
      notify({ title: "Products", message: "Product updated.", severity: "success" });
    } else {
      await sellerApi.addProduct(form);
      notify({ title: "Products", message: "Product created.", severity: "success" });
    }
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(false);
    loadProducts();
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    await sellerApi.deleteProduct(confirmDeleteId);
    notify({ title: "Products", message: "Product deleted.", severity: "success" });
    setConfirmDeleteId(null);
    loadProducts();
  };

  return (
    <Box>
      <PageHeader
        eyebrow="Seller"
        title="Product inventory"
        description="Manage seller listings with a modal-based workflow and safer confirmation steps."
        action={<Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => { setEditingId(null); setForm(emptyForm); setModalOpen(true); }}>Add product</Button>}
      />

      <DataTable
        loading={loading}
        columns={[
          { key: "image", label: "Image" },
          { key: "name", label: "Name" },
          { key: "price", label: "Price" },
          { key: "stock", label: "Stock" },
          { key: "status", label: "Status" },
          { key: "actions", label: "Actions" },
        ]}
        rows={products}
        emptyTitle="No data available"
        emptyDescription="Add your first product to start selling."
        renderRow={(product) => (
          <TableRow key={product.id} hover>
            <TableCell>
              <Avatar variant="rounded" sx={{ width: 56, height: 56, bgcolor: "primary.50", color: "primary.main" }}>
                <Inventory2OutlinedIcon />
              </Avatar>
            </TableCell>
            <TableCell>
              <Typography fontWeight={600}>{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">{product.description || "No description added yet"}</Typography>
            </TableCell>
            <TableCell>{currency.format(product.price)}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>
              <StatusChip status={stockStatus(product.stock)} />
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => handleEdit(product)}>
                  Edit
                </Button>
                <Button size="small" variant="outlined" color="error" startIcon={<DeleteOutlineOutlinedIcon />} onClick={() => setConfirmDeleteId(product.id)}>
                  Delete
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        )}
      />

      <AppModal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit product" : "Add product"}>
        <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
          <Stack spacing={2}>
            <TextField label="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            <TextField label="Description" multiline minRows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <TextField label="Price" type="number" inputProps={{ step: "0.01" }} value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} required />
            <TextField label="Stock" type="number" value={form.stock} onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))} required />
            <Button type="submit" variant="contained">{editingId ? "Save changes" : "Create product"}</Button>
          </Stack>
        </Box>
      </AppModal>

      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete product"
        description="This removes the product from your seller catalog without changing any backend logic."
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
}

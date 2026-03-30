import { Button, DialogActions, DialogContentText, Stack } from "@mui/material";

import AppModal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  confirmColor = "primary",
}) {
  return (
    <AppModal open={open} onClose={onClose} title={title} maxWidth="xs">
      <Stack spacing={3} sx={{ pt: 1 }}>
        <DialogContentText>{description}</DialogContentText>
        <DialogActions sx={{ px: 0 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color={confirmColor} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

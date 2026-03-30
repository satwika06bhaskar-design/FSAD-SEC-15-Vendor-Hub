import { Dialog, DialogContent, DialogTitle } from "@mui/material";

export default function AppModal({ open, onClose, title, children, maxWidth = "sm" }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth}>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}

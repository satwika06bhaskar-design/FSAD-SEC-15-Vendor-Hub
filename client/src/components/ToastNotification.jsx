import { Alert, Slide, Snackbar } from "@mui/material";

function Transition(props) {
  return <Slide {...props} direction="left" />;
}

export default function ToastNotification({ notification, open, onClose, onExited }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      TransitionComponent={Transition}
      TransitionProps={{ onExited }}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert onClose={onClose} severity={notification?.severity || "info"} variant="filled" sx={{ width: "100%" }}>
        {notification?.message || ""}
      </Alert>
    </Snackbar>
  );
}

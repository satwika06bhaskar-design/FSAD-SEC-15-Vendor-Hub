import { createContext, useContext, useEffect, useMemo, useState } from "react";

import ToastNotification from "../components/ToastNotification";

const ToastContext = createContext(null);

function normalizePayload(payload, fallbackSeverity) {
  if (typeof payload === "string") {
    return {
      message: payload,
      severity: fallbackSeverity || "info",
      title: "Notification",
    };
  }

  return {
    title: payload.title || "Notification",
    message: payload.message,
    severity: payload.severity || fallbackSeverity || "info",
  };
}

export function ToastProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [current, setCurrent] = useState(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!current && queue.length) {
      setCurrent(queue[0]);
      setQueue((items) => items.slice(1));
      setOpen(true);
    }
  }, [queue, current]);

  const notify = (payload, fallbackSeverity) => {
    const item = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...normalizePayload(payload, fallbackSeverity),
      createdAt: Date.now(),
      read: false,
    };

    setNotifications((items) => [item, ...items].slice(0, 12));
    setQueue((items) => [...items, item]);
  };

  const handleClose = () => setOpen(false);

  const handleExited = () => {
    setCurrent(null);
  };

  const markAllRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  const value = useMemo(
    () => ({
      notify,
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      markAllRead,
    }),
    [notifications]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastNotification
        notification={current}
        open={open}
        onClose={handleClose}
        onExited={handleExited}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

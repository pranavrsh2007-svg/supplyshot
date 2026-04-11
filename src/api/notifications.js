// Mock notifications API — stores in localStorage

const STORAGE_KEY = "truckAI_notifications";

const SEED_NOTIFICATIONS = [
  {
    _id: "notif_1",
    type: "info",
    title: "Welcome to TruckAI!",
    message: "Your account is set up. Start by adding your truck details.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    _id: "notif_2",
    type: "service_due",
    title: "Service Due Soon",
    message: "Your truck MH12AB1234 is due for service in 51 days.",
    read: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "notif_3",
    type: "warning",
    title: "Heavy Traffic Alert",
    message: "Heavy traffic reported on NH48 near Vadodara. Expect 45 min delay.",
    read: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

function loadNotifs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    return JSON.parse(saved);
  } catch { return SEED_NOTIFICATIONS; }
}
function saveNotifs(notifs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
}

export const getNotifications = async () => {
  await new Promise((r) => setTimeout(r, 150));
  const notifications = loadNotifs();
  const unreadCount = notifications.filter((n) => !n.read).length;
  return { data: { notifications, unreadCount } };
};

export const markAllRead = async () => {
  await new Promise((r) => setTimeout(r, 100));
  const notifs = loadNotifs().map((n) => ({ ...n, read: true }));
  saveNotifs(notifs);
  return { data: { message: "All marked as read." } };
};

export const markOneRead = async (id) => {
  await new Promise((r) => setTimeout(r, 100));
  const notifs = loadNotifs().map((n) => n._id === id ? { ...n, read: true } : n);
  saveNotifs(notifs);
  return { data: notifs.find((n) => n._id === id) };
};

export const deleteNotification = async (id) => {
  await new Promise((r) => setTimeout(r, 100));
  saveNotifs(loadNotifs().filter((n) => n._id !== id));
  return { data: { message: "Deleted." } };
};

// Helper to add a notification (used internally, e.g. on document upload)
export const addNotification = (type, title, message) => {
  const notifs = loadNotifs();
  const newNotif = {
    _id: "notif_" + Date.now(),
    type, title, message,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifs.unshift(newNotif);
  saveNotifs(notifs);
  return newNotif;
};

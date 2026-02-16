// Toast notification state/store

let toastListeners = [];

export function addToast({ message, type = "default", duration = 5000 }) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  toastListeners.forEach((cb) => cb({ type: "add", toast: { id, message, type, duration } }));
  return id;
}

export function removeToast(id) {
  toastListeners.forEach((cb) => cb({ type: "remove", id }));
}

export function subscribe(fn) {
  toastListeners.push(fn);
  return () => {
    toastListeners = toastListeners.filter((l) => l !== fn);
  };
}

// Offline queue for attendance syncing when network is unavailable.
// localStorage persists records until back online, then we sync to Supabase.

const QUEUE_KEY = "ganesha_attendance_queue";

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function addToOfflineQueue(record) {
  const storage = getStorage();
  if (!storage) return;
  const queue = JSON.parse(storage.getItem(QUEUE_KEY) || "[]");
  queue.push({ ...record, queuedAt: Date.now() });
  storage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function getOfflineQueue() {
  const storage = getStorage();
  if (!storage) return [];
  return JSON.parse(storage.getItem(QUEUE_KEY) || "[]");
}

export function clearOfflineQueue() {
  const storage = getStorage();
  if (storage) storage.setItem(QUEUE_KEY, "[]");
}

export async function processOfflineQueue(supabase) {
  const queue = getOfflineQueue();
  for (const record of queue) {
    try {
      const payload = {
        student_id: record.student_id,
        class_date: record.class_date ?? record.date,
        status: record.status ?? "present",
        notes: record.notes ?? null,
        marked_by: record.marked_by ?? null,
      };
      const { error } = await supabase.from("attendance").insert(payload);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to sync queued attendance:", err);
      return;
    }
  }
  clearOfflineQueue();
}

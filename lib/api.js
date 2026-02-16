/**
 * API abstraction for Supabase operations.
 * Centralizes all DB calls for easier maintenance and offline support.
 */
import { supabase } from "@/lib/supabase";

function handleError(error, context) {
  if (error) {
    if (error?.name === "AbortError") throw error;
    console.error("[Supabase]", context, error.message || error);
    throw error;
  }
}

const STORAGE_BUCKET_PHOTOS = "student-photos";
const STORAGE_BUCKET_IMAGES = "inventory-images";

// ---- Students ----
export async function fetchStudents(filters = {}) {
  let q = supabase.from("students").select("*");
  if (filters.branchId) q = q.eq("branch_id", filters.branchId);
  if (filters.isActive !== undefined) q = q.eq("is_active", filters.isActive);
  q = q.order("first_name", { ascending: true });
  const { data, error } = await q;
  handleError(error, "fetchStudents");
  return data ?? [];
}

export async function createStudent(payload) {
  const { data, error } = await supabase.from("students").insert(payload).select().single();
  handleError(error, "createStudent");
  return data;
}

export async function updateStudent(id, payload) {
  const { data, error } = await supabase.from("students").update(payload).eq("id", id).select().single();
  handleError(error, "updateStudent");
  return data;
}

export async function getStudent(id) {
  const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
  handleError(error, "getStudent");
  return data;
}

export async function deleteStudent(id) {
  const { error } = await supabase.from("students").delete().eq("id", id);
  handleError(error, "deleteStudent");
}

export async function uploadStudentPhoto(studentId, file) {
  const ext = file.name.split(".").pop();
  const path = `${studentId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET_PHOTOS).upload(path, file, { upsert: true });
  handleError(error, "uploadStudentPhoto");
  const { data } = supabase.storage.from(STORAGE_BUCKET_PHOTOS).getPublicUrl(path);
  return data.publicUrl;
}

// ---- Belt Ranks ----
export async function fetchBeltRanks() {
  const { data, error } = await supabase.from("belt_ranks").select("*").order("id", { ascending: true });
  handleError(error, "fetchBeltRanks");
  return data ?? [];
}

// ---- Branches ----
export async function fetchBranches() {
  const { data, error } = await supabase.from("branches").select("*").order("name");
  handleError(error, "fetchBranches");
  return data ?? [];
}

export async function createBranch(payload) {
  const { data, error } = await supabase.from("branches").insert(payload).select().single();
  handleError(error, "createBranch");
  return data;
}

export async function updateBranch(id, payload) {
  const { data, error } = await supabase.from("branches").update(payload).eq("id", id).select().single();
  handleError(error, "updateBranch");
  return data;
}

export async function getBranch(id) {
  const { data, error } = await supabase.from("branches").select("*").eq("id", id).single();
  handleError(error, "getBranch");
  return data;
}

export async function getBranchStats(branchId) {
  const [studentsRes, instructorsRes] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("branch_id", branchId).eq("is_active", true),
    supabase.from("instructors").select("id", { count: "exact", head: true }).eq("branch_id", branchId).eq("is_active", true),
  ]);
  return {
    students: studentsRes?.count ?? 0,
    instructors: instructorsRes?.count ?? 0,
  };
}

// ---- Instructors ----
export async function fetchInstructors(filters = {}) {
  let q = supabase.from("instructors").select("*");
  if (filters.branchId) q = q.eq("branch_id", filters.branchId);
  q = q.order("first_name", { ascending: true });
  const { data, error } = await q;
  handleError(error, "fetchInstructors");
  return data ?? [];
}

export async function createInstructor(payload) {
  const { data, error } = await supabase.from("instructors").insert(payload).select().single();
  handleError(error, "createInstructor");
  return data;
}

export async function updateInstructor(id, payload) {
  const { data, error } = await supabase.from("instructors").update(payload).eq("id", id).select().single();
  handleError(error, "updateInstructor");
  return data;
}

export async function deleteInstructor(id) {
  const { error } = await supabase.from("instructors").delete().eq("id", id);
  handleError(error, "deleteInstructor");
}

export async function getInstructor(id) {
  const { data, error } = await supabase.from("instructors").select("*").eq("id", id).single();
  handleError(error, "getInstructor");
  return data;
}

export async function getInstructorByAuthId(authId) {
  const { data, error } = await supabase.from("instructors").select("*").eq("auth_id", authId).maybeSingle();
  handleError(error, "getInstructorByAuthId");
  return data;
}

// ---- Attendance ----
export async function fetchAttendance(filters = {}) {
  let q = supabase.from("attendance").select("*, students(first_name, last_name, branch_id)");
  if (filters.date) q = q.eq("class_date", filters.date);
  if (filters.branchId != null && filters.branchId !== "all") {
    const { data: students } = await supabase.from("students").select("id").eq("branch_id", filters.branchId).eq("is_active", true);
    const ids = (students ?? []).map((s) => s.id);
    if (ids.length) q = q.in("student_id", ids);
    else q = q.eq("student_id", -1);
  }
  q = q.order("class_date", { ascending: false });
  const { data, error } = await q;
  handleError(error, "fetchAttendance");
  return data ?? [];
}

export async function createAttendance(payload) {
  const { data, error } = await supabase.from("attendance").insert(payload).select().single();
  handleError(error, "createAttendance");
  return data;
}

export async function updateAttendance(id, payload) {
  const { data, error } = await supabase.from("attendance").update(payload).eq("id", id).select().single();
  handleError(error, "updateAttendance");
  return data;
}

export async function saveAttendanceBulk(date, branchId, records, markedByAuth = null) {
  const { data: students } = await supabase.from("students").select("id").eq("branch_id", branchId).eq("is_active", true);
  const studentIds = new Set((students ?? []).map((s) => s.id));
  for (const r of records) {
    if (!studentIds.has(r.student_id)) continue;
    const payload = { status: r.status };
    if (markedByAuth) payload.marked_by_auth = markedByAuth;
    const { data: existing } = await supabase.from("attendance").select("id").eq("student_id", r.student_id).eq("class_date", date).maybeSingle();
    if (existing?.id) await updateAttendance(existing.id, payload);
    else await createAttendance({ student_id: r.student_id, class_date: date, ...payload });
  }
}

export async function getTodayAttendanceCount() {
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase.from("attendance").select("id", { count: "exact", head: true }).eq("class_date", today).eq("status", "present");
  return count ?? 0;
}

// ---- Fees ----
export async function fetchFees(filters = {}) {
  let q = supabase.from("fees").select("*, students(first_name, last_name, branch_id)");
  if (filters.studentId) q = q.eq("student_id", filters.studentId);
  if (filters.branchId) {
    const { data: students } = await supabase.from("students").select("id").eq("branch_id", filters.branchId);
    const ids = (students ?? []).map((s) => s.id);
    if (ids.length) q = q.in("student_id", ids);
    else q = q.eq("student_id", -1);
  }
  q = q.order("due_date", { ascending: false });
  const { data, error } = await q;
  handleError(error, "fetchFees");
  return data ?? [];
}

export async function createFee(payload) {
  const { data, error } = await supabase.from("fees").insert(payload).select().single();
  handleError(error, "createFee");
  return data;
}

export async function updateFee(id, payload) {
  const { data, error } = await supabase.from("fees").update(payload).eq("id", id).select().single();
  handleError(error, "updateFee");
  return data;
}

export async function getUpcomingFeesCount() {
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("fees")
    .select("id", { count: "exact", head: true })
    .gte("due_date", today)
    .neq("status", "paid");
  return count ?? 0;
}

export async function fetchFeesForMonth(branchId, yearMonth) {
  const [year, month] = yearMonth.split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
  const { data: students } = await supabase.from("students").select("id").eq("branch_id", branchId).eq("is_active", true);
  const ids = (students ?? []).map((s) => s.id);
  if (!ids.length) return [];
  const { data } = await supabase
    .from("fees")
    .select("*")
    .in("student_id", ids)
    .gte("due_date", start)
    .lte("due_date", end)
    .order("student_id");
  return data ?? [];
}

export async function saveFeesBulk(yearMonth, branchId, records, defaultAmount = 0) {
  const [year, month] = yearMonth.split("-").map(Number);
  const dueDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const today = new Date().toISOString().split("T")[0];
  for (const r of records) {
    const payload = {
      student_id: r.student_id,
      amount: Number(r.amount) || defaultAmount,
      due_date: dueDate,
      status: r.status ?? "pending",
      payment_method: r.status === "paid" ? (r.payment_method || "Cash") : null,
    };
    if (r.status === "paid") payload.paid_at = today;
    const { data: existing } = await supabase
      .from("fees")
      .select("id")
      .eq("student_id", r.student_id)
      .eq("due_date", dueDate)
      .maybeSingle();
    if (existing?.id) {
      const { error } = await supabase.from("fees").update(payload).eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("fees").insert(payload);
      if (error) throw error;
    }
  }
}

// ---- Announcements ----
export async function fetchAnnouncements(filters = {}) {
  let q = supabase.from("announcements").select("*");
  if (filters.branchId) q = q.eq("branch_id", filters.branchId);
  if (filters.isActive !== undefined) q = q.eq("is_active", filters.isActive);
  const { data, error } = await q.order("created_at", { ascending: false });
  handleError(error, "fetchAnnouncements");
  return data ?? [];
}

export async function createAnnouncement(payload) {
  const res = await fetch("/api/announcements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to create announcement");
  return json;
}

export async function updateAnnouncement(id, payload) {
  const { data, error } = await supabase.from("announcements").update(payload).eq("id", id).select().single();
  handleError(error, "updateAnnouncement");
  return data;
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  handleError(error, "deleteAnnouncement");
}

// ---- Inventory ----
export async function fetchInventory(filters = {}) {
  let q = supabase.from("inventory").select("*");
  if (filters.branchId) q = q.eq("branch_id", filters.branchId);
  if (filters.activeOnly) q = q.eq("is_active", true);
  q = q.order("item_name", { ascending: true });
  const { data, error } = await q;
  handleError(error, "fetchInventory");
  return data ?? [];
}

export async function createInventoryItem(payload) {
  const { data, error } = await supabase.from("inventory").insert(payload).select().single();
  handleError(error, "createInventoryItem");
  return data;
}

export async function updateInventoryItem(id, payload) {
  const { data, error } = await supabase.from("inventory").update(payload).eq("id", id).select().single();
  handleError(error, "updateInventoryItem");
  return data;
}

export async function uploadInventoryImage(itemId, file) {
  const ext = file.name.split(".").pop();
  const path = `${itemId}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET_IMAGES).upload(path, file, { upsert: true });
  handleError(error, "uploadInventoryImage");
  const { data } = supabase.storage.from(STORAGE_BUCKET_IMAGES).getPublicUrl(path);
  return data.publicUrl;
}

// ---- Orders ----
export async function fetchOrders(filters = {}) {
  let q = supabase.from("orders").select("*, students(first_name, last_name), instructors(first_name, last_name)");
  if (filters.branchId) q = q.eq("branch_id", filters.branchId);
  if (filters.instructorId) q = q.eq("instructor_id", filters.instructorId);
  const { data, error } = await q.order("created_at", { ascending: false });
  handleError(error, "fetchOrders");
  return data ?? [];
}

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createOrder(payload) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_number: payload.order_number ?? generateOrderNumber(),
      student_id: payload.student_id ?? null,
      instructor_id: payload.instructor_id ?? null,
      branch_id: payload.branch_id ?? null,
      total: payload.total ?? 0,
      status: payload.status ?? "pending",
      items: payload.items ?? null,
    })
    .select()
    .single();
  handleError(error, "createOrder");
  return data;
}

export async function updateOrder(id, payload) {
  const { data, error } = await supabase.from("orders").update(payload).eq("id", id).select().single();
  handleError(error, "updateOrder");
  return data;
}

// ---- Notifications ----
export async function fetchNotifications(userId, filters = {}) {
  if (filters?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
  let q = supabase.from("notifications").select("*").eq("user_id", userId);
  if (filters.unreadOnly) q = q.eq("is_read", false);
  q = q.order("created_at", { ascending: false }).limit(50);
  const { data, error } = await q;
  handleError(error, "fetchNotifications");
  return data ?? [];
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  handleError(error, "markNotificationRead");
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
  handleError(error, "markAllNotificationsRead");
}

export async function getUnreadCount(userId) {
  const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_read", false);
  return count ?? 0;
}

// ---- Approval Requests ----
export async function fetchApprovalRequests(filters = {}) {
  let q = supabase.from("approval_requests").select("*, instructors(first_name, last_name)");
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.instructorId) q = q.eq("instructor_id", filters.instructorId);
  const { data, error } = await q.order("created_at", { ascending: false });
  handleError(error, "fetchApprovalRequests");
  return data ?? [];
}

export async function createApprovalRequest(payload) {
  const { data, error } = await supabase.from("approval_requests").insert(payload).select().single();
  handleError(error, "createApprovalRequest");
  return data;
}

export async function updateApprovalRequest(id, payload) {
  const { data, error } = await supabase.from("approval_requests").update(payload).eq("id", id).select().single();
  handleError(error, "updateApprovalRequest");
  return data;
}

export async function getPendingApprovalCount() {
  const { count } = await supabase
    .from("approval_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export async function getPendingOrdersCount(branchId) {
  if (!branchId) return 0;
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("branch_id", branchId)
    .or("status.eq.pending,status.eq.processing,status.is.null");
  return count ?? 0;
}

// ---- Notifications (create) ----
export async function createNotification(payload) {
  const { data, error } = await supabase.from("notifications").insert(payload).select().single();
  handleError(error, "createNotification");
  return data;
}

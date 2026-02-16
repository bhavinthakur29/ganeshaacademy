/**
 * Schema helpers and column references for Supabase tables.
 * Use these constants when building queries to avoid typos.
 *
 * Tables: students, attendance, notifications, branches, fees, orders, belt_ranks, instructors, inventory, announcements
 */

export function getStudentFullName(student) {
  if (!student) return "";
  const first = student.first_name || "";
  const last = student.last_name || "";
  return `${first} ${last}`.trim() || "-";
}

export const STUDENTS_COLUMNS = {
  id: "id",
  membershipId: "membership_id",
  firstName: "first_name",
  lastName: "last_name",
  emailAddress: "email_address",
  gender: "gender",
  dateOfBirth: "date_of_birth",
  age: "age",
  contactNumber: "contact_number",
  branchId: "branch_id",
  beltId: "belt_id",
  fatherName: "father_name",
  motherName: "mother_name",
  isActive: "is_active",
};

export const ATTENDANCE_COLUMNS = {
  id: "id",
  studentId: "student_id",
  classDate: "class_date",
  status: "status",
  notes: "notes",
  markedBy: "marked_by",
};

export const NOTIFICATIONS_COLUMNS = {
  id: "id",
  userId: "user_id",
  type: "type",
  message: "message",
  isRead: "is_read",
  createdAt: "created_at",
};

export const BRANCHES_COLUMNS = {
  id: "id",
  name: "name",
  address: "address",
  phone: "phone",
  email: "email",
  manager: "manager",
};

export const FEES_COLUMNS = {
  id: "id",
  studentId: "student_id",
  amount: "amount",
  dueDate: "due_date",
  paidAt: "paid_at",
  status: "status",
  paymentMethod: "payment_method",
};

export const ORDERS_COLUMNS = {
  id: "id",
  studentId: "student_id",
  instructorId: "instructor_id",
  branchId: "branch_id",
  total: "total",
  status: "status",
  items: "items",
  createdAt: "created_at",
};

export const INSTRUCTORS_COLUMNS = {
  id: "id",
  firstName: "first_name",
  lastName: "last_name",
  emailAddress: "email_address",
  phone: "phone",
  branchId: "branch_id",
  beltLevel: "belt_level",
  isActive: "is_active",
};

export const INVENTORY_COLUMNS = {
  id: "id",
  itemName: "item_name",
  category: "category",
  quantity: "quantity",
  unitPrice: "unit_price",
  branchId: "branch_id",
  supplier: "supplier",
  lastRestocked: "last_restocked",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

export const ANNOUNCEMENTS_COLUMNS = {
  id: "id",
  title: "title",
  message: "message",
  branchId: "branch_id",
  isActive: "is_active",
  startDate: "start_date",
  endDate: "end_date",
  createdAt: "created_at",
};

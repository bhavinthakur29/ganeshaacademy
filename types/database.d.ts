/**
 * Supabase table row types (Ganesha Academy schema).
 * Use these for type-safe hooks and API responses.
 */
export interface Student {
  id: string;
  membership_id?: string | null;
  first_name: string;
  last_name: string;
  email_address?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  age?: number | null;
  contact_number?: string | null;
  branch_id?: string | null;
  belt_id?: string | null;
  father_name?: string | null;
  mother_name?: string | null;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Branch {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  manager?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  email_address?: string | null;
  phone?: string | null;
  branch_id?: string | null;
  belt_level?: string | null;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_date: string;
  status: string;
  notes?: string | null;
  marked_by?: string | null;
  created_at?: string | null;
  students?: { first_name?: string; last_name?: string } | null;
}

export interface Fee {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  paid_at?: string | null;
  status: string;
  payment_method?: string | null;
  created_at?: string | null;
  students?: { first_name?: string; last_name?: string } | null;
}

export interface Notification {
  id: string;
  user_id: string;
  type?: string | null;
  message: string;
  is_read?: boolean;
  created_at?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  message?: string | null;
  branch_id?: string | null;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string | null;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  category?: string | null;
  quantity?: number;
  unit_price?: number | null;
  branch_id?: string | null;
  supplier?: string | null;
  last_restocked?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Order {
  id: string;
  student_id: string;
  instructor_id?: string | null;
  branch_id?: string | null;
  total?: number | null;
  status?: string | null;
  items?: unknown;
  created_at?: string | null;
  students?: { first_name?: string; last_name?: string } | null;
}

export interface BeltRank {
  id: string;
  name?: string | null;
  color?: string | null;
  order?: number | null;
}

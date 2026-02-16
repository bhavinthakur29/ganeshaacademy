# Supabase Schema Reference

Create these tables in your Supabase project. Adjust column types to match your existing schema.

## Storage Buckets

- `student-photos` - for student profile images
- `inventory-images` - for inventory item images

## Tables

### students (existing - use your schema)
Key columns: id, first_name, last_name, email_address, contact_number, branch_id, branch_name, date_of_birth, age, belt_id, fee_account_member, is_active, notes, photo, etc.

### branches
- id (int, pk)
- name (text)
- address (text)
- phone (text)
- email (text)
- manager (text)

### instructors
- id (int, pk)
- first_name (text)
- last_name (text)
- email_address (text) or email (text)
- phone (text)
- branch_id (int, fk branches)
- belt_level (text)
- is_active (boolean)

### attendance
- id (int, pk)
- student_id (int, fk students)
- date (date)
- status (text) - present, absent, late
- branch_id (int)
- approval_status (text, optional) - pending, approved

### fees
- id (int, pk)
- student_id (int, fk students)
- amount (numeric)
- due_date (date)
- status (text) - pending, paid, overdue, partial
- payment_method (text)
- paid_at (timestamp)

### announcements
- id (int, pk)
- title (text)
- message (text)
- branch_id (int, nullable - null = all branches)
- is_active (boolean)
- start_date (date)
- end_date (date)
- created_at (timestamp)

### inventory
- id (int, pk)
- name (text)
- description (text)
- price (numeric)
- quantity (int)
- image_url (text)

### orders
- id (int, pk)
- student_id (int, fk students)
- instructor_id (int, fk instructors)
- branch_id (int)
- total (numeric)
- status (text) - pending, completed, cancelled
- items (jsonb, optional)
- created_at (timestamp)

### notifications
- id (int, pk)
- user_id (uuid - Supabase auth user id)
- title (text)
- message (text)
- read (boolean)
- created_at (timestamp)

## Row Level Security (RLS)

Enable RLS and create policies for role-based access. Example:

- Admin: full access to all tables
- Branch manager: filter by branch_id = user's branch_id (set in user_metadata)

Add branch_id and role to user metadata via Supabase Auth:
```sql
-- In Supabase dashboard or via Admin API
-- user_metadata: { "role": "admin" } or { "role": "branch_manager", "branch_id": 1 }
```

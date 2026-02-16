import { redirect } from "next/navigation";
// TODO: Add Supabase Auth check - redirect to /login if not authenticated, else /dashboard
export default function HomePage() {
  redirect("/dashboard");
}

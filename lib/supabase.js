/**
 * Single source for Supabase credentials and client.
 * Uses createBrowserClient from @supabase/ssr so sessions are stored in cookies,
 * allowing middleware to read auth state on protected routes.
 *
 * Realtime config for Firefox reliability:
 * - Shorter heartbeat + timeout for faster failure detection and reconnect
 * - heartbeatCallback forces reconnect on timeout (handles interrupted connections)
 * - Explicit reconnect backoff
 * - Ensure wss:// (HTTPS) for production
 */
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase env vars required. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    timeout: 15000,
    heartbeatIntervalMs: 15000,
    heartbeatCallback: (status) => {
      if (typeof window === "undefined") return;
      if (status === "timeout" || status === "disconnected") {
        supabase.realtime.connect();
      }
    },
    reconnectAfterMs: (tries) => {
      const delays = [1000, 2000, 5000, 10000, 15000];
      return delays[Math.min(tries, delays.length - 1)] ?? 15000;
    },
    logLevel: process.env.NODE_ENV === "development" ? "info" : "warn",
  },
});

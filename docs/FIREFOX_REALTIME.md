# Firefox Realtime WebSocket Troubleshooting

If Supabase Realtime fails in Firefox (e.g. "Firefox can't establish a connection to wss://...", "__cf_bm cookie rejected"), follow these steps.

## 1. App-Level Fixes (Already Applied)

The app includes:

- **Supabase client** (`lib/supabase.js`): heartbeatCallback for reconnect on timeout, shorter heartbeat/timeout, explicit reconnect backoff
- **useRealtimeNotifications** (`hooks/useRealtimeNotifications.js`): Delayed subscribe (300ms), retry on failure (up to 2 times), polling fallback, visibility-change reconnection
- **NotificationRealtimeHandler**: Uses the hook; falls back to polling every 25s when WebSocket fails

## 2. Firefox Settings

### Disable Strict Tracking Protection for Your Site

1. Click the shield icon in the address bar
2. Turn off "Enhanced Tracking Protection" for this site, or set to "Standard" instead of "Strict"

The `__cf_bm` cookie is set by Cloudflare (used by Supabase). Firefox's Strict mode can reject it as a third-party cookie, which breaks the WebSocket handshake.

### Alternative: Add Site Exception

1. Open `about:config` in Firefox
2. Search for `network.cookie.cookieBehavior`
3. Or add an exception: **Settings → Privacy & Security → Enhanced Tracking Protection → Exceptions** → add your app's domain

## 3. HTTPS / WSS

Ensure the app is served over **HTTPS** in production. Mixed content (HTTP page + WSS) can cause connection issues.

## 4. Verify Supabase Realtime

1. Supabase Dashboard → Project Settings → API
2. Confirm the project URL uses `https://`
3. Realtime is enabled by default; ensure the `notifications` table is in the Realtime publication (see migrations)

## 5. Debug in Development

In development, the Supabase client logs realtime events. Open the browser console and look for:

- `[Realtime]` messages
- WebSocket connection errors
- Cookie warnings

Set `log_level: "info"` in `lib/supabase.js` (already done for development) to see connection attempts and reconnections.

## 6. Ready-to-Use Realtime Subscription Pattern

Use `useRealtimeNotifications` in any component:

```jsx
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

function MyComponent({ userId }) {
  useRealtimeNotifications(userId, {
    onNotification: (payload) => { /* handle INSERT/UPDATE/DELETE */ },
    onFallback: () => { /* refresh data when WebSocket fails - e.g. refetch */ },
    onSubscribed: () => { /* optional: when Realtime connects successfully */ },
  });
  return <div>...</div>;
}
```

Or use `NotificationRealtimeHandler` in a layout:

```jsx
<NotificationRealtimeHandler
  userId={user?.id}
  onNotification={handleRealtimeNotification}
  onRealtimeFailed={refreshUnreadCount}
/>
```

## Summary

| Issue                | Fix                                              |
|----------------------|--------------------------------------------------|
| WebSocket fails      | App falls back to polling; notifications still work |
| __cf_bm rejected     | Relax Enhanced Tracking Protection for the site |
| Connection drops     | heartbeatCallback + reconnect; retry + visibility reconnection |
| No errors but no actions | Check console; ensure HTTPS in production     |

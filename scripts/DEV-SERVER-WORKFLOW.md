# Next.js Dev Server & Static Chunks – Clean Workflow

When `_next/static` JS/CSS chunks return 404 after a dev server restart, use this workflow.

---

## Quick Fix (Try First)

1. **Stop the dev server** (Ctrl+C)
2. **Delete `.next` only:**
   ```powershell
   Remove-Item -Recurse -Force .next
   ```
3. **Restart:**
   ```powershell
   npm run dev
   # or
   bun run dev
   ```
4. **Hard refresh the browser:** `Ctrl+Shift+R` or `Ctrl+F5`

---

## Full Clean Rebuild (When Quick Fix Fails)

### Windows (PowerShell)

From project root:

```powershell
# Using npm (default)
.\scripts\clean-rebuild.ps1

# Or with Bun
.\scripts\clean-rebuild.ps1 -PackageManager bun
```

### Windows (CMD)

```cmd
scripts\clean-rebuild.bat
scripts\clean-rebuild.bat bun
```

### Manual Steps

| Step | Command (npm) | Command (Bun) |
|------|----------------|---------------|
| 1. Stop dev server | Ctrl+C | Ctrl+C |
| 2. Remove .next | `Remove-Item -Recurse -Force .next` | Same |
| 3. Remove caches | `Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue` | Same |
| 4. Remove .turbo | `Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue` | Same |
| 5. Remove node_modules | `Remove-Item -Recurse -Force node_modules` | Same |
| 6. Reinstall | `npm install` | `bun install` |
| 7. Build | `npm run build` | `bun run build` |
| 8. Start dev | `npm run dev` | `bun run dev` |

---

## Safe Dev Restart (No Full Rebuild)

To avoid stale chunks:

1. **Stop the dev server** (Ctrl+C)
2. **Clear .next** (optional but recommended):
   ```powershell
   if (Test-Path .next) { Remove-Item -Recurse -Force .next }
   ```
3. **Start again:**
   ```powershell
   npm run dev
   ```
4. **Hard refresh the browser** after the first load.

---

## App Router Structure Check

Your app folder should look like:

```
app/
├── layout.jsx          # Root layout (required)
├── page.jsx            # Home page
├── loading.jsx         # Optional root loading
├── error.jsx            # Optional root error
├── not-found.jsx        # Optional 404
├── (auth)/              # Route group
│   ├── layout.jsx
│   ├── loading.jsx
│   └── login/page.jsx
├── (dashboard)/         # Route group
│   ├── layout.jsx
│   ├── loading.jsx
│   └── dashboard/page.jsx
│   └── ... other pages
└── api/                 # API routes
    └── ...
```

**Checklist:**

- [ ] `app/layout.jsx` exists and exports a root layout
- [ ] Route groups `(auth)` and `(dashboard)` use parentheses (correct)
- [ ] Each page has `page.jsx` (or `page.js`)
- [ ] Layouts use `layout.jsx` (not `layout.js` unless you use TypeScript)

---

## Common Causes of 404 Chunks

1. **Stale .next folder** – Old chunk hashes, new build uses new hashes
2. **Browser cache** – References to old chunk URLs
3. **Turbopack/Webpack cache** – `node_modules/.cache` or `.turbo`
4. **Port conflict** – Old process still holding the port
5. **Build corruption** – Incomplete or interrupted build

---

## If Problems Persist

1. **Clear browser cache** for localhost or use incognito
2. **Check next.config.js** – No custom `assetPrefix` unless needed
3. **Try different port:**
   ```powershell
   npm run dev -- -p 3001
   ```
4. **Check Node version:** Next.js 15 needs Node 18.18+
5. **Disable browser extensions** that block/modify requests

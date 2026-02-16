"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { subscribe, removeToast as removeToastFn } from "@/lib/toast";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Toasts() {
  const [toasts, setToasts] = useState([]);
  const [exiting, setExiting] = useState(new Set());
  const timeoutRefs = useRef(new Map());

  const dismiss = useCallback((id) => {
    setExiting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 220);
  }, []);

  useEffect(() => {
    const unsub = subscribe((ev) => {
      if (ev.type === "add") {
        setToasts((t) => [...t, ev.toast]);
        const duration = ev.toast.duration ?? 5000;
        if (duration > 0) {
          const tid = setTimeout(() => dismiss(ev.toast.id), duration);
          timeoutRefs.current.set(ev.toast.id, tid);
        }
      }
      if (ev.type === "remove") {
        const tid = timeoutRefs.current.get(ev.id);
        if (tid) {
          clearTimeout(tid);
          timeoutRefs.current.delete(ev.id);
        }
        setToasts((t) => t.filter((toast) => toast.id !== ev.id));
      }
    });
    return () => {
      unsub();
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current.clear();
    };
  }, [dismiss]);

  const visibleCount = toasts.filter((t) => !exiting.has(t.id)).length;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {visibleCount > 1 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5 text-xs">
            {visibleCount}
          </Badge>
        </div>
      )}
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "toast-enter flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-shadow",
            exiting.has(toast.id) && "toast-exit",
            toast.type === "error" && "border-destructive/60 bg-destructive/10 backdrop-blur-xl text-destructive",
            toast.type === "success" && "border-emerald-500/40 bg-emerald-500/10 backdrop-blur-xl text-emerald-700 dark:text-emerald-400",
            toast.type === "default" && "border-white/30 dark:border-white/10 bg-white/75 dark:bg-slate-900/85 backdrop-blur-xl"
          )}
          role="alert"
        >
          {toast.type === "success" && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />}
          {toast.type === "error" && <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />}
          <span className="flex-1 text-sm">{toast.message}</span>
          <button
            className="rounded p-1 opacity-70 hover:opacity-100 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

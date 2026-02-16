"use client";

import { useState } from "react";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPopover } from "@/components/NotificationPopover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export function Navbar({ onMenuClick, theme, onThemeToggle, unreadCount = 0, onReadUpdate, compact, className }) {
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleSignOut = async () => {
    setLogoutOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className={cn(
      "sticky top-0 z-30 shrink-0 flex h-14 min-h-[3.5rem] items-center justify-between gap-2",
      "border-b border-slate-200/60 dark:border-slate-700/50",
      "backdrop-blur-2xl",
      "bg-gradient-to-r from-white/90 via-white/85 to-emerald-50/30 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-emerald-950/20",
      "shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
      "px-3 sm:px-4",
      className
    )}>
      {!compact && (
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden shrink-0 h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      )}
      <div className="flex-1 min-w-0" />
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <Button variant="ghost" size="icon" onClick={onThemeToggle} className="h-9 w-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-amber-400" title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        {!compact && <NotificationPopover unreadCount={unreadCount} onReadUpdate={onReadUpdate} />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLogoutOpen(true)}
          title="Sign out"
          aria-label="Sign out"
          className="h-9 w-9 rounded-lg text-slate-600 dark:text-slate-400 hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">Are you sure you want to sign out?</p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Sheet = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange?.(false)} aria-hidden="true" />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-white/20 dark:border-white/10 bg-white/85 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl sm:max-w-md">
        {children}
      </div>
    </div>
  );
};

const SheetTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props}>{children}</div>
));

const SheetContent = React.forwardRef(({ className, side = "right", children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-full flex-col", className)}
    {...props}
  >
    {children}
  </div>
));
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-4 border-b border-border", className)} {...props} />
);

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
SheetTitle.displayName = "SheetTitle";

const SheetClose = ({ onClick, className, children, ...props }) => (
  <button type="button" onClick={onClick} className={cn(className)} {...props}>{children}</button>
);

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose };

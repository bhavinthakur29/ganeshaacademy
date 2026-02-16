"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const PopoverContext = React.createContext(null);

export function Popover({ open, onOpenChange, children }) {
  const containerRef = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onOpenChange?.(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onOpenChange]);

  return (
    <PopoverContext.Provider value={{ open, onOpenChange }}>
      <div ref={containerRef} className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ asChild, children, className, ...props }) {
  const ctx = React.useContext(PopoverContext);
  const child = React.Children.only(children);
  const handleClick = (e) => {
    child?.props?.onClick?.(e);
    ctx?.onOpenChange?.(!ctx.open);
  };

  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, {
      "data-state": ctx?.open ? "open" : "closed",
      "aria-expanded": ctx?.open,
      onClick: handleClick,
      className: cn(className, child.props.className),
      ...props,
    });
  }
  return (
    <button
      type="button"
      data-state={ctx?.open ? "open" : "closed"}
      aria-expanded={ctx?.open}
      onClick={handleClick}
      className={cn(className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function PopoverContent({ className, children, align = "end", ...props }) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx?.open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      className={cn(
        "absolute z-50 mt-2 rounded-xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl text-popover-foreground shadow-xl outline-none",
        "min-w-[280px] max-w-[360px] max-h-[min(400px,85vh)] overflow-auto",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {children}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-xs text-slate-100 bg-slate-900 border border-slate-700 rounded-md shadow-lg",
            "bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap",
            className
          )}
        >
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TooltipTrigger({ children, asChild = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  return <div {...props}>{children}</div>;
}

export function TooltipContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "z-50 px-3 py-1.5 text-xs text-slate-100 bg-slate-900 border border-slate-700 rounded-md shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

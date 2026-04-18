"use client";

import React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

/* Sheet Components */
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={`fixed inset-0 z-50 bg-black/10 backdrop-blur-xs transition-opacity duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 ${className || ""}`}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  const sideClasses = {
    top: "inset-x-0 top-0 h-auto border-b",
    right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
    bottom: "inset-x-0 bottom-0 h-auto border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
  };

  const slideClasses = {
    top: "data-[state=open]:slide-in-from-top-10 data-[state=closed]:slide-out-to-top-10",
    right:
      "data-[state=open]:slide-in-from-right-10 data-[state=closed]:slide-out-to-right-10",
    bottom:
      "data-[state=open]:slide-in-from-bottom-10 data-[state=closed]:slide-out-to-bottom-10",
    left: "data-[state=open]:slide-in-from-left-10 data-[state=closed]:slide-out-to-left-10",
  };

  React.useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Store original overflow values
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
    };
  }, []);

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        className={`fixed z-50 flex flex-col bg-background/95 backdrop-blur-xl border-foreground/10 shadow-lg transition-all duration-200 p-4 ${sideClasses[side]} ${slideClasses[side]} data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 ${className || ""}`}
        {...props}
      >
        <div className="flex flex-col overflow-hidden flex-1 min-h-0">
          <div className="overflow-y-auto overflow-x-hidden flex-1 overscroll-contain">
            {children}
          </div>
        </div>
        <SheetPrimitive.Close className="absolute top-4 right-4 text-foreground/60 hover:text-foreground transition-colors z-10">
          <X className="w-5 h-5" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={`flex flex-col gap-2 pb-4 ${className || ""}`} {...props} />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={`text-lg font-bold text-foreground ${className || ""}`}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={`text-sm text-foreground/60 ${className || ""}`}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};

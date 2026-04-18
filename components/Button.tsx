"use client";

import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outlined" | "icon" | "sm" | "sm-outlined" | "select";
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  if (variant === "primary") {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`relative px-8 md:px-10 py-4 rounded-xl font-semibold text-background bg-primary shadow-lg hover:shadow-xl transition-shadow group overflow-hidden cursor-pointer ${className}`}
        {...props}
      >
        {/* Glassmorphic shine effect */}
        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        <span className="relative">{children}</span>
      </motion.button>
    );
  }

  if (variant === "outlined") {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`relative px-8 md:px-10 py-4 rounded-xl font-semibold text-primary bg-primary/10 backdrop-blur-md border border-primary/20 hover:border-primary/40 hover:bg-primary/15 transition-all group overflow-hidden cursor-pointer  ${className}`}
        {...props}
      >
        {/* Glassmorphic shine effect */}
        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        <span className="relative">{children}</span>
      </motion.button>
    );
  }

  if (variant === "icon") {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`p-2 md:p-2.5 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary transition-colors duration-300 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }

  if (variant === "sm") {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`relative px-4 py-2 rounded-lg font-medium text-background bg-primary shadow-md hover:shadow-lg transition-shadow group overflow-hidden cursor-pointer ${className}`}
        {...props}
      >
        {/* Glassmorphic shine effect */}
        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        <span className="relative text-sm">{children}</span>
      </motion.button>
    );
  }

  if (variant === "sm-outlined") {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`relative px-4 py-2 rounded-lg font-medium text-primary bg-primary/10 border border-primary/20 hover:border-primary/40 hover:bg-primary/15 transition-all group overflow-hidden cursor-pointer ${className}`}
        {...props}
      >
        {/* Glassmorphic shine effect */}
        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        <span className="relative text-sm">{children}</span>
      </motion.button>
    );
  }

  if (variant === "select") {
    const isActive = (props as any).isActive;
    const { isActive: _, ...restProps } = props as any;
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden p-3 rounded-lg transition-all font-medium ${
          isActive
            ? "bg-primary text-background shadow-md"
            : "bg-primary/10 text-foreground hover:bg-primary/15 border border-primary/20 hover:border-primary/30"
        } ${className}`}
        {...restProps}
      >
        {/* Glassmorphic shine effect */}
        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        <div className="relative">{children}</div>
      </motion.button>
    );
  }

  return null;
}

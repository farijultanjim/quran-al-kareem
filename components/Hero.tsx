"use client";

import React from "react";
import { motion, cubicBezier } from "framer-motion";
import { ArrowDown, BookOpen } from "lucide-react";

const customEasing = cubicBezier(0.23, 1, 0.32, 1);

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: customEasing },
  },
};

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-20, 20, -20],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const scaleVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 1, ease: customEasing },
  },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-20">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 -z-10">
        {/* Primary gradient blob */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary gradient blob */}
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="space-y-8 text-center"
        >
          {/* Icon */}
          <motion.div variants={scaleVariants} className="flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-4 rounded-2xl bg-primary/10 backdrop-blur-md border border-primary/20"
            >
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight">
              Qur'an
              <br />
              <span className="text-foreground">Al-Kareem</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed"
          >
            Explore the divine wisdom of the Holy Qur'an with customizable
            fonts, translations, and beautiful reading experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            {/* Primary Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-8 md:px-10 py-4 rounded-xl font-semibold text-background bg-primary shadow-lg hover:shadow-xl transition-shadow group overflow-hidden"
            >
              {/* Glassmorphic shine effect */}
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <span className="relative flex items-center gap-2">
                Start Reading
                <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </span>
            </motion.button>

            {/* Secondary Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 md:px-10 py-4 rounded-xl font-semibold text-primary bg-primary/10 backdrop-blur-md border border-primary/20 hover:border-primary/40 hover:bg-primary/15 transition-all"
            >
              Explore Surahs
            </motion.button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="pt-8 grid grid-cols-3 gap-4 md:gap-8"
          >
            {[
              { number: "114", label: "Surahs" },
              { number: "6,236", label: "Verses" },
              { number: "∞", label: "Wisdom" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="p-4 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/10 hover:border-primary/30 transition-all"
                whileHover={{ y: -5 }}
              >
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.number}
                </p>
                <p className="text-xs md:text-sm text-foreground/60 mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div variants={itemVariants} className="pt-12">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="flex justify-center text-primary/40"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Glassmorphic Cards Background */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  );
}

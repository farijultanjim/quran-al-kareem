"use client";

import { useState, useEffect } from "react";
import {
  motion,
  cubicBezier,
  useScroll,
  useMotionValue,
  useSpring,
} from "framer-motion";
import Link from "next/link";
import { BookOpen, Search, Settings } from "lucide-react";

const customEasing = cubicBezier(0.76, 0, 0.24, 1);

interface HeaderProps {
  onSearchClick?: () => void;
  onSettingsClick?: () => void;
}

// Page load animation variants
const logoVariants = {
  initial: { y: -30, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.8, ease: customEasing },
  },
};

const buttonVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: customEasing,
      delay: index * 0.1,
    },
  }),
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export default function Header({
  onSearchClick,
  onSettingsClick,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  // Smooth scroll-based hide/show animation
  const { scrollY } = useScroll();
  const yPosition = useMotionValue(0);
  const springY = useSpring(yPosition, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll-based hide/show animation
  useEffect(() => {
    let prevScrollY = scrollY.get();

    const updateScrollDirection = () => {
      const currentScrollY = scrollY.get();
      if (currentScrollY > prevScrollY && currentScrollY > 0) {
        yPosition.set(-100);
      } else if (currentScrollY < prevScrollY || currentScrollY === 0) {
        yPosition.set(0);
      }
      prevScrollY = currentScrollY;
    };

    const unsubscribe = scrollY.on("change", updateScrollDirection);
    return () => unsubscribe();
  }, [scrollY, yPosition]);

  return (
    <>
      <motion.header
        className="fixed top-2 left-4 right-4 z-50 max-w-7xl mx-auto"
        style={{ y: springY }}
      >
        <div
          className={`transition-all duration-500 rounded-2xl ${
            scrolled
              ? "backdrop-blur-xl bg-background/80"
              : "backdrop-blur-md bg-background/60"
          }`}
          style={{
            background: scrolled
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Liquid Glass Effect Overlay */}
          <div
            className="absolute inset-0 opacity-20 rounded-2xl"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)
              `,
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
            <div className="flex items-center justify-between ">
              {/* Logo */}
              <motion.div
                variants={logoVariants}
                initial="initial"
                animate="animate"
                className="flex-shrink-0"
              >
                <Link href="/" className="flex items-center gap-2 md:gap-3">
                  <BookOpen className="w-6 h-6 md:w-7.5 md:h-7.5 text-primary" />

                  <div className="flex flex-col items-start">
                    <h1 className="text-[19px] md:text-[22px] font-bold text-primary leading-none">
                      Quran
                    </h1>
                    <p className="text-xs md:text-sm text-foreground/80 font-medium leading-none">
                      Al-Kareem
                    </p>
                  </div>
                </Link>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* Search Button */}
                <motion.button
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  custom={0}
                  whileHover="whileHover"
                  whileTap="whileTap"
                  onClick={onSearchClick}
                  className="p-2 md:p-2.5 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary transition-colors duration-300"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>

                {/* Settings Button */}
                <motion.button
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  custom={1}
                  whileHover="whileHover"
                  whileTap="whileTap"
                  onClick={onSettingsClick}
                  className="p-2 md:p-2.5 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary transition-colors duration-300"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5 md:w-6 md:h-6" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}

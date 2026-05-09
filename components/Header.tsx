"use client";

import { useState, useEffect } from "react";
import { motion, cubicBezier, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Settings,
  Menu,
  Moon,
  Sun,
  Sunset,
  SunMoon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSettings, type Theme } from "@/app/_context/SettingsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const customEasing = cubicBezier(0.76, 0, 0.24, 1);

interface HeaderProps {
  onSearchClick?: () => void;
  onSettingsClick?: () => void;
  onMenuClick?: () => void;
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

export default function Header({
  onSearchClick,
  onSettingsClick,
  onMenuClick,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const { settings, updateSettings } = useSettings();

  const yPosition = useMotionValue(0);
  const springY = useSpring(yPosition, { stiffness: 100, damping: 20 });

  useEffect(() => {
    const scrollEl = document.getElementById("surah-scroll-container");
    let prevScrollY = scrollEl ? scrollEl.scrollTop : window.scrollY;

    const onScroll = () => {
      const currentScrollY = scrollEl ? scrollEl.scrollTop : window.scrollY;
      setScrolled(currentScrollY > 30);

      if (currentScrollY > prevScrollY && currentScrollY > 0) {
        yPosition.set(-100);
      } else if (currentScrollY < prevScrollY || currentScrollY === 0) {
        yPosition.set(0);
      }

      prevScrollY = currentScrollY;
    };

    onScroll();

    if (scrollEl) {
      scrollEl.addEventListener("scroll", onScroll, { passive: true });
      return () => scrollEl.removeEventListener("scroll", onScroll);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [yPosition]);

  const handleThemeChange = (theme: Theme) => {
    updateSettings({ theme });
  };

  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "dark":
        return <Moon className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "sepia":
        return <Sunset className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "system":
        return <SunMoon className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <Sun className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{ y: springY }}
      >
        <div
          className={`transition-all duration-500 border-b border-border w-full ${
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
            // boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
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

          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
            <div className="flex items-center justify-between">
              {/* Menu Button - Mobile/Tablet Only */}
              <motion.div
                className="md:hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.5,
                    ease: customEasing,
                    delay: 0,
                  },
                }}
              >
                <Button
                  variant="icon"
                  onClick={onMenuClick}
                  aria-label="Menu"
                  className="w-9 h-9 sm:w-10 sm:h-10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Logo */}
              <motion.div
                variants={logoVariants}
                initial="initial"
                animate="animate"
                className="shrink-0"
              >
                <Link href="/" className="flex items-center gap-2 md:gap-3">
                  <BookOpen className="w-6 h-6 md:w-7.5 md:h-7.5 text-primary" />

                  <div className="hidden sm:flex flex-col items-start">
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Search Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.5,
                      ease: customEasing,
                      delay: 0,
                    },
                  }}
                >
                  <Button
                    variant="icon"
                    onClick={onSearchClick}
                    aria-label="Search"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </motion.div>

                {/* Theme Dropdown Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.5,
                      ease: customEasing,
                      delay: 0.05,
                    },
                  }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="icon"
                        aria-label="Theme selector"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
                      >
                        {getThemeIcon(settings.theme)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-34 bg-background space-y-2 p-2"
                    >
                      <DropdownMenuItem
                        onClick={() => handleThemeChange("light")}
                        className="cursor-pointer"
                      >
                        <Sun className="w-4 h-4 mr-2" />
                        <span className="text-lg">Light</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleThemeChange("dark")}
                        className="cursor-pointer"
                      >
                        <Moon className="w-4 h-4 mr-2" />
                        <span className="text-lg">Dark</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleThemeChange("sepia")}
                        className="cursor-pointer"
                      >
                        <Sunset className="w-4 h-4 mr-2" />
                        <span className="text-lg">Sepia</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleThemeChange("system")}
                        className="cursor-pointer"
                      >
                        <SunMoon className="w-4 h-4 mr-2" />
                        <span className="text-lg">System</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>

                {/* Settings Button - Mobile/Tablet Only */}
                <motion.div
                  className="md:hidden"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.5,
                      ease: customEasing,
                      delay: 0.1,
                    },
                  }}
                >
                  <Button
                    variant="icon"
                    onClick={onSettingsClick}
                    aria-label="Settings"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}

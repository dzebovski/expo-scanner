"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-[100dvh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="min-h-[100dvh]"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

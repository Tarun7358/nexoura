import { motion } from "motion/react";
import { ReactNode } from "react";

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "danger";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function GlowButton({ 
  children, 
  onClick, 
  variant = "primary", 
  className = "", 
  type = "button",
  disabled = false 
}: GlowButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-black shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:shadow-[0_0_30px_rgba(0,212,255,0.8)]",
    secondary: "bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]",
    success: "bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]",
    danger: "bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`${variants[variant]} px-6 py-3 rounded-lg transition-all duration-300 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

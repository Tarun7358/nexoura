import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Swords, Zap } from "lucide-react";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("nexouraToken");
      navigate(token ? "/app" : "/login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background shapes */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#00d4ff]/10 blur-3xl"
      />
      <motion.div
        animate={{
          rotate: -360,
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[#a855f7]/10 blur-3xl"
      />
      
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative mb-8"
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px rgba(0,212,255,0.5)",
              "0 0 40px rgba(168,85,247,0.5)",
              "0 0 20px rgba(0,212,255,0.5)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-gradient-to-br from-[#00d4ff] to-[#a855f7] p-6 rounded-3xl"
        >
          <Swords className="w-20 h-20 text-black" />
        </motion.div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute -top-2 -right-2"
        >
          <Zap className="w-8 h-8 text-[#00d4ff]" />
        </motion.div>
      </motion.div>

      {/* App name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4 bg-gradient-to-r from-[#00d4ff] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent"
        style={{ fontSize: "3.5rem", fontWeight: 800 }}
      >
        NEXOURA
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl text-muted-foreground tracking-widest"
      >
        Compete. Conquer. Connect.
      </motion.p>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12"
      >
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-3 h-3 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

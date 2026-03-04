import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { GlowButton } from "../components/GlowButton";
import { Mail, Lock, User, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { authAPI } from "../api/apiclient";

export default function SignupScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await authAPI.register(username, email, password);
      const token = response.data?.token;

      if (!token) {
        setError("Invalid signup response from server");
        return;
      }

      localStorage.setItem("nexouraToken", token);
      localStorage.setItem("nexouraUserId", response.data?.userId || "");
      localStorage.setItem("nexouraRole", response.data?.user?.role || "user");
      navigate("/app");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a0a2e] to-[#0a0a0f] flex items-center justify-center px-4 py-4 relative overflow-hidden"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 12px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-10 right-10 w-56 h-56 rounded-full bg-[#a855f7]/10 blur-3xl"
      />

      <div className="w-full max-w-md relative z-10 max-h-[92vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/85 backdrop-blur-xl border border-border rounded-2xl p-5 sm:p-8 shadow-[0_0_40px_rgba(168,85,247,0.1)]"
        >
          <div className="flex justify-center mb-5">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#a855f7] to-[#00d4ff] p-3 rounded-2xl"
            >
              <Gamepad2 className="w-9 h-9 text-white" />
            </motion.div>
          </div>

          <h2 className="text-center mb-2 bg-gradient-to-r from-[#a855f7] to-[#00d4ff] bg-clip-text text-transparent">
            Join Nexoura
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Create your account and start competing
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            {error ? (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 break-words">
                {error}
              </div>
            ) : null}

            <div>
              <label className="block text-sm mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                />
              </div>
            </div>

            <GlowButton type="submit" variant="secondary" className="w-full py-3.5">
              Create Account
            </GlowButton>
          </form>

          <p className="text-center mt-5 text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-secondary hover:underline">
              Login
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
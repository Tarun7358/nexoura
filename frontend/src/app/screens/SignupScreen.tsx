import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { GlowButton } from "../components/GlowButton";
import { Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { authAPI } from "../api/apiclient";
import appLogo from "../../styles/logo.jpg";

export default function SignupScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0F] px-3 py-4 sm:px-4 sm:py-6"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 24px)",
        paddingBottom: "max(env(safe-area-inset-bottom), 24px)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(124,58,237,0.12),transparent_36%),radial-gradient(circle_at_20%_82%,rgba(0,212,255,0.11),transparent_30%)]" />

      <div className="relative z-10 w-full max-w-[420px] max-h-[100dvh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="mx-auto mb-3 flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#13131A] shadow-[0_0_26px_rgba(124,58,237,0.22)] sm:h-20 sm:w-20">
            <img src={appLogo} alt="Nexoura logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold tracking-[0.18em] text-white sm:text-2xl sm:tracking-[0.24em]">NEXOURA</h1>
          <p className="mt-2 text-sm text-[#A0A0B0]">Compete. Dominate. Rise.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#13131A]/95 p-4 shadow-[0_0_35px_rgba(124,58,237,0.14)] backdrop-blur-xl sm:p-7"
        >
          <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">Join Nexoura</h2>
          <p className="mt-2 text-center text-sm text-[#A0A0B0]">Create your account and start competing</p>

          <form onSubmit={handleSignup} className="mt-5 space-y-3.5 sm:mt-6 sm:space-y-4">
            {error ? (
              <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-white">Username</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A0A0B0]" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="h-11 w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A1A24] py-2.5 pr-4 pl-11 text-sm text-white placeholder:text-[#A0A0B0] transition-all duration-200 focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.18)] focus:outline-none sm:h-12 sm:py-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A0A0B0]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-11 w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A1A24] py-2.5 pr-4 pl-11 text-sm text-white placeholder:text-[#A0A0B0] transition-all duration-200 focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.18)] focus:outline-none sm:h-12 sm:py-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A0A0B0]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="h-11 w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A1A24] py-2.5 pr-4 pl-11 text-sm text-white placeholder:text-[#A0A0B0] transition-all duration-200 focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.18)] focus:outline-none sm:h-12 sm:py-3"
                />
              </div>
            </div>

            <GlowButton type="submit" disabled={isSubmitting} className="w-full rounded-xl py-3.5 text-base font-semibold">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </GlowButton>
          </form>

          <p className="mt-5 text-center text-sm text-[#A0A0B0]">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="font-medium text-[#00D4FF] hover:text-[#7C3AED]">
              Login
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

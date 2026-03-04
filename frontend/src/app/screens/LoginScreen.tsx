import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { GlowButton } from "../components/GlowButton";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { authAPI } from "../api/apiclient";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { auth } from "../../utils/firebaseConfig";
import appLogo from "../../styles/logo.jpg";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const storeSessionAndNavigate = (response: any) => {
    const token = response?.data?.token;

    if (!token) {
      setError("Invalid login response from server");
      return;
    }

    localStorage.setItem("nexouraToken", token);
    localStorage.setItem("nexouraUserId", response.data?.userId || "");
    localStorage.setItem("nexouraRole", response.data?.user?.role || "user");
    navigate("/app");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      const response = await authAPI.login(email, password);
      storeSessionAndNavigate(response);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setInfoMessage("");

    if (!auth) {
      setError("Firebase auth is not initialized. Check frontend .env values.");
      return;
    }

    setIsGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const isCapacitorApp = typeof window !== "undefined" && !!(window as any).Capacitor;

      if (isCapacitorApp) {
        await signInWithRedirect(auth, provider);
        setInfoMessage("Continuing Google sign-in...");
        return;
      }

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await authAPI.googleLogin(idToken);
      storeSessionAndNavigate(response);
    } catch (err: any) {
      const code = err?.code || "";
      const message = err?.response?.data?.message || err?.message || "Google login failed";

      if (code.includes("auth/unauthorized-domain")) {
        setError("Google login domain is not authorized in Firebase. Add your site domain in Firebase Auth settings.");
      } else if (code.includes("auth/popup-closed-by-user")) {
        setError("Google sign-in popup was closed before completion.");
      } else if (code.includes("auth/popup-blocked")) {
        setError("Popup blocked by browser. Allow popups and try again.");
      } else {
        setError(message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError("");
    setInfoMessage("");

    if (!auth) {
      setError("Firebase auth is not initialized. Check frontend .env values.");
      return;
    }

    if (!email.trim()) {
      setError("Enter your email first, then click Forgot Password.");
      return;
    }

    setIsResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMessage("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      setError(err?.message || "Failed to send password reset email");
    } finally {
      setIsResetLoading(false);
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(0,212,255,0.11),transparent_36%),radial-gradient(circle_at_18%_78%,rgba(124,58,237,0.13),transparent_30%)]" />

      <div className="relative z-10 w-full max-w-[420px] max-h-[100dvh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="mx-auto mb-3 flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#13131A] shadow-[0_0_26px_rgba(0,212,255,0.22)] sm:h-20 sm:w-20">
            <img src={appLogo} alt="Nexoura logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-xl font-semibold tracking-[0.18em] text-white sm:text-2xl sm:tracking-[0.24em]">NEXOURA</h1>
          <p className="mt-2 text-sm text-[#A0A0B0]">Compete. Dominate. Rise.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#13131A]/95 p-4 shadow-[0_0_35px_rgba(0,212,255,0.14)] backdrop-blur-xl sm:p-7"
        >
          <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">Welcome Back</h2>
          <p className="mt-2 text-center text-sm text-[#A0A0B0]">Login to continue your esports journey</p>

          <form onSubmit={handleLogin} className="mt-5 space-y-3.5 sm:mt-6 sm:space-y-4">
            {error ? (
              <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
            ) : null}

            {!error && infoMessage ? (
              <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">{infoMessage}</div>
            ) : null}

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
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A1A24] py-2.5 pr-4 pl-11 text-sm text-white placeholder:text-[#A0A0B0] transition-all duration-200 focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.18)] focus:outline-none sm:h-12 sm:py-3"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={isResetLoading}
              className="appearance-none border-0 bg-transparent p-0 text-sm text-[#00D4FF] transition-colors hover:text-[#7C3AED] disabled:opacity-60"
            >
              {isResetLoading ? "Sending reset email..." : "Forgot Password?"}
            </button>

            <GlowButton type="submit" disabled={isSubmitting} className="w-full rounded-xl py-3.5 text-base font-semibold">
              {isSubmitting ? "Logging in..." : "Login"}
            </GlowButton>
          </form>

          <div className="my-4 flex items-center gap-3 sm:my-5">
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
            <span className="text-xs tracking-[0.24em] text-[#A0A0B0]">OR</span>
            <div className="h-px flex-1 bg-[rgba(255,255,255,0.08)]" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="flex h-11 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A1A24] px-3 text-sm font-semibold text-white transition-all duration-200 hover:border-[#00D4FF]/70 hover:bg-[#1d1d29] disabled:opacity-60 sm:h-12 sm:gap-3 sm:px-4"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="truncate">{isGoogleLoading ? "Connecting..." : "Continue with Google"}</span>
          </button>

          <p className="mt-5 text-center text-sm text-[#A0A0B0]">
            Don't have an account?{" "}
            <button onClick={() => navigate("/signup")} className="font-medium text-[#00D4FF] hover:text-[#7C3AED]">
              Create Account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

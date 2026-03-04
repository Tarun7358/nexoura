import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { GlowButton } from "../components/GlowButton";
import { Mail, Lock, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { authAPI } from "../api/apiclient";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../utils/firebaseConfig";

export default function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

    try {
      const response = await authAPI.login(email, password);
      storeSessionAndNavigate(response);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");

    if (!auth) {
      setError("Firebase auth is not initialized. Check frontend .env values.");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      // Avoid redirect on Android WebView, which caused localhost/login external browser failure.
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await authAPI.googleLogin(idToken);
      storeSessionAndNavigate(response);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Google login failed");
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
        className="absolute top-10 right-10 w-56 h-56 rounded-full bg-[#00d4ff]/10 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-10 left-10 w-60 h-60 rounded-full bg-[#a855f7]/10 blur-3xl"
      />

      <div className="w-full max-w-md relative z-10 max-h-[92vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/85 backdrop-blur-xl border border-border rounded-2xl p-5 sm:p-8 shadow-[0_0_40px_rgba(0,212,255,0.1)]"
        >
          <div className="flex justify-center mb-5">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#00d4ff] to-[#a855f7] p-3 rounded-2xl"
            >
              <Gamepad2 className="w-9 h-9 text-black" />
            </motion.div>
          </div>

          <h2 className="text-center mb-2 bg-gradient-to-r from-[#00d4ff] to-[#a855f7] bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-center text-muted-foreground mb-6">
            Login to continue your esports journey
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {error ? (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 break-words">
                {error}
              </div>
            ) : null}

            <div>
              <label className="block text-sm mb-2">Email / Phone</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
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
                  placeholder="Enter your password"
                  className="w-full bg-input-background border border-border rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            <button type="button" className="text-sm text-primary hover:underline">
              Forgot Password?
            </button>

            <GlowButton type="submit" className="w-full py-3.5">
              Login
            </GlowButton>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white/10 border border-border rounded-xl px-4 py-3.5 hover:bg-white/20 transition-all flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, minWidth: 20, minHeight: 20 }} aria-hidden="true">
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
            <span className="font-medium">Continue with Google</span>
          </button>

          <p className="text-center mt-5 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button onClick={() => navigate("/signup")} className="text-primary hover:underline">
              Create Account
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
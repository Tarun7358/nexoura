import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { User, IdCard, Phone } from "lucide-react";
import { authAPI } from "../api/apiclient";
import { GlowButton } from "../components/GlowButton";

export default function ProfileSetupScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [gamingUID, setGamingUID] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const userId = localStorage.getItem("nexouraUserId");
    if (!userId) {
      setError("Missing user session. Please login again.");
      return;
    }
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    if (!gamingUID.trim()) {
      setError("Gaming UID is required");
      return;
    }

    try {
      setSaving(true);
      await authAPI.updateProfile(userId, {
        username: username.trim(),
        gamerTag: username.trim(),
        gamingUID: gamingUID.trim(),
        phone: phone.trim(),
        profileCompleted: true,
      });
      localStorage.setItem("nexouraProfileCompleted", "true");
      navigate("/app", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0F] px-4 py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,212,255,0.11),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(124,58,237,0.12),transparent_30%)]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[420px] rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#13131A]/95 p-5 shadow-[0_0_35px_rgba(0,212,255,0.14)] sm:p-7"
      >
        <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">Complete Your Profile</h2>
        <p className="mt-2 text-center text-sm text-[#A0A0B0]">
          First-time setup. This is shown only once.
        </p>

        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {error ? (
            <div className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Username</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A0A0B0]" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your public username"
                className="h-11 w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A1A24] py-2.5 pr-4 pl-11 text-sm text-white placeholder:text-[#A0A0B0] focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.18)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Gaming UID</label>
            <div className="relative">
              <IdCard className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A0A0B0]" />
              <input
                value={gamingUID}
                onChange={(e) => setGamingUID(e.target.value)}
                placeholder="Your in-game UID"
                className="h-11 w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A1A24] py-2.5 pr-4 pl-11 text-sm text-white placeholder:text-[#A0A0B0] focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.18)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">Phone (optional)</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#A0A0B0]" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="h-11 w-full rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1A1A24] py-2.5 pr-4 pl-11 text-sm text-white placeholder:text-[#A0A0B0] focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.18)] focus:outline-none"
              />
            </div>
          </div>

          <GlowButton type="submit" className="w-full rounded-xl py-3 text-base font-semibold" disabled={saving}>
            {saving ? "Saving..." : "Save & Continue"}
          </GlowButton>
        </form>
      </motion.div>
    </div>
  );
}

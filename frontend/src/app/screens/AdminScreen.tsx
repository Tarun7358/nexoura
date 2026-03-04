import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { Shield, Trophy, Users, DollarSign, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { tournamentAPI } from "../api/apiclient";

export default function AdminScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "manage">("overview");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [payoutTournamentId, setPayoutTournamentId] = useState("");
  const [payoutUserId, setPayoutUserId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payingOut, setPayingOut] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mode: "squad",
    entryFee: "",
    prizePool: "",
    maxParticipants: "",
    startDate: "",
  });

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const res = await tournamentAPI.getAll();
      setTournaments(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load tournaments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const stats = useMemo(() => {
    const total = tournaments.length;
    const totalPlayers = tournaments.reduce((sum, t) => sum + Number(t.currentParticipants || 0), 0);
    const totalPool = tournaments.reduce((sum, t) => sum + Number(t.prizePool || 0), 0);
    return { total, totalPlayers, totalPool };
  }, [tournaments]);

  const onChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.mode || !form.maxParticipants || !form.startDate) {
      setError("Please fill required tournament fields");
      return;
    }

    try {
      setSaving(true);
      await tournamentAPI.create({
        name: form.name,
        mode: form.mode,
        entryFee: Number(form.entryFee || 0),
        prizePool: Number(form.prizePool || 0),
        maxParticipants: Number(form.maxParticipants || 0),
        startDate: new Date(form.startDate).toISOString(),
      });

      setSuccess("Tournament created successfully");
      setForm({
        name: "",
        mode: "squad",
        entryFee: "",
        prizePool: "",
        maxParticipants: "",
        startDate: "",
      });
      await loadTournaments();
      setActiveTab("overview");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create tournament. Ensure your user role is admin.");
    } finally {
      setSaving(false);
    }
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!payoutTournamentId || !payoutUserId || !payoutAmount) {
      setError("Tournament, winner user ID and payout amount are required");
      return;
    }

    try {
      setPayingOut(true);
      await tournamentAPI.payout(payoutTournamentId, {
        userId: payoutUserId,
        amount: Number(payoutAmount),
      });
      setSuccess("Winner payout completed");
      setPayoutUserId("");
      setPayoutAmount("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to process payout");
    } finally {
      setPayingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-[#a855f7]/10 to-[#ec4899]/10 p-6">
        <div className="mx-auto max-w-lg">
          <button onClick={() => navigate("/app")} className="mb-4 text-sm text-muted-foreground hover:text-foreground">
            Back to Home
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#a855f7] to-[#ec4899] p-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1>Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Tournament organizer dashboard</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <NeonCard glowColor="purple" className="text-center">
              <Trophy className="mx-auto mb-1 h-4 w-4 text-[#a855f7]" />
              <p className="text-xs text-muted-foreground">Tournaments</p>
              <p className="text-lg">{stats.total}</p>
            </NeonCard>
            <NeonCard glowColor="blue" className="text-center">
              <Users className="mx-auto mb-1 h-4 w-4 text-[#00d4ff]" />
              <p className="text-xs text-muted-foreground">Players</p>
              <p className="text-lg">{stats.totalPlayers}</p>
            </NeonCard>
            <NeonCard glowColor="green" className="text-center">
              <DollarSign className="mx-auto mb-1 h-4 w-4 text-[#10b981]" />
              <p className="text-xs text-muted-foreground">Pool</p>
              <p className="text-lg">Rs.{stats.totalPool}</p>
            </NeonCard>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg p-6">
        <div className="mb-6 flex gap-2">
          {[
            { label: "Overview", value: "overview" },
            { label: "Create", value: "create" },
            { label: "Manage", value: "manage" },
          ].map((tab) => (
            <motion.button
              key={tab.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.value as any)}
              className={`flex-1 rounded-lg px-4 py-2 transition-all ${
                activeTab === tab.value
                  ? "bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  : "border border-border bg-card hover:border-secondary"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {error ? <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div> : null}
        {success ? <div className="mb-3 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-300">{success}</div> : null}

        {activeTab === "overview" && (
          <div className="space-y-3">
            {loading ? (
              <NeonCard><p className="text-sm text-muted-foreground">Loading tournaments...</p></NeonCard>
            ) : tournaments.length === 0 ? (
              <NeonCard><p className="text-sm text-muted-foreground">No tournaments yet. Create one from Create tab.</p></NeonCard>
            ) : (
              tournaments.map((t) => (
                <NeonCard key={t.id} glowColor="purple">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-1">{t.name}</h3>
                      <p className="text-xs text-muted-foreground">{String(t.mode || "squad").toUpperCase()} | {Number(t.currentParticipants || 0)}/{Number(t.maxParticipants || 0)}</p>
                    </div>
                    <span className="text-sm text-[#10b981]">Rs.{Number(t.prizePool || 0)}</span>
                  </div>
                </NeonCard>
              ))
            )}
          </div>
        )}

        {activeTab === "create" && (
          <NeonCard glowColor="purple">
            <form className="space-y-3" onSubmit={createTournament}>
              <h3 className="mb-2">Create New Tournament</h3>

              <input value={form.name} onChange={(e) => onChange("name", e.target.value)} placeholder="Tournament name" className="h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm" />

              <select value={form.mode} onChange={(e) => onChange("mode", e.target.value)} className="h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm">
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>

              <input type="number" value={form.entryFee} onChange={(e) => onChange("entryFee", e.target.value)} placeholder="Entry fee (Rs.)" className="h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm" />
              <input type="number" value={form.prizePool} onChange={(e) => onChange("prizePool", e.target.value)} placeholder="Prize pool (Rs.)" className="h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm" />
              <input type="number" value={form.maxParticipants} onChange={(e) => onChange("maxParticipants", e.target.value)} placeholder="Max participants" className="h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm" />
              <input type="datetime-local" value={form.startDate} onChange={(e) => onChange("startDate", e.target.value)} className="h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm" />

              <GlowButton type="submit" variant="secondary" className="w-full" disabled={saving}>
                <Plus className="mr-2 inline h-4 w-4" />
                {saving ? "Creating..." : "Create Tournament"}
              </GlowButton>
            </form>
          </NeonCard>
        )}

        {activeTab === "manage" && (
          <div className="space-y-3">
            <NeonCard glowColor="blue">
              <form className="space-y-3" onSubmit={handlePayout}>
                <h3 className="mb-2">Winner Payout</h3>
                <select
                  value={payoutTournamentId}
                  onChange={(e) => setPayoutTournamentId(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm"
                >
                  <option value="">Select tournament</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({String(t.mode || "squad").toUpperCase()})
                    </option>
                  ))}
                </select>
                <input
                  value={payoutUserId}
                  onChange={(e) => setPayoutUserId(e.target.value)}
                  placeholder="Winner User ID"
                  className="h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm"
                />
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Payout amount (Rs.)"
                  className="h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm"
                />
                <GlowButton type="submit" variant="primary" className="w-full" disabled={payingOut}>
                  {payingOut ? "Processing..." : "Credit Winner Wallet"}
                </GlowButton>
              </form>
            </NeonCard>
          </div>
        )}
      </div>
    </div>
  );
}

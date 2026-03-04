import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { Wallet, Trophy, Users, CalendarDays, Shield } from "lucide-react";
import { authAPI, tournamentAPI, walletAPI } from "../api/apiclient";

export default function HomeScreen() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("nexouraUserId") || "";
  const role = localStorage.getItem("nexouraRole") || "user";

  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>({ balance: 0 });
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileRes, walletRes, tournamentsRes] = await Promise.all([
          userId ? authAPI.getProfile(userId) : Promise.resolve({ data: null }),
          walletAPI.getBalance(),
          tournamentAPI.getAll(),
        ]);

        setProfile(profileRes?.data || null);
        setWallet(walletRes?.data || { balance: 0 });
        setTournaments(Array.isArray(tournamentsRes?.data) ? tournamentsRes.data : []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const upcoming = useMemo(() => {
    return tournaments
      .filter((t) => String(t.status || "Upcoming").toLowerCase() !== "completed")
      .slice(0, 4);
  }, [tournaments]);

  const formatDate = (value: any) => {
    if (!value) return "TBD";
    if (typeof value === "string") return new Date(value).toLocaleString();
    if (value?._seconds) return new Date(value._seconds * 1000).toLocaleString();
    return "TBD";
  };

  const statCards = [
    { label: "Tournaments Joined", value: Number(profile?.tournamentsJoined || 0), color: "text-[#00d4ff]" },
    { label: "Wins", value: Number(profile?.wins || 0), color: "text-[#10b981]" },
    { label: "Earnings", value: `Rs.${Number(profile?.earnings || 0)}`, color: "text-[#a855f7]" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-[#00d4ff]/10 to-[#7c3aed]/10 p-4 sm:p-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Welcome</p>
              <h2 className="text-xl sm:text-2xl">{profile?.username || profile?.gamerTag || "Player"}</h2>
              <p className="mt-1 text-xs text-muted-foreground">UID: {profile?.gamingUID || "Not set"}</p>
            </div>

            <div className="flex items-center gap-2">
              {role === "admin" ? (
                <button
                  onClick={() => navigate("/app/admin")}
                  className="rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] p-2"
                  title="Admin"
                >
                  <Shield className="h-4 w-4 text-white" />
                </button>
              ) : null}
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                <Wallet className="h-4 w-4 text-[#00d4ff]" />
                <span className="text-sm">Rs.{Number(wallet?.balance || 0)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {statCards.map((stat) => (
              <NeonCard key={stat.label} glowColor="blue" className="text-center">
                <p className="text-[10px] leading-tight text-muted-foreground sm:text-xs">{stat.label}</p>
                <p className={`mt-1 text-sm sm:text-base ${stat.color}`}>{stat.value}</p>
              </NeonCard>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 p-4 sm:p-6">
        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>
        ) : null}

        {loading ? (
          <NeonCard>
            <p className="text-sm text-muted-foreground">Loading dashboard...</p>
          </NeonCard>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg">Upcoming Tournaments</h3>
              <button className="text-sm text-primary" onClick={() => navigate("/app/tournaments")}>View All</button>
            </div>

            {upcoming.length === 0 ? (
              <NeonCard>
                <p className="text-sm text-muted-foreground">No tournaments created yet. Admin-created tournaments will appear here.</p>
              </NeonCard>
            ) : (
              upcoming.map((tournament, index) => {
                const current = Number(tournament.currentParticipants || tournament.registeredPlayers || 0);
                const max = Number(tournament.maxParticipants || tournament.maxPlayers || 0);

                return (
                  <motion.div key={tournament.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <NeonCard glowColor="purple">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm sm:text-base">{tournament.title || tournament.name}</h4>
                            <p className="text-xs text-muted-foreground">{String(tournament.mode || "squad").toUpperCase()} | {tournament.game || "BGMI"}</p>
                          </div>
                          <span className="rounded-md bg-[#10b981]/20 px-2 py-1 text-xs text-[#10b981]">Rs.{Number(tournament.prizePool || 0)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(tournament.startTime || tournament.startDate)}</div>
                          <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{current}/{max || 0} players</div>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">Entry Fee: Rs.{Number(tournament.entryFee || 0)}</p>
                          <GlowButton className="px-4 py-2 text-xs" onClick={() => navigate("/app/tournaments")}>Join</GlowButton>
                        </div>
                      </div>
                    </NeonCard>
                  </motion.div>
                );
              })
            )}

            <NeonCard glowColor="green">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet Balance</p>
                  <h3 className="text-lg">Rs.{Number(wallet?.balance || 0)}</h3>
                </div>
                <GlowButton variant="primary" className="px-4 py-2 text-xs" onClick={() => navigate("/app/wallet")}>
                  Add Money
                </GlowButton>
              </div>
            </NeonCard>
          </>
        )}
      </div>
    </div>
  );
}

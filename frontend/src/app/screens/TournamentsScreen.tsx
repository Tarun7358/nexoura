import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { Trophy, Calendar, DollarSign, Users, Filter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { tournamentAPI } from "../api/apiclient";

export default function TournamentsScreen() {
  const [activeFilter, setActiveFilter] = useState<"all" | "solo" | "duo" | "squad">("all");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError("");
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

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const mode = String(t.mode || "").toLowerCase();
      return activeFilter === "all" || mode === activeFilter;
    });
  }, [tournaments, activeFilter]);

  const formatDate = (value: any) => {
    if (!value) return "TBD";
    if (typeof value === "string") return new Date(value).toLocaleString();
    if (value?._seconds) return new Date(value._seconds * 1000).toLocaleString();
    return "TBD";
  };

  const handleJoin = async (id: string) => {
    try {
      setJoiningId(id);
      setError("");
      await tournamentAPI.join(id);
      await loadTournaments();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Join failed");
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-[#a855f7]/10 to-[#00d4ff]/10 p-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-2 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-[#00d4ff]" />
            <h1>Tournaments</h1>
          </div>
          <p className="text-muted-foreground">Compete for glory and prizes</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg p-6">
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Filter by type</p>
          </div>
          <div className="flex gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Solo", value: "solo" },
              { label: "Duo", value: "duo" },
              { label: "Squad", value: "squad" },
            ].map((filter) => (
              <motion.button
                key={filter.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter.value as any)}
                className={`rounded-lg px-4 py-2 transition-all ${
                  activeFilter === filter.value
                    ? "bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-black shadow-[0_0_20px_rgba(0,212,255,0.5)]"
                    : "border border-border bg-card hover:border-primary"
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {loading ? (
          <NeonCard>
            <p className="text-sm text-muted-foreground">Loading tournaments...</p>
          </NeonCard>
        ) : (
          <div className="space-y-4">
            {filteredTournaments.length === 0 ? (
              <NeonCard>
                <p className="text-sm text-muted-foreground">No tournaments available right now.</p>
              </NeonCard>
            ) : null}

            {filteredTournaments.map((tournament, index) => {
              const current = Number(tournament.currentParticipants || 0);
              const max = Number(tournament.maxParticipants || 0);
              const isFull = max > 0 && current >= max;
              const mode = String(tournament.mode || "").toLowerCase();

              return (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <NeonCard glowColor={isFull ? "pink" : "purple"}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="mb-1">{tournament.name}</h3>
                          <p className="text-xs text-muted-foreground">Created by admin</p>
                        </div>
                        <div className={`rounded-lg px-2 py-1 text-xs ${
                          mode === "solo"
                            ? "bg-[#00d4ff]/20 text-[#00d4ff]"
                            : mode === "duo"
                            ? "bg-[#a855f7]/20 text-[#a855f7]"
                            : "bg-[#ec4899]/20 text-[#ec4899]"
                        }`}>
                          {String(tournament.mode || "SQUAD").toUpperCase()}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Start</p>
                            <p className="text-sm">{formatDate(tournament.startDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-[#10b981]" />
                          <div>
                            <p className="text-xs text-muted-foreground">Prize Pool</p>
                            <p className="text-sm text-[#10b981]">Rs.{Number(tournament.prizePool || 0)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Slots</p>
                            <p className="text-sm">{current}/{max || 0}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Entry Fee</p>
                          <p className="text-sm">Rs.{Number(tournament.entryFee || 0)}</p>
                        </div>
                      </div>

                      <GlowButton
                        variant={isFull ? "danger" : "secondary"}
                        className="w-full text-sm"
                        disabled={isFull || joiningId === tournament.id}
                        onClick={() => handleJoin(tournament.id)}
                      >
                        {isFull ? "Full" : joiningId === tournament.id ? "Joining..." : "Join Tournament"}
                      </GlowButton>
                    </div>
                  </NeonCard>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
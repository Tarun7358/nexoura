import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { Award, Trophy, Medal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { authAPI } from "../api/apiclient";

export default function LeaderboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = localStorage.getItem("nexouraUserId");

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await authAPI.getLeaderboard();
        const rows = Array.isArray(res.data) ? res.data : [];
        const mapped = rows.map((u: any, idx: number) => ({
          rank: idx + 1,
          id: u.id,
          name: u.username || u.gamerTag || u.email || "Player",
          kills: Number(u.kills || u.stats?.kills || 0),
          points: Number(u.stats?.points || 0),
          matches: Number(u.stats?.matches || 0),
          wins: Number(u.wins || u.stats?.wins || 0),
        }));
        setLeaderboardData(mapped);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const me = useMemo(() => leaderboardData.find((p) => p.id === currentUserId), [leaderboardData, currentUserId]);

  const getTrophyIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-[#f59e0b]" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-[#a0a0b0]" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-[#cd7f32]" />;
    return <span className="text-lg text-muted-foreground">{rank}</span>;
  };

  const getGlowColor = (rank: number): "blue" | "purple" | "pink" | "green" => {
    if (rank === 1) return "blue";
    if (rank === 2) return "purple";
    if (rank === 3) return "pink";
    return "green";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-br from-[#00d4ff]/10 to-[#a855f7]/10 p-6">
        <div className="mx-auto max-w-lg">
          <div className="mb-2 flex items-center gap-3">
            <Award className="h-6 w-6 text-[#00d4ff]" />
            <h1>Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">Live rankings from player stats</p>
        </div>
      </div>

      <div className="mx-auto max-w-lg p-6">
        {error ? <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div> : null}

        <NeonCard glowColor="blue" className="mb-6 text-center">
          <p className="mb-1 text-xs text-muted-foreground">Your Rank</p>
          <p className="text-2xl">{me ? `#${me.rank}` : "-"}</p>
          <p className="text-xs text-muted-foreground">Points: {me ? me.points : 0}</p>
        </NeonCard>

        {loading ? (
          <NeonCard><p className="text-sm text-muted-foreground">Loading leaderboard...</p></NeonCard>
        ) : (
          <div className="space-y-2">
            {leaderboardData.map((player, index) => (
              <motion.div
                key={player.id || player.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <NeonCard
                  glowColor={getGlowColor(player.rank)}
                  className={`!p-3 ${player.id === currentUserId ? "border-2 border-primary" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center">{getTrophyIcon(player.rank)}</div>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm ${player.id === currentUserId ? "text-primary" : ""}`}>
                        {player.name}
                        {player.id === currentUserId ? <span className="ml-2 text-xs text-muted-foreground">(You)</span> : null}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{player.matches} matches</span>
                        <span>{player.wins} wins</span>
                        <span>{player.kills} kills</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{player.points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                </NeonCard>
              </motion.div>
            ))}
            {leaderboardData.length === 0 ? (
              <NeonCard><p className="text-sm text-muted-foreground">No leaderboard data yet.</p></NeonCard>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
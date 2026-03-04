import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { Award, Trophy, Medal, Target, Swords } from "lucide-react";

export default function LeaderboardScreen() {
  const leaderboardData = [
    { rank: 1, name: "EliteSniper_X", kills: 2847, points: 15420, matches: 342, winRate: "72%" },
    { rank: 2, name: "ShadowAssassin", kills: 2756, points: 14890, matches: 328, winRate: "68%" },
    { rank: 3, name: "ThunderStrike", kills: 2643, points: 14120, matches: 315, winRate: "65%" },
    { rank: 4, name: "ProGamer_X", kills: 2541, points: 13780, matches: 342, winRate: "63%" },
    { rank: 5, name: "NightHawk99", kills: 2487, points: 13450, matches: 298, winRate: "61%" },
    { rank: 6, name: "PhoenixRising", kills: 2398, points: 12980, matches: 287, winRate: "59%" },
    { rank: 7, name: "IceBreaker", kills: 2312, points: 12560, matches: 276, winRate: "57%" },
    { rank: 8, name: "VortexKing", kills: 2256, points: 12240, matches: 265, winRate: "55%" },
    { rank: 9, name: "StormChaser", kills: 2198, points: 11890, matches: 254, winRate: "53%" },
    { rank: 10, name: "BlazeMaster", kills: 2134, points: 11560, matches: 243, winRate: "51%" },
  ];

  const getTrophyIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-[#f59e0b]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-[#a0a0b0]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-[#cd7f32]" />;
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
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00d4ff]/10 to-[#a855f7]/10 border-b border-border p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-[#00d4ff]" />
            <h1>Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">Top players this season</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <NeonCard glowColor="blue" className="text-center">
            <Target className="w-5 h-5 text-[#00d4ff] mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Your Rank</p>
            <p className="text-lg">#4</p>
          </NeonCard>
          <NeonCard glowColor="purple" className="text-center">
            <Swords className="w-5 h-5 text-[#a855f7] mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Your Points</p>
            <p className="text-lg">13.7K</p>
          </NeonCard>
          <NeonCard glowColor="green" className="text-center">
            <Trophy className="w-5 h-5 text-[#10b981] mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Win Rate</p>
            <p className="text-lg">63%</p>
          </NeonCard>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-6">
          <div className="flex items-end justify-center gap-2 mb-6">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a0a0b0] to-[#808080] flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(160,160,176,0.5)]">
                <Medal className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm mb-1">ShadowAssassin</p>
              <div className="bg-[#a0a0b0]/20 px-4 py-2 rounded-lg">
                <p className="text-xs text-muted-foreground">14.8K pts</p>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center -mt-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(245,158,11,0.8)]">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm mb-1">EliteSniper_X</p>
              <div className="bg-[#f59e0b]/20 px-4 py-2 rounded-lg">
                <p className="text-xs text-muted-foreground">15.4K pts</p>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#cd7f32] to-[#a0522d] flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(205,127,50,0.5)]">
                <Medal className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm mb-1">ThunderStrike</p>
              <div className="bg-[#cd7f32]/20 px-4 py-2 rounded-lg">
                <p className="text-xs text-muted-foreground">14.1K pts</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Full Leaderboard Table */}
        <div className="space-y-2">
          {leaderboardData.map((player, index) => (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NeonCard
                glowColor={getGlowColor(player.rank)}
                className={`!p-3 ${player.name === "ProGamer_X" ? "border-2 border-primary" : ""}`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getTrophyIcon(player.rank)}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${
                      player.name === "ProGamer_X" ? "text-primary" : ""
                    }`}>
                      {player.name}
                      {player.name === "ProGamer_X" && (
                        <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{player.matches} matches</span>
                      <span>•</span>
                      <span className="text-[#10b981]">{player.winRate} WR</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="text-sm">{player.points.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{player.kills} kills</p>
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          ))}
        </div>

        {/* Season Info */}
        <NeonCard glowColor="purple" className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Current Season</p>
          <h3 className="bg-gradient-to-r from-[#00d4ff] to-[#a855f7] bg-clip-text text-transparent mb-2">
            Season 4: Legends Rising
          </h3>
          <p className="text-xs text-muted-foreground">Ends in 12 days</p>
        </NeonCard>
      </div>
    </div>
  );
}


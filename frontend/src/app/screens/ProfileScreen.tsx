import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { User, Edit, LogOut, History, Settings, Trophy, Target, Zap, DollarSign } from "lucide-react";
import { useNavigate } from "react-router";

export default function ProfileScreen() {
  const navigate = useNavigate();

  const stats = [
    { label: "Matches Played", value: "342", icon: Target, color: "text-[#00d4ff]" },
    { label: "Total Wins", value: "127", icon: Trophy, color: "text-[#10b981]" },
    { label: "K/D Ratio", value: "2.4", icon: Zap, color: "text-[#a855f7]" },
    { label: "Total Earnings", value: "$890", icon: DollarSign, color: "text-[#f59e0b]" },
  ];

  const recentTransactions = [
    { date: "Mar 3, 2026", tournament: "Weekend Warriors Cup", amount: "+$50", type: "win" },
    { date: "Mar 2, 2026", tournament: "Solo Showdown", amount: "+$25", type: "win" },
    { date: "Mar 1, 2026", tournament: "Entry Fee", amount: "-$10", type: "fee" },
    { date: "Feb 28, 2026", tournament: "Daily Scrim", amount: "+$15", type: "win" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Profile Banner */}
      <div className="bg-gradient-to-br from-[#00d4ff]/20 via-[#a855f7]/20 to-[#ec4899]/20 border-b border-border">
        <div className="max-w-lg mx-auto p-6">
          {/* Profile Info */}
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(0,212,255,0.5)]">
                PX
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#10b981] border-2 border-background rounded-full" />
            </motion.div>

            <div className="flex-1">
              <h2 className="mb-1">ProGamer_X</h2>
              <p className="text-sm text-muted-foreground mb-2">UID: NXR-2847-PGX</p>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-[#00d4ff] to-[#a855f7] px-3 py-1 rounded-full">
                  <p className="text-xs text-black">Diamond Tier</p>
                </div>
                <div className="bg-muted px-3 py-1 rounded-full">
                  <p className="text-xs">Level 47</p>
                </div>
              </div>
            </div>

            <button className="p-2 bg-card/50 backdrop-blur-sm rounded-lg hover:bg-card transition-all">
              <Edit className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <NeonCard 
                  key={i} 
                  glowColor={i % 2 === 0 ? "blue" : "purple"}
                  className="text-center"
                >
                  <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-lg">{stat.value}</p>
                </NeonCard>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Account Level Progress */}
        <NeonCard glowColor="purple">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Account Level</p>
                <p className="text-lg">Level 47</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#00d4ff]">8,450 / 10,000 XP</p>
                <p className="text-xs text-muted-foreground">Next: Level 48</p>
              </div>
            </div>
            <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "84.5%" }}
                transition={{ duration: 1, delay: 0.3 }}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00d4ff] to-[#a855f7] rounded-full"
              />
            </div>
          </div>
        </NeonCard>

        {/* Recent Achievements */}
        <div>
          <h3 className="mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "First Blood", icon: "🎯", rarity: "Epic" },
              { name: "Triple Kill", icon: "⚡", rarity: "Rare" },
              { name: "Champion", icon: "👑", rarity: "Legendary" },
            ].map((achievement, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-card border border-border rounded-xl p-3 text-center hover:border-primary transition-all"
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className="text-xs mb-1">{achievement.name}</p>
                <p className={`text-xs ${
                  achievement.rarity === "Legendary" ? "text-[#f59e0b]" :
                  achievement.rarity === "Epic" ? "text-[#a855f7]" :
                  "text-[#00d4ff]"
                }`}>
                  {achievement.rarity}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#00d4ff]" />
              <h3>Transaction History</h3>
            </div>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>

          <div className="space-y-2">
            {recentTransactions.map((transaction, i) => (
              <NeonCard key={i} glowColor="blue" className="!p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm mb-1">{transaction.tournament}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${
                    transaction.type === "win"
                      ? "bg-[#10b981]/20 text-[#10b981]"
                      : "bg-[#ef4444]/20 text-[#ef4444]"
                  }`}>
                    <p className="text-sm">{transaction.amount}</p>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <GlowButton variant="primary" className="w-full">
            <Edit className="w-4 h-4 mr-2 inline" />
            Edit Profile
          </GlowButton>

          <button className="w-full px-6 py-3 bg-card border border-border rounded-lg hover:border-primary transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </div>
          </button>

          <button className="w-full px-6 py-3 bg-card border border-border rounded-lg hover:border-primary transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5" />
              <span>Full Transaction History</span>
            </div>
          </button>

          <button 
            onClick={() => navigate("/login")}
            className="w-full px-6 py-3 border border-border rounded-lg hover:border-destructive hover:text-destructive transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}


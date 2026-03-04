import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { Wallet, Bell, Trophy, Swords, Megaphone, DollarSign, Clock, Users, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import API from "../services/api";
import { useEffect } from "react";

export default function HomeScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/tournaments")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  }, []);

  const liveScrimData = [
    { id: 1, title: "Solo Ranked Scrim", slots: "8/10", time: "Starting in 5m", prize: "$50" },
    { id: 2, title: "Squad Battle Royale", slots: "12/16", time: "Starting in 12m", prize: "$100" },
  ];

  const upcomingTournaments = [
    { id: 1, title: "Weekend Warriors Cup", date: "Mar 6, 2026", prize: "$5,000", slots: "45/64" },
    { id: 2, title: "Spring Championship", date: "Mar 10, 2026", prize: "$10,000", slots: "28/32" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00d4ff]/10 to-[#a855f7]/10 border-b border-border p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-muted-foreground text-sm">Welcome back,</h3>
              <h2 className="bg-gradient-to-r from-[#00d4ff] to-[#a855f7] bg-clip-text text-transparent">
                ProGamer_X
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/app/admin")}
                className="p-2 bg-gradient-to-br from-[#a855f7] to-[#ec4899] rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                title="Admin Panel"
              >
                <Shield className="w-5 h-5 text-white" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="relative p-2 bg-card rounded-full border border-border"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full" />
              </motion.button>
              <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2">
                <Wallet className="w-4 h-4 text-[#00d4ff]" />
                <span className="text-sm">2,450</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <NeonCard glowColor="blue" className="text-center">
              <Trophy className="w-5 h-5 text-[#00d4ff] mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Wins</p>
              <p className="text-lg">127</p>
            </NeonCard>
            <NeonCard glowColor="purple" className="text-center">
              <Swords className="w-5 h-5 text-[#a855f7] mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Matches</p>
              <p className="text-lg">342</p>
            </NeonCard>
            <NeonCard glowColor="green" className="text-center">
              <DollarSign className="w-5 h-5 text-[#10b981] mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Earned</p>
              <p className="text-lg">$890</p>
            </NeonCard>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Live Scrims */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-[#ef4444]" />
              <h3>Live Scrims</h3>
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-[#ef4444] rounded-full"
              />
            </div>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>

          <div className="space-y-3">
            {liveScrimData.map((scrim) => (
              <NeonCard 
                key={scrim.id} 
                glowColor="blue"
                onClick={() => navigate(`/app/scrims/${scrim.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="mb-1">{scrim.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{scrim.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{scrim.slots}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#10b981] mb-1">{scrim.prize}</p>
                    <GlowButton variant="primary" className="text-xs px-4 py-1.5">
                      Join
                    </GlowButton>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>

        {/* Upcoming Tournaments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#00d4ff]" />
              <h3>Upcoming Tournaments</h3>
            </div>
            <button 
              onClick={() => navigate("/app/tournaments")}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {upcomingTournaments.map((tournament) => (
              <NeonCard key={tournament.id} glowColor="purple">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="mb-2">{tournament.title}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{tournament.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>{tournament.slots} Registered</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-gradient-to-r from-[#00d4ff] to-[#a855f7] px-3 py-1 rounded-lg mb-2">
                      <p className="text-xs text-black">Prize Pool</p>
                      <p className="text-black">{tournament.prize}</p>
                    </div>
                    <GlowButton variant="secondary" className="text-xs px-4 py-1.5">
                      Register
                    </GlowButton>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-[#f59e0b]" />
            <h3>Announcements</h3>
          </div>

          <NeonCard glowColor="pink">
            <div className="flex items-start gap-3">
              <div className="bg-[#ec4899]/20 p-2 rounded-lg">
                <Megaphone className="w-5 h-5 text-[#ec4899]" />
              </div>
              <div className="flex-1">
                <h4 className="mb-1">New Season Starting Soon!</h4>
                <p className="text-sm text-muted-foreground">
                  Season 5 begins March 15th with exclusive rewards and new tournaments.
                </p>
                <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
              </div>
            </div>
          </NeonCard>
        </div>

        {/* Prize Pool Highlights */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-[#10b981]" />
            <h3>Prize Pool Highlights</h3>
          </div>

          <NeonCard glowColor="green" className="bg-gradient-to-br from-[#10b981]/10 to-transparent">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Active Prize Pools</p>
              <h2 className="bg-gradient-to-r from-[#10b981] to-[#00d4ff] bg-clip-text text-transparent mb-4" style={{ fontSize: "2.5rem" }}>
                $45,000
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Tournaments</p>
                  <p className="text-lg text-[#00d4ff]">12</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Daily Scrims</p>
                  <p className="text-lg text-[#a855f7]">24</p>
                </div>
              </div>
            </div>
          </NeonCard>
        </div>
      </div>
    </div>
  );
}

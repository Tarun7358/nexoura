import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { 
  Shield, 
  Plus, 
  Trophy, 
  Users, 
  Megaphone, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function AdminScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "manage">("overview");

  const pendingRegistrations = [
    { id: 1, tournament: "Weekend Warriors Cup", player: "NewPlayer_123", date: "Mar 4, 2026" },
    { id: 2, tournament: "Solo Showdown", player: "GamerPro_89", date: "Mar 4, 2026" },
    { id: 3, tournament: "Spring Championship", player: "EliteSniper", date: "Mar 3, 2026" },
  ];

  const activeTournaments = [
    { id: 1, name: "Weekend Warriors Cup", status: "Live", players: 45, prize: "$5,000" },
    { id: 2, name: "Solo Showdown", status: "Upcoming", players: 87, prize: "$2,000" },
    { id: 3, name: "Spring Championship", status: "Upcoming", players: 12, prize: "$10,000" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#a855f7]/10 to-[#ec4899]/10 border-b border-border p-6">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate("/app")}
            className="text-sm text-muted-foreground mb-4 hover:text-foreground"
          >
            ← Back to Home
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-[#a855f7] to-[#ec4899] p-3 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1>Admin Panel</h1>
              <p className="text-sm text-muted-foreground">Tournament Organizer Dashboard</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <NeonCard glowColor="purple" className="text-center">
              <Trophy className="w-4 h-4 text-[#a855f7] mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-lg">12</p>
            </NeonCard>
            <NeonCard glowColor="blue" className="text-center">
              <Users className="w-4 h-4 text-[#00d4ff] mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Players</p>
              <p className="text-lg">847</p>
            </NeonCard>
            <NeonCard glowColor="green" className="text-center">
              <DollarSign className="w-4 h-4 text-[#10b981] mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Pool</p>
              <p className="text-lg">$45K</p>
            </NeonCard>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { label: "Overview", value: "overview" },
            { label: "Create", value: "create" },
            { label: "Manage", value: "manage" },
          ].map((tab) => (
            <motion.button
              key={tab.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.value as any)}
              className={`flex-1 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.value
                  ? "bg-gradient-to-r from-[#a855f7] to-[#ec4899] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  : "bg-card border border-border hover:border-secondary"
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Pending Registrations */}
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00d4ff]" />
                Pending Registrations
              </h3>
              <div className="space-y-2">
                {pendingRegistrations.map((reg) => (
                  <NeonCard key={reg.id} glowColor="blue" className="!p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm mb-1">{reg.player}</p>
                        <p className="text-xs text-muted-foreground">{reg.tournament}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{reg.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1.5 bg-[#10b981]/20 text-[#10b981] rounded-lg hover:bg-[#10b981]/30 transition-all flex items-center justify-center gap-1 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button className="flex-1 px-3 py-1.5 bg-[#ef4444]/20 text-[#ef4444] rounded-lg hover:bg-[#ef4444]/30 transition-all flex items-center justify-center gap-1 text-sm">
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </NeonCard>
                ))}
              </div>
            </div>

            {/* Active Tournaments */}
            <div>
              <h3 className="mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#a855f7]" />
                Active Tournaments
              </h3>
              <div className="space-y-3">
                {activeTournaments.map((tournament) => (
                  <NeonCard key={tournament.id} glowColor="purple">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="mb-1">{tournament.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{tournament.players} players</span>
                          <span>•</span>
                          <span className="text-[#10b981]">{tournament.prize}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        tournament.status === "Live"
                          ? "bg-[#ef4444]/20 text-[#ef4444]"
                          : "bg-[#00d4ff]/20 text-[#00d4ff]"
                      }`}>
                        {tournament.status}
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-muted rounded-lg hover:bg-muted/70 transition-all text-sm">
                      Manage Tournament
                    </button>
                  </NeonCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === "create" && (
          <div className="space-y-4">
            <NeonCard glowColor="purple">
              <div className="text-center py-8">
                <Plus className="w-12 h-12 text-[#a855f7] mx-auto mb-4" />
                <h3 className="mb-2">Create New Tournament</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Set up a new tournament with custom rules and prize pools
                </p>
                <GlowButton variant="secondary" className="mx-auto">
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Start Creating
                </GlowButton>
              </div>
            </NeonCard>

            <NeonCard glowColor="blue">
              <div className="text-center py-8">
                <Megaphone className="w-12 h-12 text-[#00d4ff] mx-auto mb-4" />
                <h3 className="mb-2">Post Announcement</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Share news and updates with all players
                </p>
                <GlowButton variant="primary" className="mx-auto">
                  <Megaphone className="w-4 h-4 mr-2 inline" />
                  Create Post
                </GlowButton>
              </div>
            </NeonCard>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === "manage" && (
          <div className="space-y-4">
            {/* Prize Distribution */}
            <NeonCard glowColor="green">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-[#10b981]" />
                <h3>Prize Distribution</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Pool</span>
                  <span className="text-[#10b981]">$45,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Distributed</span>
                  <span>$28,500</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="text-[#f59e0b]">$16,500</span>
                </div>
                <div className="h-px bg-border my-2" />
                <GlowButton variant="success" className="w-full text-sm">
                  Process Pending Prizes
                </GlowButton>
              </div>
            </NeonCard>

            {/* Match Management */}
            <NeonCard glowColor="purple">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-[#a855f7]" />
                <h3>Match Management</h3>
              </div>
              <div className="space-y-2">
                {["Update Match Results", "Resolve Disputes", "Schedule Matches"].map((action, i) => (
                  <button
                    key={i}
                    className="w-full px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-all text-sm text-left"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </NeonCard>

            {/* Player Management */}
            <NeonCard glowColor="blue">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#00d4ff]" />
                <h3>Player Management</h3>
              </div>
              <div className="space-y-2">
                {["View All Players", "Manage Bans", "Player Verification"].map((action, i) => (
                  <button
                    key={i}
                    className="w-full px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-all text-sm text-left"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </NeonCard>
          </div>
        )}
      </div>
    </div>
  );
}


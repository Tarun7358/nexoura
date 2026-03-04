import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { Users, Plus, Crown, Shield, Swords, Mail, MoreVertical, UserPlus } from "lucide-react";
import { useState } from "react";

export default function TeamScreen() {
  const [hasTeam, setHasTeam] = useState(true);

  const teamMembers = [
    { id: 1, name: "ProGamer_X", role: "Captain", rank: "Diamond", kills: 2541, isOnline: true },
    { id: 2, name: "ShadowHunter", role: "Player", rank: "Platinum", kills: 1987, isOnline: true },
    { id: 3, name: "NinjaStrike", role: "Player", rank: "Diamond", kills: 2156, isOnline: false },
    { id: 4, name: "ThunderBolt99", role: "Player", rank: "Gold", kills: 1654, isOnline: true },
  ];

  const CreateTeamView = () => (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="bg-gradient-to-br from-[#00d4ff]/20 to-[#a855f7]/20 p-8 rounded-full mb-6"
        >
          <Users className="w-16 h-16 text-[#00d4ff]" />
        </motion.div>

        <h2 className="mb-2 text-center">You're Not in a Team</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-sm">
          Create your own team or join an existing one to compete in squad tournaments
        </p>

        <div className="space-y-3 w-full max-w-sm">
          <GlowButton onClick={() => setHasTeam(true)} className="w-full">
            <Plus className="w-5 h-5 mr-2 inline" />
            Create New Team
          </GlowButton>
          <button className="w-full px-6 py-3 border border-border rounded-lg hover:border-primary transition-all">
            Browse Teams
          </button>
        </div>
      </div>
    </div>
  );

  if (!hasTeam) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-[#00d4ff]/10 to-[#a855f7]/10 border-b border-border p-6">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#00d4ff]" />
              <h1>My Team</h1>
            </div>
          </div>
        </div>
        <CreateTeamView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00d4ff]/10 to-[#a855f7]/10 border-b border-border p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#00d4ff]" />
              <h1>My Team</h1>
            </div>
            <button className="p-2 hover:bg-card rounded-lg transition-all">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Team Info Card */}
          <NeonCard glowColor="blue" className="bg-gradient-to-br from-[#00d4ff]/10 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#a855f7] flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="mb-1">Thunder Strikers</h2>
                <p className="text-sm text-muted-foreground">EST. Jan 2026</p>
              </div>
            </div>
          </NeonCard>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        {/* Team Stats */}
        <div className="grid grid-cols-3 gap-3">
          <NeonCard glowColor="blue" className="text-center">
            <Swords className="w-5 h-5 text-[#00d4ff] mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Wins</p>
            <p className="text-lg">47</p>
          </NeonCard>
          <NeonCard glowColor="purple" className="text-center">
            <Users className="w-5 h-5 text-[#a855f7] mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Members</p>
            <p className="text-lg">4/5</p>
          </NeonCard>
          <NeonCard glowColor="green" className="text-center">
            <Crown className="w-5 h-5 text-[#10b981] mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Rank</p>
            <p className="text-lg">#24</p>
          </NeonCard>
        </div>

        {/* Team Members */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Team Members</h3>
            <GlowButton variant="primary" className="text-xs px-4 py-2">
              <UserPlus className="w-4 h-4 mr-1 inline" />
              Invite
            </GlowButton>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <NeonCard key={member.id} glowColor="purple">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                      member.rank === "Diamond"
                        ? "from-[#00d4ff] to-[#0099cc]"
                        : member.rank === "Platinum"
                        ? "from-[#a855f7] to-[#7c3aed]"
                        : "from-[#f59e0b] to-[#d97706]"
                    } flex items-center justify-center`}>
                      <span>{member.name.charAt(0)}</span>
                    </div>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] border-2 border-card rounded-full" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm truncate">{member.name}</p>
                      {member.role === "Captain" && (
                        <Crown className="w-4 h-4 text-[#f59e0b]" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{member.rank}</span>
                      <span>•</span>
                      <span>{member.kills} kills</span>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    member.role === "Captain"
                      ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                      : "bg-muted/50 text-muted-foreground"
                  }`}>
                    {member.role}
                  </div>
                </div>
              </NeonCard>
            ))}

            {/* Empty Slot */}
            <NeonCard glowColor="blue" className="border-dashed">
              <div className="flex items-center justify-center gap-3 py-3">
                <Plus className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Empty Slot</p>
              </div>
            </NeonCard>
          </div>
        </div>

        {/* Recent Matches */}
        <div>
          <h3 className="mb-4">Recent Matches</h3>
          
          <div className="space-y-2">
            {[
              { result: "Win", tournament: "Weekend Warriors", place: "#1", reward: "+150 pts" },
              { result: "Win", tournament: "Daily Scrim", place: "#2", reward: "+120 pts" },
              { result: "Loss", tournament: "Squad Battle", place: "#5", reward: "+50 pts" },
            ].map((match, i) => (
              <NeonCard 
                key={i} 
                glowColor={match.result === "Win" ? "green" : "pink"}
                className="!p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${
                      match.result === "Win" ? "bg-[#10b981]" : "bg-[#ef4444]"
                    }`} />
                    <div>
                      <p className="text-sm">{match.tournament}</p>
                      <p className="text-xs text-muted-foreground">{match.place}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${
                      match.result === "Win" ? "text-[#10b981]" : "text-[#ef4444]"
                    }`}>
                      {match.result}
                    </p>
                    <p className="text-xs text-muted-foreground">{match.reward}</p>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>

        {/* Team Settings */}
        <div className="space-y-3">
          <button className="w-full px-6 py-3 bg-card border border-border rounded-lg hover:border-primary transition-all text-left flex items-center justify-between">
            <span>Team Settings</span>
            <MoreVertical className="w-4 h-4" />
          </button>
          <button className="w-full px-6 py-3 border border-border rounded-lg hover:border-destructive hover:text-destructive transition-all">
            Leave Team
          </button>
        </div>
      </div>
    </div>
  );
}


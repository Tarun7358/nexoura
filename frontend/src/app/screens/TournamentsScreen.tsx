import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { Trophy, Calendar, DollarSign, Users, Filter } from "lucide-react";
import { useState } from "react";

export default function TournamentsScreen() {
  const [activeFilter, setActiveFilter] = useState<"all" | "solo" | "duo" | "squad">("all");

  const tournaments = [
    {
      id: 1,
      title: "Weekend Warriors Cup",
      type: "squad",
      date: "Mar 6, 2026",
      time: "6:00 PM EST",
      entryFee: "$10",
      prizePool: "$5,000",
      slots: "45/64",
      game: "Battle Royale",
    },
    {
      id: 2,
      title: "Solo Showdown",
      type: "solo",
      date: "Mar 7, 2026",
      time: "3:00 PM EST",
      entryFee: "$5",
      prizePool: "$2,000",
      slots: "87/100",
      game: "1v1 Arena",
    },
    {
      id: 3,
      title: "Duo Domination",
      type: "duo",
      date: "Mar 8, 2026",
      time: "7:00 PM EST",
      entryFee: "$15",
      prizePool: "$3,500",
      slots: "28/32",
      game: "Team Deathmatch",
    },
    {
      id: 4,
      title: "Spring Championship",
      type: "squad",
      date: "Mar 10, 2026",
      time: "5:00 PM EST",
      entryFee: "$25",
      prizePool: "$10,000",
      slots: "12/16",
      game: "Battle Royale",
    },
    {
      id: 5,
      title: "Quick Fire Solo",
      type: "solo",
      date: "Mar 5, 2026",
      time: "8:00 PM EST",
      entryFee: "Free",
      prizePool: "$500",
      slots: "64/64",
      game: "Speed Run",
    },
  ];

  const filteredTournaments = tournaments.filter(
    (t) => activeFilter === "all" || t.type === activeFilter
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#a855f7]/10 to-[#00d4ff]/10 border-b border-border p-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-[#00d4ff]" />
            <h1>Tournaments</h1>
          </div>
          <p className="text-muted-foreground">Compete for glory and prizes</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6">
        {/* Filters */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
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
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeFilter === filter.value
                    ? "bg-gradient-to-r from-[#00d4ff] to-[#a855f7] text-black shadow-[0_0_20px_rgba(0,212,255,0.5)]"
                    : "bg-card border border-border hover:border-primary"
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tournaments List */}
        <div className="space-y-4">
          {filteredTournaments.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NeonCard glowColor={tournament.slots.startsWith("6") ? "pink" : "purple"}>
                <div className="space-y-3">
                  {/* Title and Game */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-1">{tournament.title}</h3>
                      <p className="text-xs text-muted-foreground">{tournament.game}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs ${
                      tournament.type === "solo"
                        ? "bg-[#00d4ff]/20 text-[#00d4ff]"
                        : tournament.type === "duo"
                        ? "bg-[#a855f7]/20 text-[#a855f7]"
                        : "bg-[#ec4899]/20 text-[#ec4899]"
                    }`}>
                      {tournament.type.toUpperCase()}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-sm">{tournament.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#10b981]" />
                      <div>
                        <p className="text-xs text-muted-foreground">Prize Pool</p>
                        <p className="text-sm text-[#10b981]">{tournament.prizePool}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Slots</p>
                        <p className="text-sm">{tournament.slots}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Entry Fee</p>
                      <p className="text-sm">{tournament.entryFee}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2">
                    <GlowButton
                      variant={tournament.slots.startsWith("6") ? "danger" : "secondary"}
                      className="flex-1 text-sm"
                      disabled={tournament.slots.startsWith("6")}
                    >
                      {tournament.slots.startsWith("6") ? "Full" : "Join Tournament"}
                    </GlowButton>
                    <button className="px-4 py-3 border border-border rounded-lg hover:border-primary transition-all">
                      Details
                    </button>
                  </div>
                </div>
              </NeonCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}


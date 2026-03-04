import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { Copy, Users, Clock, MapPin, Check, Shield } from "lucide-react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router";

export default function ScrimsLobbyScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const matchId = "NXRA-5847-XYZ9";
  const roomPassword = "ELITE2026";
  const startTime = "Starting in 3:45";

  const participants = [
    { id: 1, name: "ProGamer_X", status: "ready", kills: 127, rank: "Diamond" },
    { id: 2, name: "ShadowHunter", status: "ready", kills: 98, rank: "Platinum" },
    { id: 3, name: "NinjaStrike", status: "ready", kills: 145, rank: "Master" },
    { id: 4, name: "ThunderBolt99", status: "waiting", kills: 76, rank: "Gold" },
    { id: 5, name: "PhoenixRising", status: "ready", kills: 112, rank: "Diamond" },
    { id: 6, name: "IceBreaker", status: "waiting", kills: 89, rank: "Platinum" },
    { id: 7, name: "VortexKing", status: "ready", kills: 134, rank: "Master" },
    { id: 8, name: "StormChaser", status: "waiting", kills: 67, rank: "Gold" },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#ef4444]/10 to-[#00d4ff]/10 border-b border-border p-6">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-muted-foreground mb-4 hover:text-foreground"
          >
            ← Back to Home
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-1">Solo Ranked Scrim</h1>
              <p className="text-muted-foreground">Battle Royale • Ranked</p>
            </div>
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 bg-[#ef4444]/20 px-3 py-1.5 rounded-full"
            >
              <div className="w-2 h-2 bg-[#ef4444] rounded-full" />
              <span className="text-sm text-[#ef4444]">LIVE</span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-4">
        {/* Match Info */}
        <NeonCard glowColor="blue">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Match ID</p>
                <p className="text-lg tracking-wider">{matchId}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopy(matchId)}
                className="p-2 bg-primary/20 rounded-lg hover:bg-primary/30 transition-all"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <Copy className="w-5 h-5 text-primary" />
                )}
              </motion.button>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Room Password</p>
                <p className="text-lg tracking-wider">{roomPassword}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCopy(roomPassword)}
                className="p-2 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-all"
              >
                <Copy className="w-5 h-5 text-secondary" />
              </motion.button>
            </div>
          </div>
        </NeonCard>

        {/* Match Details */}
        <div className="grid grid-cols-3 gap-3">
          <NeonCard glowColor="purple" className="text-center">
            <Clock className="w-5 h-5 text-[#a855f7] mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Start Time</p>
            <p className="text-sm">3:45</p>
          </NeonCard>
          <NeonCard glowColor="blue" className="text-center">
            <MapPin className="w-5 h-5 text-[#00d4ff] mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Map</p>
            <p className="text-sm">Arena 7</p>
          </NeonCard>
          <NeonCard glowColor="green" className="text-center">
            <Shield className="w-5 h-5 text-[#10b981] mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Mode</p>
            <p className="text-sm">Ranked</p>
          </NeonCard>
        </div>

        {/* Participants */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00d4ff]" />
              <h3>Participants</h3>
              <span className="text-sm text-muted-foreground">({participants.length}/10)</span>
            </div>
          </div>

          <div className="space-y-2">
            {participants.map((participant) => (
              <NeonCard 
                key={participant.id} 
                glowColor={participant.status === "ready" ? "green" : "blue"}
                className="!p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                      participant.rank === "Master"
                        ? "from-[#ec4899] to-[#a855f7]"
                        : participant.rank === "Diamond"
                        ? "from-[#00d4ff] to-[#0099cc]"
                        : participant.rank === "Platinum"
                        ? "from-[#a855f7] to-[#7c3aed]"
                        : "from-[#f59e0b] to-[#d97706]"
                    } flex items-center justify-center`}>
                      <span className="text-sm">{participant.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm">{participant.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{participant.rank}</span>
                        <span>•</span>
                        <span>{participant.kills} Kills</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    participant.status === "ready"
                      ? "bg-[#10b981]/20 text-[#10b981]"
                      : "bg-muted/50 text-muted-foreground"
                  }`}>
                    {participant.status === "ready" ? "Ready" : "Waiting"}
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <GlowButton
            variant={isReady ? "success" : "primary"}
            onClick={() => setIsReady(!isReady)}
            className="w-full"
          >
            {isReady ? "✓ Ready" : "Mark as Ready"}
          </GlowButton>
          <button
            onClick={() => navigate("/app")}
            className="w-full px-6 py-3 border border-border rounded-lg hover:border-destructive hover:text-destructive transition-all"
          >
            Leave Lobby
          </button>
        </div>
      </div>
    </div>
  );
}


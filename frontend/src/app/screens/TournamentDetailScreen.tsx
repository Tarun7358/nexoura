import { motion } from "motion/react";
import NeonCard from "../components/NeonCard";
import { GlowButton } from "../components/GlowButton";
import { Bracket } from "../components/Bracket";
import { ChatPanel } from "../components/ChatPanel";
import { Trophy, Calendar, DollarSign, Users, ChevronLeft, Swords, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";

export default function TournamentDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'bracket' | 'matches' | 'chat'>('overview');
  
  // Mock data - in a real app, fetch based on id
  const tournament = {
    title: "Weekend Warriors Cup",
    game: "Battle Royale",
    prizePool: "$5,000",
    date: "Mar 6, 2026",
    status: "Live",
    participants: 64,
  };

  const [liveMatches, setLiveMatches] = useState([
    { id: 1, t1: "Team Alpha", t2: "Team Beta", s1: 12, s2: 10, time: "12:30" },
    { id: 2, t1: "Gamma Ray", t2: "Delta Force", s1: 5, s2: 8, time: "08:45" },
    { id: 3, t1: "Epsilon", t2: "Zeta Squad", s1: 15, s2: 15, time: "15:20" },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMatches(prev => prev.map(m => ({
        ...m,
        s1: m.s1 + (Math.random() > 0.7 ? 1 : 0),
        s2: m.s2 + (Math.random() > 0.7 ? 1 : 0),
        time: `${parseInt(m.time.split(':')[0]) + 1}:${m.time.split(':')[1]}` // Dummy time increment
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-br from-[#a855f7]/10 to-[#00d4ff]/10 border-b border-border p-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-card rounded-lg transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold leading-tight">{tournament.title}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
              <span>•</span>
              <span>{tournament.game}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['overview', 'bracket', 'matches', 'chat'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <NeonCard glowColor="purple" className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Prize Pool</p>
                  <h2 className="text-3xl font-bold text-[#10b981]">{tournament.prizePool}</h2>
                </div>
                <Trophy className="w-12 h-12 text-[#f59e0b] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
              </NeonCard>

              <div className="grid grid-cols-2 gap-3">
                <NeonCard glowColor="blue">
                  <Calendar className="w-5 h-5 text-[#00d4ff] mb-2" />
                  <p className="text-xs text-muted-foreground">Start Date</p>
                  <p className="font-semibold">{tournament.date}</p>
                </NeonCard>
                <NeonCard glowColor="pink">
                  <Users className="w-5 h-5 text-[#ec4899] mb-2" />
                  <p className="text-xs text-muted-foreground">Participants</p>
                  <p className="font-semibold">{tournament.participants} Teams</p>
                </NeonCard>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card/50">
                <h3 className="text-sm font-semibold mb-2">Rules & Format</h3>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                  <li>Single Elimination Bracket</li>
                  <li>Best of 3 Matches</li>
                  <li>Map Pool: 5 Maps (Veto System)</li>
                  <li>No toxicity allowed (Instant DQ)</li>
                </ul>
              </div>
              
              <GlowButton className="w-full">Register Team</GlowButton>
            </div>
          )}

          {activeTab === 'bracket' && (
            <div className="bg-card/30 rounded-xl border border-border p-2 overflow-hidden">
              <h3 className="text-sm font-semibold mb-4 px-2">Tournament Bracket</h3>
              <Bracket />
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Live Matches</h3>
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Updating
                </span>
              </div>
              
              {liveMatches.map((match) => (
                <NeonCard key={match.id} glowColor="blue" className="!p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex-1">
                      <div className="flex justify-between font-bold mb-1">
                        <span>{match.t1}</span>
                        <span className="text-[#00d4ff]">{match.s1}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-[#00d4ff]" 
                          initial={{ width: "50%" }}
                          animate={{ width: `${(match.s1 / (match.s1 + match.s2 || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="px-3 text-center">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">VS</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-right w-full block">{match.t2}</span>
                        <span className="text-[#a855f7] -order-1">{match.s2}</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden flex justify-end">
                        <motion.div 
                          className="h-full bg-[#a855f7]"
                          initial={{ width: "50%" }}
                          animate={{ width: `${(match.s2 / (match.s1 + match.s2 || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {match.time}</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-500" /> High Activity</span>
                  </div>
                </NeonCard>
              ))}
            </div>
          )}

          {activeTab === 'chat' && (
            <ChatPanel channelName={tournament.title} />
          )}
        </motion.div>
      </div>
    </div>
  );
}


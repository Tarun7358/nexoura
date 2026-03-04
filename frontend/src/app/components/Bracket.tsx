import { motion } from "motion/react";
import { NeonCard } from "./NeonCard";

interface MatchProps {
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: 1 | 2;
  round: number;
  matchIndex: number;
}

const Match = ({ team1, team2, score1, score2, winner, round, matchIndex }: MatchProps) => {
  return (
    <div className="flex flex-col justify-center items-center w-40 m-2 relative">
      <NeonCard 
        glowColor={winner ? "green" : "blue"} 
        className={`w-full p-2 !bg-opacity-80 ${winner ? 'border-[#10b981]' : ''}`}
      >
        <div className={`flex justify-between items-center ${winner === 1 ? 'font-bold text-[#10b981]' : ''}`}>
          <span className="truncate text-xs">{team1}</span>
          <span className="text-xs">{score1 ?? '-'}</span>
        </div>
        <div className="h-[1px] bg-border my-1 w-full" />
        <div className={`flex justify-between items-center ${winner === 2 ? 'font-bold text-[#10b981]' : ''}`}>
          <span className="truncate text-xs">{team2}</span>
          <span className="text-xs">{score2 ?? '-'}</span>
        </div>
      </NeonCard>
      {/* Connector lines would go here, simplified for now with spacing */}
    </div>
  );
};

export function Bracket() {
  // Mock data for a 8-team bracket
  const rounds = [
    [
      { id: 1, t1: "Team Alpha", t2: "Team Beta", s1: 2, s2: 1, w: 1 },
      { id: 2, t1: "Gamma Ray", t2: "Delta Force", s1: 0, s2: 2, w: 2 },
      { id: 3, t1: "Epsilon", t2: "Zeta Squad", s1: 1, s2: 3, w: 2 },
      { id: 4, t1: "Eta Bit", t2: "Theta Waves", s1: 2, s2: 0, w: 1 },
    ],
    [
      { id: 5, t1: "Team Alpha", t2: "Delta Force", s1: 2, s2: 1, w: 1 },
      { id: 6, t1: "Zeta Squad", t2: "Eta Bit", s1: 1, s2: 2, w: 2 },
    ],
    [
      { id: 7, t1: "Team Alpha", t2: "Eta Bit", s1: 3, s2: 2, w: 1 }, // Final
    ]
  ];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max p-4">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col justify-around gap-4">
            <h4 className="text-center text-muted-foreground text-xs mb-2 uppercase tracking-widest">
              {roundIndex === rounds.length - 1 ? "Finals" : `Round ${roundIndex + 1}`}
            </h4>
            {round.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: roundIndex * 0.2 + i * 0.1 }}
              >
                <Match 
                  team1={match.t1} 
                  team2={match.t2} 
                  score1={match.s1} 
                  score2={match.s2} 
                  winner={match.w as 1 | 2}
                  round={roundIndex}
                  matchIndex={i}
                />
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from "motion/react";
import { Crosshair, MessageCircle, Trophy, Activity, Zap } from "lucide-react";

export function LiveMatchUpdates({ events }: { events: any[] }) {
  return (
    <div className="bg-black/50 backdrop-blur-md rounded-xl p-4 h-64 overflow-y-auto border border-white/10 relative">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"/>
        <span className="text-xs font-mono text-red-500 uppercase tracking-widest">Live Feed</span>
      </div>
      
      <div className="space-y-2 mt-6">
        <AnimatePresence mode="popLayout">
          {events.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground text-sm py-10"
            >
              Waiting for match events...
            </motion.div>
          )}
          
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, scale: 0.9, height: 0 }}
              className="flex items-center gap-3 text-sm p-2 rounded-lg bg-white/5 border border-white/5"
            >
              {/* Icon based on type */}
              <div className={`p-1.5 rounded-full shrink-0 ${
                event.type === 'kill' ? 'bg-red-500/20 text-red-400' :
                event.type === 'chat' ? 'bg-blue-500/20 text-blue-400' :
                event.type === 'score' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {event.type === 'kill' && <Crosshair size={14} />}
                {event.type === 'chat' && <MessageCircle size={14} />}
                {event.type === 'score' && <Trophy size={14} />}
                {event.type === 'system' && <Activity size={14} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {event.type === 'kill' && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-400 truncate">{event.data.killer}</span>
                    <Zap size={10} className="text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{event.data.victim}</span>
                    <span className="text-xs text-muted-foreground/50 ml-auto flex items-center gap-1">
                      <Crosshair size={10} />
                      {event.data.weapon}
                    </span>
                  </div>
                )}
                
                {event.type === 'chat' && (
                  <div className="flex gap-2">
                    <span className="font-bold text-blue-400">{event.data.user}:</span>
                    <span className="text-gray-300 truncate">{event.data.message}</span>
                  </div>
                )}

                {event.type === 'system' && (
                  <span className="text-gray-400 italic">{event.data.message}</span>
                )}
              </div>
              
              <span className="text-[10px] text-muted-foreground/40 whitespace-nowrap">
                {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

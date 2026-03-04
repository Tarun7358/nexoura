import { useState, useEffect } from 'react';

export type EventType = 'chat' | 'kill' | 'score' | 'system';

export interface RealtimeEvent {
  id: string;
  type: EventType;
  data: any;
  timestamp: number;
}

export function useMockRealtime(matchId: string) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate connection delay
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
      addEvent('system', { message: 'Connected to match server' });
    }, 1500);

    return () => clearTimeout(connectTimer);
  }, [matchId]);

  useEffect(() => {
    if (!isConnected) return;

    // Simulate incoming events
    const interval = setInterval(() => {
      const random = Math.random();
      
      if (random > 0.7) {
        // Simulate a kill
        const killer = ['ProGamer_X', 'ShadowHunter', 'NinjaStrike', 'VortexKing'][Math.floor(Math.random() * 4)];
        const victim = ['NoobMaster', 'Camper101', 'Bot_01', 'LaggyBoy'][Math.floor(Math.random() * 4)];
        const weapon = ['AK-47', 'AWP', 'M4A1', 'Desert Eagle'][Math.floor(Math.random() * 4)];
        
        addEvent('kill', { killer, victim, weapon });
      } else if (random < 0.1) {
        // Simulate a chat message
        const user = ['Spectator1', 'Coach_Mike', 'Admin'][Math.floor(Math.random() * 3)];
        const msg = ['Nice shot!', 'What a play!', 'Lag?', 'GG'][Math.floor(Math.random() * 4)];
        
        addEvent('chat', { user, message: msg });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const addEvent = (type: EventType, data: any) => {
    setEvents(prev => [{
      id: Date.now().toString() + Math.random().toString(),
      type,
      data,
      timestamp: Date.now()
    }, ...prev].slice(0, 50)); // Keep last 50 events
  };

  const sendMessage = (text: string) => {
    addEvent('chat', { user: 'Me', message: text });
  };

  return { isConnected, events, sendMessage };
}

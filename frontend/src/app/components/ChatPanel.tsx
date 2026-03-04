import { useState, useRef, useEffect } from "react";
import { Send, User } from "lucide-react";
import { GlowButton } from "./GlowButton";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  sender: string;
  text: string;
  isMe: boolean;
  timestamp: string;
}

export function ChatPanel({ channelName }: { channelName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'System', text: `Welcome to #${channelName}!`, isMe: false, timestamp: '12:00 PM' },
    { id: '2', sender: 'ProGamer_X', text: 'Anyone ready for scrims?', isMe: false, timestamp: '12:05 PM' },
  ]);
  const [inputValue, setInputValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "You",
      text: inputValue,
      isMe: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    
    // Simulate reply
    if (Math.random() > 0.5) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'ShadowHunter',
          text: 'I am ready!',
          isMe: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-card/50 rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          {channelName}
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] flex gap-2 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!msg.isMe && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                
                <div>
                  <div className={`flex items-baseline gap-2 mb-1 ${msg.isMe ? 'justify-end' : ''}`}>
                    <span className="text-xs text-muted-foreground">{msg.sender}</span>
                    <span className="text-[10px] text-muted-foreground/50">{msg.timestamp}</span>
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.isMe 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-muted/50 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-card/80 border-t border-border flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-muted/50 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
        />
        <GlowButton onClick={handleSend} className="px-3 !py-2">
          <Send className="w-4 h-4" />
        </GlowButton>
      </div>
    </div>
  );
}

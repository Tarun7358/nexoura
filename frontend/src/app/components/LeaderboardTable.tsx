import React from 'react';
import '../styles/ui-kit.css';

export default function LeaderboardTable({rows}:{rows:any[]}){
  return (
    <div className="neon-card">
      <div style={{display:'grid',gridTemplateColumns:'48px 1fr 64px 64px 64px',gap:8,alignItems:'center',fontWeight:700}}>
        <div>Rank</div><div>Player</div><div>Kills</div><div>Points</div><div>Matches</div>
      </div>
      <div style={{marginTop:8}}>
        {rows.map((r,i)=> (
          <div key={r.id} style={{display:'grid',gridTemplateColumns:'48px 1fr 64px 64px 64px',gap:8,alignItems:'center',padding:'8px 0',borderTop:'1px solid rgba(255,255,255,0.02)'}}>
            <div>{i<3?`🏆 ${i+1}`:i+1}</div>
            <div>{r.name}</div>
            <div>{r.kills}</div>
            <div>{r.points}</div>
            <div>{r.matches}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

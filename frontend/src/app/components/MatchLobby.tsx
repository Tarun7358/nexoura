import React from 'react';
import NeonCard from './NeonCard';
import NeonButton from './NeonButton';
import '../styles/ui-kit.css';

export default function MatchLobby({lobby}:{lobby:any}){
  return (
    <NeonCard>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontWeight:800}}>Match ID: {lobby.id}</div>
          <div className="small-muted">Starts: {lobby.start}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div className="small-muted">Players</div>
          <div style={{fontWeight:800}}>{lobby.players.length}/{lobby.max}</div>
        </div>
      </div>
      <div style={{marginTop:12,display:'flex',gap:8}}>
        <NeonButton>Copy ID</NeonButton>
        <NeonButton className="ghost">Ready</NeonButton>
      </div>
    </NeonCard>
  )
}

import React from 'react';
import MatchLobby from '../components/MatchLobby';
import '../styles/ui-kit.css';

export default function ScrimDetail(){
  const sample = {id:'ROOM-55',start:'Now',players:[ 'Alpha','Beta','Gamma'],max:16}
  return (
    <div className="container">
      <h2>Room: {sample.id}</h2>
      <MatchLobby lobby={sample} />
      <div style={{marginTop:12}} className="neon-card">
        <div style={{fontWeight:700}}>Participants</div>
        <div className="small-muted">{sample.players.join(', ')}</div>
      </div>
    </div>
  )
}

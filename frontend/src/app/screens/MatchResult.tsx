import React from 'react';
import NeonCard from '../components/NeonCard';
import '../styles/ui-kit.css';

export default function MatchResult(){
  return (
    <div className="container">
      <h2>Match Result</h2>
      <NeonCard>
        <div style={{fontWeight:800}}>Victory • Phantoms</div>
        <div className="small-muted">Kills: 28 • Points: 560</div>
      </NeonCard>
    </div>
  )
}

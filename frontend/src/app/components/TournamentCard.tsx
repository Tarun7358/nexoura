import React from 'react';
import NeonCard from './NeonCard';
import NeonButton from './NeonButton';
import '../styles/ui-kit.css';

export default function TournamentCard({t}:{t:any}){
  return (
    <NeonCard className="tournament-card">
      <div>
        <div className="title">{t.name}</div>
        <div className="small-muted">{t.date} • {t.mode}</div>
      </div>
      <div className="center">
        <div style={{textAlign:'right',marginRight:12}}>
          <div style={{fontWeight:800}}>{t.prize}</div>
          <div className="small-muted">Entry: {t.entry}</div>
        </div>
        <NeonButton>Join</NeonButton>
      </div>
    </NeonCard>
  )
}

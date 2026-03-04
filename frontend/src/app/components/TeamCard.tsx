import React from 'react';
import NeonCard from './NeonCard';
import NeonButton from './NeonButton';
import '../styles/ui-kit.css';

export default function TeamCard({team}:{team:any}){
  return (
    <NeonCard>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:56,height:56,borderRadius:10,background:'linear-gradient(90deg,var(--neon-blue),var(--neon-purple))'}} />
          <div>
            <div style={{fontWeight:800}}>{team.name}</div>
            <div className="small-muted">{team.members.length} members</div>
          </div>
        </div>
        <NeonButton className="ghost">Manage</NeonButton>
      </div>
    </NeonCard>
  )
}

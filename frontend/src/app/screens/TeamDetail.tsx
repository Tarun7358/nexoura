import React from 'react';
import NeonCard from '../components/NeonCard';
import '../styles/ui-kit.css';

export default function TeamDetail(){
  const team = {name:'Phantoms',members:['User1','User2','User3']}
  return (
    <div className="container">
      <h2>{team.name}</h2>
      <NeonCard>
        <div style={{fontWeight:800}}>Members</div>
        <div className="small-muted">{team.members.join(', ')}</div>
      </NeonCard>
    </div>
  )
}

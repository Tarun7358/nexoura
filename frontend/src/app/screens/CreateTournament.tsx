import React from 'react';
import NeonButton from '../components/NeonButton';
import '../styles/ui-kit.css';

export default function CreateTournament(){
  return (
    <div className="container">
      <h2>Create Tournament</h2>
      <div className="neon-card">
        <label className="small-muted">Name</label>
        <input style={{width:'100%',padding:10,marginTop:8,marginBottom:12,borderRadius:8}} />
        <label className="small-muted">Entry Fee</label>
        <input style={{width:'100%',padding:10,marginTop:8,marginBottom:12,borderRadius:8}} />
        <label className="small-muted">Prize Pool</label>
        <input style={{width:'100%',padding:10,marginTop:8,marginBottom:12,borderRadius:8}} />
        <NeonButton style={{width:'100%'}}>Create</NeonButton>
      </div>
    </div>
  )
}

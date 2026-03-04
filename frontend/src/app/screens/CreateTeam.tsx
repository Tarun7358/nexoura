import React from 'react';
import NeonButton from '../components/NeonButton';
import '../styles/ui-kit.css';

export default function CreateTeam(){
  return (
    <div className="container">
      <h2>Create Team</h2>
      <div className="neon-card">
        <label className="small-muted">Team Name</label>
        <input style={{width:'100%',padding:10,marginTop:8,marginBottom:12,borderRadius:8}} />
        <label className="small-muted">Team Logo</label>
        <div style={{height:120,borderRadius:10,background:'rgba(255,255,255,0.02)',display:'flex',alignItems:'center',justifyContent:'center'}}>Upload</div>
        <NeonButton style={{width:'100%',marginTop:12}}>Create</NeonButton>
      </div>
    </div>
  )
}

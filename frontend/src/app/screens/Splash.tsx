import React from 'react';
import '../styles/ui-kit.css';

export default function Splash(){
  return (
    <div className="container center" style={{height:'100vh',flexDirection:'column'}}>
      <div style={{width:140,height:140,borderRadius:28,background:'linear-gradient(90deg,var(--neon-blue),var(--neon-purple))'}} className="glow"/>
      <h1 style={{marginTop:18,fontSize:20}}>Nexoura</h1>
      <div className="small-muted">Compete. Conquer. Connect.</div>
    </div>
  )
}

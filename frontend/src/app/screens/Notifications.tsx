import React from 'react';
import NeonCard from '../components/NeonCard';
import '../styles/ui-kit.css';

export default function Notifications(){
  return (
    <div className="container">
      <h2>Notifications</h2>
      <div style={{display:'grid',gap:10}}>
        <NeonCard>
          <div style={{fontWeight:800}}>Match starting in 10 minutes</div>
          <div className="small-muted">Join your scrim room.</div>
        </NeonCard>
      </div>
    </div>
  )
}

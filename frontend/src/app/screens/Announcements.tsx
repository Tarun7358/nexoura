import React from 'react';
import NeonCard from '../components/NeonCard';
import '../styles/ui-kit.css';

export default function Announcements(){
  return (
    <div className="container">
      <h2>Announcements</h2>
      <div style={{display:'grid',gap:10}}>
        <NeonCard>
          <div style={{fontWeight:800}}>Patch 1.2 Released</div>
          <div className="small-muted">New map rotations and bug fixes.</div>
        </NeonCard>
      </div>
    </div>
  )
}

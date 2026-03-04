import React from 'react';
import NeonCard from '../components/NeonCard';
import '../styles/ui-kit.css';

export default function Settings(){
  return (
    <div className="container">
      <h2>Settings</h2>
      <NeonCard>
        <div className="small-muted">Notifications</div>
        <div className="small-muted">Privacy</div>
        <div className="small-muted">Appearance</div>
      </NeonCard>
    </div>
  )
}

import React from 'react';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import '../styles/ui-kit.css';

export default function ManageMatches(){
  return (
    <div className="container">
      <h2>Manage Matches</h2>
      <NeonCard>
        <div>Match list, results, re-schedule and adjudicate reports.</div>
        <div style={{marginTop:12}}>
          <NeonButton>New Match</NeonButton>
        </div>
      </NeonCard>
    </div>
  )
}

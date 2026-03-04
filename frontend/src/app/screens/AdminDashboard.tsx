import React from 'react';
import NeonCard from '../components/NeonCard';
import NeonButton from '../components/NeonButton';
import '../styles/ui-kit.css';

export default function AdminDashboard(){
  return (
    <div className="container">
      <h2>Organizer Panel</h2>
      <div style={{display:'grid',gap:10}}>
        <NeonCard>
          <div style={{display:'flex',justifyContent:'space-between'}}>
            <div>Create or manage tournaments</div>
            <NeonButton>Create Tournament</NeonButton>
          </div>
        </NeonCard>
        <NeonCard>
          <div>Manage Matches • View registrations • Distribute prizes</div>
        </NeonCard>
      </div>
    </div>
  )
}

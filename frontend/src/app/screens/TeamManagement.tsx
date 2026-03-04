import React from 'react';
import TeamCard from '../components/TeamCard';
import NeonButton from '../components/NeonButton';
import BottomNav from '../components/BottomNav';
import '../styles/ui-kit.css';

const teams = [{id:1,name:'Phantoms',members:[1,2,3]},{id:2,name:'Starlords',members:[4,5]}]

export default function TeamManagement(){
  return (
    <div className="container" style={{paddingBottom:100}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>My Teams</h2>
        <NeonButton>Create Team</NeonButton>
      </div>
      <div style={{display:'grid',gap:10,marginTop:12}}>
        {teams.map(t=> <TeamCard key={t.id} team={t} />)}
      </div>
      <BottomNav />
    </div>
  )
}

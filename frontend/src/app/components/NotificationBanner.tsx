import React from 'react';
import '../styles/ui-kit.css';

export default function NotificationBanner({text}:{text:string}){
  return (
    <div style={{padding:10,borderRadius:10,background:'linear-gradient(90deg,var(--neon-blue),var(--neon-purple))',color:'#03030a',fontWeight:700}}>
      {text}
    </div>
  )
}

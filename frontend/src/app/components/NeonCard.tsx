import React from 'react';
import '../styles/ui-kit.css';

export default function NeonCard({children, className=''}:{children:React.ReactNode,className?:string}){
  return (
    <div className={`neon-card ${className}`}>
      {children}
    </div>
  )
}

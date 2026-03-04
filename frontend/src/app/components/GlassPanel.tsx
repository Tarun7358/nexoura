import React from 'react';
import '../styles/ui-kit.css';

export default function GlassPanel({children,style}:{children:React.ReactNode,style?:React.CSSProperties}){
  return <div className="glass-panel" style={{padding:12,...style}}>{children}</div>
}

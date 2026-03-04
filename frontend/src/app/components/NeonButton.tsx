import React from 'react';
import '../styles/ui-kit.css';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode };

export default function NeonButton(props: Props){
  const { children, className='', ...rest } = props;
  return (
    <button className={`neon-button ${className}`} {...rest}>
      {children}
    </button>
  )
}

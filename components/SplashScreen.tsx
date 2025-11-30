
import React from 'react';
import { BryteLogo } from './BryteLogo';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] animate-out fade-out duration-1000 fill-mode-forwards delay-[2000ms]">
      <div className="relative flex flex-col items-center">
        <BryteLogo className="w-24 h-24 text-bryte-accent animate-pulse" />
        <h1 className="mt-6 text-3xl font-black text-white tracking-tighter opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-forwards">
          Bryte
        </h1>
        <p className="mt-2 text-bryte-muted text-sm font-medium tracking-widest uppercase opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards">
          The Creator OS
        </p>
      </div>
    </div>
  );
};

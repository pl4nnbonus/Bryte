import React from 'react';
import { BryteLogo } from './BryteLogo';
import { ArrowRight, Music, Wallet, Activity, Zap } from 'lucide-react';
import { Track } from '../types';

interface HomeViewProps {
  balance: number;
  brytetag: string;
  tracks: Track[];
  onOpenStudio: () => void;
  onOpenWallet: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  balance, 
  brytetag, 
  tracks, 
  onOpenStudio, 
  onOpenWallet 
}) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  const totalPlays = tracks.reduce((acc, t) => acc + t.plays, 0);

  return (
    <div className="flex flex-col h-full bg-black text-white px-6 pt-8 pb-24 overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-gray-400 text-sm font-medium">{greeting},</h2>
          <h1 className="text-3xl font-black tracking-tight">{brytetag}</h1>
        </div>
        <div className="bg-gray-900 p-2 rounded-full border border-gray-800">
          <BryteLogo className="w-6 h-6 text-bryte-accent" />
        </div>
      </div>

      {/* Wallet Summary */}
      <div 
        onClick={onOpenWallet}
        className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800 rounded-3xl p-6 mb-6 relative overflow-hidden cursor-pointer hover:border-gray-700 transition group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
           <Wallet size={80} />
        </div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Balance</p>
        <h2 className="text-4xl font-black mb-4">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
        <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-900/20 px-3 py-1.5 rounded-full w-fit">
           <Activity size={12} /> +12.5% this month
        </div>
      </div>

      {/* Shortcuts */}
      <h3 className="font-bold text-lg mb-4">Jump Back In</h3>
      <div className="grid grid-cols-2 gap-4 mb-8">
          <div 
            onClick={onOpenStudio}
            className="bg-[#1e1e1e] rounded-2xl p-5 border border-gray-800 cursor-pointer hover:bg-[#252525] transition flex flex-col justify-between h-32"
          >
             <div className="bg-blue-500/20 w-10 h-10 rounded-full flex items-center justify-center text-blue-500 mb-2">
                 <Music size={20} />
             </div>
             <div>
                 <h4 className="font-bold">BriteCook</h4>
                 <p className="text-xs text-gray-500">Create new beat</p>
             </div>
          </div>
          
          <div className="bg-[#1e1e1e] rounded-2xl p-5 border border-gray-800 cursor-pointer hover:bg-[#252525] transition flex flex-col justify-between h-32">
             <div className="bg-purple-500/20 w-10 h-10 rounded-full flex items-center justify-center text-purple-500 mb-2">
                 <Zap size={20} />
             </div>
             <div>
                 <h4 className="font-bold">Trending</h4>
                 <p className="text-xs text-gray-500">See what's hot</p>
             </div>
          </div>
      </div>

      {/* Stats */}
      <h3 className="font-bold text-lg mb-4">Your Stats</h3>
      <div className="bg-[#111] rounded-2xl p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
              <div>
                  <p className="text-gray-400 text-xs uppercase font-bold">Total Plays</p>
                  <p className="text-2xl font-black">{totalPlays.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 h-10 w-[1px]"></div>
              <div>
                   <p className="text-gray-400 text-xs uppercase font-bold">Releases</p>
                   <p className="text-2xl font-black">{tracks.length}</p>
              </div>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-bryte-accent w-3/4"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">You're in the top 15% of creators this week!</p>
      </div>
    </div>
  );
};
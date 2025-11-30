
import React, { useState } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Lock, Share } from 'lucide-react';

interface BrowserOverlayProps {
  url: string;
  onClose: () => void;
}

export const BrowserOverlay: React.FC<BrowserOverlayProps> = ({ url, onClose }) => {
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#1e1e1e] flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="bg-[#1e1e1e] px-4 py-2 pt-12 pb-3 flex items-center justify-between border-b border-gray-800 shadow-sm z-10">
         <button onClick={onClose} className="text-bryte-accent font-bold text-base hover:opacity-80 transition">Done</button>
         
         <div className="flex-1 mx-6 flex flex-col items-center">
             <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5 opacity-70">
                 <Lock size={8} />
                 <span className="font-bold tracking-wider">SECURE</span>
             </div>
             <div className="bg-[#2c2c2e] text-white text-xs px-4 py-1.5 rounded-lg w-full max-w-xs text-center truncate flex items-center justify-center gap-2 font-mono">
                 {new URL(url).hostname}
             </div>
         </div>
         
         <button onClick={handleRefresh} className="text-white hover:text-gray-300"><RotateCcw size={18} /></button>
      </div>

      {/* Browser View */}
      <div className="flex-1 bg-white relative w-full h-full overflow-hidden">
         <iframe 
            key={iframeKey}
            src={url} 
            className="w-full h-full border-none bg-white"
            title="Built-in Browser"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
         />
      </div>

      {/* Navigation Bar (Bottom) */}
      <div className="bg-[#1e1e1e]/95 backdrop-blur-xl border-t border-gray-800 p-4 pb-8 flex justify-between items-center px-8 z-10">
          <button className="text-gray-400 hover:text-white"><ChevronLeft size={24} /></button>
          <button className="text-gray-400 hover:text-white opacity-50"><ChevronRight size={24} /></button>
          <button className="text-gray-400 hover:text-white"><Share size={20} /></button>
          <button onClick={handleRefresh} className="text-gray-400 hover:text-white opacity-80"><RotateCcw size={20} /></button>
      </div>
    </div>
  );
};

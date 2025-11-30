

import React from 'react';
import { Home, Music, Wallet, MessageCircle, BarChart3, Settings, LayoutGrid } from 'lucide-react';
import { View } from '../types';
import { clsx } from 'clsx';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: View.HOME, icon: Home, label: 'Home' },
    { view: View.FEED, icon: LayoutGrid, label: 'Feed' },
    { view: View.STUDIO, icon: Music, label: 'BriteCook' },
    { view: View.AI, icon: MessageCircle, label: 'Bryte Chat' },
    { view: View.WALLET, icon: Wallet, label: 'BrytePay' },
    { view: View.DISTRO, icon: BarChart3, label: 'Distro' },
    { view: View.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bryte-dark/95 backdrop-blur-md border-t border-bryte-gray px-2 py-2 pb-6 flex justify-between items-center z-40">
      {navItems.map((item) => {
        const isActive = currentView === item.view;
        const Icon = item.icon;
        return (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={clsx(
              "flex flex-col items-center justify-center w-full h-12 transition-all duration-200",
              isActive ? "text-bryte-accent transform scale-105" : "text-bryte-muted hover:text-white"
            )}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] mt-1 font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
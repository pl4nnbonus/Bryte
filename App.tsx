import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { View, Transaction, Track } from './types';
import { WalletView } from './components/WalletView';
import { StudioView } from './components/StudioView';
import { ChatInterface } from './components/ChatInterface';
import { SocialFeed } from './components/SocialFeed';
import { DistributionView } from './components/DistributionView';
import { LoginView } from './components/LoginView';
import { IntroView } from './components/IntroView';
import { OnboardingView } from './components/OnboardingView';
import { SettingsView } from './components/SettingsView';
import { SplashScreen } from './components/SplashScreen';
import { BrowserOverlay } from './components/BrowserOverlay';
import { HomeView } from './components/HomeView';

const App: React.FC = () => {
  // App State Flow (Lazy init from LocalStorage)
  const [showSplash, setShowSplash] = useState(true);
  
  const [hasLoggedIn, setHasLoggedIn] = useState(() => {
      return localStorage.getItem('bryte_auth') === 'true';
  });
  
  const [hasOnboarded, setHasOnboarded] = useState(() => {
      return localStorage.getItem('bryte_onboarded') === 'true';
  });
  
  const [hasSeenIntro, setHasSeenIntro] = useState(() => {
      return localStorage.getItem('bryte_intro_seen') === 'true';
  });

  const [currentView, setView] = useState<View>(View.HOME);
  
  // Browser State
  const [browserUrl, setBrowserUrl] = useState<string | null>(null);

  // Global Data State - PERSISTED
  const [brytetag, setBrytetag] = useState(() => localStorage.getItem('bryte_tag') || '');
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('bryte_avatar') || '');
  
  const [balance, setBalance] = useState(() => {
      const saved = localStorage.getItem('bryte_balance');
      return saved ? parseFloat(saved) : 0.00;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
      const saved = localStorage.getItem('bryte_transactions');
      return saved ? JSON.parse(saved) : [];
  });

  const [isVerified, setIsVerified] = useState(() => localStorage.getItem('bryte_verified') === 'true');
  
  const [tracks, setTracks] = useState<Track[]>(() => {
      const saved = localStorage.getItem('bryte_tracks');
      return saved ? JSON.parse(saved) : [];
  });
  
  // Studio Fullscreen Mode
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Show splash for 2.5s
    return () => clearTimeout(timer);
  }, []);

  // Data Persistence Effects
  useEffect(() => {
      if (hasLoggedIn) {
          localStorage.setItem('bryte_balance', balance.toString());
      }
  }, [balance, hasLoggedIn]);

  useEffect(() => {
      if (hasLoggedIn) {
          localStorage.setItem('bryte_transactions', JSON.stringify(transactions));
      }
  }, [transactions, hasLoggedIn]);

  useEffect(() => {
      if (hasLoggedIn) {
          localStorage.setItem('bryte_tracks', JSON.stringify(tracks));
      }
  }, [tracks, hasLoggedIn]);

  // Handlers
  const handleLogin = () => {
      setHasLoggedIn(true);
      localStorage.setItem('bryte_auth', 'true');
  };

  const handleLogout = () => {
      localStorage.clear();
      setHasLoggedIn(false);
      setHasOnboarded(false);
      setHasSeenIntro(false);
      setBrytetag('');
      setIsVerified(false);
      setUserAvatar('');
      setBalance(0);
      setTransactions([]);
      setTracks([]);
      window.location.reload();
  };

  const handleOpenBrowser = (url: string) => {
      setBrowserUrl(url);
  };

  const handleAddFunds = (amount: number, type: 'ad' | 'bonus' | 'royalty') => {
    setBalance(prev => prev + amount);
    const newTx: Transaction = {
      id: Date.now().toString(),
      type: type,
      amount: amount,
      date: new Date().toISOString(),
      description: type === 'ad' ? 'Ad Revenue' : type === 'bonus' ? 'Identity Verified Bonus' : 'Royalty Payout'
    };
    setTransactions(prev => [...prev, newTx]);
  };

  const handleSendMoney = (amount: number, user: string) => {
      if (amount > balance) return;
      setBalance(prev => prev - amount);
      const newTx: Transaction = {
          id: Date.now().toString(),
          type: 'outgoing',
          amount: amount,
          date: new Date().toISOString(),
          description: `Sent to ${user}`
      };
      setTransactions(prev => [...prev, newTx]);
  };

  const handleRequestMoney = (amount: number, user: string) => {
      const newTx: Transaction = {
          id: Date.now().toString(),
          type: 'incoming',
          amount: amount,
          date: new Date().toISOString(),
          description: `Request from ${user}`,
          status: 'pending'
      };
      setTransactions(prev => [...prev, newTx]);
  };

  const handleAddTrack = (track: Track) => {
      setTracks(prev => [track, ...prev]);
  };

  const handleVerifySuccess = () => {
      setIsVerified(true);
      localStorage.setItem('bryte_verified', 'true');
  };
  
  const handleOnboardingComplete = (tag: string, avatar: string, verified: boolean) => {
      setBrytetag(tag);
      setUserAvatar(avatar);
      localStorage.setItem('bryte_tag', tag);
      localStorage.setItem('bryte_avatar', avatar);
      localStorage.setItem('bryte_onboarded', 'true');

      if (verified) {
          setIsVerified(true);
          localStorage.setItem('bryte_verified', 'true');
          handleAddFunds(700, 'bonus'); 
      }
      setHasOnboarded(true);
  };
  
  const handleIntroComplete = () => {
      setHasSeenIntro(true);
      localStorage.setItem('bryte_intro_seen', 'true');
  };

  const handleSetView = (view: View) => {
    if (view === View.STUDIO) {
        setIsStudioOpen(true);
    } else {
        setView(view);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.HOME:
          return <HomeView 
            balance={balance}
            brytetag={brytetag}
            tracks={tracks}
            onOpenStudio={() => setIsStudioOpen(true)}
            onOpenWallet={() => setView(View.WALLET)}
          />;
      case View.FEED:
        return <SocialFeed />;
      case View.STUDIO:
        return null; // Handled by overlay
      case View.WALLET:
        return <WalletView 
            balance={balance} 
            transactions={transactions} 
            onAddFunds={handleAddFunds} 
            onSendMoney={handleSendMoney}
            onRequestMoney={handleRequestMoney}
            isVerified={isVerified}
            onVerifySuccess={handleVerifySuccess}
            brytetag={brytetag}
        />;
      case View.DISTRO:
        return <DistributionView 
            onWithdraw={(amount) => handleAddFunds(amount, 'royalty')} 
            tracks={tracks}
            onAddTrack={handleAddTrack}
        />;
      case View.AI:
        return <ChatInterface onLinkClick={handleOpenBrowser} />;
      case View.SETTINGS:
        return <SettingsView 
            brytetag={brytetag} 
            isVerified={isVerified} 
            userAvatar={userAvatar}
            onLogout={handleLogout}
        />;
      default:
        return <SocialFeed />;
    }
  };

  // 0. Splash Screen
  if (showSplash) {
      return <SplashScreen />;
  }

  // 1. Login Screen
  if (!hasLoggedIn) {
      return <LoginView onLogin={handleLogin} />;
  }

  // 2. Onboarding (Brytetag, Avatar & ID)
  if (!hasOnboarded) {
      return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  // 3. Intro Screen
  if (!hasSeenIntro) {
      return <IntroView onComplete={handleIntroComplete} />;
  }

  // 4. Studio Overlay
  if (isStudioOpen) {
      return <StudioView onBack={() => setIsStudioOpen(false)} />;
  }

  // 5. Main App
  return (
    <div className="h-screen w-screen bg-black text-white font-sans overflow-hidden flex flex-col relative animate-in fade-in duration-500">
      
      {/* Browser Overlay */}
      {browserUrl && (
          <BrowserOverlay url={browserUrl} onClose={() => setBrowserUrl(null)} />
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative w-full h-full bg-black overflow-hidden">
        {/* Page Transition Wrapper */}
        <div key={currentView} className="h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
             {renderView()}
        </div>
        <Navigation currentView={currentView} setView={handleSetView} />
      </main>
    </div>
  );
};

export default App;
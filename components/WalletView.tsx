
import React, { useState, useRef } from 'react';
import { Send, ArrowDownLeft, ScanLine, Camera, Loader2, DollarSign, CheckCircle2, PlayCircle, Eye, EyeOff, Wifi, X, Check, ShieldCheck, Lock, Copy, Gift, PiggyBank, Search, TrendingUp, Target, Plus, ShoppingBag } from 'lucide-react';
import { Transaction } from '../types';
import { verifyIdentityWithAI } from '../services/geminiService';
import { clsx } from 'clsx';
import { BryteLogo } from './BryteLogo';

interface WalletViewProps {
  balance: number;
  transactions: Transaction[];
  onAddFunds: (amount: number, type: 'ad' | 'bonus' | 'royalty') => void;
  onSendMoney: (amount: number, user: string) => void;
  onRequestMoney: (amount: number, user: string) => void;
  isVerified: boolean;
  onVerifySuccess: () => void;
  brytetag: string;
}

interface SavingsGoal {
    id: string;
    name: string;
    target: number;
    saved: number;
    image?: string;
}

export const WalletView: React.FC<WalletViewProps> = ({ 
    balance, 
    transactions, 
    onAddFunds, 
    onSendMoney,
    onRequestMoney,
    isVerified, 
    onVerifySuccess,
    brytetag
}) => {
  const [verifying, setVerifying] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [adError, setAdError] = useState('');
  const [idError, setIdError] = useState('');
  
  // Modals
  const [activeModal, setActiveModal] = useState<'send' | 'request' | null>(null);
  const [modalAmount, setModalAmount] = useState('');
  const [modalUser, setModalUser] = useState('');
  const [processingTx, setProcessingTx] = useState(false);

  // Card State
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showDirectDeposit, setShowDirectDeposit] = useState(false);

  // BryteSave State
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [foundProduct, setFoundProduct] = useState<{name: string, price: number, image: string} | null>(null);
  
  // Mock Bank Info
  const routingNum = "071000288";
  const accountNum = "899201022345";

  const cardNumber = "4532 1234 5678 9012";
  const expiry = "12/28";
  const cvv = "345";
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerifying(true);
    setIdError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = (reader.result as string).replace("data:", "").replace(/^.+,/, "");
        const isValid = await verifyIdentityWithAI(base64String);
        
        if (isValid) {
            onVerifySuccess();
            onAddFunds(700, 'bonus');
        } else {
            setIdError("Could not verify ID. Please ensure it is a clear Government Issued ID or School ID.");
        }
        setVerifying(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerCamera = () => fileInputRef.current?.click();

  const watchAd = () => {
    const lastAd = localStorage.getItem('lastAdWatch');
    const now = Date.now();
    if (lastAd && now - parseInt(lastAd) < 86400000) {
        setAdError('Daily limit reached. Come back tomorrow!');
        return;
    }
    setAdLoading(true);
    setAdError('');
    setTimeout(() => {
        setAdLoading(false);
        onAddFunds(20, 'ad');
        localStorage.setItem('lastAdWatch', now.toString());
    }, 5000);
  };

  const executeTransaction = () => {
      if (!modalAmount || !modalUser) return;
      setProcessingTx(true);
      setTimeout(() => {
          if (activeModal === 'send') {
              onSendMoney(parseFloat(modalAmount), modalUser);
          } else {
              onRequestMoney(parseFloat(modalAmount), modalUser);
          }
          setProcessingTx(false);
          setActiveModal(null);
          setModalAmount('');
          setModalUser('');
      }, 1500);
  };

  // BryteSave Logic
  const handleProductSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!productSearch.trim()) return;
      
      setIsSearchingProduct(true);
      setFoundProduct(null);

      // Simulate Web Search
      setTimeout(() => {
          const mockPrice = Math.floor(Math.random() * 500) + 50;
          setFoundProduct({
              name: productSearch,
              price: mockPrice + 0.99,
              image: `https://source.unsplash.com/random/200x200/?${encodeURIComponent(productSearch)}`
          });
          setIsSearchingProduct(false);
      }, 1500);
  };

  const createGoal = () => {
      if (!foundProduct) return;
      const newGoal: SavingsGoal = {
          id: Date.now().toString(),
          name: foundProduct.name,
          target: foundProduct.price,
          saved: 0,
          image: foundProduct.image
      };
      setSavingsGoals([...savingsGoals, newGoal]);
      setFoundProduct(null);
      setProductSearch('');
  };

  const addToGoal = (goalId: string, amount: number) => {
      if (balance < amount) {
          alert("Insufficient funds in main balance");
          return;
      }
      // Deduct from wallet by "sending" to self/savings
      onSendMoney(amount, "BryteSave Goal");
      
      setSavingsGoals(prev => prev.map(g => {
          if (g.id === goalId) {
              return { ...g, saved: Math.min(g.target, g.saved + amount) };
          }
          return g;
      }));
  };

  return (
    <div className="flex flex-col h-full px-4 pt-4 pb-24 overflow-y-auto no-scrollbar bg-black text-white font-sans relative">
      <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <BryteLogo className="w-8 h-8 text-bryte-accent" />
            <span className="font-extrabold text-2xl tracking-tight text-white">Bryte<span className="text-bryte-accent">Pay</span></span>
          </div>
          <div className="bg-[#1a1a1a] px-3 py-1 rounded-full border border-gray-800 text-xs font-mono text-gray-400">
             {brytetag}
          </div>
      </div>

      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      {/* VERIFICATION GATE - LOCKED STATE */}
      {!isVerified && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center h-[120%]">
              <div className="bg-[#1e1e1e] border border-red-500/30 p-8 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center animate-in zoom-in duration-300 sticky top-20">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-500">
                      <Lock size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Access Locked</h2>
                  <p className="text-gray-400 text-sm mb-6">You must verify your identity to unlock your Balance, Visa Card, and Pathward Bank Direct Deposit.</p>
                  
                  <button 
                    onClick={triggerCamera}
                    disabled={verifying}
                    className="bg-white text-black w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition"
                  >
                    {verifying ? <Loader2 className="animate-spin" /> : <Camera size={20} />}
                    {verifying ? 'Verifying...' : 'Verify ID Now'}
                  </button>
                  {idError && <p className="text-red-400 text-xs mt-3">{idError}</p>}
              </div>
          </div>
      )}

      {/* Cash App Style Balance */}
      <div className={clsx("flex flex-col items-center justify-center py-6", !isVerified && "blur-md")}>
        <h1 className="text-6xl font-extrabold tracking-tighter flex items-start">
          <span className="text-3xl mt-2 mr-1">$</span>
          {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className="flex items-center gap-2 mt-2 text-bryte-muted text-sm uppercase tracking-widest font-bold">
          Balance
          {isVerified && <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> Verified</span>}
        </div>
      </div>
      
      {/* $700 BONUS CLAIM BUTTON */}
      {!isVerified && (
        <div className="mb-8 relative z-30">
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 p-[1px] rounded-2xl">
                <div className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Sign Up Bonus</h3>
                        <p className="text-2xl font-black text-white">$700.00</p>
                    </div>
                    <button 
                        onClick={triggerCamera}
                        className="bg-white text-black font-bold text-xs py-2 px-4 rounded-full shadow-lg hover:scale-105 transition flex items-center gap-1"
                    >
                        <ShieldCheck size={14} /> Verify Identity To Claim
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Virtual Visa Card */}
      <div className={clsx("w-full mb-6 perspective group", !isVerified && "blur-md")}>
        <div className="relative w-full aspect-[1.586] bg-gradient-to-br from-zinc-900 to-black rounded-2xl border border-zinc-800 p-6 flex flex-col justify-between shadow-2xl overflow-hidden group transition-transform duration-500 transform group-hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-bryte-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex justify-between items-start z-10">
                <div className="flex items-center gap-1">
                    <span className="font-extrabold italic text-2xl tracking-tighter text-white">Bryte</span>
                </div>
                <span className="font-bold italic text-white/80">VISA</span>
            </div>

            <div className="flex justify-between items-center z-10">
                <div className="w-12 h-9 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-md border border-white/20 relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 border border-black/10 rounded-md"></div>
                </div>
                <div className="flex flex-col items-end">
                    <Wifi className="text-white/50 rotate-90" size={24} />
                    <div className="flex items-center gap-1 text-[8px] text-green-500 font-bold bg-green-900/30 px-1 rounded border border-green-500/20 mt-1">
                        <ShieldCheck size={8} /> Fraud Protection: Active
                    </div>
                </div>
            </div>

            <div className="z-10 mt-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="font-mono text-xl tracking-widest text-white text-shadow-sm truncate">
                        {showCardDetails ? cardNumber : `•••• •••• •••• ${cardNumber.slice(-4)}`}
                    </div>
                    <button 
                        onClick={() => setShowCardDetails(!showCardDetails)}
                        className="text-white/50 hover:text-white transition"
                    >
                        {showCardDetails ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                         <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">Card Holder</p>
                         <p className="font-bold uppercase text-sm tracking-wider">Bryte Member</p>
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">Expires</p>
                            <p className="font-mono text-sm">{expiry}</p>
                        </div>
                        <div>
                            <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-0.5">CVV</p>
                            <p className="font-mono text-sm">{showCardDetails ? cvv : '•••'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-4">
             <button 
                onClick={() => setActiveModal('send')}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-gray-800 transition"
             >
                 <Send size={18} className="mb-1" />
                 <span className="text-xs font-bold">Send</span>
             </button>
             <button 
                onClick={() => setActiveModal('request')}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-gray-800 transition"
             >
                 <ArrowDownLeft size={18} className="mb-1" />
                 <span className="text-xs font-bold">Request</span>
             </button>
             <button 
                onClick={() => setAdLoading(true)} // Simple simulation trigger
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl py-3 flex flex-col items-center justify-center hover:bg-gray-800 transition"
             >
                 <Plus size={18} className="mb-1" />
                 <span className="text-xs font-bold">Add Cash</span>
             </button>
        </div>
        
        {/* Bank Info Footer */}
        <div className="mt-4 flex justify-between items-center px-2">
            <span className="text-[10px] text-gray-500">Banking services provided by Pathward, N.A.</span>
            <button 
                onClick={() => setShowDirectDeposit(!showDirectDeposit)}
                className="text-[10px] font-bold text-bryte-accent hover:underline"
            >
                {showDirectDeposit ? 'Hide Details' : 'Direct Deposit Info'}
            </button>
        </div>
        
        {/* Direct Deposit Details */}
        {showDirectDeposit && (
            <div className="bg-[#1a1a1a] rounded-xl p-4 mt-2 border border-gray-800 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-400 font-bold uppercase">Routing Number</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm select-all">{routingNum}</span>
                        <Copy size={12} className="text-gray-500" />
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-bold uppercase">Account Number</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm select-all">{accountNum}</span>
                        <Copy size={12} className="text-gray-500" />
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* BryteSave Section */}
      <div className={clsx("mb-8", !isVerified && "opacity-50 pointer-events-none")}>
          <div className="flex items-center gap-2 mb-3 px-1">
             <PiggyBank size={18} className="text-bryte-accent" />
             <h3 className="font-bold text-lg">BryteSave</h3>
          </div>
          
          <div className="bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-gray-800 rounded-2xl p-5 shadow-lg">
             <div className="flex items-start gap-3 mb-4">
                 <div className="bg-bryte-accent/10 p-2 rounded-lg">
                     <TrendingUp size={20} className="text-bryte-accent" />
                 </div>
                 <div>
                     <h4 className="font-bold text-sm text-white">Save Wisely</h4>
                     <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                         Set specific goals for things you want. Searching and planning your purchase helps verify it's worth the wait!
                     </p>
                 </div>
             </div>
             
             {/* Search Bar */}
             <form onSubmit={handleProductSearch} className="relative mb-6">
                 <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                 <input 
                    type="text" 
                    placeholder="Search product to save for..." 
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-bryte-accent outline-none transition-colors"
                 />
                 <button type="submit" className="hidden"></button>
             </form>

             {/* Search Result */}
             {isSearchingProduct && (
                 <div className="flex justify-center py-4"><Loader2 className="animate-spin text-bryte-accent" /></div>
             )}
             
             {foundProduct && (
                 <div className="bg-gray-900/50 rounded-xl p-3 flex gap-3 items-center mb-6 border border-gray-700 animate-in fade-in slide-in-from-bottom-2">
                     <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                         <ShoppingBag size={20} className="text-gray-500" />
                     </div>
                     <div className="flex-1">
                         <p className="font-bold text-sm truncate">{foundProduct.name}</p>
                         <p className="text-xs text-bryte-accent font-bold">${foundProduct.price.toFixed(2)}</p>
                     </div>
                     <button 
                        onClick={createGoal}
                        className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-200"
                     >
                         Start Goal
                     </button>
                 </div>
             )}

             {/* Active Goals */}
             <div className="space-y-3">
                 {savingsGoals.length === 0 && !foundProduct && (
                     <div className="text-center py-4 opacity-30">
                         <Target size={32} className="mx-auto mb-2" />
                         <p className="text-xs font-bold">No Active Goals</p>
                     </div>
                 )}
                 
                 {savingsGoals.map(goal => {
                     const percent = Math.min(100, (goal.saved / goal.target) * 100);
                     return (
                         <div key={goal.id} className="bg-black/40 rounded-xl p-3 border border-gray-800">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="font-bold text-sm">{goal.name}</span>
                                 <span className="text-xs font-mono text-gray-400">${goal.saved.toFixed(2)} / ${goal.target.toFixed(2)}</span>
                             </div>
                             <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
                                 <div className="h-full bg-bryte-accent transition-all duration-500" style={{ width: `${percent}%` }}></div>
                             </div>
                             <button 
                                onClick={() => addToGoal(goal.id, 10)}
                                disabled={balance < 10}
                                className="w-full py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 disabled:opacity-50"
                             >
                                 <Plus size={10} /> Add $10 from Balance
                             </button>
                         </div>
                     );
                 })}
             </div>
          </div>
      </div>

      {/* Transaction Modal */}
      {activeModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
              <div className="bg-[#1e1e1e] w-full max-w-sm rounded-3xl p-6 animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-xl">{activeModal === 'send' ? 'Send Money' : 'Request Money'}</h3>
                      <button onClick={() => setActiveModal(null)}><X /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="bg-black p-4 rounded-xl border border-gray-800">
                          <label className="text-xs text-gray-500 uppercase font-bold">Amount</label>
                          <div className="flex items-center text-3xl font-bold mt-1">
                              <span className="text-gray-500 mr-1">$</span>
                              <input 
                                type="number" 
                                value={modalAmount} 
                                onChange={(e) => setModalAmount(e.target.value)}
                                className="bg-transparent outline-none w-full"
                                placeholder="0.00"
                                autoFocus
                              />
                          </div>
                      </div>
                      
                      <div className="bg-black p-4 rounded-xl border border-gray-800">
                          <label className="text-xs text-gray-500 uppercase font-bold">To / From</label>
                          <input 
                            type="text" 
                            value={modalUser} 
                            onChange={(e) => setModalUser(e.target.value)}
                            className="bg-transparent outline-none w-full mt-1 font-medium"
                            placeholder="$cashtag, phone, or email"
                          />
                      </div>

                      <button 
                        onClick={executeTransaction}
                        disabled={processingTx || !modalAmount || !modalUser}
                        className="w-full bg-white text-black font-bold py-4 rounded-full mt-4 flex items-center justify-center gap-2"
                      >
                          {processingTx ? <Loader2 className="animate-spin" /> : (activeModal === 'send' ? 'Send Now' : 'Request Now')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Ad Section */}
      <div className={clsx("bg-[#1a1a1a] p-4 rounded-2xl mb-8 flex justify-between items-center border border-gray-800", !isVerified && "opacity-50 pointer-events-none")}>
          <div>
              <h3 className="font-bold">Daily Earnings</h3>
              <p className="text-xs text-gray-400">Watch short ad • Earn $20.00</p>
              {adError && <p className="text-red-400 text-[10px] mt-1">{adError}</p>}
          </div>
          <button 
             onClick={watchAd}
             disabled={adLoading || !!adError}
             className="bg-green-500 text-black font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
          >
             {adLoading ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
             Watch
          </button>
      </div>

      {/* Activity */}
      <h3 className="font-bold text-lg mb-4 text-gray-400">Activity</h3>
      <div className="space-y-4">
        {transactions.slice().reverse().map(t => (
          <div key={t.id} className="flex justify-between items-center bg-black">
            <div className="flex items-center gap-4">
              <div className={clsx(
                "w-12 h-12 rounded-full flex items-center justify-center",
                t.type === 'outgoing' ? "bg-gray-800" : "bg-green-900/20 text-green-500"
              )}>
                <span className="font-bold text-lg">{t.description[0]}</span>
              </div>
              <div>
                <p className="font-bold text-sm">{t.description}</p>
                <p className="text-xs text-gray-500">{t.type === 'incoming' || t.type === 'bonus' ? 'Received' : 'Sent'} • {new Date(t.date).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={clsx("font-bold", t.type === 'outgoing' ? "text-white" : "text-green-500")}>
              {t.type === 'outgoing' ? '-' : '+'}${t.amount.toFixed(2)}
            </span>
          </div>
        ))}
        {transactions.length === 0 && <div className="text-center py-10 opacity-50"><p>No activity yet.</p></div>}
      </div>
    </div>
  );
};

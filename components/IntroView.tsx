
import React, { useState } from 'react';
import { ArrowRight, Music, Wallet, MessageCircle } from 'lucide-react';

interface IntroViewProps {
  onComplete: () => void;
}

export const IntroView: React.FC<IntroViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: <Wallet size={48} className="text-bryte-accent" />,
      title: "BrytePay",
      desc: "Manage your royalties, spend with your Bryte Visa, and send money instantly."
    },
    {
      icon: <Music size={48} className="text-blue-500" />,
      title: "BriteCook",
      desc: "Produce hits in a professional studio. Distribution to all major platforms included."
    },
    {
      icon: <MessageCircle size={48} className="text-purple-500" />,
      title: "Bryte Chat",
      desc: "Connect with creators and use AI to generate artwork, code, and lyrics."
    }
  ];

  const nextStep = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-between p-8 text-white relative">
       <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 animate-in slide-in-from-right duration-300" key={step}>
           <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
               {slides[step].icon}
           </div>
           <h2 className="text-3xl font-bold tracking-tight">{slides[step].title}</h2>
           <p className="text-gray-400 max-w-xs leading-relaxed">{slides[step].desc}</p>
       </div>

       <div className="w-full flex justify-between items-center">
           <div className="flex gap-2">
               {slides.map((_, i) => (
                   <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-white' : 'w-2 bg-gray-700'}`} />
               ))}
           </div>
           
           <button 
             onClick={nextStep}
             className="bg-bryte-accent text-black p-4 rounded-full font-bold shadow-[0_0_20px_rgba(0,255,148,0.3)] hover:shadow-[0_0_30px_rgba(0,255,148,0.5)] transition-all"
           >
               <ArrowRight size={24} />
           </button>
       </div>
    </div>
  );
};

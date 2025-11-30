
import React, { useState, useRef } from 'react';
import { ArrowRight, AtSign, Check, Loader2, Camera, ShieldCheck, AlertCircle, MapPin, Calendar, User as UserIcon, Image as ImageIcon } from 'lucide-react';
import { verifyIdentityWithAI } from '../services/geminiService';
import { clsx } from 'clsx';

interface OnboardingViewProps {
  onComplete: (brytetag: string, avatar: string, verified: boolean) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [brytetag, setBrytetag] = useState('');
  const [verifyingTag, setVerifyingTag] = useState(false);
  const [tagAvailable, setTagAvailable] = useState<boolean | null>(null);

  // Avatar State
  const [avatar, setAvatar] = useState('');
  
  // Identity State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    dob: '',
    address: ''
  });
  
  const [verifyingID, setVerifyingID] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [idError, setIdError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const checkTag = (tag: string) => {
      const cleanTag = tag.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
      setBrytetag(cleanTag);
      setTagAvailable(null);
      
      if (cleanTag.length > 3) {
          setVerifyingTag(true);
          // Simulate API check
          setTimeout(() => {
              setVerifyingTag(false);
              setTagAvailable(true); // Always available for demo
          }, 800);
      }
  };

  const handleNextStep = () => {
      if (step === 1 && tagAvailable) {
          setStep(2);
      } else if (step === 2) {
          if (!avatar) setAvatar('https://ui-avatars.com/api/?name=' + brytetag + '&background=random');
          setStep(3);
      } else if (step === 3) {
          onComplete(`$${brytetag}`, avatar || `https://ui-avatars.com/api/?name=${brytetag}&background=random`, idVerified);
      }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setAvatar(ev.target?.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const isPersonalInfoValid = () => {
      return personalInfo.fullName.length > 2 && personalInfo.dob && personalInfo.address.length > 5;
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isPersonalInfoValid()) {
        setIdError("Please fill in your personal details before scanning ID.");
        return;
    }

    setVerifyingID(true);
    setIdError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = (reader.result as string).replace("data:", "").replace(/^.+,/, "");
        const isValid = await verifyIdentityWithAI(base64String);
        
        if (isValid) {
            setIdVerified(true);
        } else {
            setIdError("Verification failed. Please ensure the image is a clear, valid ID (School or Gov).");
        }
        setVerifyingID(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center p-6 text-white overflow-y-auto no-scrollbar">
      <div className="w-full max-w-sm space-y-8 animate-in slide-in-from-right duration-500 my-auto">
        
        {/* Step Indicator */}
        <div className="flex gap-2 mb-8 justify-center">
            <div className={clsx("h-1 w-8 rounded-full transition-colors", step >= 1 ? "bg-bryte-accent" : "bg-gray-800")}></div>
            <div className={clsx("h-1 w-8 rounded-full transition-colors", step >= 2 ? "bg-bryte-accent" : "bg-gray-800")}></div>
            <div className={clsx("h-1 w-8 rounded-full transition-colors", step >= 3 ? "bg-bryte-accent" : "bg-gray-800")}></div>
        </div>

        {/* STEP 1: CREATE BRYTETAG */}
        {step === 1 && (
            <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto ring-1 ring-white/20">
                    <AtSign size={32} className="text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Claim your $brytetag</h2>
                    <p className="text-gray-400 text-sm mt-2">This is your unique ID for payments and distribution.</p>
                </div>
                
                <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-500 font-bold text-lg">$</span>
                    <input 
                        type="text" 
                        value={brytetag}
                        onChange={(e) => checkTag(e.target.value)}
                        className="w-full bg-[#111] border border-gray-800 rounded-xl pl-8 pr-12 py-4 font-bold text-lg outline-none focus:border-bryte-accent transition-colors"
                        placeholder="yourname"
                        autoFocus
                    />
                    <div className="absolute right-4 top-4">
                        {verifyingTag && <Loader2 className="animate-spin text-gray-500" />}
                        {!verifyingTag && tagAvailable && <Check className="text-green-500" />}
                    </div>
                </div>

                <button 
                    onClick={handleNextStep}
                    disabled={!tagAvailable}
                    className="w-full bg-white text-black font-bold py-4 rounded-full disabled:opacity-50 hover:bg-gray-200 transition"
                >
                    Continue
                </button>
            </div>
        )}

        {/* STEP 2: PROFILE PICTURE */}
        {step === 2 && (
            <div className="text-center space-y-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Add a Profile Photo</h2>
                    <p className="text-gray-400 text-sm mt-2">Let people know it's you.</p>
                </div>

                <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-40 h-40 mx-auto rounded-full bg-gray-900 border-2 border-dashed border-gray-700 flex items-center justify-center cursor-pointer hover:border-bryte-accent overflow-hidden relative group"
                >
                    {avatar ? (
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-500">
                            <ImageIcon size={32} />
                            <span className="text-xs mt-2 font-bold">Upload</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Camera size={24} />
                    </div>
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} />
                </div>

                <button 
                    onClick={handleNextStep}
                    className="w-full bg-white text-black font-bold py-4 rounded-full hover:bg-gray-200 transition"
                >
                    {avatar ? 'Looks Good' : 'Skip for Now'}
                </button>
            </div>
        )}

        {/* STEP 3: VERIFY IDENTITY */}
        {step === 3 && (
            <div className="text-center space-y-6">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">Verify Identity</h2>
                    <p className="text-gray-400 text-sm mt-2">Required for Pathward, N.A. Banking & Payments.</p>
                </div>

                <div className="bg-[#111] p-6 rounded-2xl border border-gray-800 space-y-4">
                    
                    {/* Form Fields */}
                    <div className="space-y-3">
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Full Legal Name"
                                value={personalInfo.fullName}
                                onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                                className="w-full bg-black border border-gray-800 rounded-lg pl-10 p-3 text-sm focus:border-bryte-accent outline-none"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 text-gray-500" size={16} />
                            <input 
                                type="date" 
                                placeholder="Date of Birth"
                                value={personalInfo.dob}
                                onChange={(e) => setPersonalInfo({...personalInfo, dob: e.target.value})}
                                className="w-full bg-black border border-gray-800 rounded-lg pl-10 p-3 text-sm focus:border-bryte-accent outline-none text-white"
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Home Address"
                                value={personalInfo.address}
                                onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                                className="w-full bg-black border border-gray-800 rounded-lg pl-10 p-3 text-sm focus:border-bryte-accent outline-none"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-4">
                        <h3 className="font-bold text-xs text-left mb-2 text-gray-400 uppercase">Document Verification</h3>
                        
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleIdUpload} />
                        
                        {!idVerified ? (
                            <button 
                                onClick={() => {
                                    if(!isPersonalInfoValid()) {
                                        setIdError("Please fill out all personal fields first.");
                                        return;
                                    }
                                    fileInputRef.current?.click();
                                }}
                                disabled={verifyingID}
                                className={clsx(
                                    "w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition",
                                    isPersonalInfoValid() ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-900 text-gray-600 cursor-not-allowed"
                                )}
                            >
                                {verifyingID ? <Loader2 className="animate-spin" /> : <Camera size={18} />}
                                {verifyingID ? 'Analyzing ID...' : 'Scan ID Document'}
                            </button>
                        ) : (
                            <div className="bg-green-500/10 text-green-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-500/20">
                                <Check size={18} /> Identity Verified
                            </div>
                        )}
                        
                        {idError && <p className="text-red-400 text-xs mt-3 flex items-center justify-center gap-1"><AlertCircle size={12} /> {idError}</p>}
                    </div>
                </div>

                <button 
                    onClick={handleNextStep}
                    className="w-full bg-white text-black font-bold py-4 rounded-full hover:bg-gray-200 transition"
                >
                    {idVerified ? 'Finish Setup' : 'Skip (Limited Access)'}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

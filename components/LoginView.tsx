
import React, { useState } from 'react';
import { BryteLogo } from './BryteLogo';
import { Loader2, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'verify'>('signin');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    code: ''
  });
  const [error, setError] = useState('');

  const completeLogin = () => {
      setShowWelcome(true);
      setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
              onLogin();
          }, 800); // Wait for circle animation
      }, 1500); // Show welcome message
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      completeLogin();
    }, 1500);
  };

  const handleSubmit = () => {
    setError('');
    if (!formData.email || !formData.password) {
        setError('Please fill in all fields.');
        return;
    }

    if (authMode === 'signin') {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            completeLogin();
        }, 1500);
    } else if (authMode === 'signup') {
        if (!formData.name) {
            setError('Please enter your name.');
            return;
        }
        setLoading(true);
        // Simulate sending verification code
        setTimeout(() => {
            setLoading(false);
            setAuthMode('verify');
        }, 1500);
    }
  };

  const handleVerify = () => {
      if (formData.code.length < 6) {
          setError('Please enter the 6-digit code sent to your email.');
          return;
      }
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          completeLogin();
      }, 1500);
  };

  return (
    <div className={clsx("h-full w-full bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden text-white transition-all duration-700", isExiting && "scale-150 opacity-0")}>
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-bryte-accent/10 via-black to-black z-0 pointer-events-none"></div>

      {/* Circle Transition Overlay */}
      <div className={clsx("absolute inset-0 bg-bryte-accent z-50 rounded-full pointer-events-none transition-transform duration-700 ease-in-out", isExiting ? "scale-[5]" : "scale-0")}></div>

      {showWelcome ? (
          <div className="z-40 flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <CheckCircle2 size={64} className="text-bryte-accent mb-4" />
              <h1 className="text-4xl font-black tracking-tighter">Welcome Brytemate!</h1>
              <p className="text-gray-400 mt-2">Loading your OS...</p>
          </div>
      ) : (
          <div className="z-10 flex flex-col items-center w-full max-w-sm relative">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-bryte-accent/20 blur-xl rounded-full animate-pulse"></div>
                <BryteLogo className="w-24 h-24 text-bryte-accent relative z-10 animate-in fade-in zoom-in duration-1000" />
            </div>
            
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-black tracking-tighter">
                    {authMode === 'verify' ? 'Verify Email' : (authMode === 'signup' ? 'Create Account' : 'Welcome Back')}
                </h1>
                <p className="text-gray-400 text-sm">
                    {authMode === 'verify' 
                        ? `We sent a code to ${formData.email}` 
                        : 'The all-in-one OS for Creators.'}
                </p>
            </div>

            <div className="w-full space-y-4 animate-in slide-in-from-bottom duration-300">
                
                {authMode === 'verify' ? (
                    // VERIFICATION VIEW
                    <div className="space-y-4">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="000000" 
                                maxLength={6}
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value.replace(/\D/g,'')})}
                                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-4 text-center text-2xl tracking-[1em] font-mono text-white focus:border-bryte-accent outline-none transition-colors"
                            />
                        </div>
                        <button 
                            onClick={handleVerify}
                            disabled={loading}
                            className="w-full bg-bryte-accent text-black font-bold text-lg py-3 rounded-full hover:brightness-110 transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                        </button>
                        <button 
                            onClick={() => setAuthMode('signup')}
                            className="w-full text-xs text-gray-500 hover:text-white mt-4"
                        >
                            Wrong email? Go back
                        </button>
                    </div>
                ) : (
                    // LOGIN / SIGNUP VIEW
                    <>
                        {authMode === 'signup' && (
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-gray-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-[#111] border border-[#333] rounded-xl pl-12 pr-4 py-3 text-white focus:border-bryte-accent outline-none transition-colors"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-[#111] border border-[#333] rounded-xl pl-12 pr-4 py-3 text-white focus:border-bryte-accent outline-none transition-colors"
                            />
                        </div>
                        
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full bg-[#111] border border-[#333] rounded-xl pl-12 pr-4 py-3 text-white focus:border-bryte-accent outline-none transition-colors"
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-white text-black font-bold text-lg py-3 rounded-full hover:bg-gray-200 transition-transform active:scale-95 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                        </button>

                        <div className="relative py-4 flex items-center justify-center w-full">
                            <div className="absolute w-full h-[1px] bg-gray-800"></div>
                            <span className="bg-black px-2 text-xs text-gray-500 relative z-10">OR</span>
                        </div>

                        <button 
                            onClick={handleGoogleLogin}
                            className="w-full bg-[#111] border border-[#333] text-white font-bold text-sm py-3 rounded-full hover:bg-[#222] transition-colors flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="flex justify-center mt-6">
                            <button 
                                onClick={() => {
                                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                                    setError('');
                                    setFormData({ name: '', email: '', password: '', code: '' });
                                }}
                                className="text-sm text-gray-400 hover:text-white font-medium"
                            >
                                {authMode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                            </button>
                        </div>
                    </>
                )}
            </div>
          </div>
      )}
    </div>
  );
};

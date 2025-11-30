
import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Sparkles, Loader2, MessageCircle, Search, Sticker, Check, CheckCheck } from 'lucide-react';
import { generateResponse } from '../services/geminiService';
import { ChatMessage, ChatConversation } from '../types';
import { clsx } from 'clsx';

interface ChatInterfaceProps {
  onLinkClick: (url: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLinkClick }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'ai'>('inbox');
  const [showGifPicker, setShowGifPicker] = useState(false);
  
  // AI State
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    { 
        id: '1', 
        role: 'model', 
        text: 'Hello! I am Bryte AI. I can create web apps, generate code, write lyrics, and help you get paid. How can I help today?', 
        timestamp: Date.now() - 60000,
        read: true
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Inbox State (Empty for now as requested - clone fresh app)
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, activeTab]);

  const handleAiSend = async (text: string = aiInput, gifUrl?: string) => {
    if (!text.trim() && !gifUrl) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      gifUrl: gifUrl,
      timestamp: Date.now(),
      read: false // Will become read when bot replies
    };

    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setShowGifPicker(false);
    
    if (gifUrl) return; // Don't send GIFs to AI model for text response currently

    setAiLoading(true);

    const history = aiMessages.filter(m => m.text).map(m => ({
      role: m.role,
      parts: [{ text: m.text || '' }]
    }));

    const responseText = await generateResponse(userMsg.text || '', history);
    
    // Mark user message as read
    setAiMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, read: true } : m));

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now(),
      read: true
    };

    setAiMessages(prev => [...prev, botMsg]);
    setAiLoading(false);
  };

  const renderMessageText = (text?: string) => {
    if (!text) return null;
    
    // Regex to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            return (
                <span 
                    key={i} 
                    onClick={() => onLinkClick(part)}
                    className="text-bryte-accent underline cursor-pointer hover:text-white transition-colors"
                >
                    {part}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
  };

  const formatTime = (ts: number) => {
      return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Mock Tenor GIFs
  const mockGifs = [
      "https://media.tenor.com/m410a8r8o88AAAAC/excited-happy.gif",
      "https://media.tenor.com/15YIPfD8aBMAAAAC/money-pay-me.gif",
      "https://media.tenor.com/p0G_XP8r4W8AAAAC/computer-typing.gif",
      "https://media.tenor.com/Images/Stickers/cool.gif"
  ];

  return (
    <div className="flex flex-col h-full bg-black pt-4 pb-20">
      {/* Header & Tabs */}
      <div className="px-4 pb-2 border-b border-gray-800">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <div className="flex p-1 bg-gray-900 rounded-lg">
           <button 
             onClick={() => setActiveTab('inbox')}
             className={clsx("flex-1 py-2 rounded-md text-sm font-bold transition flex items-center justify-center gap-2", activeTab === 'inbox' ? "bg-gray-800 text-white shadow" : "text-gray-500 hover:text-gray-300")}
           >
             <MessageCircle size={16} /> Inbox
           </button>
           <button 
             onClick={() => setActiveTab('ai')}
             className={clsx("flex-1 py-2 rounded-md text-sm font-bold transition flex items-center justify-center gap-2", activeTab === 'ai' ? "bg-gray-800 text-white shadow" : "text-gray-500 hover:text-gray-300")}
           >
             <Sparkles size={16} /> Bryte Chat
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* INBOX VIEW */}
        {activeTab === 'inbox' && (
            <div className="h-full flex flex-col p-4">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                    <input type="text" placeholder="Search people..." className="w-full bg-gray-900 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none" />
                </div>

                {conversations.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 pb-20">
                        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle size={32} className="text-gray-600" />
                        </div>
                        <h3 className="font-bold">No Messages Yet</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-[200px]">Connect with other artists and creators to start chatting.</p>
                        <button className="mt-6 bg-white text-black font-bold px-6 py-2 rounded-full text-sm">Find People</button>
                    </div>
                ) : (
                    <div>{/* Conversation list would go here */}</div>
                )}
            </div>
        )}

        {/* AI VIEW */}
        {activeTab === 'ai' && (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 no-scrollbar" ref={scrollRef}>
                    {aiMessages.map((msg) => (
                    <div key={msg.id} className={clsx("flex w-full flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                        <div className="flex max-w-[85%]">
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 mr-2 flex items-center justify-center mt-auto mb-1">
                                    <Sparkles size={14} className="text-white" />
                                </div>
                            )}
                            <div className={clsx(
                            "rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap flex flex-col gap-1 shadow-sm min-w-[100px]",
                            msg.role === 'user' 
                                ? "bg-blue-600 text-white rounded-tr-sm" 
                                : "bg-gray-800 text-gray-200 rounded-tl-sm"
                            )}>
                                {msg.text && <span>{renderMessageText(msg.text)}</span>}
                                {msg.gifUrl && <img src={msg.gifUrl} className="rounded-lg max-w-full mt-1" alt="gif" />}
                                
                                {/* Timestamp inside bubble */}
                                <div className={clsx("flex items-center justify-end gap-1 mt-1 text-[9px]", msg.role === 'user' ? "text-blue-200" : "text-gray-500")}>
                                    <span>{formatTime(msg.timestamp)}</span>
                                    {msg.role === 'user' && (
                                        msg.read ? <CheckCheck size={10} className="text-blue-200" /> : <Check size={10} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    ))}
                    {aiLoading && (
                    <div className="flex justify-start">
                         <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 mr-2" />
                         <div className="bg-gray-800 rounded-2xl px-4 py-3 rounded-tl-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-gray-400" />
                            <span className="text-xs text-gray-400">Thinking...</span>
                         </div>
                    </div>
                    )}
                </div>

                {/* GIF Picker */}
                {showGifPicker && (
                    <div className="bg-gray-900 border-t border-gray-800 p-2 h-32 overflow-x-auto whitespace-nowrap space-x-2">
                        {mockGifs.map((gif, i) => (
                            <img 
                                key={i} 
                                src={gif} 
                                className="h-full inline-block rounded cursor-pointer hover:opacity-80 transition" 
                                alt="gif-option"
                                onClick={() => handleAiSend('', gif)}
                            />
                        ))}
                    </div>
                )}

                <div className="p-4 bg-black border-t border-gray-800">
                    <div className="flex items-center gap-2 bg-gray-900 rounded-full px-2 py-2">
                        <button className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-800">
                            <ImageIcon size={20} />
                        </button>
                        <button 
                            onClick={() => setShowGifPicker(!showGifPicker)}
                            className={clsx("p-2 transition rounded-full hover:bg-gray-800", showGifPicker ? "text-blue-400" : "text-gray-400 hover:text-white")}
                        >
                            <Sticker size={20} />
                        </button>
                        <input 
                        type="text" 
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                        placeholder="Ask AI anything..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder-gray-500"
                        />
                        <button 
                        onClick={() => handleAiSend()}
                        disabled={aiLoading || !aiInput.trim()}
                        className="p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition disabled:opacity-50 disabled:bg-gray-700"
                        >
                        <Send size={16} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

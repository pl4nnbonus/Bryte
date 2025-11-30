
import React, { useState, useEffect } from 'react';
import { Upload, DollarSign, Globe, CheckCircle, Clock, X, Disc, Loader2, Music, Podcast, Radio, User, Mic2, PenTool } from 'lucide-react';
import { Track } from '../types';
import { clsx } from 'clsx';

interface DistributionViewProps {
  onWithdraw: (amount: number) => void;
  tracks: Track[];
  onAddTrack: (track: Track) => void;
}

interface SavedProfiles {
    artists: string[];
    producers: string[];
    songwriters: string[];
}

export const DistributionView: React.FC<DistributionViewProps> = ({ onWithdraw, tracks, onAddTrack }) => {
  const totalBalance = tracks.reduce((acc, t) => acc + t.revenue, 0);
  
  // Upload Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadData, setUploadData] = useState({ title: '', artist: '', producer: '', songwriter: '', cover: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Autosave State
  const [savedProfiles, setSavedProfiles] = useState<SavedProfiles>({
      artists: [],
      producers: [],
      songwriters: []
  });

  useEffect(() => {
      // Load saved profiles on mount
      const loadedArtists = JSON.parse(localStorage.getItem('bryte_saved_artists') || '[]');
      const loadedProducers = JSON.parse(localStorage.getItem('bryte_saved_producers') || '[]');
      const loadedSongwriters = JSON.parse(localStorage.getItem('bryte_saved_songwriters') || '[]');
      
      setSavedProfiles({
          artists: loadedArtists,
          producers: loadedProducers,
          songwriters: loadedSongwriters
      });
  }, []);

  const saveProfileData = () => {
      const newArtists = Array.from(new Set([...savedProfiles.artists, uploadData.artist])).filter(Boolean);
      const newProducers = Array.from(new Set([...savedProfiles.producers, uploadData.producer])).filter(Boolean);
      const newSongwriters = Array.from(new Set([...savedProfiles.songwriters, uploadData.songwriter])).filter(Boolean);

      localStorage.setItem('bryte_saved_artists', JSON.stringify(newArtists));
      localStorage.setItem('bryte_saved_producers', JSON.stringify(newProducers));
      localStorage.setItem('bryte_saved_songwriters', JSON.stringify(newSongwriters));

      setSavedProfiles({
          artists: newArtists,
          producers: newProducers,
          songwriters: newSongwriters
      });
  };

  const handleUpload = () => {
      setUploading(true);
      setUploadStatus('Encoding Audio...');
      
      // Simulate multiple steps
      setTimeout(() => {
          setUploadStatus('Generating Fingerprint...');
          setTimeout(() => {
             setUploadStatus('Delivering to Spotify, Apple Music, TikTok...');
             setTimeout(() => {
                const newTrack: Track = {
                    id: Date.now().toString(),
                    name: uploadData.title || 'Untitled Track',
                    artist: uploadData.artist || 'Unknown Artist',
                    plays: 0,
                    revenue: 0,
                    cover: uploadData.cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&q=80',
                    status: 'Processing'
                };
                
                // Save credits for autofill
                saveProfileData();

                onAddTrack(newTrack);
                setUploading(false);
                setShowWizard(false);
                setStep(1);
                setUploadData({ title: '', artist: '', producer: '', songwriter: '', cover: '' });
                setUploadStatus('');
             }, 1500);
          }, 1000);
      }, 1000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setUploadData({ ...uploadData, cover: ev.target?.result as string });
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  return (
    <div className="flex flex-col h-full px-4 pt-12 pb-24 overflow-y-auto no-scrollbar bg-white text-black relative">
       {/* UnitedMasters Style Header */}
       <div className="flex justify-between items-center mb-8">
           <h1 className="text-4xl font-black tracking-tighter uppercase">Distro</h1>
           <div className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
               Select
           </div>
       </div>

       {/* 24hr Approval Banner */}
       <div className="bg-black text-white p-4 rounded-none mb-8 flex items-center gap-3 shadow-xl">
           <div className="bg-green-400 text-black p-2 rounded-full">
               <Clock size={20} />
           </div>
           <div>
               <h3 className="font-bold uppercase text-sm">Fast Lane Approval</h3>
               <p className="text-xs text-gray-400">Get your music on stores in 24 hours.</p>
           </div>
       </div>

       {/* Balance Section */}
       <div className="border border-black p-6 mb-8 relative">
          <div className="absolute -top-3 left-4 bg-white px-2 font-bold text-sm uppercase">Wallet Balance</div>
          <h2 className="text-5xl font-bold mt-2">${totalBalance.toFixed(2)}</h2>
          <div className="mt-6 flex gap-3">
             <button className="flex-1 bg-gray-100 text-gray-400 py-3 font-bold uppercase text-sm border border-gray-200">
                Withdraw
             </button>
             <button className="flex-1 bg-gray-100 text-gray-400 py-3 font-bold uppercase text-sm border border-gray-200">
                Split Pay
             </button>
          </div>
       </div>

       {/* Actions */}
       <div className="grid grid-cols-1 gap-4 mb-8">
          <button 
             onClick={() => setShowWizard(true)}
             className="bg-black text-white py-4 flex items-center justify-center gap-2 font-bold uppercase tracking-wider hover:bg-gray-900 transition"
          >
             <Upload size={20} /> New Release
          </button>
       </div>

       {/* Tracks List */}
       <div className="border-t-2 border-black pt-6">
          <h3 className="font-bold text-xl uppercase mb-4">Releases</h3>
          
          {tracks.length === 0 ? (
             <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300">
                <Globe size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="font-bold text-gray-400 uppercase text-sm">No releases yet</p>
                <p className="text-xs text-gray-400 mt-1">Upload your first track to get started.</p>
             </div>
          ) : (
             <div className="space-y-4">
                {tracks.map(track => (
                    <div key={track.id} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                        <img src={track.cover} alt={track.name} className="w-16 h-16 object-cover bg-gray-200" />
                        <div className="flex-1">
                            <h4 className="font-bold uppercase">{track.name}</h4>
                            <p className="text-xs text-gray-500 uppercase">{track.artist}</p>
                            
                            <div className="flex items-center gap-2 mt-2">
                                <span className={clsx("text-[10px] px-2 py-0.5 font-bold uppercase inline-block", track.status === 'Processing' ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800")}>{track.status}</span>
                                {/* DSP Icons */}
                                <div className="flex gap-1 opacity-50">
                                    <Music size={12} fill="black" />
                                    <Radio size={12} />
                                    <Podcast size={12} />
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold">${track.revenue.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{track.plays} plays</p>
                        </div>
                    </div>
                ))}
             </div>
          )}
       </div>

       {/* Upload Wizard Modal */}
       {showWizard && (
           <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                   <button onClick={() => setShowWizard(false)} className="absolute top-4 right-4"><X /></button>
                   <h2 className="text-2xl font-black uppercase mb-6">New Release</h2>
                   
                   {step === 1 && (
                       <div className="space-y-4">
                           {/* TITLE */}
                           <div>
                               <label className="block text-xs font-bold uppercase mb-1">Track Title</label>
                               <input 
                                    type="text" 
                                    className="w-full border border-black p-3 font-bold outline-none focus:bg-gray-50" 
                                    placeholder="Enter title" 
                                    value={uploadData.title} 
                                    onChange={e => setUploadData({...uploadData, title: e.target.value})} 
                                />
                           </div>

                           {/* ARTIST - with Autofill */}
                           <div>
                               <label className="block text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                   <User size={12} /> Primary Artist
                               </label>
                               <input 
                                    type="text" 
                                    list="artists-list"
                                    className="w-full border border-black p-3 font-bold outline-none focus:bg-gray-50" 
                                    placeholder="Artist Name" 
                                    value={uploadData.artist} 
                                    onChange={e => setUploadData({...uploadData, artist: e.target.value})} 
                                />
                                <datalist id="artists-list">
                                    {savedProfiles.artists.map((name, i) => <option key={i} value={name} />)}
                                </datalist>
                           </div>

                           {/* PRODUCER - with Autofill */}
                           <div>
                               <label className="block text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                   <Mic2 size={12} /> Producer
                               </label>
                               <input 
                                    type="text" 
                                    list="producers-list"
                                    className="w-full border border-black p-3 font-medium outline-none focus:bg-gray-50" 
                                    placeholder="Producer Name" 
                                    value={uploadData.producer} 
                                    onChange={e => setUploadData({...uploadData, producer: e.target.value})} 
                                />
                                <datalist id="producers-list">
                                    {savedProfiles.producers.map((name, i) => <option key={i} value={name} />)}
                                </datalist>
                           </div>

                           {/* SONGWRITER - with Autofill */}
                           <div>
                               <label className="block text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                   <PenTool size={12} /> Songwriter
                               </label>
                               <input 
                                    type="text" 
                                    list="songwriters-list"
                                    className="w-full border border-black p-3 font-medium outline-none focus:bg-gray-50" 
                                    placeholder="Songwriter Name" 
                                    value={uploadData.songwriter} 
                                    onChange={e => setUploadData({...uploadData, songwriter: e.target.value})} 
                                />
                                <datalist id="songwriters-list">
                                    {savedProfiles.songwriters.map((name, i) => <option key={i} value={name} />)}
                                </datalist>
                           </div>

                           <button onClick={() => setStep(2)} className="w-full bg-black text-white py-4 font-bold uppercase mt-4">Next: Artwork</button>
                       </div>
                   )}

                   {step === 2 && (
                       <div className="space-y-4 text-center">
                           <div className="w-48 h-48 bg-gray-100 mx-auto border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                               {uploadData.cover ? (
                                   <img src={uploadData.cover} className="w-full h-full object-cover" />
                               ) : (
                                   <div className="text-gray-400 flex flex-col items-center">
                                       <Disc size={32} />
                                       <span className="text-xs font-bold mt-2 uppercase">Upload Art</span>
                                   </div>
                               )}
                               <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageSelect} />
                           </div>
                           
                           {uploading && (
                               <div className="text-xs text-gray-500 font-mono mt-2 animate-pulse">{uploadStatus}</div>
                           )}

                           <button onClick={handleUpload} disabled={uploading} className="w-full bg-black text-white py-4 font-bold uppercase mt-4 flex items-center justify-center gap-2">
                               {uploading ? <Loader2 className="animate-spin" /> : 'Distribute Now'}
                           </button>
                       </div>
                   )}
               </div>
           </div>
       )}
    </div>
  );
};



import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Share2, MoreHorizontal, Plus, Camera, X, PlayCircle, Search, Sticker, Music, Video as VideoIcon, Image as ImageIcon, Disc } from 'lucide-react';
import { Post, Story, VideoPost, Comment } from '../types';
import { clsx } from 'clsx';
import { BryteLogo } from './BryteLogo';

// 4-Sided Star Icon
const Star4Icon = ({ size = 24, filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ff0000" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
);

export const SocialFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'tunes'>('feed');
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [videoPosts, setVideoPosts] = useState<VideoPost[]>([]);
  
  const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);
  
  // Creation Refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const tuneImageInputRef = useRef<HTMLInputElement>(null); // New for Image+Sound Tunes
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [progress, setProgress] = useState(0);

  // Comment Modal State
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [showGifPicker, setShowGifPicker] = useState(false);

  const popularSounds = [
      "Trending Viral Hit - DJ Cool",
      "Summer Vibes 2024 - The Wave",
      "Bryte Original Sound - Producer Kai",
      "Late Night Drive - Lofi Beats",
      "Hype Anthem - Trap Nation"
  ];

  // Story Viewer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (viewingStoryIndex !== null && stories[viewingStoryIndex]) {
        setProgress(0);
        const duration = 5000; // 5 seconds per story
        const step = 50;
        interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    if (viewingStoryIndex < stories.length - 1) {
                        setViewingStoryIndex(viewingStoryIndex + 1);
                        return 0;
                    } else {
                        setViewingStoryIndex(null); 
                        return 100;
                    }
                }
                return prev + (step / duration) * 100;
            });
        }, step);
    }
    return () => clearInterval(interval);
  }, [viewingStoryIndex, stories.length]);

  const handleStoryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
          const newStory: Story = {
              id: Date.now().toString(),
              user: 'You',
              avatar: '', 
              mediaUrl: reader.result as string,
              mediaType: file.type.startsWith('video') ? 'video' : 'image',
              isViewed: false,
              timestamp: Date.now()
          };
          setStories(prev => [newStory, ...prev]);
      };
      reader.readAsDataURL(file);
  };

  const handleCreateContent = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image' | 'tune-image') => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);

      if (type === 'video') {
          // Standard Video Tune
          const newVideo: VideoPost = {
              id: Date.now().toString(),
              user: 'You',
              avatar: '',
              videoUrl: url,
              likes: 0,
              comments: 0,
              caption: 'My new Tune created with Bryte! 🎥',
              type: 'video'
          };
          setVideoPosts(prev => [newVideo, ...prev]);
      } else if (type === 'tune-image') {
          // Image + Popular Sound Tune
          const randomSound = popularSounds[Math.floor(Math.random() * popularSounds.length)];
          const newTune: VideoPost = {
              id: Date.now().toString(),
              user: 'You',
              avatar: '',
              imageUrl: url, // Store as image url
              videoUrl: undefined,
              likes: 0,
              comments: 0,
              caption: `Vibing to ${randomSound} 🎵`,
              type: 'image-audio',
              musicTrack: randomSound
          };
          setVideoPosts(prev => [newTune, ...prev]);
      } else {
          // Standard Feed Post
          const newPost: Post = {
              id: Date.now().toString(),
              user: 'You',
              avatar: '',
              image: url,
              likes: 0,
              caption: 'Just posted from Bryte OS',
              timestamp: new Date().toISOString()
          };
          setPosts(prev => [newPost, ...prev]);
      }
      
      // Cleanup input
      e.target.value = '';
  };

  const handlePostComment = (gifUrl?: string) => {
      if (!commentInput.trim() && !gifUrl) return;
      const newComment: Comment = {
          id: Date.now().toString(),
          user: 'You',
          text: commentInput,
          gifUrl: gifUrl,
          timestamp: Date.now()
      };
      setComments([...comments, newComment]);
      setCommentInput('');
      setShowGifPicker(false);
  };

  // Mock Tenor GIFs for Comments
  const mockGifs = [
      "https://media.tenor.com/m410a8r8o88AAAAC/excited-happy.gif",
      "https://media.tenor.com/15YIPfD8aBMAAAAC/money-pay-me.gif",
      "https://media.tenor.com/Images/Stickers/cool.gif"
  ];

  return (
    <div className="flex flex-col h-full pt-4 pb-20 overflow-y-auto no-scrollbar bg-black text-white relative">
       {/* Header */}
       <div className="px-4 pb-4 flex justify-between items-center border-b border-gray-800 sticky top-0 bg-black/90 backdrop-blur-md z-20">
          <div className="flex gap-4 items-center">
               <button onClick={() => setActiveTab('feed')} className={clsx("font-bold text-lg", activeTab === 'feed' ? "text-white" : "text-gray-500")}>Feed</button>
               <button onClick={() => setActiveTab('tunes')} className={clsx("font-bold text-lg", activeTab === 'tunes' ? "text-white" : "text-gray-500")}>Tunes</button>
          </div>
          <div className="flex gap-4">
            <div className="relative">
                <div className="w-2 h-2 bg-bryte-accent rounded-full absolute top-0 right-0 border border-black z-10"></div>
                <Star4Icon size={24} />
            </div>
          </div>
       </div>

       {/* Creation Inputs */}
       <input 
            type="file" 
            ref={videoInputRef} 
            accept="video/*" 
            capture="environment" 
            className="hidden" 
            onChange={(e) => handleCreateContent(e, 'video')} 
       />
       <input 
            type="file" 
            ref={tuneImageInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => handleCreateContent(e, 'tune-image')} 
       />
       <input 
            type="file" 
            ref={imageInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={(e) => handleCreateContent(e, 'image')} 
       />

       {/* Floating Action Button for Creation */}
       <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3 items-end pointer-events-none">
           <div className="pointer-events-auto flex flex-col gap-3 items-end">
               {activeTab === 'tunes' && (
                   <>
                       <div className="flex items-center gap-2 group">
                           <span className="text-xs font-bold bg-black/80 px-2 py-1 rounded hidden group-hover:block transition-all">Video</span>
                           <button 
                                onClick={() => videoInputRef.current?.click()}
                                className="bg-bryte-accent text-black p-3 rounded-full shadow-lg shadow-bryte-accent/20 hover:scale-110 transition-transform"
                                title="Upload Video"
                           >
                               <VideoIcon size={20} />
                           </button>
                       </div>
                       <div className="flex items-center gap-2 group">
                           <span className="text-xs font-bold bg-black/80 px-2 py-1 rounded hidden group-hover:block transition-all">Image + Sound</span>
                           <button 
                                onClick={() => tuneImageInputRef.current?.click()}
                                className="bg-pink-500 text-white p-3 rounded-full shadow-lg shadow-pink-500/20 hover:scale-110 transition-transform"
                                title="Upload Image over Sound"
                           >
                               <Music size={20} />
                           </button>
                       </div>
                   </>
               )}
               {activeTab === 'feed' && (
                   <button 
                        onClick={() => imageInputRef.current?.click()}
                        className="bg-white text-black p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
                   >
                       <Plus size={24} />
                   </button>
               )}
           </div>
       </div>

       {/* FEED VIEW */}
       {activeTab === 'feed' && (
           <>
                {/* HitTimes (Stories) */}
                <div className="py-4 border-b border-gray-800">
                    <div className="px-4 mb-2 flex justify-between items-center">
                        <span className="font-bold text-sm text-gray-400">HitTimes</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar">
                        <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => storyInputRef.current?.click()}>
                            <div className="w-16 h-16 rounded-full relative bg-gray-800 flex items-center justify-center border-2 border-gray-700">
                            <input type="file" ref={storyInputRef} className="hidden" accept="image/*,video/*" onChange={handleStoryUpload} />
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-black">
                                <Plus size={12} className="text-white" />
                            </div>
                            <span className="text-xs font-bold text-gray-500">You</span>
                            </div>
                        </div>
                        {stories.map((story, idx) => (
                            <div key={story.id} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => setViewingStoryIndex(idx)}>
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 to-yellow-500 p-[2px]">
                                <div className="w-full h-full rounded-full bg-black p-[2px] overflow-hidden">
                                    {story.mediaType === 'image' ? <img src={story.mediaUrl} className="w-full h-full object-cover rounded-full" /> : <video src={story.mediaUrl} className="w-full h-full object-cover rounded-full" />}
                                </div>
                            </div>
                            <span className="text-xs text-gray-500">{story.user}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feed Content */}
                {posts.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 px-10 text-center">
                        <div className="w-20 h-20 border-2 border-gray-800 rounded-full flex items-center justify-center mb-6">
                            <ImageIcon size={32} className="text-gray-600" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">No Posts Yet</h2>
                        <p className="text-gray-500 text-sm mb-6">Share your first beat, money move, or lifestyle photo.</p>
                        <button onClick={() => imageInputRef.current?.click()} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-900/20">Create First Post</button>
                    </div>
                ) : (
                    <div className="space-y-6 p-4">
                        {posts.map(post => (
                            <div key={post.id} className="bg-[#111] rounded-2xl overflow-hidden border border-gray-800">
                                <div className="p-3 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                                    <span className="font-bold text-sm">{post.user}</span>
                                </div>
                                <img src={post.image} className="w-full aspect-square object-cover" />
                                <div className="p-3">
                                    <div className="flex gap-4 mb-2">
                                        <Star4Icon size={24} />
                                        <MessageCircle size={24} />
                                        <Share2 size={24} />
                                    </div>
                                    <p className="text-sm"><span className="font-bold mr-2">{post.user}</span>{post.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
           </>
       )}

       {/* TUNES VIEW (Vertical) */}
       {activeTab === 'tunes' && (
           <div className="flex-1 overflow-y-scroll snap-y snap-mandatory h-[calc(100vh-140px)]">
               {videoPosts.length === 0 ? (
                   <div className="flex-1 flex flex-col items-center justify-center h-full text-center px-8">
                       <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6">
                           <VideoIcon size={32} className="text-gray-600" />
                       </div>
                       <h2 className="text-xl font-bold mb-2">No Tunes Yet</h2>
                       <p className="text-gray-500 text-sm mb-6">Record a video or upload an image with sound to start.</p>
                       <div className="flex gap-2 justify-center">
                            <button onClick={() => videoInputRef.current?.click()} className="bg-bryte-accent text-black font-bold py-3 px-6 rounded-full text-xs">Video</button>
                            <button onClick={() => tuneImageInputRef.current?.click()} className="bg-pink-500 text-white font-bold py-3 px-6 rounded-full text-xs">Image+Sound</button>
                       </div>
                   </div>
               ) : (
                   videoPosts.map(video => (
                       <div key={video.id} className="w-full h-full snap-start relative bg-gray-900 flex items-center justify-center overflow-hidden">
                           {/* Render Video or Image with Sound overlay */}
                           {video.type === 'image-audio' && video.imageUrl ? (
                               <div className="w-full h-full relative">
                                   <img src={video.imageUrl} className="w-full h-full object-cover opacity-80" />
                                   {/* Audio Visualizer Overlay */}
                                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center animate-pulse">
                                            <Disc size={64} className="text-white/80 animate-[spin_3s_linear_infinite]" />
                                        </div>
                                   </div>
                               </div>
                           ) : (
                               <video src={video.videoUrl} loop muted autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                           )}
                           
                           {/* Overlay Info */}
                           <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                               <div className="flex items-center gap-3 mb-2">
                                   <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                                   <span className="font-bold">{video.user}</span>
                                   <button className="text-xs border border-white/30 px-2 py-0.5 rounded-full">Follow</button>
                               </div>
                               <p className="text-sm mb-4">{video.caption}</p>
                               <div className="flex items-center gap-2 text-xs opacity-70">
                                   <Music size={12} className={video.type === 'image-audio' ? "text-pink-400 animate-pulse" : ""} /> 
                                   <span>{video.musicTrack || `Original Audio - ${video.user}`}</span>
                               </div>
                           </div>

                           {/* Side Actions */}
                           <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center">
                               <div className="flex flex-col items-center gap-1">
                                   <Star4Icon size={28} />
                                   <span className="text-xs font-bold">{video.likes}</span>
                               </div>
                               <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setShowComments(video.id)}>
                                   <MessageCircle size={28} />
                                   <span className="text-xs font-bold">{video.comments}</span>
                               </div>
                               <div className="flex flex-col items-center gap-1">
                                   <Share2 size={28} />
                                   <span className="text-xs font-bold">Share</span>
                               </div>
                               {video.type === 'image-audio' && (
                                   <div className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center animate-[spin_4s_linear_infinite]">
                                       <Music size={14} />
                                   </div>
                               )}
                           </div>
                       </div>
                   ))
               )}
           </div>
       )}

       {/* Story Viewer Overlay */}
       {viewingStoryIndex !== null && stories[viewingStoryIndex] && (
           <div className="fixed inset-0 z-50 bg-black flex flex-col">
               <div className="flex gap-1 pt-2 px-2 absolute top-0 w-full z-10">
                   {stories.map((_, idx) => (
                       <div key={idx} className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                           <div className="h-full bg-white transition-all duration-100 linear" style={{ width: idx < viewingStoryIndex ? '100%' : idx === viewingStoryIndex ? `${progress}%` : '0%' }}></div>
                       </div>
                   ))}
               </div>
               <div className="absolute top-4 left-0 w-full p-4 flex justify-between items-center z-10 text-white">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm shadow-black drop-shadow-md">{stories[viewingStoryIndex].user}</span>
                    </div>
                    <button onClick={() => setViewingStoryIndex(null)}><X size={24} /></button>
               </div>
               <div className="flex-1 flex items-center justify-center bg-gray-900">
                   {stories[viewingStoryIndex].mediaType === 'image' ? <img src={stories[viewingStoryIndex].mediaUrl} className="max-w-full max-h-full object-contain" /> : <video src={stories[viewingStoryIndex].mediaUrl} autoPlay className="max-w-full max-h-full" />}
               </div>
           </div>
       )}

       {/* Comments Modal (Tenor Support) */}
       {showComments && (
           <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
               <div className="bg-[#111] w-full h-[60vh] rounded-t-3xl p-4 flex flex-col animate-in slide-in-from-bottom duration-200">
                   <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                       <h3 className="font-bold">Comments</h3>
                       <button onClick={() => setShowComments(null)}><X /></button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                       {comments.map(c => (
                           <div key={c.id} className="flex gap-3">
                               <div className="w-8 h-8 bg-purple-600 rounded-full flex-shrink-0"></div>
                               <div>
                                   <p className="text-sm font-bold text-gray-400">You</p>
                                   {c.text && <p className="text-sm">{c.text}</p>}
                                   {c.gifUrl && <img src={c.gifUrl} className="w-32 rounded-md mt-1" />}
                               </div>
                           </div>
                       ))}
                       {comments.length === 0 && <p className="text-center text-gray-500 text-sm mt-4">No comments yet. Be the first!</p>}
                   </div>

                   {showGifPicker && (
                       <div className="h-24 overflow-x-auto whitespace-nowrap space-x-2 py-2 border-t border-gray-800">
                           {mockGifs.map((gif, i) => (
                               <img key={i} src={gif} className="h-full inline-block rounded cursor-pointer" onClick={() => handlePostComment(gif)} />
                           ))}
                       </div>
                   )}

                   <div className="mt-2 flex items-center gap-2">
                       <input 
                            type="text" 
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Add a comment..." 
                            className="flex-1 bg-gray-900 rounded-full px-4 py-2 text-sm outline-none"
                        />
                        <button onClick={() => setShowGifPicker(!showGifPicker)} className="text-gray-400"><Sticker size={20} /></button>
                        <button onClick={() => handlePostComment()} className="text-blue-500 font-bold text-sm">Post</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};


export enum View {
  HOME = 'HOME',
  FEED = 'FEED',
  STUDIO = 'STUDIO',
  WALLET = 'WALLET',
  DISTRO = 'DISTRO',
  AI = 'AI',
  SETTINGS = 'SETTINGS'
}

export interface Post {
  id: string;
  user: string;
  avatar: string;
  image: string;
  likes: number;
  caption: string;
  verified?: boolean;
  timestamp: string;
}

export interface VideoPost {
  id: string;
  user: string;
  avatar: string;
  videoUrl?: string; // Optional, for video posts
  imageUrl?: string; // For image-audio posts
  likes: number;
  comments: number;
  caption: string;
  type?: 'video' | 'image-audio';
  musicTrack?: string;
}

export interface Comment {
  id: string;
  user: string;
  text?: string;
  gifUrl?: string;
  timestamp: number;
}

export interface Story {
  id: string;
  user: string;
  avatar: string;
  mediaUrl: string; // URL for image or video
  mediaType: 'image' | 'video';
  isViewed: boolean;
  timestamp: number;
}

export interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing' | 'royalty' | 'bonus' | 'ad';
  amount: number;
  date: string;
  description: string;
  status?: 'completed' | 'pending';
}

export interface Track {
  id: string;
  name: string;
  artist: string;
  plays: number;
  revenue: number;
  cover: string;
  status: 'Live' | 'Processing' | 'Approved';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'friend';
  text?: string;
  gifUrl?: string;
  senderName?: string;
  timestamp: number;
  read?: boolean;
}

export interface ChatConversation {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  unread: number;
}

// Studio Types
export type InstrumentType = 'kick' | 'snare' | 'hihat' | 'synth' | 'bsn' | 'sampler';

export interface TrackFX {
  reverb: boolean;
  delay: boolean;
  eq: boolean;
}

export interface SequencerTrack {
  id: string;
  name: string;
  instrument: InstrumentType;
  steps: boolean[]; // 16 steps
  color: string;
  cutItself: boolean;
  volume: number;
  pan: number;
  fx: TrackFX;
  pianoRollData?: { step: number; note: number }[]; // Simple piano roll data
  sampleUrl?: string;
  muted?: boolean;
  solo?: boolean;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'plugin';
  children?: FileNode[];
  isOpen?: boolean;
}
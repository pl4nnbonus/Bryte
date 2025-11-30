
import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Settings2, Plus, Volume2, ArrowLeft, Folder, File, ChevronRight, ChevronDown, Music, Scissors, Loader2, Upload, X, Check, Timer, Download, MousePointer2, Trash2, Mic, Mic2, FileAudio, RotateCcw, RotateCw } from 'lucide-react';
import { AudioEngine } from '../services/audioEngine';
import { SequencerTrack, FileNode } from '../types';
import { clsx } from 'clsx';
import { BryteLogo } from './BryteLogo';

interface StudioViewProps {
  onBack: () => void;
}

interface Note {
  step: number;
  note: number;
}

interface Coord {
  step: number;
  note: number;
}

export const StudioView: React.FC<StudioViewProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeView, setActiveView] = useState<'rack' | 'piano'>('rack');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('1');
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);
  
  // Undo/Redo State
  const [history, setHistory] = useState<SequencerTrack[][]>([]);
  const [redoStack, setRedoStack] = useState<SequencerTrack[][]>([]);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Piano Roll Tools & State
  const [toolMode, setToolMode] = useState<'draw' | 'select'>('draw');
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Note | null>(null);
  const [dragOffset, setDragOffset] = useState<Note>({ step: 0, note: 0 });
  
  // Marquee Selection State
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<Coord | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<Coord | null>(null);

  const engineRef = useRef<AudioEngine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trackFileInputRef = useRef<HTMLInputElement>(null);
  const pianoRollRef = useRef<HTMLDivElement>(null);
  const [targetTrackForFile, setTargetTrackForFile] = useState<string | null>(null);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [studioSettings, setStudioSettings] = useState({
    importUnzipped: true,
    audioPath: '/user/documents/britecook/data',
    vstPath: '/library/audio/plug-ins/vst'
  });

  // File Browser State
  const [browserData, setBrowserData] = useState<FileNode[]>([
    {
      id: 'root-plugins', name: 'Plugin Database', type: 'folder', isOpen: true, children: [
        {
          id: 'bsn-folder', name: 'BSN Plugins', type: 'folder', isOpen: false, children: Array.from({ length: 50 }).map((_, i) => ({
            id: `bsn-${i}`, name: `BSN Preset ${i + 1} - ${['Saw', 'Pluck', 'Bass', 'Lead', 'Pad'][i % 5]}`, type: 'plugin'
          }))
        }
      ]
    },
    {
      id: 'root-packs', name: 'Packs', type: 'folder', isOpen: false, children: [
        { id: 'drums', name: 'Drums', type: 'folder', children: [
            { id: 'kicks', name: 'Kicks', type: 'folder' },
            { id: 'snares', name: 'Snares', type: 'folder' },
            { id: 'hats', name: 'Hats', type: 'folder' }
        ]},
        { id: 'instruments', name: 'Instruments', type: 'folder' }
      ]
    },
    {
      id: 'root-user', name: 'User Imports', type: 'folder', isOpen: true, children: []
    }
  ]);

  // Track State
  const [tracks, setTracks] = useState<SequencerTrack[]>([
    { id: '1', name: 'BSN Lead 1', instrument: 'bsn', steps: new Array(16).fill(false), color: 'bg-green-500', cutItself: false, volume: 1, pan: 0, fx: { reverb: true, delay: false, eq: false }, pianoRollData: [], muted: false, solo: false },
    { id: '2', name: 'KICK', instrument: 'kick', steps: new Array(16).fill(false), color: 'bg-red-500', cutItself: true, volume: 1, pan: 0, fx: { reverb: false, delay: false, eq: true }, pianoRollData: [], muted: false, solo: false },
    { id: '3', name: 'CLAP', instrument: 'snare', steps: new Array(16).fill(false), color: 'bg-orange-500', cutItself: true, volume: 1, pan: 0, fx: { reverb: true, delay: false, eq: false }, pianoRollData: [], muted: false, solo: false },
    { id: '4', name: 'HAT', instrument: 'hihat', steps: new Array(16).fill(false), color: 'bg-blue-400', cutItself: true, volume: 0.8, pan: 0, fx: { reverb: false, delay: false, eq: true }, pianoRollData: [], muted: false, solo: false },
  ]);

  const activeTrack = tracks.find(t => t.id === selectedTrackId);

  // Loading Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return prev + (Math.random() * 10);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Audio Engine Init
  useEffect(() => {
    engineRef.current = new AudioEngine((step) => {
      setCurrentStep(step);
    });
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTracks(tracks);
      engineRef.current.isMetronomeOn = isMetronomeOn;
      engineRef.current.setMasterVolume(masterVolume);
    }
  }, [tracks, isMetronomeOn, masterVolume]);
  
  // Recording Timer
  useEffect(() => {
      let interval: any;
      if (isRecording) {
          interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      } else {
          setRecordingTime(0);
      }
      return () => clearInterval(interval);
  }, [isRecording]);

  // Undo / Redo Logic
  const recordHistory = () => {
    // Deep copy current tracks to history
    const stateSnapshot = JSON.parse(JSON.stringify(tracks));
    setHistory(prev => [...prev, stateSnapshot]);
    setRedoStack([]); // Clear redo stack on new action
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    
    // Push current to redo
    const currentSnapshot = JSON.parse(JSON.stringify(tracks));
    setRedoStack(prev => [...prev, currentSnapshot]);
    
    setTracks(previousState);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    
    // Push current to history
    const currentSnapshot = JSON.parse(JSON.stringify(tracks));
    setHistory(prev => [...prev, currentSnapshot]);
    
    setTracks(nextState);
    setRedoStack(prev => prev.slice(0, -1));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete
      if (activeView === 'piano' && (e.key === 'Delete' || e.key === 'Backspace')) {
        handleDeleteSelected();
      }
      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, selectedNotes, tracks, selectedTrackId, history, redoStack]);

  // Handlers
  const toggleStep = (trackId: string, stepIndex: number) => {
    recordHistory();
    const newTracks = tracks.map(t => {
      if (t.id === trackId) {
        const newSteps = [...t.steps];
        newSteps[stepIndex] = !newSteps[stepIndex];
        return { ...t, steps: newSteps };
      }
      return t;
    });
    setTracks(newTracks);
  };

  const toggleCutItself = (trackId: string) => {
    recordHistory();
    const newTracks = tracks.map(t => {
        if (t.id === trackId) return { ...t, cutItself: !t.cutItself };
        return t;
    });
    setTracks(newTracks);
  };

  const toggleMute = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    recordHistory();
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const toggleSolo = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    recordHistory();
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, solo: !t.solo } : t));
  };

  const toggleEffect = (trackId: string, effect: 'reverb' | 'delay' | 'eq') => {
      recordHistory();
      const newTracks = tracks.map(t => {
          if (t.id === trackId) {
              return { ...t, fx: { ...t.fx, [effect]: !t.fx[effect] } };
          }
          return t;
      });
      setTracks(newTracks);
  };
  
  const handleRecordToggle = async () => {
      if (isRecording) {
          // Stop Recording
          setIsRecording(false);
          if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach(track => track.stop());
              mediaStreamRef.current = null;
          }
          
          recordHistory();
          // Add a mock audio track to signify the take
          const newTrack: SequencerTrack = {
              id: Date.now().toString(),
              name: `Vocal Take ${tracks.length + 1}`,
              instrument: 'synth', // Placeholder instrument
              steps: new Array(16).fill(false),
              color: 'bg-pink-500',
              cutItself: false,
              volume: 1,
              pan: 0,
              fx: { reverb: true, delay: false, eq: true },
              pianoRollData: [{ step: 0, note: 12 }, { step: 4, note: 12 }, { step: 8, note: 12 }],
              muted: false,
              solo: false
          };
          setTracks(prev => [...prev, newTrack]);
      } else {
          // Start Recording - Request Permission
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              mediaStreamRef.current = stream;
              setIsRecording(true);
          } catch (err) {
              console.error("Microphone access denied", err);
              alert("Microphone access is required to record vocals.");
          }
      }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const startY = e.clientY;
      
      const onMove = (moveEvent: MouseEvent) => {
          const deltaY = startY - moveEvent.clientY;
          const sensitivity = 0.005;
          setMasterVolume(prev => Math.max(0, Math.min(1, prev + deltaY * sensitivity)));
      };
      
      const onUp = () => {
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
      };
      
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
  };
  
  const handleAddNewSamplerTrack = () => {
      if (tracks.length >= 24) return; // Limit total tracks
      recordHistory();
      const newTrack: SequencerTrack = {
          id: Date.now().toString(),
          name: `Sampler ${tracks.length + 1}`,
          instrument: 'sampler',
          steps: new Array(16).fill(false),
          color: 'bg-gray-500',
          cutItself: false,
          volume: 0.8,
          pan: 0,
          fx: { reverb: false, delay: false, eq: false },
          pianoRollData: [],
          muted: false,
          solo: false
      };
      setTracks([...tracks, newTrack]);
  };
  
  const handleTrackFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!targetTrackForFile || !e.target.files?.[0]) return;
      
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      
      // Load into audio engine
      if (engineRef.current) {
          engineRef.current.loadSample(url);
      }
      
      recordHistory();
      // Update track
      setTracks(prev => prev.map(t => {
          if (t.id === targetTrackForFile) {
              return { 
                  ...t, 
                  name: file.name.substring(0, 12),
                  sampleUrl: url,
                  instrument: 'sampler'
              };
          }
          return t;
      }));
      
      setTargetTrackForFile(null);
      e.target.value = '';
  };
  
  const openTrackFilePicker = (trackId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setTargetTrackForFile(trackId);
      trackFileInputRef.current?.click();
  };

  // --- Piano Roll Logic ---

  const handleGridMouseDown = (e: React.MouseEvent, step: number, noteVal: number) => {
    if (activeView !== 'piano' || !activeTrack) return;
    
    // Check if clicked on a note
    const existingNote = activeTrack.pianoRollData?.find(n => n.step === step && n.note === noteVal);

    if (existingNote) {
      // Note exists
      const isSelected = selectedNotes.some(n => n.step === step && n.note === noteVal);
      
      if (toolMode === 'select') {
        if (isSelected) {
            // Deselect
            setSelectedNotes(prev => prev.filter(n => !(n.step === step && n.note === noteVal)));
        } else {
            // Select
            setSelectedNotes(prev => [...prev, { step, note: noteVal }]);
        }
      } else {
        // Draw Mode: Clicking existing note selects it for drag (if not already selected)
        if (!isSelected) {
          // Exclusive select in draw mode
          setSelectedNotes([{ step, note: noteVal }]);
        }
        // Start Drag
        setIsDragging(true);
        setDragStart({ step, note: noteVal });
      }
    } else {
      // Empty grid space
      if (toolMode === 'draw') {
        recordHistory(); // Recording history before adding note
        // Add Note
        const newTracks = tracks.map(t => {
            if (t.id === selectedTrackId) {
                const currentNotes = t.pianoRollData || [];
                return { ...t, pianoRollData: [...currentNotes, { step, note: noteVal }] };
            }
            return t;
        });
        setTracks(newTracks);
        // Also select it immediately to allow dragging
        setSelectedNotes([{ step, note: noteVal }]);
        // Prepare drag from this new note
        setIsDragging(true);
        setDragStart({ step, note: noteVal });
      } else if (toolMode === 'select') {
        // START MARQUEE SELECTION
        setIsMarqueeSelecting(true);
        setMarqueeStart({ step, note: noteVal });
        setMarqueeEnd({ step, note: noteVal });
        setSelectedNotes([]);
      }
    }
  };

  const handleGridMouseMove = (e: React.MouseEvent, step: number, noteVal: number) => {
     if (isDragging && dragStart) {
         const dStep = step - dragStart.step;
         const dNote = noteVal - dragStart.note;
         setDragOffset({ step: dStep, note: dNote });
     }
     
     if (isMarqueeSelecting && marqueeStart) {
         setMarqueeEnd({ step, note: noteVal });
         
         // Update selection in real-time
         const minS = Math.min(marqueeStart.step, step);
         const maxS = Math.max(marqueeStart.step, step);
         const minN = Math.min(marqueeStart.note, noteVal);
         const maxN = Math.max(marqueeStart.note, noteVal);
         
         if (activeTrack && activeTrack.pianoRollData) {
             const inBox = activeTrack.pianoRollData.filter(n => 
                 n.step >= minS && n.step <= maxS && n.note >= minN && n.note <= maxN
             );
             setSelectedNotes(inBox);
         }
     }
  };

  const handleGridMouseUp = () => {
      if (isDragging && dragStart && (dragOffset.step !== 0 || dragOffset.note !== 0)) {
          recordHistory(); // Record before applying drag
          
          // Apply changes
          const newTracks = tracks.map(t => {
              if (t.id === selectedTrackId && t.pianoRollData) {
                  // Move all selected notes
                  const newNotes = t.pianoRollData.map(n => {
                      const isSelected = selectedNotes.some(sn => sn.step === n.step && sn.note === n.note);
                      if (isSelected) {
                          let newStep = n.step + dragOffset.step;
                          let newNote = n.note + dragOffset.note;
                          
                          // Bounds check
                          if (newStep < 0) newStep = 0;
                          if (newStep > 15) newStep = 15;
                          if (newNote < 0) newNote = 0;
                          if (newNote > 23) newNote = 23;
                          
                          return { step: newStep, note: newNote };
                      }
                      return n;
                  });
                  return { ...t, pianoRollData: newNotes };
              }
              return t;
          });
          setTracks(newTracks);

          // Update selection coordinates
          setSelectedNotes(prev => prev.map(n => {
              let newStep = n.step + dragOffset.step;
              let newNote = n.note + dragOffset.note;
              if (newStep < 0) newStep = 0;
              if (newStep > 15) newStep = 15;
              if (newNote < 0) newNote = 0;
              if (newNote > 23) newNote = 23;
              return { step: newStep, note: newNote };
          }));
      }

      setIsDragging(false);
      setDragStart(null);
      setDragOffset({ step: 0, note: 0 });
      
      setIsMarqueeSelecting(false);
      setMarqueeStart(null);
      setMarqueeEnd(null);
  };

  const handleDeleteSelected = () => {
      if (selectedNotes.length === 0) return;
      recordHistory();
      const newTracks = tracks.map(t => {
          if (t.id === selectedTrackId && t.pianoRollData) {
              return {
                  ...t,
                  pianoRollData: t.pianoRollData.filter(n => !selectedNotes.some(sn => sn.step === n.step && sn.note === n.note))
              };
          }
          return t;
      });
      setTracks(newTracks);
      setSelectedNotes([]);
  };

  const handlePlay = () => {
    if (engineRef.current) {
      const playing = engineRef.current.togglePlay();
      setIsPlaying(playing);
    }
  };

  const handleExport = () => {
    setIsPlaying(false);
    setExporting(true);
    setExportProgress(0);
    
    // Simulate Rendering Process
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
           clearInterval(interval);
           
           // Trigger Download
           setTimeout(() => {
               setExporting(false);
               const blob = new Blob(["RIFF....WAVEfmt ... data.... (Simulated Audio Content)"], { type: "audio/wav" });
               const url = URL.createObjectURL(blob);
               const a = document.createElement("a");
               a.href = url;
               a.download = `Bryte_Project_${Date.now()}.wav`;
               a.click();
               URL.revokeObjectURL(url);
           }, 500);
           
           return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const toggleFolder = (id: string) => {
    const toggleNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
            if (node.id === id) return { ...node, isOpen: !node.isOpen };
            if (node.children) return { ...node, children: toggleNode(node.children) };
            return node;
        });
    };
    setBrowserData(toggleNode(browserData));
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const name = file.name;
      const isZip = name.endsWith('.zip');
      const isAudio = name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.m4a') || name.endsWith('.mp4');
      
      let newNode: FileNode;

      if (isZip) {
          newNode = {
            id: `import-${Date.now()}`,
            name: name,
            type: 'folder',
            children: [
                { id: `unzip-${Date.now()}-1`, name: 'Kick_01.wav', type: 'file' },
                { id: `unzip-${Date.now()}-2`, name: 'Snare_01.wav', type: 'file' }
            ]
          };
      } else if (isAudio) {
          newNode = {
            id: `import-${Date.now()}`,
            name: name,
            type: 'file'
          };
      } else {
          return; // Unsupported
      }

      const addImport = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
              if (node.id === 'root-user') {
                  return { ...node, children: [...(node.children || []), newNode], isOpen: true };
              }
              return node;
          });
      };
      setBrowserData(addImport(browserData));
  };

  const addPluginTrack = (pluginName: string) => {
      recordHistory();
      const newTrack: SequencerTrack = {
          id: Date.now().toString(),
          name: pluginName.split('-')[0].trim(),
          instrument: 'bsn',
          steps: new Array(16).fill(false),
          color: 'bg-purple-500',
          cutItself: false,
          volume: 0.8,
          pan: 0,
          fx: { reverb: false, delay: false, eq: false },
          pianoRollData: [],
          muted: false,
          solo: false
      };
      setTracks([...tracks, newTrack]);
  };

  // Render Helpers
  const renderBrowserNode = (node: FileNode, depth = 0) => {
    return (
        <div key={node.id}>
            <div 
                className="flex items-center gap-1 py-1 px-2 hover:bg-white/10 cursor-pointer text-xs text-gray-400 select-none"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => node.children ? toggleFolder(node.id) : (node.type === 'plugin' ? addPluginTrack(node.name) : null)}
            >
                {node.children ? (
                    node.isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                ) : <div className="w-3" />}
                
                {node.type === 'folder' && <Folder size={12} className="text-orange-400" />}
                {node.type === 'plugin' && <Settings2 size={12} className="text-green-400" />}
                {node.type === 'file' && <Music size={12} className="text-blue-400" />}
                
                <span className={clsx(node.type === 'plugin' && "text-white")}>{node.name}</span>
            </div>
            {node.isOpen && node.children && (
                <div>{node.children.map(child => renderBrowserNode(child, depth + 1))}</div>
            )}
        </div>
    );
  };

  // Loading Overlay
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
        <BryteLogo className="w-20 h-20 text-[#f5a623] mb-6 animate-pulse" />
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 font-sans text-white">Bryte Studio</h1>
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#f5a623] transition-all duration-100 ease-out" style={{ width: `${loadingProgress}%` }}></div>
        </div>
        <div className="mt-2 text-xs font-mono text-gray-500">{Math.round(loadingProgress)}% LOADING PLUGINS...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1e1f26] text-[#babbc0] font-sans">
      
      {/* Export Overlay */}
      {exporting && (
          <div className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
              <Loader2 size={40} className="text-[#f5a623] animate-spin mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Rendering Audio...</h2>
              <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                   <div className="h-full bg-[#f5a623] transition-all duration-75" style={{ width: `${exportProgress}%` }}></div>
              </div>
              <p className="mt-2 text-xs text-gray-400 font-mono">Exporting Mix to WAV</p>
          </div>
      )}

      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-4 bg-[#292b35] border-b border-black/30 shadow-md relative z-10">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-1 hover:text-white transition"><ArrowLeft size={18} /></button>
            <div className="flex items-center gap-2">
                <BryteLogo className="w-8 h-8 text-[#f5a623]" />
                <div className="text-white font-extrabold text-lg tracking-tight">Bryte <span className="text-white/40 font-normal">Studio</span></div>
            </div>
            <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
            
            {/* Transport */}
            <div className="flex gap-2 items-center">
                <div className="mr-3 flex items-center gap-2 border-r border-white/10 pr-3">
                    {/* MASTER VOLUME KNOB */}
                    <div 
                        onMouseDown={handleVolumeChange}
                        className="w-8 h-8 rounded-full bg-[#1a1c21] border border-white/20 relative cursor-ns-resize group shadow-lg"
                        title="Master Volume"
                    >
                        <div 
                            className="absolute top-1/2 left-1/2 w-1 h-3 bg-[#f5a623] rounded-full origin-bottom"
                            style={{ 
                                transform: `translate(-50%, -50%) rotate(${(masterVolume * 270) - 135}deg)`,
                                bottom: '50%' 
                            }}
                        ></div>
                        <div className="absolute inset-0 rounded-full border border-white/5 group-hover:border-[#f5a623]/50 transition-colors"></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#f5a623]">{Math.round(masterVolume * 100)}%</span>
                </div>
                
                {/* Undo / Redo */}
                <div className="flex items-center gap-1 mr-2">
                    <button 
                        onClick={handleUndo} 
                        disabled={history.length === 0}
                        className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Undo (Ctrl+Z)"
                    >
                        <RotateCcw size={14} className="text-gray-300" />
                    </button>
                    <button 
                        onClick={handleRedo} 
                        disabled={redoStack.length === 0}
                        className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Redo (Ctrl+Y)"
                    >
                        <RotateCw size={14} className="text-gray-300" />
                    </button>
                </div>

                <button 
                  className={clsx("px-4 py-1.5 rounded-md text-black font-bold text-xs uppercase shadow-sm transition-all flex items-center gap-2", isPlaying ? "bg-[#8bd156] brightness-110" : "bg-[#5a5c66] hover:bg-[#8bd156]")}
                  onClick={handlePlay}
                >
                  {isPlaying ? <Square size={12} fill="black" /> : <Play size={12} fill="black" />}
                  <span className="hidden md:inline">{isPlaying ? 'STOP' : 'PLAY'}</span>
                </button>
                <button 
                    className={clsx("px-3 py-1.5 rounded-md font-bold text-xs uppercase shadow-sm transition-all flex items-center gap-2", isRecording ? "bg-red-600 text-white animate-pulse" : "bg-[#5a5c66] text-black/50 hover:bg-red-900 hover:text-white")}
                    onClick={handleRecordToggle}
                    title="Record"
                >
                    <Mic size={14} fill={isRecording ? "currentColor" : "none"} />
                    {isRecording && <span className="text-[8px] min-w-[30px]">{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>}
                </button>
                <button 
                    className={clsx("px-3 py-1.5 rounded-md font-bold text-xs uppercase shadow-sm transition-all flex items-center gap-2", isMetronomeOn ? "bg-[#f5a623] text-black" : "bg-[#5a5c66] text-black/50 hover:bg-[#d4d4d8]")}
                    onClick={() => setIsMetronomeOn(!isMetronomeOn)}
                    title="Metronome"
                >
                    <Timer size={14} />
                    <span className="hidden md:inline">METRO</span>
                </button>
            </div>
            
            <div className="bg-[#141519] px-3 py-1.5 rounded border border-white/5 text-[#f5a623] font-mono text-sm tracking-widest hidden md:block">
                130.00 <span className="text-white/30 text-[10px]">BPM</span>
            </div>
        </div>
        
        <div className="flex gap-2">
             <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-[#33353e] px-3 py-1.5 rounded text-xs font-semibold hover:text-white transition"
             >
                 <Download size={14} /> Export
             </button>
             <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 bg-[#33353e] px-3 py-1.5 rounded text-xs font-semibold hover:text-white transition"
             >
                 <Settings2 size={14} /> Settings
             </button>
             <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-[#33353e] px-3 py-1.5 rounded text-xs font-semibold hover:text-white transition">
                 <Upload size={14} /> Import
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept=".zip,.mp3,.wav,.m4a,.mp4" onChange={handleFileImport} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Browser */}
        <div className="w-64 bg-[#23252d] border-r border-black/30 flex flex-col">
            <div className="p-3 bg-[#2d3039] text-[10px] font-bold text-white/50 uppercase tracking-widest border-b border-white/5 flex justify-between items-center">
                <span>Browser</span>
                <button onClick={() => fileInputRef.current?.click()} title="Quick Import" className="hover:text-white"><Plus size={14} /></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                {browserData.map(node => renderBrowserNode(node))}
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#1e1f26]">
            {/* Toolbar */}
            <div className="bg-[#33353e] px-4 py-2 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white/50 border-b border-black/20 shadow-sm">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveView('rack')}
                        className={clsx("hover:text-white transition-colors pb-1 border-b-2", activeView === 'rack' ? "text-[#f5a623] border-[#f5a623]" : "border-transparent")}
                    >
                        Channel Rack
                    </button>
                    <button 
                        onClick={() => setActiveView('piano')}
                        className={clsx("hover:text-white transition-colors pb-1 border-b-2", activeView === 'piano' ? "text-[#f5a623] border-[#f5a623]" : "border-transparent")}
                    >
                        Piano Roll
                    </button>
                </div>
                
                {activeView === 'piano' && (
                    <div className="flex items-center gap-2">
                         <div className="flex bg-[#23252d] rounded border border-black/20 p-0.5">
                             <button 
                                onClick={() => setToolMode('draw')}
                                title="Draw Mode"
                                className={clsx("p-1 rounded transition-colors", toolMode === 'draw' ? "bg-[#f5a623] text-black" : "text-gray-400 hover:text-white")}
                             >
                                 <Plus size={14} />
                             </button>
                             <button 
                                onClick={() => setToolMode('select')}
                                title="Select Mode"
                                className={clsx("p-1 rounded transition-colors", toolMode === 'select' ? "bg-[#f5a623] text-black" : "text-gray-400 hover:text-white")}
                             >
                                 <MousePointer2 size={14} />
                             </button>
                         </div>

                         {/* New Mic Button in Piano Roll */}
                         <button 
                            onClick={handleRecordToggle}
                            title="Record Audio (New Track)"
                            className={clsx("p-1 rounded transition-colors flex items-center gap-1", isRecording ? "bg-red-600 text-white animate-pulse" : "text-gray-400 hover:text-white")}
                         >
                             <Mic size={14} />
                             {isRecording && <span className="text-[9px]">REC</span>}
                         </button>
                         
                         {selectedNotes.length > 0 && (
                             <button 
                                onClick={handleDeleteSelected}
                                className="text-red-500 hover:text-red-400 p-1"
                                title="Delete Selected"
                             >
                                 <Trash2 size={16} />
                             </button>
                         )}

                         <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
                         
                         {activeTrack && (
                            <div className="text-white/30 flex items-center gap-2">
                                Editing: <span className="text-white bg-black/20 px-2 py-0.5 rounded">{activeTrack.name}</span>
                            </div>
                         )}
                    </div>
                )}
            </div>

            {/* CHANNEL RACK VIEW */}
            {activeView === 'rack' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#1e1f26]">
                    {tracks.map(track => (
                    <div 
                        key={track.id} 
                        onClick={() => setSelectedTrackId(track.id)}
                        className={clsx(
                            "flex items-center bg-[#292b35] rounded-md p-1.5 border transition-all duration-200", 
                            selectedTrackId === track.id ? "ring-1 ring-[#f5a623]/50 bg-[#353842] border-[#f5a623]/30" : "border-black/20"
                        )}
                    >
                        {/* Channel Controls */}
                        <div className="w-64 flex items-center gap-2 px-2 border-r border-black/20 mr-2 relative group">
                            <div className={clsx("w-1 h-full absolute left-0 top-0 bottom-0 rounded-l", track.color)}></div>
                            
                            {/* Mute/Solo */}
                            <div className="flex flex-col gap-[2px] mr-1">
                                <button 
                                    onClick={(e) => toggleMute(track.id, e)}
                                    className={clsx("text-[8px] font-bold w-5 h-3 flex items-center justify-center rounded uppercase", track.muted ? "bg-red-500 text-white" : "bg-black/40 text-gray-500 hover:text-white")}
                                    title="Mute"
                                >M</button>
                                <button 
                                    onClick={(e) => toggleSolo(track.id, e)}
                                    className={clsx("text-[8px] font-bold w-5 h-3 flex items-center justify-center rounded uppercase", track.solo ? "bg-green-500 text-black" : "bg-black/40 text-gray-500 hover:text-white")}
                                    title="Solo"
                                >S</button>
                            </div>

                            {/* FX Toggles */}
                            <div className="flex flex-col gap-[2px] mr-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleEffect(track.id, 'reverb'); }}
                                    className={clsx("text-[8px] font-bold px-1 rounded uppercase", track.fx.reverb ? "bg-blue-500 text-white" : "bg-black/40 text-gray-500")}
                                >REV</button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleEffect(track.id, 'delay'); }}
                                    className={clsx("text-[8px] font-bold px-1 rounded uppercase", track.fx.delay ? "bg-purple-500 text-white" : "bg-black/40 text-gray-500")}
                                >DLY</button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleEffect(track.id, 'eq'); }}
                                    className={clsx("text-[8px] font-bold px-1 rounded uppercase", track.fx.eq ? "bg-yellow-500 text-black" : "bg-black/40 text-gray-500")}
                                >EQ</button>
                            </div>
                            
                            {/* Sample Load Button (for samplers) */}
                            {track.instrument === 'sampler' && (
                                <button 
                                    onClick={(e) => openTrackFilePicker(track.id, e)}
                                    className="p-1 text-gray-500 hover:text-[#f5a623]"
                                    title="Load Sample"
                                >
                                    <Folder size={12} />
                                </button>
                            )}

                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleCutItself(track.id); }}
                                title="Cut Itself"
                                className={clsx("p-1 rounded", track.cutItself ? "bg-red-500/20 text-red-500" : "text-gray-600 hover:text-gray-400")}
                            >
                                <Scissors size={12} />
                            </button>
                            <span className="font-bold text-xs text-[#d9dee6] w-20 truncate cursor-pointer hover:text-white" title={track.name}>{track.name}</span>
                            
                            {/* Visual Knobs */}
                            <div className="flex gap-2 ml-auto">
                                <div className="w-6 h-6 rounded-full border-2 border-gray-600 relative bg-[#222] hover:border-[#f5a623] transition-colors shadow-inner" title="Volume">
                                    <div className="absolute top-1/2 left-1/2 w-2.5 h-[2px] bg-[#d9dee6] -translate-y-1/2 -translate-x-1/2 rotate-45"></div>
                                </div>
                                <div className="w-6 h-6 rounded-full border-2 border-gray-600 relative bg-[#222] hover:border-[#f5a623] transition-colors shadow-inner" title="Pan">
                                    <div className="absolute top-1/2 left-1/2 w-2.5 h-[2px] bg-[#d9dee6] -translate-y-1/2 -translate-x-1/2 -rotate-45"></div>
                                </div>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="flex-1 grid grid-cols-8 gap-1">
                            {track.steps.map((isActive, idx) => (
                                <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); toggleStep(track.id, idx); }}
                                className={clsx(
                                    "h-8 rounded-[2px] border-b-[3px] transition-all relative",
                                    // FL Step Colors: Alternating blocks of 4
                                    idx % 8 < 4 
                                        ? (isActive ? "bg-[#d9dee6] border-[#b0b5bd]" : "bg-[#454752] border-[#2e3038]") 
                                        : (isActive ? "bg-[#d9dee6] border-[#b0b5bd]" : "bg-[#383a42] border-[#25272e]"),
                                    // Playhead
                                    idx === currentStep && isPlaying && "brightness-150 ring-1 ring-[#f5a623] z-10"
                                )}
                                />
                            ))}
                        </div>
                    </div>
                    ))}
                    
                    {/* Add Channel / DrumRoll 7 MAX */}
                    <div className="mt-6 border-t border-dashed border-white/10 pt-4">
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-bold text-[#f5a623] uppercase tracking-widest">DrumRoll 7 MAX</span>
                             <span className="text-[10px] text-gray-500">{tracks.filter(t => t.instrument === 'sampler').length} / 20 Tracks Used</span>
                        </div>
                        <button 
                            onClick={handleAddNewSamplerTrack} 
                            disabled={tracks.length >= 24}
                            className="w-full py-3 flex items-center justify-center gap-2 text-white/50 hover:text-[#f5a623] hover:bg-white/5 transition border-2 border-dashed border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> Add Sampler Track
                        </button>
                    </div>
                    
                    {/* Hidden Input for Track File Loading */}
                    <input type="file" ref={trackFileInputRef} className="hidden" accept="audio/*" onChange={handleTrackFileSelect} />
                </div>
            )}

            {/* PIANO ROLL VIEW */}
            {activeView === 'piano' && activeTrack && (
                <div className="flex-1 bg-[#23252d] relative overflow-hidden flex h-full select-none" onMouseUp={handleGridMouseUp}>
                    {/* Keys */}
                    <div className="w-16 bg-[#1a1c21] flex flex-col border-r border-black/50 overflow-hidden shadow-xl z-10">
                         {Array.from({ length: 24 }).map((_, i) => {
                             // i=0 is top (C5 approx), i=23 is bottom (C3 approx)
                             const noteInOctave = (23 - i) % 12; // Invert so low notes are at bottom
                             const isBlack = [1, 3, 6, 8, 10].includes(noteInOctave);
                             const isC = noteInOctave === 0;
                             
                             return (
                                 <div key={i} className={clsx(
                                     "flex-1 border-b border-black/30 relative flex items-center justify-end pr-1 transition-colors hover:bg-[#f5a623]/20", 
                                     isBlack ? "bg-black text-gray-700" : "bg-white text-gray-400"
                                  )}>
                                     {isC && <span className="text-[9px] font-bold text-[#f5a623]">C{Math.floor((23-i)/12) + 3}</span>}
                                 </div>
                             )
                         })}
                    </div>
                    
                    {/* Grid Area */}
                    <div 
                        className="flex-1 bg-[#282a33] flex flex-col overflow-auto relative cursor-crosshair"
                        ref={pianoRollRef}
                    >
                        {Array.from({ length: 24 }).map((_, rowIdx) => (
                             <div key={rowIdx} className="flex-1 flex border-b border-white/5">
                                 {Array.from({ length: 16 }).map((_, colIdx) => {
                                     const noteVal = 23 - rowIdx; // Match key index
                                     
                                     // Check if this cell is part of the "ghost" drag preview
                                     let isGhost = false;
                                     if (isDragging && dragOffset) {
                                         // Check if any selected note would move here
                                         isGhost = selectedNotes.some(n => 
                                            (n.step + dragOffset.step) === colIdx && 
                                            (n.note + dragOffset.note) === noteVal
                                         );
                                     }
                                     
                                     // Check marquee highlight
                                     let isMarqueeHighlighted = false;
                                     if (isMarqueeSelecting && marqueeStart && marqueeEnd) {
                                         const minS = Math.min(marqueeStart.step, marqueeEnd.step);
                                         const maxS = Math.max(marqueeStart.step, marqueeEnd.step);
                                         const minN = Math.min(marqueeStart.note, marqueeEnd.note);
                                         const maxN = Math.max(marqueeStart.note, marqueeEnd.note);
                                         
                                         if (colIdx >= minS && colIdx <= maxS && noteVal >= minN && noteVal <= maxN) {
                                             isMarqueeHighlighted = true;
                                         }
                                     }

                                     const hasNote = activeTrack.pianoRollData?.some(n => {
                                        // If dragging, hide original note IF it's selected (it's moving as a ghost)
                                        if (isDragging && selectedNotes.some(sn => sn.step === n.step && sn.note === n.note)) {
                                            return false; 
                                        }
                                        return n.step === colIdx && n.note === noteVal;
                                     });

                                     const isSelected = selectedNotes.some(n => n.step === colIdx && n.note === noteVal);
                                     const isBeat = colIdx % 4 === 0;

                                     return (
                                         <div 
                                            key={colIdx} 
                                            onMouseDown={(e) => handleGridMouseDown(e, colIdx, noteVal)}
                                            onMouseMove={(e) => handleGridMouseMove(e, colIdx, noteVal)}
                                            className={clsx(
                                                "flex-1 border-r border-white/5 relative hover:bg-white/5 transition-colors",
                                                isBeat && "border-r-white/10 bg-black/10",
                                                isMarqueeHighlighted && "bg-blue-500/20"
                                            )}
                                         >
                                             {/* Note Block */}
                                             {(hasNote || isGhost) && (
                                                 <div className={clsx(
                                                     "absolute inset-[2px] rounded-[2px] shadow-sm border border-black/20",
                                                     isGhost ? "bg-white/50 animate-pulse" : activeTrack.color,
                                                     isSelected && !isGhost && "ring-2 ring-white z-20"
                                                 )}></div>
                                             )}
                                             
                                             {/* Playhead in Piano Roll */}
                                             {colIdx === currentStep && isPlaying && (
                                                 <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-[#f5a623] z-20 shadow-[0_0_10px_#f5a623] pointer-events-none"></div>
                                             )}
                                         </div>
                                     );
                                 })}
                             </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Settings Modal */}
        {showSettings && (
            <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#292b35] w-full max-w-md border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="bg-[#1e1f26] p-4 flex justify-between items-center border-b border-black/50">
                        <h2 className="text-[#f5a623] font-bold tracking-widest text-lg">SETTINGS</h2>
                        <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 space-y-6 text-sm text-[#d9dee6]">
                        {/* Option 1 */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold">Scan Unzipped Folders</h3>
                                <p className="text-xs text-gray-500">Automatically import unzipped drum kits found in user directory.</p>
                            </div>
                            <button 
                                onClick={() => setStudioSettings(s => ({ ...s, importUnzipped: !s.importUnzipped }))}
                                className={clsx("w-10 h-5 rounded-full relative transition-colors", studioSettings.importUnzipped ? "bg-[#f5a623]" : "bg-gray-700")}
                            >
                                <div className={clsx("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", studioSettings.importUnzipped ? "left-6" : "left-1")}></div>
                            </button>
                        </div>

                        {/* Option 2 */}
                        <div className="space-y-2">
                             <h3 className="font-bold">User Data Path</h3>
                             <div className="flex gap-2">
                                 <input 
                                    type="text" 
                                    value={studioSettings.audioPath}
                                    onChange={(e) => setStudioSettings(s => ({ ...s, audioPath: e.target.value }))}
                                    className="flex-1 bg-[#141519] border border-white/10 rounded px-3 py-2 text-xs font-mono text-gray-400 focus:text-white focus:border-[#f5a623] outline-none" 
                                 />
                                 <button className="bg-[#33353e] p-2 rounded hover:bg-white/10"><Folder size={16} /></button>
                             </div>
                        </div>

                        {/* Option 3 */}
                        <div className="space-y-2">
                             <h3 className="font-bold">VST Plugin Custom Path</h3>
                             <div className="flex gap-2">
                                 <input 
                                    type="text" 
                                    value={studioSettings.vstPath}
                                    onChange={(e) => setStudioSettings(s => ({ ...s, vstPath: e.target.value }))}
                                    className="flex-1 bg-[#141519] border border-white/10 rounded px-3 py-2 text-xs font-mono text-gray-400 focus:text-white focus:border-[#f5a623] outline-none" 
                                 />
                                 <button className="bg-[#33353e] p-2 rounded hover:bg-white/10"><Folder size={16} /></button>
                             </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-[#1e1f26] p-4 flex justify-end">
                        <button 
                            onClick={() => setShowSettings(false)}
                            className="bg-[#f5a623] text-black font-bold px-6 py-2 rounded text-xs hover:brightness-110 flex items-center gap-2"
                        >
                            <Check size={14} /> Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

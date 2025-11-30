

// Simple synth engine for the Studio
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentStep: number = 0;
  private tempo: number = 130; // Updated default BPM
  private nextNoteTime: number = 0;
  private timerID: number | undefined;
  private scheduleAheadTime: number = 0.1;
  private lookahead: number = 25.0;
  private tracks: any[] = [];
  private onStepChange: (step: number) => void;
  
  // Metronome
  public isMetronomeOn: boolean = false;
  
  // Master Volume
  private masterGainNode: GainNode | null = null;
  public masterVolume: number = 0.8;

  // Global Reverb Buffer (generated once)
  private reverbBuffer: AudioBuffer | null = null;
  
  // Sample Cache
  private sampleCache: Map<string, AudioBuffer> = new Map();

  constructor(onStepChange: (step: number) => void) {
    this.onStepChange = onStepChange;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create Master Gain
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.value = this.masterVolume;
      this.masterGainNode.connect(this.ctx.destination);

      this.reverbBuffer = this.createReverbImpulse(2.0);
    }
  }
  
  async loadSample(url: string): Promise<AudioBuffer | null> {
      if (!this.ctx) this.init();
      if (this.sampleCache.has(url)) return this.sampleCache.get(url)!;

      try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
          this.sampleCache.set(url, audioBuffer);
          return audioBuffer;
      } catch (e) {
          console.error("Failed to load sample:", url, e);
          return null;
      }
  }

  setMasterVolume(volume: number) {
      this.masterVolume = Math.max(0, Math.min(1, volume));
      if (this.masterGainNode && this.ctx) {
          this.masterGainNode.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      }
  }

  // Generate synthetic impulse response for reverb
  private createReverbImpulse(duration: number): AudioBuffer {
    const rate = this.ctx!.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx!.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        // Exponential decay noise
        const n = i / length;
        const decay = Math.pow(1 - n, 3); 
        left[i] = (Math.random() * 2 - 1) * decay;
        right[i] = (Math.random() * 2 - 1) * decay;
    }
    return impulse;
  }

  setTracks(tracks: any[]) {
    this.tracks = tracks;
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.tempo;
    this.nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
    this.currentStep++;
    if (this.currentStep === 16) {
      this.currentStep = 0;
    }
  }

  private scheduleNote(stepNumber: number, time: number) {
    // Notify UI
    setTimeout(() => this.onStepChange(stepNumber), (time - this.ctx!.currentTime) * 1000);

    // Metronome (Quarter notes: 0, 4, 8, 12)
    if (this.isMetronomeOn && stepNumber % 4 === 0) {
        this.playMetronomeClick(time, stepNumber === 0);
    }

    // Determine if any track is soloed
    const isAnySolo = this.tracks.some(t => t.solo);

    this.tracks.forEach(track => {
      // Mute/Solo Logic
      // If any track is soloed, this track plays ONLY if it is soloed.
      // If no track is soloed, this track plays ONLY if it is NOT muted.
      const shouldPlay = isAnySolo ? track.solo : !track.muted;
      
      if (!shouldPlay) return;

      // Check Step Sequencer
      if (track.steps[stepNumber]) {
        this.playSound(track, time);
      }
      // Check Piano Roll (Simple implementation: if a note exists at this step)
      if (track.pianoRollData) {
        const note = track.pianoRollData.find((n: any) => n.step === stepNumber);
        if (note) {
           this.playSound(track, time, note.note);
        }
      }
    });
  }

  private playMetronomeClick(time: number, isDownbeat: boolean) {
      if (!this.ctx || !this.masterGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      // Connect metronome to master
      gain.connect(this.masterGainNode);
      
      osc.frequency.setValueAtTime(isDownbeat ? 1000 : 800, time);
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      
      osc.start(time);
      osc.stop(time + 0.05);
  }

  private playSound(track: any, time: number, pitchOffset: number = 0) {
    if (!this.ctx || !this.masterGainNode) return;
    
    // 1. Source Setup
    let sourceNode: AudioScheduledSourceNode | null = null;
    
    // Check for Sampler
    if (track.sampleUrl && this.sampleCache.has(track.sampleUrl)) {
        const buffer = this.sampleCache.get(track.sampleUrl)!;
        const src = this.ctx.createBufferSource();
        src.buffer = buffer;
        // Pitch/Rate change based on note
        // Default middle C is 0 offset. 
        if (pitchOffset !== 0) {
            src.playbackRate.value = Math.pow(2, pitchOffset / 12);
        }
        sourceNode = src;
    } else {
        // Fallback / Synth
        const osc = this.ctx.createOscillator();
        sourceNode = osc;
    }

    const gain = this.ctx.createGain(); // Envelope gain

    // 2. FX Chain Setup
    let inputNode: AudioNode = gain;

    // EQ (Simple High Shelf boost)
    if (track.fx?.eq) {
        const eq = this.ctx.createBiquadFilter();
        eq.type = 'highshelf';
        eq.frequency.value = 3000;
        eq.gain.value = 10;
        inputNode.connect(eq);
        inputNode = eq;
    }

    // Delay
    if (track.fx?.delay) {
        const delay = this.ctx.createDelay();
        delay.delayTime.value = 0.3; // 300ms
        const delayGain = this.ctx.createGain();
        delayGain.gain.value = 0.4;
        
        // Simple feed forward for simplicity in this chain
        inputNode.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(this.masterGainNode); // Delay wet goes to master
    }

    // Reverb
    if (track.fx?.reverb && this.reverbBuffer) {
        const conv = this.ctx.createConvolver();
        conv.buffer = this.reverbBuffer;
        const revGain = this.ctx.createGain();
        revGain.gain.value = 0.5; // Wet level

        inputNode.connect(conv);
        conv.connect(revGain);
        revGain.connect(this.masterGainNode); // Reverb wet goes to master
    }

    // Dry Signal
    inputNode.connect(this.masterGainNode); // Dry signal goes to master

    // 3. Sound Synthesis / Playback
    sourceNode.connect(gain);

    const instrument = track.instrument;
    
    // Synth handling
    if (!track.sampleUrl && sourceNode instanceof OscillatorNode) {
        const osc = sourceNode;
        if (instrument === 'kick') {
          osc.frequency.setValueAtTime(150, time);
          osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
          gain.gain.setValueAtTime(1 * track.volume, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        } else if (instrument === 'snare') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(100, time);
          gain.gain.setValueAtTime(0.5 * track.volume, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        } else if (instrument === 'hihat') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, time);
          gain.gain.setValueAtTime(0.3 * track.volume, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
        } else if (instrument === 'bsn' || instrument === 'synth') {
          const seed = track.name.length;
          osc.type = seed % 2 === 0 ? 'sawtooth' : 'square';
          const baseFreq = 261.63 * Math.pow(2, pitchOffset / 12);
          osc.frequency.setValueAtTime(baseFreq, time);
          gain.gain.setValueAtTime(0.4 * track.volume, time);
          gain.gain.linearRampToValueAtTime(0, time + 0.4);
        }
    } else {
        // Sampler handling
        gain.gain.setValueAtTime(1 * track.volume, time);
        // Simple decay to prevent clicking if sample is long
        gain.gain.linearRampToValueAtTime(0, time + 2.0);
    }

    sourceNode.start(time);
    sourceNode.stop(time + 2.0); // Stop after 2s max for now
  }

  private scheduler() {
    while (this.nextNoteTime < this.ctx!.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = window.setTimeout(this.scheduler.bind(this), this.lookahead);
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      if (!this.ctx) this.init();
      if (this.ctx?.state === 'suspended') this.ctx.resume();
      this.currentStep = 0;
      this.nextNoteTime = this.ctx!.currentTime;
      this.scheduler();
    } else {
      window.clearTimeout(this.timerID);
    }
    return this.isPlaying;
  }
}
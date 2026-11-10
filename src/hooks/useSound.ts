import { createContext, createElement, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type NoiseKind = "flip" | "rustle";

function noiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function playNoise(
  context: AudioContext,
  options: { seconds: number; frequency: number; type: BiquadFilterType; gain: number },
): void {
  const source = context.createBufferSource();
  source.buffer = noiseBuffer(context, options.seconds);
  const filter = context.createBiquadFilter();
  filter.type = options.type;
  filter.frequency.value = options.frequency;
  const gain = context.createGain();
  const now = context.currentTime;
  gain.gain.setValueAtTime(options.gain, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + options.seconds);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start();
  source.stop(now + options.seconds);
}

export function useSound() {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<AudioBufferSourceNode | null>(null);
  const enabledRef = useRef(false);

  function context(): AudioContext {
    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }
    return contextRef.current;
  }

  function stopAmbient(): void {
    ambientRef.current?.stop();
    ambientRef.current = null;
  }

  function startAmbient(): void {
    stopAmbient();
    const audio = context();
    void audio.resume();
    const source = audio.createBufferSource();
    source.buffer = noiseBuffer(audio, 2);
    source.loop = true;
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    const gain = audio.createGain();
    gain.gain.value = 0.012;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    source.start();
    ambientRef.current = source;
  }

  function toggle(): void {
    const next = !enabledRef.current;
    enabledRef.current = next;
    setEnabled(next);
    if (next) startAmbient();
    else stopAmbient();
  }

  function play(kind: NoiseKind): void {
    if (!enabledRef.current) return;
    const audio = context();
    void audio.resume();
    if (kind === "flip") {
      playNoise(audio, { seconds: 0.12, frequency: 1800, type: "bandpass", gain: 0.07 });
      return;
    }
    playNoise(audio, { seconds: 0.32, frequency: 900, type: "lowpass", gain: 0.045 });
  }

  useEffect(() => {
    return () => {
      ambientRef.current?.stop();
      void contextRef.current?.close();
    };
  }, []);

  return { enabled, toggle, play };
}

type SoundApi = {
  enabled: boolean;
  toggle: () => void;
  play: (kind: NoiseKind) => void;
};

const fallbackSound: SoundApi = {
  enabled: false,
  toggle: () => undefined,
  play: () => undefined,
};

const SoundContext = createContext(fallbackSound);

export function SoundProvider({ children }: { children: ReactNode }) {
  const sound = useSound();
  return createElement(SoundContext.Provider, { value: sound }, children);
}

export function useSiteSound() {
  return useContext(SoundContext);
}

"use client";

import { useEffect, useRef, useState } from "react";

const TRACKS = [
  {
    id: "cybernetic-pulse",
    title: "Cybernetic Pulse",
    artist: "Hyper-Glitch Unit",
    bpm: 128,
    energy: 1,
    summary: "Quarter-note control drill with a heavy club pocket.",
    colorA: "#d394ff",
    colorB: "#00fbfb",
  },
  {
    id: "neon-horizon",
    title: "Neon Horizon",
    artist: "Retro-Future Syndicate",
    bpm: 142,
    energy: 2,
    summary: "Fast-reactive loop for tighter timing windows and less forgiveness.",
    colorA: "#ff8cb5",
    colorB: "#d394ff",
  },
  {
    id: "kinetic-flow",
    title: "Kinetic Flow",
    artist: "Velocity Zero",
    bpm: 110,
    energy: 1,
    summary: "Slower groove that exposes drift and trains internal timing.",
    colorA: "#69fd5d",
    colorB: "#00fbfb",
  },
];

const WINDOWS = [
  { rating: "PERFECT", max: 50, points: 1000, streak: 1 },
  { rating: "GREAT", max: 100, points: 500, streak: 1 },
  { rating: "GOOD", max: 150, points: 200, streak: 0 },
];
const MAX_HIT_WINDOW_MS = 150;
const SOUND_SOURCES = ["Click", "Kick", "Snare", "Hi-Hat", "Drum Kit"];
const GROOVE_LIBRARY = [
  {
    level: 1,
    name: "Four On The Floor",
    source: "House",
    pattern: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    level: 2,
    name: "Half-Time Gaps",
    source: "Hip-Hop",
    pattern: [0, 2, 4, 6],
  },
  {
    level: 3,
    name: "Son Clave",
    source: "Afro-Cuban",
    pattern: [0, 1.5, 3, 4.5, 6],
  },
  {
    level: 4,
    name: "Billie Jean Pulse",
    source: "Pop",
    pattern: [0, 1.5, 2, 3, 4, 5.5, 6, 7],
  },
  {
    level: 5,
    name: "Funky Drummer",
    source: "Breakbeat",
    pattern: [0, 1, 1.5, 2.5, 3, 4, 5, 5.5, 6.5, 7],
  },
  {
    level: 6,
    name: "Amen Break",
    source: "Jungle",
    pattern: [0, 0.75, 1, 1.5, 2.25, 2.5, 3, 4, 4.75, 5, 5.5, 6.25, 6.5, 7, 7.25, 7.5],
  },
  {
    level: 7,
    name: "Apache Roll",
    source: "Old School Break",
    pattern: [0, 0.5, 1, 2.5, 3, 4, 4.5, 5.5, 6.5, 7],
  },
  {
    level: 8,
    name: "Purdie Shuffle",
    source: "Shuffle",
    pattern: [0, 0.66, 2, 2.66, 4, 4.66, 6, 6.66],
  },
  {
    level: 9,
    name: "Dembow Drive",
    source: "Reggaeton",
    pattern: [0, 1.5, 2, 3, 4, 5.5, 6, 6.75, 7],
  },
  {
    level: 10,
    name: "Hyper Sync",
    source: "Footwork",
    pattern: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5],
  },
];

const TEST_LEVELS = GROOVE_LIBRARY.map((groove) => groove.level);

function getGroove(level) {
  return GROOVE_LIBRARY[Math.min(Math.max(level, 1), GROOVE_LIBRARY.length) - 1];
}

function getPattern(level) {
  return getGroove(level).pattern;
}

function getPatternName(level) {
  return getGroove(level).name;
}

function getPatternSource(level) {
  return getGroove(level).source;
}

function scoreTap(tapTime, targetTime) {
  const offset = tapTime - targetTime;
  const absolute = Math.abs(offset);
  const window = WINDOWS.find((item) => absolute <= item.max);

  if (!window) {
    return { rating: "MISS", offset, absolute, points: 0, streak: 0, success: false };
  }

  return {
    rating: window.rating,
    offset,
    absolute,
    points: window.points,
    streak: window.streak,
    success: true,
  };
}

function averageOffset(history) {
  if (!history.length) return 0;
  return Math.round(history.reduce((sum, value) => sum + Math.abs(value), 0) / history.length);
}

function formatOffset(value) {
  const rounded = Math.round(value);
  if (rounded === 0) return "0ms";
  return `${rounded > 0 ? "+" : ""}${rounded}ms`;
}

function accuracyRate(history) {
  if (!history.length) return 0;
  return Math.max(0, Math.min(100, Math.round(100 - (averageOffset(history) / 150) * 100)));
}

function buildTraceSeries(trace, width, height, maxOffset = 150) {
  if (!trace.length) {
    return { lineSegments: [], hitDots: [], missMarkers: [] };
  }

  const centerY = height / 2;
  const amplitude = height / 2 - 12;
  const stepX = trace.length > 1 ? width / (trace.length - 1) : width / 2;
  const lineSegments = [];
  const hitDots = [];
  const missMarkers = [];
  let currentSegment = [];

  for (let index = 0; index < trace.length; index += 1) {
    const entry = trace[index];
    const x = trace.length > 1 ? index * stepX : width / 2;

    if (!entry.success) {
      if (currentSegment.length) {
        lineSegments.push(currentSegment.join(" "));
        currentSegment = [];
      }
      missMarkers.push({ x, y: centerY });
      continue;
    }

    const clamped = Math.max(-maxOffset, Math.min(maxOffset, entry.offset));
    const y = centerY - (clamped / maxOffset) * amplitude;
    currentSegment.push(`${x},${y}`);
    hitDots.push({ x, y, key: `${entry.absoluteBeat}-${entry.offset}` });
  }

  if (currentSegment.length) {
    lineSegments.push(currentSegment.join(" "));
  }

  return { lineSegments, hitDots, missMarkers };
}

function getPatternForSession(level) {
  return getPattern(level);
}

function getCueBeats(phase, phasePhrases, beatsPerPhrase, pattern) {
  if (phase === "GET_READY") {
    const cues = [];
    for (let phrase = 0; phrase < phasePhrases; phrase += 1) {
      for (const patternBeat of pattern) {
        cues.push(phrase * beatsPerPhrase + patternBeat);
      }
    }
    return cues.sort((left, right) => left - right);
  }

  if (phase === "LISTEN" || phase === "TAP") {
    const cues = [];
    for (let phrase = 0; phrase < phasePhrases; phrase += 1) {
      for (const patternBeat of pattern) {
        cues.push(phrase * beatsPerPhrase + patternBeat);
      }
    }
    return cues.sort((left, right) => left - right);
  }

  if (phase === "COUNT_IN") {
    return Array.from({ length: phasePhrases * beatsPerPhrase }, (_, beat) => beat);
  }

  return [];
}

function getTapTargets(phasePhrases, beatsPerPhrase, pattern, phaseStart, beatDuration) {
  const targets = [];
  for (let phrase = 0; phrase < phasePhrases; phrase += 1) {
    for (const patternBeat of pattern) {
      const absoluteBeat = phrase * beatsPerPhrase + patternBeat;
      targets.push({
        absoluteBeat,
        targetBeat: patternBeat,
        time: phaseStart + absoluteBeat * beatDuration,
        judged: false,
      });
    }
  }
  return targets.sort((left, right) => left.time - right.time);
}

export default function SonicKineticApp() {
  const beatsPerPhrase = 8;
  const listenPhrases = 1;
  const getReadyPhrases = 1;
  const tapPhrases = 4;

  const [route, setRoute] = useState("home");
  const [phase, setPhase] = useState("IDLE");
  const [selectedTrackId, setSelectedTrackId] = useState(TRACKS[0].id);
  const [bpmOverride, setBpmOverride] = useState(null);
  const [difficulty, setDifficulty] = useState(1);
  const [trackTestLevel, setTrackTestLevel] = useState(1);
  const [soundSource, setSoundSource] = useState("Drum Kit");
  const [queuedSession, setQueuedSession] = useState(null);
  const [successLoops, setSuccessLoops] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [lastHit, setLastHit] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isBeatActive, setIsBeatActive] = useState(false);
  const [isPadPressed, setIsPadPressed] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [countdownBeat, setCountdownBeat] = useState(null);
  const [resultsSummary, setResultsSummary] = useState({ expected: 0, hit: 0, missed: 0 });
  const [resultsTrace, setResultsTrace] = useState([]);

  const targetPattern = getPatternForSession(difficulty);
  const patternName = getPatternName(difficulty);
  const patternSource = getPatternSource(difficulty);
  const selectedTrack = TRACKS.find((track) => track.id === selectedTrackId) ?? TRACKS[0];
  const bpm = bpmOverride ?? selectedTrack.bpm;

  const audioContextRef = useRef(null);
  const audioBusRef = useRef(null);
  const noiseBufferRef = useRef(null);
  const animationRef = useRef(null);
  const phaseTimeoutRef = useRef(null);
  const engineRef = useRef(null);

  function cleanupLoop() {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    if (audioBusRef.current) {
      audioBusRef.current.disconnect();
      audioBusRef.current = null;
    }
    engineRef.current = null;
  }

  async function ensureAudio() {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioContextRef.current = new Ctx();
    }

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    setAudioReady(audioContextRef.current.state === "running");
    return audioContextRef.current;
  }

  function ensureNoiseBuffer(audioContext) {
    if (noiseBufferRef.current) return noiseBufferRef.current;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.2, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    noiseBufferRef.current = buffer;
    return buffer;
  }

  function playClick(audioContext, outputNode, when, emphasis) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = emphasis ? "triangle" : "sine";
    osc.frequency.value = emphasis ? 1200 : 860;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(emphasis ? 0.12 : 0.08, when + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
    osc.connect(gain);
    gain.connect(outputNode);
    osc.start(when);
    osc.stop(when + 0.08);
  }

  function playKick(audioContext, outputNode, when, emphasis) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(emphasis ? 150 : 120, when);
    osc.frequency.exponentialRampToValueAtTime(42, when + 0.12);
    gain.gain.setValueAtTime(emphasis ? 0.9 : 0.7, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
    osc.connect(gain);
    gain.connect(outputNode);
    osc.start(when);
    osc.stop(when + 0.2);
  }

  function playSnare(audioContext, outputNode, when) {
    const noise = audioContext.createBufferSource();
    noise.buffer = ensureNoiseBuffer(audioContext);
    const noiseFilter = audioContext.createBiquadFilter();
    const noiseGain = audioContext.createGain();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1400;
    noiseGain.gain.setValueAtTime(0.42, when);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, when + 0.11);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(outputNode);
    noise.start(when);
    noise.stop(when + 0.12);

    const tone = audioContext.createOscillator();
    const toneGain = audioContext.createGain();
    tone.type = "triangle";
    tone.frequency.setValueAtTime(180, when);
    toneGain.gain.setValueAtTime(0.18, when);
    toneGain.gain.exponentialRampToValueAtTime(0.001, when + 0.08);
    tone.connect(toneGain);
    toneGain.connect(outputNode);
    tone.start(when);
    tone.stop(when + 0.09);
  }

  function playHat(audioContext, outputNode, when, emphasis) {
    const noise = audioContext.createBufferSource();
    noise.buffer = ensureNoiseBuffer(audioContext);
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    filter.type = "highpass";
    filter.frequency.value = emphasis ? 9000 : 7000;
    gain.gain.setValueAtTime(emphasis ? 0.18 : 0.1, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + (emphasis ? 0.08 : 0.04));
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(outputNode);
    noise.start(when);
    noise.stop(when + 0.09);
  }

  function playCue(audioContext, outputNode, when, cueBeat, sessionSource) {
    const phrasePosition = cueBeat % beatsPerPhrase;
    const downbeat = phrasePosition === 0 || phrasePosition === 4;

    if (sessionSource === "Kick") {
      playKick(audioContext, outputNode, when, downbeat);
      return;
    }
    if (sessionSource === "Snare") {
      playSnare(audioContext, outputNode, when);
      return;
    }
    if (sessionSource === "Hi-Hat") {
      playHat(audioContext, outputNode, when, downbeat);
      return;
    }
    if (sessionSource === "Drum Kit") {
      if (downbeat) {
        playKick(audioContext, outputNode, when, true);
      } else if (phrasePosition === 2 || phrasePosition === 6) {
        playSnare(audioContext, outputNode, when);
      } else {
        playHat(audioContext, outputNode, when, false);
      }
      return;
    }

    playClick(audioContext, outputNode, when, downbeat);
  }

  function pushResolvedHit(engine, result, target) {
    target.judged = true;
    engine.hits.push({
      ...result,
      absoluteBeat: target.absoluteBeat,
      targetBeat: target.targetBeat,
    });

    setLastHit(result);
    setHistory((current) => [...current, result.offset]);
    setScore((current) => current + result.points);
    setStreak((current) => {
      const next = result.success && result.streak > 0 ? current + 1 : result.success ? current : 0;
      setBestStreak((best) => Math.max(best, next));
      return next;
    });
  }

  function resolveSessionBpm(trackIdOverride) {
    if (bpmOverride !== null) return bpmOverride;
    const trackForSession = TRACKS.find((track) => track.id === (trackIdOverride ?? selectedTrackId)) ?? TRACKS[0];
    return trackForSession.bpm;
  }

  async function startEngine(nextPhase, phasePhrases, sessionPattern, sessionBpm, onComplete) {
    cleanupLoop();

    const beatDuration = 60000 / sessionBpm;
    const totalBeats = phasePhrases * beatsPerPhrase;
    const phaseLeadInMs = 60;
    const phaseStart = performance.now() + phaseLeadInMs;

    engineRef.current = {
      phase: nextPhase,
      phaseStart,
      beatDuration,
      totalBeats,
      beatsPerPhrase,
      pattern: sessionPattern,
      cueBeats: getCueBeats(nextPhase, phasePhrases, beatsPerPhrase, sessionPattern),
      targets: [],
      hits: [],
    };

    if (nextPhase === "TAP") {
      engineRef.current.targets = getTapTargets(phasePhrases, beatsPerPhrase, sessionPattern, phaseStart, beatDuration);
    }

    setPhase(nextPhase);
    setRoute("play");
    setLastHit(null);
    setMarkers([]);
    setCountdownBeat(nextPhase === "GET_READY" ? phasePhrases * beatsPerPhrase : null);

    const audio = await ensureAudio();
    let outputNode = null;

    if (audio) {
      outputNode = audio.createGain();
      outputNode.gain.value = 1;
      outputNode.connect(audio.destination);
      audioBusRef.current = outputNode;

      const audioStart = audio.currentTime + phaseLeadInMs / 1000;
      for (const cueBeat of engineRef.current.cueBeats) {
        const cueTime = audioStart + (cueBeat * beatDuration) / 1000;
        playCue(audio, outputNode, cueTime, cueBeat, soundSource);
      }
    }

    const frame = () => {
      const engine = engineRef.current;
      if (!engine) return;

      const now = performance.now();
      const elapsed = now - engine.phaseStart;
      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(frame);
        return;
      }

      const beatFloat = elapsed / engine.beatDuration;
      const wholeBeat = Math.floor(beatFloat);

      setIsBeatActive(elapsed % engine.beatDuration < 140);
      if (nextPhase === "GET_READY") {
        const beatsRemaining = Math.max(1, engine.totalBeats - wholeBeat);
        setCountdownBeat(beatsRemaining);
      }

      if (nextPhase === "TAP") {
        for (const target of engine.targets) {
          if (target.judged) continue;
          if (now <= target.time + MAX_HIT_WINDOW_MS) continue;
          pushResolvedHit(
            engine,
            { rating: "MISS", offset: now - target.time, absolute: Math.abs(now - target.time), points: 0, streak: 0, success: false },
            target
          );
        }
      }

      const nextMarkers = [];
      for (let index = -3; index <= 8; index += 1) {
        const beatTime = now + index * engine.beatDuration;
        const distance = beatTime - now;
        const left = 50 + (distance / (engine.beatDuration * 2.5)) * 50;
        const position = ((((beatTime - engine.phaseStart) / engine.beatDuration) % engine.beatsPerPhrase) + engine.beatsPerPhrase) % engine.beatsPerPhrase;
        const target = nextPhase === "TAP" && sessionPattern.some((value) => Math.abs(value - position) < 0.12);
        const hit = engine.hits.some((entry) => Math.abs(entry.targetBeat - position) < 0.12 && entry.success);
        if (left > -10 && left < 110) {
          nextMarkers.push({ left, target, hit });
        }
      }
      setMarkers(nextMarkers);

      if (elapsed >= engine.totalBeats * engine.beatDuration) {
        cleanupLoop();
        onComplete(engine);
        return;
      }

      animationRef.current = requestAnimationFrame(frame);
    };

    animationRef.current = requestAnimationFrame(frame);
  }

  async function startSession(levelOverride = difficulty, trackIdOverride) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const sessionPattern = getPatternForSession(levelOverride);
    const sessionBpm = resolveSessionBpm(trackIdOverride);

    await startEngine("LISTEN", listenPhrases, sessionPattern, sessionBpm, () => {
      void startEngine("GET_READY", getReadyPhrases, sessionPattern, sessionBpm, () => {
        void startEngine("TAP", tapPhrases, sessionPattern, sessionBpm, (engine) => {
          const expectedHitCount = sessionPattern.length * tapPhrases;
          const resolvedHits = engine.hits.filter((hit) => hit.success).length;
          const missedHits = expectedHitCount - resolvedHits;
          const cleanRound = engine.hits.length === expectedHitCount && engine.hits.every((hit) => hit.success);
          const nextSuccessLoops = cleanRound ? successLoops + 1 : 0;

          setResultsSummary({
            expected: expectedHitCount,
            hit: resolvedHits,
            missed: missedHits,
          });
          setResultsTrace([...engine.hits].sort((left, right) => left.absoluteBeat - right.absoluteBeat));
          setSuccessLoops(nextSuccessLoops);
          setPhase("RESULTS");
          setRoute("results");
        });
      });
    });
  }

  function restartSession() {
    cleanupLoop();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPhase("IDLE");
    setRoute("play");
    setLastHit(null);
    setMarkers([]);
    setCountdownBeat(null);
    setIsBeatActive(false);
    setIsPadPressed(false);
    setResultsSummary({ expected: 0, hit: 0, missed: 0 });
    setResultsTrace([]);
    setQueuedSession({ trackId: selectedTrackId, level: difficulty });
  }

  async function launchQueuedSession() {
    if (!queuedSession) {
      await startSession();
      return;
    }

    const { trackId, level } = queuedSession;
    setQueuedSession(null);
    await startSession(level, trackId);
  }

  function stopCurrentRun(nextRoute = "home") {
    cleanupLoop();
    setPhase("IDLE");
    setRoute(nextRoute);
    setLastHit(null);
    setMarkers([]);
    setCountdownBeat(null);
    setIsBeatActive(false);
    setIsPadPressed(false);
    setQueuedSession(null);
    setResultsSummary({ expected: 0, hit: 0, missed: 0 });
    setResultsTrace([]);
  }

  function startFreshPractice(nextTrackId, levelOverride = 1) {
    cleanupLoop();
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (nextTrackId) {
      setSelectedTrackId(nextTrackId);
      setBpmOverride(null);
    }
    setDifficulty(levelOverride);
    setSuccessLoops(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setHistory([]);
    setLastHit(null);
    setMarkers([]);
    setCountdownBeat(null);
    setPhase("IDLE");
    setRoute("play");
    setResultsSummary({ expected: 0, hit: 0, missed: 0 });
    setResultsTrace([]);
    setQueuedSession({ trackId: nextTrackId ?? selectedTrackId, level: levelOverride });
  }

  function retryLevel() {
    cleanupLoop();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setPhase("IDLE");
    setRoute("play");
    setLastHit(null);
    setMarkers([]);
    setCountdownBeat(null);
    setIsBeatActive(false);
    setIsPadPressed(false);
    setResultsSummary({ expected: 0, hit: 0, missed: 0 });
    setResultsTrace([]);
    setQueuedSession({ trackId: selectedTrackId, level: difficulty });
  }

  function startNextLevel() {
    cleanupLoop();
    const nextDifficulty = Math.min(difficulty + 1, GROOVE_LIBRARY.length);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setDifficulty(nextDifficulty);
    setPhase("IDLE");
    setRoute("play");
    setLastHit(null);
    setMarkers([]);
    setCountdownBeat(null);
    setIsBeatActive(false);
    setIsPadPressed(false);
    setResultsSummary({ expected: 0, hit: 0, missed: 0 });
    setResultsTrace([]);
    setQueuedSession({ trackId: selectedTrackId, level: nextDifficulty });
  }

  function resetProgress() {
    cleanupLoop();
    setPhase("IDLE");
    setRoute("home");
    setDifficulty(1);
    setSuccessLoops(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setHistory([]);
    setLastHit(null);
    setMarkers([]);
    setCountdownBeat(null);
    setQueuedSession(null);
    setResultsSummary({ expected: 0, hit: 0, missed: 0 });
    setResultsTrace([]);
  }

  function nextTarget(engine, tapTime) {
    const candidates = engine.targets.filter((target) => !target.judged && Math.abs(tapTime - target.time) <= MAX_HIT_WINDOW_MS);
    if (!candidates.length) return null;
    return candidates.reduce((closest, target) => {
      if (!closest) return target;
      return Math.abs(tapTime - target.time) < Math.abs(tapTime - closest.time) ? target : closest;
    }, null);
  }

  function registerFreeMiss(tapTime) {
    const miss = {
      rating: "MISS",
      offset: 0,
      absolute: 0,
      points: 0,
      streak: 0,
      success: false,
    };
    setLastHit(miss);
    setHistory((current) => [...current, 0]);
    setStreak(0);
  }

  async function handleTap() {
    const engine = engineRef.current;
    if (!engine || engine.phase !== "TAP") return;

    await ensureAudio();

    const tapTime = performance.now();
    const target = nextTarget(engine, tapTime);
    if (!target) {
      registerFreeMiss(tapTime);
      setIsPadPressed(true);
      window.setTimeout(() => setIsPadPressed(false), 110);
      return;
    }

    const result = scoreTap(tapTime, target.time);
    pushResolvedHit(engine, result, target);

    setIsPadPressed(true);
    window.setTimeout(() => setIsPadPressed(false), 110);
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (event.code === "Space") {
        event.preventDefault();
        if (phase === "TAP") {
          void handleTap();
        } else if (phase === "IDLE") {
          void launchQueuedSession();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, bpm, difficulty, successLoops, targetPattern]);

  useEffect(() => () => cleanupLoop(), []);

  const accuracy = accuracyRate(history);
  const currentRating =
    lastHit?.rating ??
    (phase === "LISTEN" ? "LISTEN" : phase === "GET_READY" ? "GET READY" : phase === "TAP" ? "READY" : "SYNC");
  const currentOffset = lastHit ? formatOffset(lastHit.offset) : "Lock the pulse";
  const phaseLabel = phase.replaceAll("_", " ");
  const phaseTone = phase.toLowerCase();
  const toastTone = currentRating.toLowerCase().replaceAll(" ", "-");
  const flowLabel = `1 listen phrase (2 bars) • 1 ready phrase (2 bars) • ${tapPhrases} tap phrases (8 bars)`;
  const traceSeries = buildTraceSeries(resultsTrace, 640, 220, MAX_HIT_WINDOW_MS);

  return (
    <main className="sk-app">
      <header className="sk-topbar">
        <button className="sk-brand" onClick={() => stopCurrentRun("home")} type="button">
          Sonic Kinetic
        </button>
        <div className="sk-topbarMeta">
          <span className={`sk-status ${audioReady ? "is-ready" : ""}`}>{audioReady ? "Audio Armed" : "Audio Idle"}</span>
          <span className="sk-chip">{soundSource}</span>
          <span className="sk-chip">{bpm} BPM</span>
        </div>
      </header>

      <section className="sk-shell">
        <nav className="sk-nav">
          <button className={route === "home" ? "is-active" : ""} onClick={() => stopCurrentRun("home")} type="button">Home</button>
          <button className={route === "tracks" ? "is-active" : ""} onClick={() => stopCurrentRun("tracks")} type="button">Tracks</button>
          <button className={route === "play" ? "is-active" : ""} onClick={() => setRoute("play")} type="button">Play</button>
          <button className={route === "results" ? "is-active" : ""} onClick={() => stopCurrentRun("results")} type="button">Stats</button>
        </nav>

        {route === "home" && (
          <section className="sk-hero">
            <div className="sk-copy">
              <span className="sk-eyebrow">Neural Rhythm Engine</span>
              <h1>
                MASTER THE <span>SONIC FLOW</span>
              </h1>
              <p>
                Listen to the bar. Internalize the pocket. Strike the beat inside a moving timing window and
                level up into denser, faster patterns.
              </p>
              <div className="sk-actions">
                <button className="sk-button sk-buttonPrimary" onClick={() => startFreshPractice()} type="button">Start Practice</button>
                <button className="sk-button sk-buttonSecondary" onClick={() => stopCurrentRun("tracks")} type="button">Browse Tracks</button>
              </div>
            </div>

            <div className="sk-visualPanel">
              <div className="sk-waveform">
                {[36, 72, 58, 92, 48, 84, 64, 38].map((height, index) => (
                  <span key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="sk-heroStats">
                <article>
                  <label>Current Deck</label>
                  <strong>{selectedTrack.title}</strong>
                </article>
                <article>
                  <label>Difficulty</label>
                  <strong>{`L${difficulty} · ${patternName}`}</strong>
                </article>
                <article>
                  <label>Best Streak</label>
                  <strong>{bestStreak}</strong>
                </article>
              </div>
            </div>
          </section>
        )}

        {route === "tracks" && (
          <section className="sk-tracksView">
            <div className="sk-panel">
              <span className="sk-eyebrow">Track Selection</span>
              <h2>Pick a deck and tune the loop.</h2>
              <p>
                Fixed flow: first loop is listen-only, second loop is get-ready with a beat countdown, then four full
                bars of interactive tapping before the score screen.
              </p>

              <div className="sk-settings">
                <label>
                  <span>BPM Override</span>
                  <input max="160" min="96" onChange={(event) => setBpmOverride(Number(event.target.value))} type="range" value={bpm} />
                  <strong>{bpm}</strong>
                </label>
                <label>
                  <span>Sound Source</span>
                  <select className="sk-select" onChange={(event) => setSoundSource(event.target.value)} value={soundSource}>
                    {SOUND_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                  <strong>{soundSource}</strong>
                </label>
                <label>
                  <span>Test Groove</span>
                  <select className="sk-select" onChange={(event) => setTrackTestLevel(Number(event.target.value))} value={trackTestLevel}>
                    {TEST_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {`L${level} · ${getPatternName(level)} · ${getPatternSource(level)}`}
                      </option>
                    ))}
                  </select>
                  <strong>{`L${trackTestLevel} · ${getPatternName(trackTestLevel)}`}</strong>
                </label>
              </div>
            </div>

            <div className="sk-trackGrid">
              {TRACKS.map((track) => (
                <article className={`sk-trackCard ${track.id === selectedTrackId ? "is-selected" : ""}`} key={track.id}>
                  <div className="sk-trackGlow" style={{ background: `linear-gradient(135deg, ${track.colorA}, ${track.colorB})` }} />
                  <div className="sk-trackMeta">
                    <span className="sk-chip">{track.bpm} BPM</span>
                    <span className="sk-energy">L{track.energy}</span>
                  </div>
                  <h3>{track.title}</h3>
                  <p>{track.artist}</p>
                  <small>{track.summary}</small>
                  <div className="sk-actions">
                    <button
                      className="sk-button sk-buttonPrimary"
                      onClick={() => {
                        startFreshPractice(track.id, trackTestLevel);
                      }}
                      type="button"
                    >
                      Start Session
                    </button>
                    <button
                      className="sk-button sk-buttonSecondary"
                      onClick={() => {
                        setSelectedTrackId(track.id);
                        setBpmOverride(null);
                      }}
                      type="button"
                    >
                      Load Deck
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {(route === "play" || phase !== "IDLE") && route !== "results" && (
          <section className="sk-playView">
            <aside className="sk-panel">
              <span className="sk-eyebrow">Live Session</span>
              <h2 className="sk-playTitle">Listen first. Then hit the centerline.</h2>
              <p className="sk-playCopy">
                The vertical line is the truth. During TAP, you are scored against the nearest target beat in the
                current pattern. Use the click, pulse glow, and timeline to lock your timing.
              </p>
              <div className="sk-sessionStats">
                <article>
                  <label>Track</label>
                  <strong>{selectedTrack.title}</strong>
                </article>
                <article>
                  <label>BPM</label>
                  <strong>{bpm}</strong>
                </article>
                <article>
                  <label>Phase</label>
                  <strong>{phaseLabel}</strong>
                </article>
                <article>
                  <label>Pattern</label>
                  <strong>{patternName}</strong>
                </article>
                <article>
                  <label>Groove</label>
                  <strong>{patternSource}</strong>
                </article>
                <article>
                  <label>Flow</label>
                  <strong>{flowLabel}</strong>
                </article>
                <article>
                  <label>Sound</label>
                  <strong>{soundSource}</strong>
                </article>
              </div>
            </aside>

            <section className="sk-gamePanel">
              <div className="sk-gameTop">
                <div>
                  <label>Current Phase</label>
                  <h2 className={`is-${phaseTone}`}>{phaseLabel}</h2>
                </div>
                <div className="sk-streak">
                  <label>Streak</label>
                  <strong>{streak}</strong>
                </div>
              </div>

              <div className="sk-targetHud">
                <article>
                  <label>Click Target</label>
                  <strong>{patternName}</strong>
                </article>
                <article>
                  <label>Phrase Grid</label>
                  <div className="sk-patternGrid">
                    {targetPattern.map((patternBeat) => (
                      <span className="sk-patternPill" key={patternBeat}>
                        {patternBeat}
                      </span>
                    ))}
                  </div>
                </article>
              </div>

              <div className={`sk-toast is-${toastTone}`}>
                <span>{currentRating}</span>
                <small>{currentOffset}</small>
              </div>

              <div className="sk-stage">
                <div className="sk-ring sk-ringOuter" />
                <div className="sk-ring sk-ringMid" />
                <div className="sk-ring sk-ringInner" />
                {phase === "IDLE" && (
                  <button className="sk-goButton" onClick={launchQueuedSession} type="button">
                    <span aria-hidden="true" className="sk-goLabel sk-goLabelTop">
                      Cue
                    </span>
                    <span className="sk-goGlyph">▷</span>
                    <span aria-hidden="true" className="sk-goLabel sk-goLabelBottom">
                      Ready
                    </span>
                  </button>
                )}
                <button
                  className={`sk-pad ${isBeatActive ? "is-beatActive" : ""} ${isPadPressed ? "is-hit" : ""}`}
                  disabled={phase !== "TAP"}
                  onClick={handleTap}
                  type="button"
                >
                  <span>{phase === "GET_READY" ? countdownBeat ?? 4 : "◉"}</span>
                  <strong>Hit Beat</strong>
                  <small>
                    {phase === "LISTEN"
                      ? "Listen through the loop"
                      : phase === "GET_READY"
                        ? "Countdown before four interactive bars"
                        : phase === "TAP"
                          ? "Tap across the full phrase"
                          : "Round complete"}
                  </small>
                </button>
              </div>

              <div className="sk-timeline">
                <div className="sk-timelineCenter" />
                {markers.map((marker, index) => (
                  <span
                    className={`sk-marker ${marker.target ? "is-target" : ""} ${marker.hit ? "is-hit" : ""}`}
                    key={`${index}-${marker.left}`}
                    style={{ left: `${marker.left}%` }}
                  />
                ))}
              </div>

              <div className="sk-gameFooter">
                <article>
                  <label>Score</label>
                  <strong>{score.toLocaleString()}</strong>
                </article>
                <article>
                  <label>Avg Offset</label>
                  <strong>{averageOffset(history)}ms</strong>
                </article>
                <article>
                  <label>Best Streak</label>
                  <strong>{bestStreak}</strong>
                </article>
              </div>

              <div className="sk-actions">
                <button className="sk-button sk-buttonPrimary" onClick={restartSession} type="button">Restart Loop</button>
                <button className="sk-button sk-buttonSecondary" onClick={resetProgress} type="button">Reset Progress</button>
              </div>
            </section>
          </section>
        )}

        {route === "results" && (
          <section className="sk-resultsView">
            <section className="sk-panel sk-resultsHero">
              <span className="sk-eyebrow">Session Summary</span>
              <h2>{accuracy >= 94 ? "Level Up!" : accuracy >= 80 ? "Stable Groove" : "Keep Training"}</h2>
              <p>
                {accuracy >= 94
                  ? "You stayed tight enough to promote into the next rhythmic pattern."
                  : accuracy >= 80
                    ? "The groove is holding. Another clean round will scale difficulty."
                    : "The loop is still outrunning your internal clock. Reset and drill the pocket."}
              </p>

              <div className="sk-resultsStats">
                <article>
                  <label>Final Score</label>
                  <strong>{score.toLocaleString()}</strong>
                </article>
                <article>
                  <label>BPM</label>
                  <strong>{bpm}</strong>
                </article>
                <article>
                  <label>Accuracy</label>
                  <strong>{accuracy}%</strong>
                </article>
                <article>
                  <label>Max Streak</label>
                  <strong>{bestStreak}</strong>
                </article>
                <article>
                  <label>Difficulty</label>
                  <strong>{`L${difficulty} · ${patternName}`}</strong>
                </article>
                <article>
                  <label>Expected Beats</label>
                  <strong>{resultsSummary.expected}</strong>
                </article>
                <article>
                  <label>Hit</label>
                  <strong>{resultsSummary.hit}</strong>
                </article>
                <article>
                  <label>Missed</label>
                  <strong>{resultsSummary.missed}</strong>
                </article>
              </div>

              <div className="sk-chart" role="img" aria-label="Timing trace with zero milliseconds centered, late hits above and early hits below">
                <div className="sk-chartAxis sk-chartAxisTop">Late</div>
                <div className="sk-chartAxis sk-chartAxisCenter">0ms</div>
                <div className="sk-chartAxis sk-chartAxisBottom">Early</div>
                <svg className="sk-chartSvg" viewBox="0 0 640 220" preserveAspectRatio="none">
                  <rect className="sk-chartBand sk-chartBandGood" height="220" width="640" x="0" y="0" />
                  <rect className="sk-chartBand sk-chartBandGreat" height="146.7" width="640" x="0" y="36.65" />
                  <rect className="sk-chartBand sk-chartBandPerfect" height="97.8" width="640" x="0" y="61.1" />
                  <line className="sk-chartGuide" x1="0" x2="640" y1="18" y2="18" />
                  <line className="sk-chartGuide sk-chartGuideCenter" x1="0" x2="640" y1="110" y2="110" />
                  <line className="sk-chartGuide" x1="0" x2="640" y1="202" y2="202" />
                  {resultsTrace.length > 0 ? (
                    <>
                      {traceSeries.lineSegments.map((points, index) => (
                        <polyline className="sk-chartLine" fill="none" key={points || index} points={points} />
                      ))}
                      {traceSeries.hitDots.map((dot) => (
                        <circle className="sk-chartDot" cx={dot.x} cy={dot.y} key={dot.key} r="4.5" />
                      ))}
                      {traceSeries.missMarkers.map((marker, index) => (
                        <g className="sk-chartMiss" key={`${marker.x}-${index}`} transform={`translate(${marker.x} ${marker.y})`}>
                          <line x1="-6" x2="6" y1="-6" y2="6" />
                          <line x1="-6" x2="6" y1="6" y2="-6" />
                        </g>
                      ))}
                    </>
                  ) : (
                    <text className="sk-chartEmpty" x="320" y="116">
                      No timing trace yet
                    </text>
                  )}
                </svg>
              </div>

              <div className="sk-actions">
                <button className="sk-button sk-buttonPrimary" onClick={retryLevel} type="button">Retry</button>
                <button className="sk-button sk-buttonSecondary" onClick={startNextLevel} type="button">Level Up</button>
              </div>
            </section>

            <aside className="sk-panel">
              <span className="sk-eyebrow">Recent Offsets</span>
              <h3>Timing trace</h3>
              <p>{history.length ? history.slice(-10).map(formatOffset).join(" • ") : "No taps recorded yet."}</p>
              <ul className="sk-rules">
                <li>Perfect: ±50ms, +1000</li>
                <li>Great: ±100ms, +500</li>
                <li>Good: ±150ms, +200</li>
                <li>Miss: over ±150ms, streak reset</li>
              </ul>
            </aside>
          </section>
        )}
      </section>
    </main>
  );
}

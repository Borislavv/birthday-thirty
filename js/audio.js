/* Original, browser-generated score. No samples, remote files or third-party music. */
(function () {
  'use strict';

  const THEMES = {
    prologue: {
      bpm: 72, meter: 3, voice: 'bell',
      chords: [[60,64,67,71],[57,60,64,69],[53,57,60,65],[55,59,62,67]],
      melody: [76,null,79,76,74,null, 72,null,76,79,81,null,
        79,null,76,74,72,null, 71,null,74,76,67,null,
        69,null,72,76,74,null, 72,null,69,67,65,null,
        67,null,71,74,72,null, 71,null,67,null,null,null]
    },
    forest: {
      bpm: 86, meter: 3, voice: 'harp',
      chords: [[50,57,62,65],[46,53,58,62],[53,57,60,65],[48,55,60,64]],
      melody: [74,77,null,74,72,null, 69,null,72,74,77,null,
        77,79,77,74,72,null, 70,null,74,77,74,null,
        77,null,81,79,77,null, 76,null,72,69,72,null,
        76,79,null,76,74,null, 72,null,67,null,null,null]
    },
    wonderland: {
      bpm: 93, meter: 4, voice: 'bell',
      chords: [[53,57,60,64],[56,60,63,67],[50,57,60,65],[55,59,62,69]],
      melody: [81,null,76,79,null,84,81,null, 79,76,null,72,76,null,81,null,
        79,null,75,72,null,84,79,null, 75,79,null,84,87,null,79,null,
        81,null,77,74,null,81,84,null, 86,84,null,81,77,null,74,null,
        79,null,83,86,null,81,79,null, 74,71,null,74,79,null,null,null]
    },
    palace: {
      bpm: 84, meter: 4, voice: 'harp',
      chords: [[48,55,60,64],[55,59,62,67],[57,60,64,69],[53,57,60,65]],
      melody: [72,76,79,76,84,null,83,81, 79,76,74,72,71,null,67,null,
        74,79,83,79,86,null,84,83, 81,79,76,74,79,null,74,null,
        76,81,84,81,88,null,86,84, 83,81,79,76,81,null,76,null,
        77,81,84,81,86,null,84,81, 79,77,76,74,72,null,null,null]
    },
    finale: {
      bpm: 74, meter: 4, voice: 'flute',
      chords: [[48,55,60,64],[57,60,64,69],[53,57,60,65],[55,59,62,67]],
      melody: [76,null,79,null,84,null,83,81, 79,null,76,74,72,null,null,null,
        76,null,81,null,84,null,83,81, 79,null,76,74,72,null,69,null,
        77,null,81,null,84,null,81,79, 77,null,76,74,72,null,null,null,
        74,null,79,null,83,null,81,79, 76,null,74,null,72,null,null,null]
    }
  };

  const frequency = midi => 440 * Math.pow(2, (midi - 69) / 12);
  const state = {
    context: null, master: null, music: null, effects: null,
    track: null, timer: null, mood: 'prologue', volume: 0.55,
    muted: false, enabled: false, tick: 0, nextTime: 0,
    nodes: new Set()
  };

  function ramp(param, value, duration, now) {
    if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
    else {
      const previous = param.value;
      param.cancelScheduledValues(now);
      param.setValueAtTime(previous, now);
    }
    param.linearRampToValueAtTime(value, now + duration);
  }

  function outputVolume() {
    if (state.master) ramp(state.master.gain, state.muted ? 0 : state.volume * 0.62,
      0.15, state.context.currentTime);
  }

  function makeGraph() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    const ctx = state.context = new AudioContext();
    const master = state.master = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.3;
    master.gain.value = state.muted ? 0 : state.volume * 0.62;
    master.connect(compressor);
    compressor.connect(ctx.destination);
    state.music = ctx.createGain();
    state.effects = ctx.createGain();
    state.music.connect(master);
    state.effects.connect(master);
    return true;
  }

  function startTrack() {
    if (!state.context) return;
    const ctx = state.context, now = ctx.currentTime;
    if (state.track) {
      const previous = state.track;
      ramp(previous.gain, 0, 0.65, now);
      // A stopped old score cannot enqueue notes. Its last release is under 6s.
      setTimeout(() => { try { previous.disconnect(); } catch (_) {} }, 7000);
    }
    const bus = ctx.createGain();
    bus.gain.value = 0;
    bus.connect(state.music);
    bus.gain.linearRampToValueAtTime(1, now + 1.1);
    state.track = bus;
    state.tick = 0;
    state.nextTime = now + 0.08;
  }

  function note(midi, time, duration, amplitude, voice, destination) {
    const ctx = state.context;
    if (!ctx || !destination || amplitude <= 0) return;
    const envelope = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = voice === 'pad' ? 1250 : voice === 'bass' ? 800 : 3200;
    filter.Q.value = 0.35;
    envelope.connect(filter);
    filter.connect(destination);
    const tail = voice === 'pad' ? 0.9 : voice === 'bell' ? 0.75 : 0.3;
    const end = time + duration + tail;
    const attack = voice === 'pad' ? 0.32 : voice === 'flute' ? 0.08 : 0.014;
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(amplitude, time + attack);
    if (voice === 'harp' || voice === 'bell') {
      envelope.gain.exponentialRampToValueAtTime(amplitude * 0.23, time + duration * 0.7);
    } else {
      envelope.gain.setValueAtTime(amplitude * 0.78, time + Math.max(attack + 0.02, duration * 0.72));
    }
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
    const oscillator = ctx.createOscillator();
    oscillator.type = voice === 'harp' ? 'triangle' : 'sine';
    oscillator.frequency.value = frequency(midi);
    oscillator.connect(envelope);
    state.nodes.add(oscillator);
    oscillator.onended = () => {
      state.nodes.delete(oscillator);
      oscillator.disconnect(); envelope.disconnect(); filter.disconnect();
    };
    oscillator.start(time);
    oscillator.stop(end + 0.02);
  }

  function scheduleStep(theme, step, time, bus) {
    const eighth = 30 / theme.bpm;
    const stepsInBar = theme.meter * 2;
    const bar = Math.floor(step / stepsInBar);
    const chord = theme.chords[Math.floor(bar / 2) % theme.chords.length];
    const inBar = step % stepsInBar;
    const melody = theme.melody[step % theme.melody.length];
    if (melody !== null && melody !== undefined)
      note(melody, time, eighth * (theme.voice === 'flute' ? 1.7 : 1.15),
        theme.voice === 'harp' ? 0.075 : 0.064, theme.voice, bus);

    if (inBar === 0) {
      chord.forEach((pitch, index) => note(pitch, time + index * 0.035,
        eighth * stepsInBar * 1.05, 0.014, 'pad', bus));
      note(chord[0] - 12, time, eighth * 1.8, 0.075, 'bass', bus);
    }
    // A quiet waltz or four-beat accompaniment, with no synthetic drum loop.
    if (inBar === 2 || inBar === 4 || (theme.meter === 4 && inBar === 6)) {
      const index = (inBar / 2) % (chord.length - 1) + 1;
      note(chord[index], time, eighth * 0.8, 0.036, 'harp', bus);
      note(chord[(index + 1) % chord.length] + 12, time + eighth * 0.12,
        eighth * 0.65, 0.018, 'bell', bus);
    }
    if (state.mood === 'wonderland' && step % 16 === 15)
      note(91, time + eighth * 0.3, 0.16, 0.019, 'bell', bus);
  }

  function scheduler() {
    if (!state.context || state.context.state !== 'running' || document.hidden) return;
    const ctx = state.context, theme = THEMES[state.mood];
    if (state.nextTime < ctx.currentTime - 0.15) state.nextTime = ctx.currentTime + 0.04;
    while (state.nextTime < ctx.currentTime + 0.25) {
      scheduleStep(theme, state.tick++, state.nextTime, state.track);
      state.nextTime += 30 / theme.bpm;
    }
  }

  function startScheduler() {
    if (!state.timer) state.timer = setInterval(scheduler, 90);
    scheduler();
  }

  async function init() {
    try {
      if (!state.context && !makeGraph()) return false;
      state.enabled = true;
      if (state.context.state === 'suspended') await state.context.resume();
      if (!state.track) startTrack();
      startScheduler();
      return state.context.state === 'running';
    } catch (_) { return false; }
  }

  function setMood(mood) {
    if (!Object.prototype.hasOwnProperty.call(THEMES, mood) || mood === state.mood) return;
    state.mood = mood;
    if (state.context) { startTrack(); scheduler(); }
  }

  function setVolume(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return;
    state.volume = Math.min(1, Math.max(0, number));
    outputVolume();
  }

  function setMuted(muted) {
    state.muted = Boolean(muted);
    outputVolume();
  }

  function playEffect(name) {
    if (!state.context || state.context.state !== 'running' || state.muted) return;
    const time = state.context.currentTime + 0.01;
    const destination = state.effects;
    switch (name) {
      case 'correct':
        [72,76,79,84].forEach((n,i) => note(n,time+i*0.095,0.2,0.075,'bell',destination));
        break;
      case 'wrong':
        [67,64].forEach((n,i) => note(n,time+i*0.18,0.22,0.065,'flute',destination));
        break;
      case 'bubbles':
        [84,91,88,96,93,100].forEach((n,i) => note(n,time+i*0.1,0.12,0.048,'bell',destination));
        break;
      case 'magic':
        [60,64,67,72,76,79,84,88,91,96].forEach((n,i) =>
          note(n,time+i*0.075,0.45,0.046,'bell',destination));
        break;
      case 'celebrate':
        [72,76,79,84,79,84,88,91,96].forEach((n,i) =>
          note(n,time+i*0.12,0.48,0.058,'bell',destination));
        break;
      default: break;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (!state.context || !state.enabled) return;
    if (document.hidden) {
      clearInterval(state.timer); state.timer = null;
      state.context.suspend().catch(() => {});
    } else {
      state.context.resume().then(() => {
        state.nextTime = state.context.currentTime + 0.07;
        startScheduler();
      }).catch(() => {});
    }
  });
  window.addEventListener('pagehide', () => {
    clearInterval(state.timer); state.timer = null;
    if (state.context) state.context.suspend().catch(() => {});
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted && state.enabled) init();
  });

  window.NovelAudio = Object.freeze({ init, setMood, setVolume, setMuted, playEffect });
})();

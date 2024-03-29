<template>
  <div style="display: flex; flex-direction: row">
    <input
      style="font-size: 3em; width: 110px; height: 50px; margin-right: 10px; border-radius: 5px; color: black"
      type="number"
      :value="bpm"
      @input="updateBpm($event)"
      placeholder="Set BPM"
    />
    <button
      style="
        height: 50px;
        border-radius: 10px;
        border: none;
        background-color: rgb(255 34 100);
        color: black;
        padding-left: 10px;
        padding-right: 10px;
      "
      @click="handleTap"
    >
      Tap Rhythm
    </button>
    <img src="../assets/settings.png" alt="Metronome" style="margin-left: 30px; width: 30px; height: 30px" @click="toggleLoopEditor" />
    <BeatLoopEditor v-if="showLoopEditor" :resolution="resolution" :sounds="sounds" @update:sounds="updateSounds" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, defineProps, defineEmits } from "vue";
import BeatLoopEditor from "./BeatLoopEditor.vue";

const props = defineProps({
  bpm: {
    type: Number,
    default: 120, // Providing a default value
  },
  playing: Boolean,
});

interface SoundBeat {
  name: string;
  beats: number[];
  filename: string;
  sound: Promise<AudioBuffer>;
}

const emit = defineEmits(["update:bpm", "beat"]);
const audioContext = ref<AudioContext | null>(null);
const showLoopEditor = ref(false);
const resolution = ref(8); // Number of beats per phrase
const nextNoteTime = ref(0);
const scheduleAheadTime = 0.1;
const lookahead = 25.0;
let timerID: number | null = null;

const emptyPromise = new Promise<AudioBuffer>(() => {});

const loadSound = async (url: string): Promise<AudioBuffer> => {
  if (!audioContext.value) throw new Error("AudioContext not initialized");
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  // Ensure decodeAudioData always resolves to AudioBuffer or throws an error
  return audioContext.value.decodeAudioData(arrayBuffer);
};

function initializeSoundSystem() {
  if (audioContext.value) return;

  audioContext.value = new AudioContext();

  sounds.value = [
    { name: "Base Drum", beats: [1, 3, 5, 7], filename: "bassdrum.mp3", sound: emptyPromise },
    { name: "Bell", beats: [], filename: "bell.mp3", sound: emptyPromise },
    { name: "Clap", beats: [8], filename: "clap.mp3", sound: emptyPromise },
    { name: "Cowbell", beats: [], filename: "cowbell.mp3", sound: emptyPromise },
    { name: "Finger snap", beats: [], filename: "finger-snap.mp3", sound: emptyPromise },
    { name: "Hi-hat", beats: [4], filename: "hi-hat.mp3", sound: emptyPromise },
    { name: "Metronome", beats: [], filename: "metronome.mp3", sound: emptyPromise },
  ];

  sounds.value.forEach((sound) => {
    sound.sound = loadSound(`/sounds/${sound.filename}`);
  });
}

const sounds = ref<SoundBeat[]>([]);
const beatCount = ref(0);

// Tap rhythm functionality
const tapTimes = ref<number[]>([]);
const maxTaps = 8;
const minBPM = 50;
const maxInterval = (60 / minBPM) * 1000; // Max time interval between taps in milliseconds
let tapTimeoutId: number | null = null;

const resetTapSequence = () => {
  tapTimes.value = [];
};

const handleTap = () => {
  const now = Date.now();
  tapTimes.value.push(now);

  // Remove the first tap if more than maxTaps
  if (tapTimes.value.length > maxTaps) {
    tapTimes.value.shift();
  }

  if (tapTimes.value.length >= 2) {
    const intervals = tapTimes.value.slice(1).map((time, index) => time - tapTimes.value[index]);
    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const newBpm = Math.round(60 / (averageInterval / 1000));

    // Update BPM if within valid range
    if (newBpm >= minBPM) {
      emit("update:bpm", newBpm);
    }
  }
};

const playSound = async (soundPromise: Promise<AudioBuffer>, time: number) => {
  if (!audioContext.value) {
    throw new Error("Audio context not initialized");
  }
  const soundBuffer = await soundPromise;
  const source = audioContext.value.createBufferSource();
  source.buffer = soundBuffer;
  source.connect(audioContext.value.destination);
  source.start(time);
};

const playSoundOfBeat = async (time: number) => {
  beatCount.value = (beatCount.value % resolution.value) + 1;

  for (const sound of sounds.value) {
    if (sound.beats.includes(beatCount.value)) {
      try {
        await playSound(sound.sound, time);
      } catch (error) {
        console.error("Failed to play sound:", error);
        // Handle the error, e.g., by skipping this sound
      }
    }
  }

  emit("beat", beatCount.value);
};

const toggleLoopEditor = () => {
  initializeSoundSystem();
  showLoopEditor.value = !showLoopEditor.value;
};

const scheduler = () => {
  if (!audioContext.value) {
    console.error("nextNoteTime or audioContext is null", nextNoteTime.value, audioContext.value);
    throw new Error("nextNoteTime or audioContext is null");
  }

  while (nextNoteTime.value < audioContext.value?.currentTime + scheduleAheadTime) {
    const time = nextNoteTime.value;
    playSoundOfBeat(time); // Pass the exact time to play the sound
    const secondsPerBeat = 60.0 / props.bpm;
    nextNoteTime.value += secondsPerBeat; // Add beat length to last beat time
  }
  timerID = setTimeout(scheduler, lookahead);
};

const startMetronome = () => {
  initializeSoundSystem();

  if (!audioContext.value) {
    throw new Error("Audio context not initialized");
  }

  beatCount.value = 0;

  if (props.playing && !timerID) {
    nextNoteTime.value = audioContext.value.currentTime;
    scheduler(); // Start the scheduling loop
  }
};

const stopMetronome = () => {
  if (timerID) {
    clearTimeout(timerID);
    timerID = null;
  }
};

const updateBpm = (event: Event) => {
  const target = event.target as HTMLInputElement; // Type assertion here
  const newBpm = target.value; // Now you can access 'value' safely
  const bpmNumber = parseInt(newBpm, 10);
  if (!isNaN(bpmNumber)) {
    emit("update:bpm", bpmNumber);
  }
};

watch(
  () => props.playing,
  (newVal) => {
    console.log("playing", newVal);
    if (newVal) {
      startMetronome();
    } else {
      stopMetronome();
    }
  }
);

onUnmounted(() => {
  stopMetronome();
  if (tapTimeoutId) clearTimeout(tapTimeoutId); // Clear the timeout when the component is unmounted
});

function updateSounds(newSounds: SoundBeat[]) {
  sounds.value.forEach((sound) => {
    sound.sound = loadSound(`/${sound.filename}`);
  });
}
</script>

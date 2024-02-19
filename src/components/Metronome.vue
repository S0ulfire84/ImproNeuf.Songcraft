<template>
  <div style="display: flex; flex-direction: row">
    <input
      style="font-size: 3em; width: 110px; height: 50px; margin-right: 10px; border-radius: 5px"
      type="number"
      :value="bpm"
      @input="updateBpm($event)"
      placeholder="Set BPM"
    />
    <button style="height: 50px; border-radius: 10px; border: none; background-color: rgb(255 34 100)" @click="handleTap">Tap Rhythm</button>

    <img v-show="false" src="../assets/settings.png" alt="Metronome" style="margin-left: 30px; width: 30px; height: 30px" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, defineProps, defineEmits } from "vue";

const props = defineProps({
  bpm: {
    type: Number,
    default: 120, // Providing a default value
  },
  playing: Boolean,
});

const emit = defineEmits(["update:bpm", "beat"]);

const loadSound = async (url: string) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
};

const audioContext = new AudioContext();
let intervalId: number | null = null;
const drum1Promise = loadSound("/drum1.wav"); //new Audio("/metronome1.wav");
const drum2Promise = loadSound("/drum2.wav"); //new Audio("/metronome2.wav");
const clapPromise = loadSound("/clap.wav");
const cymbalPromise = loadSound("/cymbal.wav"); //new Audio("/snare.wav");
const alternateBeat = ref(true);
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

  if (tapTimeoutId) clearTimeout(tapTimeoutId);
  tapTimeoutId = setTimeout(resetTapSequence, maxInterval);
};

const playSound = async (soundPromise: Promise<AudioBuffer>) => {
  const soundBuffer = await soundPromise;
  const source = audioContext.createBufferSource();
  source.buffer = soundBuffer;
  source.connect(audioContext.destination);
  source.start();
};

const playSoundOfBeat = () => {
  beatCount.value += 1;
  if (beatCount.value % 9 === 0) {
    beatCount.value = 1;
  }

  if (beatCount.value === 4) {
    playSound(cymbalPromise);
  }

  if (beatCount.value === 8) {
    playSound(clapPromise);
    playSound(clapPromise);
  }

  emit("beat", beatCount.value);

  if (alternateBeat.value) {
    playSound(drum1Promise);
  } else {
    playSound(drum2Promise);
  }

  alternateBeat.value = !alternateBeat.value;
};

const startMetronome = () => {
  const interval = (60 / props.bpm) * 1000;
  intervalId = setInterval(playSoundOfBeat, interval);
  beatCount.value = 0;
  alternateBeat.value = true;
};

const stopMetronome = () => {
  if (intervalId !== null) clearInterval(intervalId);
  intervalId = null;
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
</script>

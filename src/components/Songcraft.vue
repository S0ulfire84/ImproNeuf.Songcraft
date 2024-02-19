<template>
  <div style="display: flex; flex-direction: column">
    <div style="display: flex; flex-direction: row; align-items: flex-start; gap: 10px">
      <!-- Impro Neuf logo -->
      <img src="../assets/impro-neuf-logo.png" alt="Impro Neuf logo" style="width: 50px; height: 50px" />

      <!-- Metronome -->
      <metronome v-show="!playing" :playing="playing" :bpm="bpm" @update:bpm="bpm = $event" @beat="beat" />

      <!-- Beat count-->
      <div v-show="playing" style="font-size: 5em; height: 50px; position: relative; bottom: 35px; margin-left: 20px">
        {{ beatCount }}
      </div>

      <!-- Use random BPM -->
      <input v-if="!playing" type="checkbox" v-model="useRandomBpm" style="width: 50px; height: 50px; margin-left: 50px" />
      <div v-if="!playing" style="font-size: 2em; height: 50px; position: relative">Use random BPM</div>

      <!-- Songcraft logo and title -->
      <div v-if="!playing" style="display: flex; flex-direction: row; margin-left: auto; margin-bottom: 10px">
        <img src="../assets/songcraft.svg" alt="Songcraft logo" style="width: 50px; height: 50px" />
        <h1 style="color: white; margin-left: 10px">Songcraft</h1>
      </div>

      <!-- Close button -->
      <div v-if="playing" style="display: flex; flex-direction: row; margin-left: auto; margin-bottom: 10px; cursor: pointer">
        <img src="../assets/close.png" alt="Stop song" style="width: 50px; height: 50px" @click="stopSong" />
      </div>
    </div>

    <!-- Four square images-->
    <div v-if="!playing" style="width: 55%; align-self: center; display: grid; grid-template-columns: 1fr 1fr">
      <div class="image-button" @click="startSong">
        <img src="../assets/song-custom.webp" alt="Custom BPM Song" />
        <div class="image-text">Custom BPM Song</div>
      </div>
      <div class="image-button" @click="startEmotionalSong">
        <img src="../assets/song-solo.webp" alt="Solo Emotional Song" />
        <div class="image-text">Solo Emotional Song</div>
      </div>
      <div class="image-button" @click="startStandardMusicalSong">
        <img src="../assets/song-duet.webp" alt="Duet Standard Song" />
        <div class="image-text">Duet Standard Song</div>
      </div>
      <div class="image-button" @click="startUpbeatMusicalSong">
        <img src="../assets/song-upbeat.webp" alt="Upbeat Chorus Song" />
        <div class="image-text">Upbeat Chorus Song</div>
      </div>
    </div>

    <song-structure
      style="color: #f4b010"
      v-if="playing"
      :bpm="bpm"
      :playing="playing"
      :beat="beatCount"
      :sections="sections"
      :phrases="phrases"
      @done="done"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Metronome from "./Metronome.vue";
import SongStructure from "./SongStructure.vue";

const defaultPhrases = ["Phrase 1", "Phrase 2", "Phrase 3", "Phrase 4"];
const listenPhrases = ["Listen in", "Keep Listening", "Listen to the rhythm", "Be ready to start at 8"];
const listenColors = ["#10bbf4", "#10bbf4", "#10bbf4", "#d2042a"];
const defaultPhraseColors = ["#4ddd21", "#bedd21", "#f4b010", "#d2042a"];
const defaultAABAColors = ["#106ff4", "#106ff4", "#f47600", "#106ff4"];
const duetColorsPersonA = ["#106ff4", "#106ff4", "#106ff4", "#106ff4"];
const duetColorsPersonB = ["#d2042a", "#d2042a", "#d2042a", "#d2042a"];
const defaultTaglinePhrases = ["Phrase 1", "Phrase 2", "Phrase 3", "Tagline"];
const chorusAABA = ["Phrase A", "Phrase A", "Phrase B", "Phrase A"];
const chorusTagline = ["Tagline", "Tagline", "Tagline", "Tagline"];

const defaultSections = [
  {
    section: "Just listen",
    phrases: listenPhrases,
    color: listenColors,
  },
  {
    section: "First Verse",
    phrases: defaultPhrases,
    color: defaultPhraseColors,
  },
  {
    section: "Second Verse",
    phrases: defaultPhrases,
    color: defaultPhraseColors,
  },
  { section: "Chorus", phrases: chorusAABA, color: defaultAABAColors },
  { section: "Repeat Chorus", phrases: chorusAABA, color: defaultAABAColors },
  {
    section: "Third Verse",
    phrases: defaultPhrases,
    color: defaultPhraseColors,
  },
  {
    section: "Fourth Verse",
    phrases: defaultPhrases,
    color: defaultPhraseColors,
  },
  { section: "Chorus", phrases: chorusAABA, color: defaultAABAColors },
  {
    section: "Repeat Chorus End Song",
    phrases: chorusAABA,
    color: defaultAABAColors,
  },
];

const bpm = ref(100);
const playing = ref(false);
const beatCount = ref(0);
const sections = ref(defaultSections);
const useRandomBpm = ref(false);

const phrases = ref(defaultPhrases);

// Tap rhythm functionality
const tapTimes = ref([]);
const maxTaps = 8;
const minBPM = 50;
const maxInterval = (60 / minBPM) * 1000; // Max time interval between taps in milliseconds

function startSong() {
  playing.value = !playing.value;

  sections.value = defaultSections;
}

function startEmotionalSong() {
  if (useRandomBpm) setBpmBetweenRange(60, 90);
  playing.value = !playing.value;

  sections.value = [
    {
      section: "Just listen",
      phrases: listenPhrases,
      color: listenColors,
    },
    {
      section: "First Verse with Tagline",
      phrases: defaultTaglinePhrases,
      color: defaultPhraseColors,
    },
    {
      section: "Second Verse with Tagline",
      phrases: defaultTaglinePhrases,
      color: defaultPhraseColors,
    },
    {
      section: "First Bridge",
      phrases: defaultPhrases,
      color: defaultPhraseColors,
    },
    {
      section: "Second Bridge",
      phrases: defaultPhrases,
      color: defaultPhraseColors,
    },
    { section: "Chorus", phrases: chorusTagline, color: defaultPhraseColors },
    {
      section: "Repeat Chorus End Song",
      phrases: chorusTagline,
      color: defaultPhraseColors,
    },
  ];
}

function startStandardMusicalSong() {
  if (useRandomBpm) setBpmBetweenRange(90, 120);
  playing.value = !playing.value;

  sections.value = defaultSections;

  sections.value = [
    { section: "Just listen", phrases: listenPhrases, color: listenColors },
    { section: "Captain First Verse", phrases: defaultPhrases, color: duetColorsPersonA },
    { section: "Co-player Second Verse", phrases: defaultPhrases, color: duetColorsPersonB },
    { section: "Chorus", phrases: chorusAABA, color: defaultAABAColors },
    { section: "Repeat Chorus", phrases: chorusAABA, color: defaultAABAColors },
    { section: "Co-player First Verse", phrases: defaultPhrases, color: duetColorsPersonB },
    { section: "Captain Second Verse", phrases: defaultPhrases, color: duetColorsPersonA },
    { section: "Chorus", phrases: chorusAABA, color: defaultAABAColors },
    { section: "Repeat Chorus End Song", phrases: chorusAABA, color: defaultAABAColors },
  ];
}

function startUpbeatMusicalSong() {
  if (useRandomBpm) setBpmBetweenRange(120, 180);
  playing.value = !playing.value;

  sections.value = defaultSections;
}

function setBpmBetweenRange(min, max) {
  if (!playing.value) {
    bpm.value = Math.floor(Math.random() * (max - min) + min);
  }
}

function stopSong() {
  playing.value = false;
}

function beat(beatNumber) {
  console.log(beatNumber);
  beatCount.value = beatNumber;
}

function done() {
  playing.value = false;
}
</script>

<style scoped>
.image-button {
  padding: 20px;
  border-radius: 50px;
  cursor: pointer;
  position: relative; /* Needed for absolute positioning of text */
  overflow: hidden; /* Ensure text doesn't spill out */
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-button img {
  transition: opacity 0.3s; /* Smooth transition for the hover effect */
  width: 100%;
  height: auto;

  border-radius: 25px;
}

.image-button:hover img {
  opacity: 0.5; /* Dim the image */
}

.image-text {
  position: absolute;
  color: white;
  font-size: 1.5em; /* Adjust as needed */
  text-align: center;
  visibility: hidden;
}

.image-button:hover .image-text {
  visibility: visible;
}
</style>

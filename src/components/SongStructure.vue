<template>
  <div class="song">
    <div style="font-size: 5em" v-if="currentSectionIndex < sections.length">
      {{ sections[currentSectionIndex].section }}
    </div>
    <div class="phrase-container" v-for="(phrase, index) in phrases" :key="index">
      <div
        class="phrase-progress"
        :style="{
          width: phraseWidths[index] + '%',
          backgroundColor: shouldPlay ? phraseColors[index] : 'grey',
          height: '50px',
        }"
      ></div>
      <div class="phrase-text">{{ phrase }}</div>
    </div>
    <div v-if="currentSectionIndex + 1 < sections.length" style="font-size: 2em">Next: {{ sections[currentSectionIndex + 1].section }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  bpm: Number,
  playing: Boolean,
  beat: Number,
  sections: Array,
});

const phrases = ref((props.sections[0] as any).phrases);
const phraseWidths = ref(phrases.value.map(() => 0));
const phraseColors = ref((props.sections[0] as any).color);
const shouldPlay = computed(() => props.playing);
const currentIndex = ref(0);
const currentSectionIndex = ref(0);
const emit = defineEmits(["done"]);

watch(
  () => props.beat,
  (beatCount) => {
    // Update the width of the current phrase
    phraseWidths.value[currentIndex.value] = (beatCount / 8) * 100;

    // Advance to the next phrase when transitioning from beat 8 to beat 1
    if (beatCount === 8) {
      // This will move to the next phrase after beat 8 is reached
      currentIndex.value++;

      console.log("phrase index" + currentIndex.value + " started");

      if (currentIndex.value === phrases.value.length) {
        console.log("done");
        console.log("current index", currentIndex.value);
        console.log("phrases length", phrases.value.length);
        console.log("phrases", phrases);
        currentIndex.value = 0;
        phraseWidths.value = phrases.value.map(() => 0);
        currentSectionIndex.value++;

        // As long as we haven't reached the end of the song, update the phrases
        if (currentSectionIndex.value < props.sections.length) {
          phrases.value = (props.sections[currentSectionIndex.value] as any).phrases;
          phraseColors.value = (props.sections[currentSectionIndex.value] as any).color;
        }

        if (currentSectionIndex.value === props.sections.length) {
          emit("done");
        }
      }
    }
  }
);
</script>

<style scoped>
.song {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.phrase-container {
  display: flex;
  background-color: #333;
  color: white; /* text color */
  width: 100%; /* initial width */
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  margin: 0.8rem 0; /* spacing between verses */
  transition: width 1s linear; /* smooth transition for width */
  border-radius: 0.7rem;
}

.phrase-progress {
  height: 100%;
  border-radius: 0.7rem;
}

.phrase-text {
  position: absolute;
  z-index: 1;
  font-size: 4em;
  padding: 0.5em;
}
</style>

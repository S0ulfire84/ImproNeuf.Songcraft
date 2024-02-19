<template>
  <div class="song">
    <div style="font-size: 5em" v-if="currentSectionIndex < sections.length">
      {{ sections[currentSectionIndex].phrases }}
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
    <div v-if="currentSectionIndex + 1 < sections.length" style="font-size: 2em">Next: {{ sections[currentSectionIndex + 1].phrases }}</div>
  </div>
</template>

<script setup lang="ts">
// Import PropType using a type-only import
import { computed, ref, watch } from "vue";
import type { PropType } from "vue";

interface Section {
  phrases: string[];
  color: string;
}

const props = defineProps({
  bpm: Number,
  playing: Boolean,
  beat: Number,
  // Use PropType for defining the type of props.sections
  sections: Array as PropType<Section[]>,
});

const phrases = ref<string[]>(props.sections?.[0]?.phrases ?? []);
const phraseWidths = ref<number[]>(phrases.value.map(() => 0));
const phraseColors = ref<string[]>(props.sections?.[0]?.color ? [props.sections[0].color] : ["#3f3"]);
const shouldPlay = computed(() => props.playing);
const currentIndex = ref(0);
const currentSectionIndex = ref(0);
const emit = defineEmits(["done"]);

watch(
  () => props.beat,
  (beatCount) => {
    if (typeof beatCount === "number") {
      // Update the width of the current phrase
      phraseWidths.value[currentIndex.value] = (beatCount / 8) * 100;

      // Advance to the next phrase when transitioning from beat 8 to beat 1
      if (beatCount === 8) {
        currentIndex.value++;

        if (currentIndex.value === phrases.value.length) {
          currentIndex.value = 0;
          phraseWidths.value = phrases.value.map(() => 0);
          currentSectionIndex.value++;

          // Check if sections is not undefined before accessing its length
          if (currentSectionIndex.value < (props.sections?.length ?? 0)) {
            const nextSection = props.sections ? props.sections[currentSectionIndex.value] : null;
            phrases.value = nextSection?.phrases ?? [];
            phraseColors.value = nextSection?.color ? [nextSection.color] : ["#3f3"];
          }

          if (currentSectionIndex.value === (props.sections?.length ?? 0)) {
            emit("done");
          }
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
  color: white;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  margin: 0.8rem 0;
  transition: width 1s linear;
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

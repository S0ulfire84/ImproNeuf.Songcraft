<template>
  <div class="song" :class="{ 'flash-effect': flashTrigger }">
    <div style="font-size: 5em" v-if="currentSectionIndex < sections.length">
      {{ sections[currentSectionIndex].sectionName }}
    </div>
    <div class="song-structure">
      <div class="phrase-container" v-for="(phrase, index) in phrases" :key="index">
        <div
          class="phrase-progress"
          :style="{
            width: phraseWidths[index] + '%',
            backgroundColor: shouldPlay ? phraseColors[index] : 'grey',
          }"
        ></div>
        <div class="phrase-text">{{ phrase }}</div>
      </div>
    </div>
    <div v-if="currentSectionIndex + 1 < sections.length && sections[currentSectionIndex + 1].sectionName.length > 0" style="font-size: 5em">
      Next: {{ sections[currentSectionIndex + 1].sectionName }}
    </div>
  </div>
</template>

<script setup lang="ts">
// Import PropType using a type-only import
import { computed, ref, watch, nextTick } from "vue";
import type { PropType } from "vue";
import type { Section } from "@/core/interfaces.ts";

const props = defineProps({
  bpm: Number,
  playing: Boolean,
  beat: Number,
  // Use PropType for defining the type of props.sections
  sections: {
    type: Array as PropType<Section[]>,
    default: () => [],
  },
});

const phrases = ref<string[]>(props.sections?.[0]?.phrases ?? []);
const phraseWidths = ref<number[]>(phrases.value.map(() => 0));
const phraseColors = ref<string[]>(props.sections?.[0]?.colors ? props.sections[0].colors : ["#3f3"]);
const shouldPlay = computed(() => props.playing);
const currentIndex = ref(0);
const currentSectionIndex = ref(0);
const emit = defineEmits(["done"]);
const flashTrigger = ref(false);

watch(
  () => props.beat,
  async (beatCount) => {
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
            phraseColors.value = nextSection?.colors ? nextSection.colors : ["#3f3"];
          }

          if (currentSectionIndex.value === (props.sections?.length ?? 0)) {
            emit("done");
          }
        }
      }
    }

    flashTrigger.value = true;
    await nextTick(); // Wait for the DOM to update
    setTimeout(() => {
      flashTrigger.value = false; // Reset after the animation duration
    }, 500); // This duration should match the animation duration
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
  background-size: calc(100% / 8) 100%;
  background-image: linear-gradient(to right, rgba(107, 107, 107, 0.5) 3px, transparent 1px);
  background-repeat: repeat-x;
  justify-content: flex-start;
}

.phrase-progress {
  border-radius: 0.7rem;
  height: 11vh;
}

.song-structure {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80%;
}

.phrase-text {
  position: absolute;
  z-index: 1;
  font-size: 10vh;
  display: inline;
}

@keyframes flash {
  0%,
  100% {
    background-color: transparent; /* Assuming the original color is transparent or set it to your component's original background color */
  }
  10% {
    background-color: rgb(46, 46, 46); /* The flash color */
  }
}

.flash-effect {
  animation: flash 0.3s;
}
</style>

<template>
  <div class="modal bg-black shadow-lg rounded-lg p-4 max-w-xl m-auto">
    <div class="modal-header">
      <h3 class="text-lg font-bold">Loop Editor</h3>
    </div>
    <div class="modal-body">
      <div class="my-4">
        <label for="resolution" class="block mb-2 text-sm font-medium text-gray-900 text-white">Resolution</label>
        <select
          id="resolution"
          v-model="resolution"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option value="8">8 Beats per Phrase</option>
          <option value="16">16 Beats per Phrase</option>
          <option value="32">32 Beats per Phrase</option>
        </select>
      </div>
      <div class="overflow-auto">
        <table class="table-fixed w-full">
          <thead>
            <tr>
              <th class="w-1/4 px-4 py-2">Sound</th>
              <template v-for="beat in computedBeats" :key="`beat-${beat}`">
                <th class="px-4 py-2">Beat {{ beat }}</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sound in sounds" :key="sound.name">
              <td class="border px-4 py-2">{{ sound.name }}</td>
              <template v-for="beat in computedBeats" :key="`cell-${sound.name}-${beat}`">
                <td class="border px-4 py-2 text-center">
                  <input type="checkbox" :checked="sound.beats.includes(beat)" @change="updateLoopStructure(sound, beat)" />
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from "vue";
import type { BeatSound } from "@/core/interfaces.ts";

const resolution = ref(8); // Default resolution

const props = defineProps({
  sounds: {
    type: Array as PropType<BeatSound[]>,
    default: () => [],
  },
});

const computedBeats = computed(() => Array.from({ length: resolution.value }, (_, i) => i + 1));

function updateLoopStructure(sound: BeatSound, beat: number) {
  const soundIndex = props.sounds.findIndex((s) => s.name === sound.name);
  if (soundIndex !== -1) {
    const beatIndex = props.sounds[soundIndex].beats.indexOf(beat);
    if (beatIndex > -1) {
      props.sounds[soundIndex].beats.splice(beatIndex, 1);
    } else {
      props.sounds[soundIndex].beats.push(beat);
      props.sounds[soundIndex].beats.sort((a, b) => a - b);
    }
  }
  console.log(props.sounds);
}
</script>

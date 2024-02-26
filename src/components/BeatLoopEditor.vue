<template>
  <div class="modal bg-black shadow-lg rounded-lg p-4 max-w-xl m-auto">
    <div class="modal-header">
      <h3 class="text-lg font-bold">Loop Editor</h3>
    </div>
    <div class="modal-body">
      <div v-if="false" class="my-4">
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
      <button @click="toggleImportExport" class="mb-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        Show Import / Export
      </button>
      <!-- Import/Export Textarea and Import Button -->
      <div v-if="showImportExport" class="mb-4">
        <textarea v-model="exportedJson" class="w-full h-64 p-2 border rounded"></textarea>
        <button @click="importSounds" class="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Import
        </button>
      </div>
      <div class="overflow-auto">
        <table class="table-fixed w-full text-gray-300">
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
import { ref, computed, watch, type PropType } from "vue";
import type { BeatSound } from "@/core/interfaces.ts";

const resolution = ref(8); // Default resolution

const props = defineProps({
  sounds: {
    type: Array as PropType<BeatSound[]>,
    default: () => [],
  },
});

const computedBeats = computed(() => Array.from({ length: resolution.value }, (_, i) => i + 1));
const emit = defineEmits(["update:sounds"]);

const showImportExport = ref(false);

const exportedJson = ref(JSON.stringify(props.sounds, null, 2));

function toggleImportExport() {
  showImportExport.value = !showImportExport.value;
}

function importSounds() {
  try {
    const newJson: BeatSound[] = JSON.parse(exportedJson.value);

    props.sounds.splice(0, props.sounds.length);
    newJson.forEach((sound) => {
        props.sounds.push(sound);
    });

    emit("update:sounds", props.sounds);
  } catch (e) {
    alert("Failed to import: Invalid JSON format");
  }
}


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

// Watch for changes in sounds prop
watch(() => props.sounds, (newSounds, oldSounds) => {
  // This function will be called whenever the sounds prop changes.
  // You can perform any specific logic you need here.
  // For just re-rendering, Vue's reactivity system will handle it without needing to do anything here.
  console.log("Sounds changed", newSounds, oldSounds);

  // Update the exportedJson value
  exportedJson.value = JSON.stringify(newSounds, null, 2);
}, { deep: true });

</script>

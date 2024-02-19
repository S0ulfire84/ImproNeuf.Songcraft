export interface Section {
  sectionName: string;
  phrases: string[];
  colors: string[];
}

export interface BeatSound {
  name: string;
  beats: number[];
  sound: any; // Use a more specific type if available, e.g., HTMLAudioElement
}

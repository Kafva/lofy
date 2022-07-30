import { SourceType, Shortcut } from './types';
/** Toggles `console.log()` output */
const DEBUG = true

/** Custom shortcuts for switching to particular playlists/albums */
const SHORTCUTS: Shortcut[] = [
  { key: "z", activeSource: SourceType.LocalPlaylist, listIndex: 1 },
  { key: "Z", activeSource: SourceType.LocalPlaylist, listIndex: 2 },
  { key: "m", activeSource: SourceType.YouTube,       listIndex: 5 }
]

class Config {
  static readonly shuffleDefaultOn = true;
  static readonly volumeStep = 0.05;
  static readonly defaultVolume = 0.8;
  static readonly seekStepSec = 5;

  // Only applicable for YouTube videos >= 30 min
  static readonly sameTrackSkipMin = 30;
  static readonly sameTrackSeekStepMin = 3;

  // Keyboard shortcuts
  static readonly pausePlayKey = ' ';

  // With <Shift> modifier
  static readonly previousTrackKey = 'ArrowLeft';
  static readonly nextTrackKey = 'ArrowRight';
  static readonly volumeDownKey = 'ArrowDown';
  static readonly volumeUpKey = 'ArrowUp';
  static readonly seekBackKey = 'H';
  static readonly seekForwardKey = 'L';
  static readonly shuffleKey = 'S';
  static readonly coverKey = 'F';
}

export { DEBUG, SHORTCUTS }
export default Config;

import { MediaListType, Shortcut } from './types';
/** Toggles `console.log()` output */
const DEBUG = true

/** Custom shortcuts for switching to particular playlists/albums */
const SHORTCUTS: Shortcut[] = [
  { key: "z", activeList: MediaListType.LocalPlaylist, listIndex: 1 },
  { key: "Z", activeList: MediaListType.LocalPlaylist, listIndex: 2 },
  { key: "m", activeList: MediaListType.YouTube,       listIndex: 5 }
]

class Config {
  static readonly shuffleDefaultOn = true;
  static readonly volumeStep = 0.05;
  static readonly defaultVolume = 0.0;
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

  // Internals
  static readonly activeListKey = "activeList"
  static readonly listIndexKey  = "listIndex"
}

export { DEBUG, SHORTCUTS }
export default Config;

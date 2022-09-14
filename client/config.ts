import { SourceType, Shortcut } from './types';

/** Toggles `console.log()` output */
const DEBUG = true

/** Custom shortcuts for switching to particular playlists/albums */
const SHORTCUTS: Shortcut[] = [
  { key: "z", activeSource: SourceType.LocalPlaylist, listIndex: 0 },
  { key: "Z", activeSource: SourceType.LocalPlaylist, listIndex: 2 },
  { key: "m", activeSource: SourceType.YouTube,       listIndex: 26 }
]

class Config {
  static readonly shuffleDefaultOn = true;
  static readonly volumeStep = 0.05;
  static readonly defaultVolume = 0.8;
  static readonly seekStepSec = 5;

  /**
  * If a video has a duration equal or above this threshold, the
  * media prev/next events are mapped to seeking back and forwards
  * in the current track
  */
  static readonly sameTrackSkipMin = 30;
  static readonly sameTrackSeekStepMin = 3;

  // Keyboard shortcuts
  // ... without <Shift>
  static readonly pausePlayKey = ' ';

  // ... with <Shift>
  static readonly previousTrackKey = 'ArrowLeft';
  static readonly nextTrackKey = 'ArrowRight';
  static readonly volumeDownKey = 'ArrowDown';
  static readonly volumeUpKey = 'ArrowUp';
  static readonly seekBackKey = 'H';
  static readonly seekForwardKey = 'L';
  static readonly shuffleKey = 'S';

  /**
  * Show a fullscreen view of the cover for the currently playing track
  * Inspired by:
  *  https://github.com/spicetify/spicetify-cli/blob/master/Extensions/fullAppDisplay.js
  */
  static readonly coverKey = 'F';
}

export { DEBUG, SHORTCUTS }
export default Config;

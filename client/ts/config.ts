class Config {
  static readonly shuffleDefaultOn = true;
  static readonly volumeStep = 0.05;
  static readonly defaultVolume = 0.8;
  static readonly seekStepSec = 5;
  static readonly sidebarScrollStepPercent = 0.1;

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
  static readonly exitKey = 'q';
  static readonly collapseKey = 'z';

  /**
  * Jump to the currently playing track
  */
  static readonly gotoCurrentKey = 'å';

  /**
  * Toggle the visualiser in the fullscreen view.
  * This feature requires additional configuration to work with YouTube.
  */
  static readonly toggleVisualiser = 'w';

  // ... with <Shift>
  static readonly previousTrackKey = 'ArrowLeft';
  static readonly nextTrackKey = 'ArrowRight';
  static readonly volumeDownKey = 'ArrowDown';
  static readonly volumeUpKey = 'ArrowUp';
  static readonly seekBackKey = 'H';
  static readonly seekForwardKey = 'L';
  static readonly shuffleKey = 'S';
  static readonly sidebarScrollDownKey = 'J';
  static readonly sidebarScrollUpKey = 'K';
  static readonly singleRepeatKey = 'R';
  /**
  * Show a fullscreen view of the cover for the currently playing track
  * Inspired by:
  *  https://github.com/spicetify/spicetify-cli/blob/master/Extensions/fullAppDisplay.js
  * The `coverKey` will toggle the view and the `exitKey` will deactivate it
  */
  static readonly coverKey = 'F';
  // To search among the tracks, use Vimium
  static readonly listSearchKey = '&'

  // ... with <Control>
  static readonly toggleSidebarKey = 'n'

}

/** Toggles `console.log()` output */
const DEBUG = true

export { DEBUG }
export default Config;

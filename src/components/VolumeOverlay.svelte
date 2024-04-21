<script>
  import {onDestroy, onMount} from "svelte";
  import {masterVolume, musicVolume, soundVolume} from "../stores/settings.js";

  /** @type {number|null} */
  let fadeOutTimer = null;
  let overlayOpacity = 0;
  let selectedVolumeType = 'master';
  /** @type {string} */
  let overlayStyles;

  $: overlayStyles = (
    "opacity: " + overlayOpacity.toPrecision(2) + ";" +
    " --master: " + $masterVolume + ";" +
    " --music: " + $musicVolume + ";" +
    " --sound: " + $soundVolume + "; " +
    // Stop interacting with the overlay if it's not active anymore
    (overlayOpacity === 0
      ? ' pointer-events: none;'
      : '')
  );

  function fadeOutAndResetVolumeType() {
    overlayOpacity = 0;
    selectedVolumeType = 'master';
  }

  function fadeInOverlay() {
    overlayOpacity = 1;

    if (fadeOutTimer) {
      clearTimeout(fadeOutTimer);
    }

    fadeOutTimer = setTimeout(fadeOutAndResetVolumeType, 2000);
  }

  /**
   * @param {WheelEvent} wheelEvent
   */
  function adjustVolume(wheelEvent) {
    if (!wheelEvent.altKey) {
      return;
    }

    fadeInOverlay();

    /** @type {import('svelte/store').Writable<number>|null}  */
    let targetVolume = null;

    switch (selectedVolumeType) {
      case "master":
        targetVolume = masterVolume;
        break;
      case "music":
        targetVolume = musicVolume;
        break;
      case "sound":
        targetVolume = soundVolume;
        break;
      default:
        console.warn('Invalid volume type selected!');
    }

    if (targetVolume) {
      let changeAmount = -0.05;

      if (wheelEvent.deltaY < 0) {
        changeAmount = changeAmount * -1;
      }

      targetVolume.update(currentValue => {
        return Math.min(Math.max(currentValue + changeAmount, 0), 1);
      });
    }
  }

  /**
   * @param {string} volumeType
   */
  function switchVolumeTypeTo(volumeType) {
    return () => {
      selectedVolumeType = volumeType;
    }
  }

  onMount(() => {
    window.addEventListener('wheel', adjustVolume);
  });

  onDestroy(() => {
    window.removeEventListener('wheel', adjustVolume);
  })
</script>

<div class="volume-overlay" style="{overlayStyles}">
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<div class="master" on:mouseover={switchVolumeTypeTo('master')} role="progressbar">Master</div>
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<div class="music" on:mouseover={switchVolumeTypeTo('music')} role="progressbar">Music</div>
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	<div class="sound" on:mouseover={switchVolumeTypeTo('sound')} role="progressbar">Sound</div>
</div>

<style lang="scss">
  .volume-overlay {
    opacity: 1;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    display: grid;
    gap: 1px;
    transition: opacity .25s ease;

    .master, .music, .sound {
      display: flex;
      padding: 1px;
      text-align: right;
      position: relative;
      text-shadow: 1px 0 black;

      &:before, &:after {
        content: '';
        display: block;
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: -1;
      }

      &:before {
        background-color: #666;
        width: 50px;
      }

      &:after {
        background-color: #999;
      }
    }

    .master:after {
      width: calc(50px * var(--master, 1));
    }

    .music:after {
      width: calc(50px * var(--music, 1));
    }

    .sound:after {
      width: calc(50px * var(--sound, 1));
    }
  }
</style>
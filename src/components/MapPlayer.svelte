<script>
  import {onDestroy, onMount} from "svelte";
  import {keyboardBinds, notesSpeed} from "../stores/settings.js";
  import {BeatMapCompiler} from "$lib/game/mapping/compiled/BeatMapCompiler.js";
  import {CompiledNote} from "$lib/game/mapping/compiled/CompiledNote.js";
  import {CompiledSlider} from "$lib/game/mapping/compiled/CompiledSlider.js";

  /**
   * Beat map object to play. Should be preloaded before passing into the player component.
   * @type {import('$lib/game/mapping.js').BeatMap}
   */
  export let map;

  const compiledMap = new BeatMapCompiler(map).compileMap();

  /**
   * Set for detecting current state of keys being held.
   * @type {Set<string>}
   */
  let pressedKeys = new Set([]);

  /**
   * Container with 4 bars.
   * @type {HTMLElement}
   */
  let mapContainer;

  /**
   * Actual height of the screen. Used for calculating the speed of the notes.
   * @type {number}
   */
  let mapHeight;

  /**
   * Array with bar elements inside for fast access.
   * @type {HTMLElement[]}
   */
  const barElements = new Array(4);

  /**
   * Lists of notes separated by bars. Useful for calculating the accuracy of key presses.
   * @type {(CompiledNote|CompiledSlider|undefined)[][]}
   */
  const noteQueues = new Array(4);

  /**
   * Current active interval of rendering upcoming notes.
   * @type {number|null}
   */
  let renderInterval = null;

  /**
   * Current active requested frame handle.
   * @type {number|null}
   */
  let refreshRequestedFrame = null;

  /**
   * Last index of the note rendered by {@link renderFutureNotes} function.
   * @type {number|null}
   */
  let lastRenderedIndex = null;

  /**
   * Handle the key being pressed.
   * @param {KeyboardEvent} event
   */
  function onKeyPressed(event) {
    // Prevent logic from running multiple times while keys was being held.
    if (pressedKeys.has(event.code)) {
      return;
    }

    const barIndex = $keyboardBinds.findIndex(keyBind => keyBind === event.code);

    if (barIndex < 0) {
      return;
    }

    pressedKeys.add(event.code);
    pressedKeys = pressedKeys;

    const barQueue = noteQueues[barIndex] ?? [];
    const closestNote = barQueue.length ? barQueue[0] : null;

    if (closestNote) {
      map.playSound(closestNote.typeIndex, closestNote.volume);
    } else {
      map.playSound(0, 1);
    }
  }

  /**
   * Handle the key being released.
   * @param {KeyboardEvent} event
   */
  function onKeyReleased(event) {
    pressedKeys.delete(event.code);
    pressedKeys = pressedKeys;
  }

  /**
   * Render the chunk of notes.
   */
  function renderFutureNotes() {
    const currentTime = Math.floor(map.currentTime * 1000);
    const startIndex = lastRenderedIndex !== null ? lastRenderedIndex + 1 : 0;
    const limitFutureTime = currentTime + $notesSpeed * 2;

    for (let currentIndex = startIndex; currentIndex < compiledMap.length; currentIndex++) {
      const note = compiledMap[currentIndex];

      if (note.time >= limitFutureTime) {
        break;
      }

      lastRenderedIndex = currentIndex;

      const noteElement = document.createElement('div');
      noteElement.classList.add('note');
      noteElement.style.setProperty('--time', note.time.toString());

      if (note instanceof CompiledSlider) {
        noteElement.classList.add('slider');
        noteElement.style.setProperty('--end-time', note.endTime.toString());
      }

      note.connectedElement = noteElement;

      barElements[note.barIndex].append(noteElement);
    }
  }

  function updateOffsetOnFrame() {
    mapContainer.style.setProperty('--offset-time', (Math.floor(map.currentTime * 1000)).toString());

    refreshRequestedFrame = requestAnimationFrame(updateOffsetOnFrame);
  }

  onMount(() => {
    mapHeight = mapContainer.clientHeight;

    window.addEventListener('keydown', onKeyPressed);
    window.addEventListener('keyup', onKeyReleased);

    map.startPlaying();

    renderInterval = setInterval(renderFutureNotes, $notesSpeed);

    renderFutureNotes();

    refreshRequestedFrame = requestAnimationFrame(updateOffsetOnFrame);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', onKeyPressed);
    window.removeEventListener('keyup', onKeyReleased);

    if (renderInterval) {
      clearInterval(renderInterval);
    }

    if (refreshRequestedFrame) {
      cancelAnimationFrame(refreshRequestedFrame);
    }
  });
</script>

<div class="map" style="--speed: {$notesSpeed}; --height: {mapHeight}px;" bind:this={mapContainer}>
	{#each $keyboardBinds as key, index}
		<div class="bar {pressedKeys.has(key ?? '') ? ' pressed' : ''}" bind:this={barElements[index]}></div>
	{/each}
</div>

<style lang="scss">
  .map {
    display: flex;
    justify-content: center;
    height: 100%;
    align-items: flex-end;
    padding-bottom: 10px;

    .bar {
      width: 20px;
      height: 100%;
      position: relative;

      &:after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        background-color: white;
        transition: bottom .05s ease;
      }

      &.pressed:after {
        bottom: -2px;
      }

      :global(.note) {
        height: 2px;
        background-color: white;
        position: absolute;
        left: 0;
        right: 0;
        bottom: calc(var(--height) / var(--speed) * (var(--time) - var(--offset-time)));
      }

      :global(.slider) {
        height: calc(var(--height) / var(--speed) * (var(--end-time) - var(--time)) + 2px);
      }
    }
  }
</style>
<script>
  import {onDestroy, onMount} from "svelte";
  import {keyboardBinds, notesSpeed} from "../stores/settings.js";
  import {BeatMapCompiler} from "$lib/game/mapping/compiled/BeatMapCompiler.js";
  import {CompiledNote} from "$lib/game/mapping/compiled/CompiledNote.js";
  import {CompiledSlider} from "$lib/game/mapping/compiled/CompiledSlider.js";

  /** @type {import('$lib/game/mapping.js').BeatMap} */
  export let map;

  const compiledMap = new BeatMapCompiler(map).compileMap();

  /** @type {Set<string>} */
  let pressedKeys = new Set([]);
  /** @type {number} */
  let mapHeight;
  /** @type {HTMLElement} */
  let mapContainer;
  /** @type {HTMLElement[]} */
  const barElements = new Array(4);
  /** @type {(CompiledNote|CompiledSlider|undefined)[]} */
  const noteQueues = new Array(4);

  /** @type {number|null} */
  let renderInterval = null;
  /** @type {number|null} */
  let refreshRequestedFrame = null;
  /** @type {number|null} */
  let lastRenderedIndex = null;

  /**
   * @param {KeyboardEvent} event
   */
  function onKeyPressed(event) {
    if (pressedKeys.has(event.code)) {
      return;
    }

    const columnPressed = $keyboardBinds.findIndex(bind => bind === event.code);

    if (columnPressed < 0) {
      return;
    }

    pressedKeys.add(event.code);
    pressedKeys = pressedKeys;

    map.playNote(0, 1);
  }

  /**
   * @param {KeyboardEvent} event
   */
  function onKeyReleased(event) {
    pressedKeys.delete(event.code);
    pressedKeys = pressedKeys;
  }

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
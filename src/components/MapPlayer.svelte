<script>
  import {onDestroy, onMount} from "svelte";
  import {keyboardBinds} from "../stores/settings.js";
  import {BeatMapCompiler} from "$lib/game/mapping/compiled/BeatMapCompiler.js";
  import {CompiledNote} from "$lib/game/mapping/compiled/CompiledNote.js";
  import {CompiledSlider} from "$lib/game/mapping/compiled/CompiledSlider.js";

  /** @type {import('$lib/game/mapping.js').BeatMap} */
  export let map;

  /** @type {Set<string>} */
  let pressedKeys = new Set([]);

  const compiledMap = new BeatMapCompiler(map).compileMap();
  /** @type {HTMLElement[]} */
  const barElements = new Array(4);
  /** @type {(CompiledNote|CompiledSlider|undefined)[]} */
  const latestBarNotes = new Array(4);

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

  onMount(() => {
    map.startPlaying();

    window.addEventListener('keydown', onKeyPressed);
    window.addEventListener('keyup', onKeyReleased);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', onKeyPressed);
    window.removeEventListener('keyup', onKeyReleased);
  });
</script>

<div class="map">
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
    }
  }
</style>
<script>
  import {onDestroy, onMount} from "svelte";
  import {keyboardBinds} from "../stores/settings.js";

  /** @type {import('$lib/game/mapping.js').BeatMap} */
  export let map;

  let elapsed = -1;
  let elapsedTimeInterval = -1;
  /** @type {Set<string>} */
  let pressedKeys = new Set([]);

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
    map.playNote(0, 1);
  }

  /**
   * @param {KeyboardEvent} event
   */
  function onKeyReleased(event) {
	pressedKeys.delete(event.code);
  }

  onMount(() => {
    map.startPlaying();

    window.addEventListener('keydown', onKeyPressed);
    window.addEventListener('keyup', onKeyReleased);

    elapsedTimeInterval = setInterval(() => {
      elapsed = map.currentTime;
    }, 16);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', onKeyPressed);
    window.removeEventListener('keyup', onKeyReleased);

    clearInterval(elapsedTimeInterval);
  });
</script>

<div>
	{elapsed}
</div>
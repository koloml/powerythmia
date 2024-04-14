<script>
  import {masterVolume, musicVolume} from "../stores/settings.js";
  import {mainThemeVolume} from "../stores/environment.js";
  import {onDestroy, onMount} from "svelte";

  /** @type {HTMLAudioElement} */
  let mainMenuAudio = new Audio('/audio/menu.ogg');

  mainMenuAudio.autoplay = false;
  mainMenuAudio.loop = true;

  $: {
    mainMenuAudio.volume = $masterVolume * $musicVolume * $mainThemeVolume;
  }

  function startAudio() {
    if (mainMenuAudio.currentTime) {
      return;
    }

    mainMenuAudio.play();
  }

  onMount(() => {
    window.addEventListener(
      'mouseover',
      startAudio,
      {passive: true}
    );
  });

  onDestroy(() => {
    mainMenuAudio.pause();
    mainMenuAudio.currentTime = 0;
  });
</script>
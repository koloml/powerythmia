<script>
  import 'unfonts.css';
  import {onDestroy, onMount} from "svelte";
  import VolumeOverlay from "../components/VolumeOverlay.svelte";
  import MenuMusicPlayer from "../components/MenuMusicPlayer.svelte";

  const targetWidth = 256;
  const targetHeight = 144;

  let scaleRatio = 1;
  let windowStyles = '';

  $: windowStyles = `transform: scale(${scaleRatio.toPrecision(4)}); width: ${targetWidth}px; height: ${targetHeight}px`;

  function refreshScaleRatio() {
    scaleRatio = Math.min(
      window.innerWidth / targetWidth,
      window.innerHeight / targetHeight
    );
  }

  onMount(() => {
    window.addEventListener('resize', refreshScaleRatio);
    refreshScaleRatio();

    // Disable zoom by wheel
    document.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    }, {passive: false});

    // Disable the zoom by Ctrl+Plus/Minus
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && (e.key === '+' || e.key === '=' || e.key === '-')) {
        e.preventDefault();
      }
    });
  });

  onDestroy(() => {
    window.removeEventListener('resize', refreshScaleRatio);
  });
</script>

<main style="{windowStyles}">
	<slot>

	</slot>
	<!--<MenuMusicPlayer></MenuMusicPlayer>-->
	<VolumeOverlay></VolumeOverlay>
</main>

<style lang="scss">
	main {
	  transform-origin: center;
	  position: relative;
	}
</style>
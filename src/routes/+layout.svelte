<script>
  import 'unfonts.css';
  import {onDestroy, onMount} from "svelte";
  import VolumeOverlay from "../components/VolumeOverlay.svelte";
  import MenuMusicPlayer from "../components/MenuMusicPlayer.svelte";

  const targetWidth = 480;
  const targetHeight = 270;

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
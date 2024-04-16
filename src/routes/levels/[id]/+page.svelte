<script>
  import {levelsCollection} from "$lib/levels/levels-collection.js";
  import {page} from "$app/stores";
  import {goto} from "$app/navigation";
  import {masterVolume, musicVolume, soundVolume} from "../../../stores/settings.js";
  import {onDestroy} from "svelte";
  import MapPlayer from "../../../components/MapPlayer.svelte";

  async function loadAndInitializeMap() {
    const map = levelsCollection.get($page.params.id);

    if (!map) {
      void goto('/levels');
      return null;
    }

    await map.initializeAudio();

    map.connectVolumeControl({
      master: masterVolume,
      music: musicVolume,
      sound: soundVolume
    })

    return map;
  }

  let promisedMap = loadAndInitializeMap();

  onDestroy(() => {
    promisedMap.then(
      map => map?.disposeResources()
    );
  })
</script>

<div>
	{#await promisedMap}
		<div>Loading map...</div>
	{:then loadedMap}
		{#if loadedMap}
			<MapPlayer map="{loadedMap}"></MapPlayer>
		{:else}
			<div>Failed to load the map!</div>
		{/if}
	{/await}
</div>
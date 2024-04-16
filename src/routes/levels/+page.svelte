<script>
  import {levelsCollection} from "$lib/levels/levels-collection.js";
</script>

<div class="level-selector">
	<div class="level-selector-title">Level Title</div>
	<div class="level-selector-splash">Splash Image</div>
	<div class="level-selector-list">
		{#if levelsCollection.size}
			{#each levelsCollection.entries() as [key, level]}
				<a href="/levels/{key}">{level.name}</a>
			{/each}
		{:else}
			<div>No Levels Loaded</div>
		{/if}
	</div>
	<div class="level-selector-bottom">
		<a href="/">Back</a>
	</div>
</div>

<style lang="scss">
  .level-selector {
    width: 100%;
    height: 100%;
    display: grid;
    grid: {
      template-columns: 1fr 1fr;
      template-rows: auto 1fr;
      template-areas: 'title list' 'splash list' 'bottom bottom';
    }
    gap: 4px;

    & > * {
      outline: 1px solid white;
    }

    &-title {
      grid-area: title;
    }

    &-splash {
      grid-area: splash;
    }

    &-list {
      grid-area: list;
    }

    &-bottom {
      grid-area: bottom;
    }
  }
</style>
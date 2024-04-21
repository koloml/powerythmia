<script>
  import {keyboardBinds, masterVolume, musicVolume, notesSpeed, soundVolume} from "../../stores/settings.js";

  /** @type {string[]} */
  let boundKeys = [];
  let maxKeys = 4;

  $: {
    for (let keyIndex = 0; keyIndex < maxKeys; keyIndex++) {
      boundKeys[keyIndex] = $keyboardBinds?.[keyIndex] ?? 'Unbound';
    }
  }

  /**
   * @param {number} updatedIndex
   * @return {function(KeyboardEvent): void}
   */
  function updateBindForIndex(updatedIndex) {
    return event => {
      const updatedKeyCode = event.code;

      keyboardBinds.update(binds => {
        return binds?.map((bindKeyCode, bindIndex) => {
          if (bindIndex === updatedIndex) {
            return updatedKeyCode;
          }

          if (bindKeyCode === updatedKeyCode) {
            return null;
          }

          return bindKeyCode;
        })
      });

      // Focus the next input if it's available
      if (event.currentTarget instanceof HTMLInputElement) {
        event.currentTarget.blur();
		event.currentTarget.parentElement?.querySelectorAll('input')[updatedIndex + 1]?.focus();
      }
    }
  }
</script>

<div class="settings">
	<h1>Settings</h1>
	<label>
		<span>Master Volume ({Math.floor($masterVolume * 100)}%)</span>
		<input bind:value={$masterVolume} min="0" max="1" step="0.05" type="range">
	</label>
	<label>
		<span>Music Volume ({Math.floor($musicVolume * 100)}%)</span>
		<input bind:value={$musicVolume} min="0" max="1" step="0.05" type="range">
	</label>
	<label>
		<span>Sound Volume ({Math.floor($soundVolume * 100)}%)</span>
		<input bind:value={$soundVolume} min="0" max="1" step="0.05" type="range">
	</label>
	<label>
		<span>Key Binds</span>
		<span class="keys">
			{#each boundKeys as key, index}
				<input type="text" readonly bind:value={key} on:keydown={updateBindForIndex(index)}>
			{/each}
		</span>
	</label>
	<label>
		<span>Note Speed ({$notesSpeed}ms)</span>
		<input bind:value={$notesSpeed} min="250" max="1000" step="50" type="range">
	</label>
	<a href="/">Back</a>
</div>

<style lang="scss">
  .settings {
    display: flex;
    flex-direction: column;
    gap: 1px;

    h1 {
      font-family: LazyFox2, sans-serif;
      font-size: 11px;
      text-align: center;
      margin-bottom: 5px;
    }

    label {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1px;

      span {
        text-align: right;
      }
    }

	a {
	  text-align: center;
	}

	.keys {
	  input {
		transform: translateY(-1px);

		&:focus {
		  background-color: white;
		  color: black;
		}
	  }
	}
  }
</style>
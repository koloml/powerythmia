<div class="main-menu">
	<h1>Powerythmia</h1>
	<a href="/levels">Play</a>
	<a href="/settings">Settings</a>
</div>

<div class="credits">
	<a href="https://koloml.itch.io/">KoloMl</a> programming
	<br>
	<a href="https://ast_r.itch.io/">ast_r</a> music & artwork
	<br>
	<a href="https://lazy-fox.itch.io/">LazyFox</a> fonts
</div>

<div class="purpose">
	Made for <a href="https://gamedevjs.com/jam/2024/">Gamedev.js 2024</a>
	<br>
	Source code on <a href="https://github.com/koloml/powerythmia">GitHub</a>
</div>

<style lang="scss">
  .main-menu {
    display: grid;
    text-align: center;
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);

    h1 {
      font-family: LazyFox2, sans-serif;
      margin-bottom: 10px;
      font-size: 22px;
    }
  }

  .credits {
    position: absolute;
    left: 0;
    bottom: 0;

    a {
      font-family: LazyFox2, sans-serif;
      font-size: 11px;
    }
  }

  .purpose {
    position: absolute;
    right: 0;
    bottom: 0;
    text-align: right;
  }
</style>
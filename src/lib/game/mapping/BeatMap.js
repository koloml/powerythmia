export class BeatMap {
  /** @type {string} */
  name;
  /** @type {string} */
  composer;
  /** @type {string} */
  mapper;
  /** @type {string} */
  trackUrl;
  /** @type {NoteType[]} */
  noteTypes;
  /** @type {TimingSection[]} */
  rawMap;
  /** @type {number} */
  startOffset;

  /** @type {AudioContext} */
  #mapAudioContext = null;

  /** @type {AudioBuffer} */
  #trackBuffer = null;

  /** @type {AudioBufferSourceNode} */
  #trackSource = null;

  /** @type {GainNode} */
  #masterGain = null;

  /** @type {GainNode} */
  #musicGain = null;

  /** @type {GainNode} */
  #soundGain = null;

  /** @type {number|null} */
  #startedAt = null;

  get currentTime() {
    if (!this.#startedAt) {
      return -1;
    }

    return this.#mapAudioContext.currentTime - this.#startedAt;
  }

  /** @type {function[]} */
  #subscribedVolumeControls = [];

  /**
   * Initialize the map by downloading and preparing all the resources needed for audio playback. Should be called
   * only once, before passing the map into the player component.
   * @return {Promise<void>}
   */
  async initializeAudio() {
    if (this.#mapAudioContext) {
      return;
    }

    this.#mapAudioContext = new AudioContext();

    const trackResponse = await fetch(this.trackUrl, {
      cache: "force-cache"
    });

    if (!trackResponse.ok) {
      throw new Error(`Failed to fetch audio at ${this.trackUrl}!`);
    }

    this.#trackBuffer = await this.#mapAudioContext.decodeAudioData(
      await trackResponse.arrayBuffer()
    );

    for (let noteDefinition of this.noteTypes) {
      await noteDefinition.loadAudio(this.#mapAudioContext);
    }

    this.#masterGain = this.#mapAudioContext.createGain()
    this.#musicGain = this.#mapAudioContext.createGain();
    this.#soundGain = this.#mapAudioContext.createGain();

    /**
     * Connecting the nodes together.
     *
     * Graph of nodes looks like this:
     *
     * [Track Source] => [Music Gain] -o> [Master Gain] => [Destination]
     *                                 |
     * [Notes] => [Sound Gain] ------->/
     */
    this.#musicGain.connect(this.#masterGain);
    this.#soundGain.connect(this.#masterGain);
    this.#masterGain.connect(this.#mapAudioContext.destination);
  }

  /**
   * Start the playback. Should be called once to start the playback.
   * @return {Promise<void>}
   */
  async startPlaying() {
    if (!this.#mapAudioContext) {
      throw new Error('Audio is not initialized yet!');
    }

    if (this.#trackSource) {
      this.#trackSource.stop();
      this.#trackSource.disconnect();
      this.#trackSource = null;
    }

    this.#trackSource = this.#mapAudioContext.createBufferSource();
    this.#trackSource.buffer = this.#trackBuffer;
    this.#trackSource.connect(this.#musicGain);
    this.#trackSource.start();

    this.#startedAt = this.#mapAudioContext.currentTime;
  }

  /**
   * Play the sound of the note type.
   * @param {number} typeIndex Type of the note to use sound from.
   * @param {number} volume Volume to run the sound at. Value from 0 to 1.
   * @return {Promise<void>}
   */
  async playSound(typeIndex, volume = 1) {
    const noteType = this.noteTypes[typeIndex] ?? null;

    if (!noteType) {
      throw new Error(`Note type is not registered: ${typeIndex}!`);
    }

    const noteSource = this.#mapAudioContext.createBufferSource();
    noteSource.buffer = noteType.audioBuffer;

    const localGain = this.#mapAudioContext.createGain();
    localGain.gain.value = volume;

    noteSource.connect(localGain);
    localGain.connect(this.#soundGain);
    noteSource.start();
  }

  /**
   * Connect the Svelte stores containing the volume for the audio playback. Should only be connected once during
   * initialization faze after the {@link BeatMap.initializeAudio}. These connections can be removed by
   * {@link BeatMap.disposeResources} method.
   * @param {VolumeStores} stores Object containing three channels for volume control.
   */
  connectVolumeControl({master, music, sound}) {
    if (this.#subscribedVolumeControls.length) {
      throw new Error('Volume controls already connected!');
    }

    this.#subscribedVolumeControls.push(
      master.subscribe(volume => this.#masterGain.gain.value = volume),
      music.subscribe(volume => this.#musicGain.gain.value = volume),
      sound.subscribe(volume => this.#soundGain.gain.value = volume),
    );
  }

  /**
   * Destroy the audio context and un-reference all the unused resources.
   */
  disposeResources() {
    void this.#mapAudioContext.close();

    for (let unsubscribe of this.#subscribedVolumeControls) {
      unsubscribe();
    }

    if (this.noteTypes && this.noteTypes.length) {
      for (let noteType of this.noteTypes) {
        noteType.disposeResources();
      }
    }

    this.#subscribedVolumeControls = [];
    this.#startedAt = null;
    this.#trackBuffer = null;
    this.#mapAudioContext = null;
  }
}

export class BeatMapBuilder {
  /**
   * Target object for building.
   * @type {BeatMap}
   */
  #beatMap = new BeatMap();

  /**
   * Set the name of the beat map.
   * @param {string} name
   * @return {BeatMapBuilder}
   */
  withName(name) {
    this.#beatMap.name = name;
    return this;
  }

  /**
   * Set the composer of the audio-track.
   * @param {string} name
   * @return {BeatMapBuilder}
   */
  withComposer(name) {
    this.#beatMap.composer = name;
    return this;
  }

  /**
   * Set the name of the person making the map.
   * @param {string} name
   * @return {BeatMapBuilder}
   */
  withMapper(name) {
    this.#beatMap.mapper = name;
    return this;
  }

  /**
   * Pass the URL of the audio-track file.
   * @param {string} audioUrl
   * @return {BeatMapBuilder}
   */
  withTrackUrl(audioUrl) {
    this.#beatMap.trackUrl = audioUrl;
    return this;
  }

  /**
   * Register the list of note types used in this map. Use {@link NoteTypeBuilder} to create a new note type.
   * @param {NoteType[]} noteTypes
   * @return {BeatMapBuilder}
   */
  withNoteTypes(noteTypes) {
    this.#beatMap.noteTypes = noteTypes;
    return this;
  }

  /**
   * The map itself. Can be built using {@link TimingSectionBuilder} class.
   * @param {TimingSection[]} map List of timing sections with notes defined inside them.
   * @return {BeatMapBuilder}
   */
  withMap(map) {
    this.#beatMap.rawMap = map;
    return this;
  }

  /**
   * Get the resulting object.
   * @return {BeatMap}
   */
  build() {
    return this.#beatMap;
  }
}

/**
 * @typedef {Object} VolumeStores
 * @property {Writable<number>} master
 * @property {Writable<number>} music
 * @property {Writable<number>} sound
 */
export class BeatMap {
  /** @type {string} */
  name;
  /** @type {string} */
  composer;
  /** @type {string} */
  mapper;
  /** @type {string} */
  trackUrl;
  /** @type {NoteDefinition[]} */
  noteTypes;
  /** @type {[]} */
  map;

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

  async playNote(noteDefinitionIndex, volume = 1) {
    const noteDefinition = this.noteTypes[noteDefinitionIndex] ?? null;

    if (!noteDefinition) {
      throw new Error(`Note definition is not registered: ${noteDefinitionIndex}!`);
    }

    const noteSource = this.#mapAudioContext.createBufferSource();
    noteSource.buffer = noteDefinition.audioBuffer;

    const localGain = this.#mapAudioContext.createGain();
    localGain.gain.value = volume;

    noteSource.connect(localGain);
    localGain.connect(this.#soundGain);
    noteSource.start();
  }

  /**
   * @param {Object} stores
   * @param {import('svelte/store').Writable<number>} stores.master
   * @param {import('svelte/store').Writable<number>} stores.music
   * @param {import('svelte/store').Writable<number>} stores.sound
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

  disposeResources() {
    void this.#mapAudioContext.close();

    for (let unsubscribe of this.#subscribedVolumeControls) {
      unsubscribe();
    }

    if (this.noteTypes && this.noteTypes.length) {
      for (let noteDefinition of this.noteTypes) {
        noteDefinition.disposeResources();
      }
    }

    this.#subscribedVolumeControls = [];
    this.#startedAt = null;
    this.#trackBuffer = null;
    this.#mapAudioContext = null;
  }
}

export class BeatMapBuilder {
  #beatMap = new BeatMap();

  withName(name) {
    this.#beatMap.name = name;
    return this;
  }

  withComposer(name) {
    this.#beatMap.composer = name;
    return this;
  }

  withMapper(name) {
    this.#beatMap.mapper = name;
    return this;
  }

  withTrackUrl(audioUrl) {
    this.#beatMap.trackUrl = audioUrl;
    return this;
  }

  withNoteTypes(noteTypes) {
    this.#beatMap.noteTypes = noteTypes;
    return this;
  }

  withMap(map) {
    return this;
  }

  build() {
    return this.#beatMap;
  }
}

export class BeatMapTimingSection {
  /**
   * Start time in milliseconds.
   * @type {number}
   */
  startTime;
  /**
   * @type {number}
   */
  bpm;
  speed;
  notes;
}

export class BeatMapTimingSectionBuilder {
  #section = new BeatMapTimingSection();

  withStartTime(startTime) {
    this.#section.startTime = startTime;
    return this;
  }

  withBpm(bpm) {
    this.#section.bpm = bpm;
    return this;
  }

  withSpeed(speed) {
    this.#section.speed = speed;
    return this;
  }

  withNotes(notes) {
    this.#section.notes = notes;
    return this;
  }

  build() {
    return this.#section;
  }
}

export class NoteDefinition {
  audioUrl;

  /** @type {AudioBuffer} */
  #noteAudioBuffer;

  /**
   * @param {AudioContext} targetAudioContext
   * @return {Promise<void>}
   */
  async loadAudio(targetAudioContext) {
    if (this.#noteAudioBuffer) {
      return;
    }

    const audioResponse = await fetch(this.audioUrl, {
      cache: "force-cache"
    });

    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio at ${this.audioUrl}`);
    }

    this.#noteAudioBuffer = await targetAudioContext.decodeAudioData(
      await audioResponse.arrayBuffer()
    );
  }

  get audioBuffer() {
    return this.#noteAudioBuffer;
  }

  disposeResources() {
    this.#noteAudioBuffer = null;
  }
}

export class NoteDefinitionBuilder {
  #noteDefinition = new NoteDefinition();

  withAudioUrl(audioUrl) {
    this.#noteDefinition.audioUrl = audioUrl;
    return this;
  }

  build() {
    return this.#noteDefinition;
  }
}


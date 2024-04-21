export class NoteType {
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

export class NoteTypeBuilder {
  #noteDefinition = new NoteType();

  withAudioUrl(audioUrl) {
    this.#noteDefinition.audioUrl = audioUrl;
    return this;
  }

  build() {
    return this.#noteDefinition;
  }
}

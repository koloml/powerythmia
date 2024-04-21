export class TimingSection {
  /**
   * Start time in milliseconds.
   * @type {number}
   */
  startTime;
  /**
   * @type {number}
   */
  bpm;
  /**
   * @type {TimingSectionRow[]}
   */
  noteRows = [];
}

export class TimingSectionBuilder {
  #section = new TimingSection();

  withStartTime(startTime) {
    this.#section.startTime = startTime;
    return this;
  }

  withBpm(bpm) {
    this.#section.bpm = bpm;
    return this;
  }

  withNotes(notes) {
    this.#section.noteRows = notes;
    return this;
  }

  build() {
    return this.#section;
  }
}

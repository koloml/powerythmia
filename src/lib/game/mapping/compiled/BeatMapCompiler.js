import {CompiledNote} from "$lib/game/mapping/compiled/CompiledNote.js";
import {Slider} from "$lib/game/mapping/timing/Slider.js";
import {Note} from "$lib/game/mapping/timing/Note.js";
import {CompiledSlider} from "$lib/game/mapping/compiled/CompiledSlider.js";

export class CompilationError extends Error {
  /**
   * @param {string} message
   * @param {number|null} [sectionIndex=null]
   * @param {number|null} [rowIndex=null]
   * @param {number|null} [barIndex=null]
   */
  constructor(message, sectionIndex = null, rowIndex = null, barIndex = null) {
    const details = [];

    if (sectionIndex !== null) {
      details.push(`Section index: ${sectionIndex}`);
    }

    if (rowIndex !== null) {
      details.push(`Row index: ${rowIndex}`);
    }

    if (barIndex !== null) {
      details.push(`Bars index: ${barIndex}`);
    }

    if (details.length > 0) {
      message += `\nDetails:\n${details.join(",")}`;
    }

    super(message);
  }
}

export class BeatMapCompiler {
  /** @type {BeatMap} */
  #beatMap;
  /** @type {(CompiledNote|CompiledSlider)[]} */
  #notes = [];
  /** @type {(CompiledSlider|undefined)[]} */
  #barSliders = [];

  /** @param {BeatMap} beatMap */
  constructor(beatMap) {
    this.#beatMap = beatMap;
  }

  compileMap() {
    this.#notes = [];
    this.#barSliders = new Array(4);

    for (let sectionIndex = 0; sectionIndex < this.#beatMap.rawMap.length; sectionIndex++) {
      let section = this.#beatMap.rawMap[sectionIndex];
      let sectionStart = section.startTime;
      let singleBeatTime = 60000 / section.bpm;

      for (let rowIndex = 0; rowIndex < section.noteRows.length; rowIndex++) {
        let row = section.noteRows[rowIndex];
        let timePerSubBeat = singleBeatTime / row.division;

        if (row.subBeat >= row.division) {
          throw new CompilationError(
            `Sub-beat index ${row.subBeat} can't be higher than division ${row.division}!`,
            sectionIndex,
            rowIndex
          );
        }

        for (let barIndex = 0; barIndex < row.bars.length; barIndex++) {
          const targetElement = row.bars[barIndex];
          const targetTime = Math.floor(
            sectionStart + singleBeatTime * row.index + timePerSubBeat * row.subBeat
          );

          if (!targetElement) {
            continue;
          }

          if (targetElement instanceof Slider) {
            let currentBarSlider = this.#barSliders[barIndex];

            if (currentBarSlider && targetElement.isHead) {
              throw new CompilationError(
                'Attempting to start new slider before ending previous slider!',
                sectionIndex,
                rowIndex,
                barIndex
              );
            }

            if (!currentBarSlider && !targetElement.isHead) {
              throw new CompilationError(
                'Attempting to end the slider before it even started!',
                sectionIndex,
                rowIndex,
                barIndex
              );
            }

            if (targetElement.isHead) {
              currentBarSlider = new CompiledSlider();

              currentBarSlider.barIndex = barIndex;
              currentBarSlider.time = targetTime;
              currentBarSlider.typeIndex = targetElement.type;

              this.#barSliders[barIndex] = currentBarSlider;
              this.#notes.push(currentBarSlider);

              continue;
            }

            if (currentBarSlider) {
              currentBarSlider.endTypeIndex = targetElement.type;
              currentBarSlider.endVolume = targetElement.volume;
              currentBarSlider.endTime = targetTime;
            }

            delete this.#barSliders[barIndex];

            continue;
          }

          if (targetElement instanceof Note) {
            const note = new CompiledNote();

            note.barIndex = barIndex;
            note.time = targetTime;
            note.typeIndex = targetElement.type;
            note.volume = targetElement.volume;

            this.#notes.push(note);

            continue;
          }

          throw new CompilationError(
            'Invalid value passed! Only notes, slides and null are allowed!',
            sectionIndex,
            rowIndex,
            barIndex
          );
        }
      }
    }

    return this.#notes;
  }
}
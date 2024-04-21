import {CompiledNote} from "$lib/game/mapping/compiled/CompiledNote.js";

export class CompiledSlider extends CompiledNote {
  /** @type {number} */
  endTime;

  /** @type {number} */
  endTypeIndex;

  /** @type {number} */
  endVolume;
}
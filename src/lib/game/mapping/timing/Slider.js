import {Note} from "$lib/game/mapping/timing/Note.js";

export class Slider extends Note {
  /** @type {boolean} */
  isHead;
}

/**
 * @param {number} type
 * @param {number} volume
 * @return {Slider}
 */
export function sliderStart(type, volume) {
  const slider = new Slider();

  slider.type = type;
  slider.volume = volume;
  slider.isHead = true;

  return slider;
}


/**
 * @param {number} type
 * @param {number} volume
 * @return {Slider}
 */
export function sliderEnd(type, volume) {
  const slider = new Slider();

  slider.type = type;
  slider.volume = volume;
  slider.isHead = false;

  return slider;
}
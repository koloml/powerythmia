import {writable} from "svelte/store";

/**
 * Initialize the savable numeric setting.
 * @param {string} settingKey Key of the local storage entry where the value will be stored.
 * @param {number} defaultValue Default value of the setting before it was saved.
 * @return {import('svelte/store').Writable<number>} Instance of the store object.
 */
function initializeNumericSetting(settingKey, defaultValue) {
  let initialValue;

  try {
    initialValue = JSON.parse(localStorage.getItem(settingKey));
  } catch (e) {
    initialValue = defaultValue;
  }

  if (!isFinite(initialValue) || initialValue === null) {
    initialValue = defaultValue;
  }

  const settingStore = writable(initialValue);

  settingStore.subscribe(updatedValue => {
    localStorage.setItem(settingKey, JSON.stringify(updatedValue));
  })

  return settingStore;
}

/**
 * Initialize the free-form JSON-compatible setting. Usually it's better to used it for saving objects and arrays.
 * @param {string} settingKey Key of the local storage entry where the value will be stored.
 * @param {any} defaultValue Default value of the setting before it was saved.
 * @return {import('svelte/store').Writable<any>} Instance of the store object.
 */
function initializeJsonSetting(settingKey, defaultValue) {
  let initialValue;

  try {
    initialValue = JSON.parse(localStorage.getItem(settingKey));
  } catch (e) {
    initialValue = defaultValue;
  }

  // These values are treated as invalid
  if (typeof initialValue === "undefined" || initialValue === null) {
    initialValue = defaultValue;
  }

  const settingStore = writable(initialValue);

  settingStore.subscribe(updatedValue => {
    localStorage.setItem(settingKey, JSON.stringify(updatedValue));
  });

  return settingStore;
}

/**
 * Master volume. Stored as value from 0 to 1. Used in audio playback as overall volume for both music and sound
 * effects.
 */
export const masterVolume = initializeNumericSetting('master', 1);

/**
 * Volume of the music. Stored as value from 0 to 1. Used in audio playback to change volume of the music separately
 * from sound effects.
 */
export const musicVolume = initializeNumericSetting('music', 1);

/**
 * Volume of the sounds. Stored as value from 0 to 1. Used in audio playback to change volume of the sound effects
 * separately from music.
 */
export const soundVolume = initializeNumericSetting('sound', 1);

/**
 * Array of key binds for each bar. Stored as the value received from the {@link KeyboardEvent.code} property.
 * @type {import('svelte/store').Writable<(string|null)[]>}
 */
export const keyboardBinds = initializeJsonSetting('keys', ['KeyD', 'KeyF', 'KeyJ', 'KeyK']);

/**
 * Setting representing the amount of time in milliseconds one note is passing the whole screen height.
 */
export const notesSpeed = initializeNumericSetting('notesSpeed', 800);
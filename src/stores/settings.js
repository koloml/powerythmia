import {writable} from "svelte/store";

/**
 * @param {string} settingKey
 * @param {number} defaultValue
 */
function initializeVolumeSettingStore(settingKey, defaultValue) {
  let initialValue;

  try {
    initialValue = JSON.parse(localStorage.getItem(settingKey));
  } catch (e) {
    initialValue = defaultValue;
  }

  if (!isFinite(initialValue)) {
    initialValue = defaultValue;
  }

  const settingStore = writable(initialValue);

  settingStore.subscribe(updatedValue => {
    localStorage.setItem(settingKey, JSON.stringify(updatedValue));
  })

  return settingStore;
}

/**
 * @param {string} settingKey
 * @param {any} defaultValue
 * @return {import('svelte/store').Writable<any>}
 */
function initializeJsonSetting(settingKey, defaultValue) {
  let initialValue;

  try {
    initialValue = JSON.parse(localStorage.getItem(settingKey));
  } catch (e) {
    initialValue = defaultValue;
  }

  if (typeof initialValue === "undefined" || initialValue === null) {
    initialValue = defaultValue;
  }

  const settingStore = writable(initialValue);

  settingStore.subscribe(updatedValue => {
    localStorage.setItem(settingKey, JSON.stringify(updatedValue));
  });

  return settingStore;
}

export const masterVolume = initializeVolumeSettingStore('master', 1);
export const musicVolume = initializeVolumeSettingStore('music', 1);
export const soundVolume = initializeVolumeSettingStore('sound', 1);

/** @type {import('svelte/store').Writable<(string|null)[]>} */
export const keyboardBinds = initializeJsonSetting('keys', ['KeyD', 'KeyF', 'KeyJ', 'KeyK']);
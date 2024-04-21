export class Note {
  type;
  volume;
}

/**
 * @param {number} type
 * @param {number} volume
 * @return {Note}
 */
export function note(type, volume) {
  const note = new Note();

  note.type = type;
  note.volume = volume;

  return note;
}

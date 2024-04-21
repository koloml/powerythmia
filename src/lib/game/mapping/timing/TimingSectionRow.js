export class TimingSectionRow {
  /** @type {number} */
  index;
  /** @type {number} */
  subBeat;
  /** @type {number} */
  division;
  /** @type {(Note|Slider|null)[]} */
  bars;
}

/**
 * @param {number} index
 * @param {number} subBeat
 * @param {number} division
 * @param {(Note|null)[]} bars
 * @return {TimingSectionRow}
 */
export function row(index, subBeat, division, bars) {
  const row = new TimingSectionRow();

  row.index = index;
  row.subBeat = subBeat;
  row.division = division;
  row.bars = bars;

  return row;
}

/**
 * @param {number} startIndex
 * @param {number} division
 * @param {((Note|Slider|null)[]|null)[]} subBeatRows
 * @return {TimingSectionRow[]}
 */
export function group(startIndex, division, subBeatRows) {
  return subBeatRows
    .map((bars, subBeatIndex) => {
      if (bars instanceof Array) {
        return row(
          startIndex + (subBeatIndex - subBeatIndex % division) / division,
          subBeatIndex % division,
          division,
          bars
        );
      }

      return null;
    })
    .filter(Boolean);
}
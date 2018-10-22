import * as COLORS from 'common/constants/colors';
import { messages } from './messages';

const EXECUTIONS = 'executions';

const range = (start = 0, end = 0, step = 1) => {
  const result = [];
  let index = 0;
  for (let tick = start; tick < end; tick += step) {
    result[index] = tick;
    index += 1;
  }
  return result;
};

export const getItemNameConfig = (name) => {
  const nameParts = name.split('$');
  return {
    itemType: nameParts[1],
    defectType: nameParts[2],
    locator: nameParts[3],
  };
};

export const getDefectTypeLocators = ({ defectType, locator }, defectTypes) => {
  const defectTypeConfig = defectTypes[defectType.toUpperCase()];
  if (defectTypeConfig) {
    const existedTypeItem = defectTypeConfig.find((item) => item.locator === locator);
    return (
      (existedTypeItem && [existedTypeItem.locator]) || defectTypeConfig.map((item) => item.locator)
    );
  }
  return null;
};

export const getItemColor = ({ itemType, defectType, locator }, defectTypes) => {
  if (itemType === EXECUTIONS) {
    return COLORS[`COLOR_${defectType.toUpperCase()}`];
  }
  const defectTypeConfig = defectTypes[defectType.toUpperCase()];
  return (
    (defectTypeConfig.find((item) => item.locator === locator) || {}).color ||
    defectTypeConfig[0].color
  );
};

export const getItemName = (
  { itemType, defectType, locator },
  defectTypes,
  formatMessage,
  noTotal = false,
) => {
  if (itemType === EXECUTIONS) {
    return formatMessage(messages[defectType], { type: '' });
  }
  const defectTypeConfig = defectTypes[defectType.toUpperCase()];
  if (noTotal) {
    return defectTypeConfig[0].longName;
  }
  return (
    (defectTypeConfig.find((item) => item.locator === locator) || {}).longName ||
    formatMessage(messages.total, {
      type: formatMessage(messages[defectTypeConfig[0].shortName.toLowerCase()]),
    })
  );
};

export const getLaunchAxisTicks = (itemsLength) =>
  range(0, itemsLength, itemsLength > 6 ? Math.round(itemsLength / 12) : 1);

export const getTimelineAxisTicks = (itemsLength) =>
  range(
    itemsLength > 5 ? ((itemsLength / 5 / 2).toFixed() / 2).toFixed() : 0,
    itemsLength,
    itemsLength > 5 ? (itemsLength / 5).toFixed() : 1,
  );

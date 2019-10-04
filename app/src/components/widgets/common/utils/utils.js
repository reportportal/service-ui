import moment from 'moment/moment';
import { ENTITY_START_TIME, CONDITION_BETWEEN } from 'components/filterEntities/constants';
import * as COLORS from 'common/constants/colors';
import { messages } from '../messages';

export const DEFECTS = 'defects';

export const range = (start = 0, end = 0, step = 1) => {
  const result = [];
  let index = 0;
  for (let tick = start; tick < end; tick += step) {
    result[index] = tick;
    index += 1;
  }
  return result;
};

export const rangeMaxValue = (itemsLength) => (itemsLength > 6 ? Math.round(itemsLength / 12) : 1);

export const transformCategoryLabelByDefault = (item) => `#${item.number}`;

export const getItemNameConfig = (name) => {
  const nameParts = name.split('$');

  if (nameParts.length === 1) {
    return {};
  }

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

export const getItemColor = (itemName, defectTypes) => {
  const { itemType, defectType, locator } = getItemNameConfig(itemName);

  if (itemType !== DEFECTS) {
    return COLORS[`COLOR_${defectType.toUpperCase()}`];
  }
  const defectTypeConfig = defectTypes[defectType.toUpperCase()];
  return (
    (defectTypeConfig.find((item) => item.locator === locator) || {}).color ||
    defectTypeConfig[0].color
  );
};

export const getItemName = ({ itemName, defectTypes, formatMessage, noTotal = false }) => {
  const { itemType, defectType, locator } = getItemNameConfig(itemName);

  if (itemType !== DEFECTS) {
    return formatMessage(messages[defectType], { type: '' });
  }
  const defectTypeConfig = defectTypes[defectType.toUpperCase()];
  if (noTotal) {
    return defectTypeConfig[0].longName;
  }
  return (
    (defectTypeConfig.find((item) => item.locator === locator) || {}).longName ||
    formatMessage(messages.total, {
      type: defectTypeConfig[0].shortName,
    })
  );
};

export const getLaunchAxisTicks = (itemsLength) =>
  range(0, itemsLength, rangeMaxValue(itemsLength));

export const getTimelineAxisTicks = (itemsLength) =>
  range(
    itemsLength > 5 ? ((itemsLength / 5 / 2).toFixed() / 2).toFixed() : 0,
    itemsLength,
    itemsLength > 5 ? (itemsLength / 5).toFixed() : 1,
  );

export const getUpdatedFilterWithTime = (chartFilter, itemDate) => {
  const rangeMillisecond = 86400000;
  const time = moment(itemDate).valueOf();
  const filterEntityValue = `${time},${time + rangeMillisecond}`;
  const newCondition = {
    filteringField: ENTITY_START_TIME,
    value: filterEntityValue,
    condition: CONDITION_BETWEEN,
  };

  return {
    orders: chartFilter.orders,
    type: chartFilter.type,
    conditions: chartFilter.conditions.concat(newCondition),
  };
};

export const getChartDefaultProps = ({ isPreview, widget, container, observer, height }) => ({
  isPreview,
  widget,
  container,
  observer,
  height,
});

import moment from 'moment';
import { DATETIME_FORMAT_TOOLTIP } from 'common/constants/timeDateFormat';

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData } = customProps;
  const { name, duration, startTime } = itemsData[data[0].index];

  return {
    itemName: name,
    duration: duration * 1000,
    date: moment(startTime).format(DATETIME_FORMAT_TOOLTIP),
  };
};

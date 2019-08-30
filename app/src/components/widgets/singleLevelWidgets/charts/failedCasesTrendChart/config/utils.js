import { range } from 'common/utils';
import { FAILED } from 'common/constants/testStatuses';
import { statusLocalization } from 'common/constants/statusLocalization';
import { messages } from 'components/widgets/common/messages';

export const getTicks = (bottom, top) => {
  const count = 6; // change it if want to increase/decrease Y-lines
  const height = top - bottom;
  let step;
  const result = [bottom];
  if (height < 1) {
    step = 0.2;
  } else if (height < 10) {
    step = 2;
  } else {
    step = Math.round(height / count / 10) * 10;
  }
  range(0, top, step || 1).forEach((item) => {
    if (item > bottom) {
      result.push(item);
    }
  });
  result.push(top);
  return result;
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage } = customProps;
  const activeItem = data[0];
  const { name, number, startTime } = itemsData[activeItem.index];
  const id = activeItem.id;

  return {
    itemName: `${name} #${number}`,
    startTime: Number(startTime),
    itemCases: `${activeItem.value} ${formatMessage(messages.cases)}`,
    color: color(id),
    issueStatNameProps: { itemName: formatMessage(statusLocalization[FAILED]) },
  };
};

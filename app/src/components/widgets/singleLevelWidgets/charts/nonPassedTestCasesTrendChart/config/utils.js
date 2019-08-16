import { messages } from 'components/widgets/common/messages';

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage } = customProps;
  const activeItem = data[0];
  const { name, number, startTime } = itemsData[activeItem.index];
  const id = activeItem.id;

  return {
    itemName: `${name} #${number}`,
    startTime: Number(startTime),
    itemCases: `${Number(activeItem.value).toFixed(2)}%`,
    color: color(id),
    issueStatNameProps: { itemName: formatMessage(messages.failedSkippedTotal) },
  };
};

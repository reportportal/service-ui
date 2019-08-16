import { messages } from 'components/widgets/common/messages';

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage } = customProps;
  const { index, id, value } = data[0];
  const { name, number, startTime } = itemsData[index];

  return {
    itemName: `${name} #${number}`,
    startTime: Number(startTime),
    itemCases: `${Number(value).toFixed(2)}%`,
    color: color(id),
    issueStatNameProps: { itemName: formatMessage(messages.failedSkippedTotal) },
  };
};

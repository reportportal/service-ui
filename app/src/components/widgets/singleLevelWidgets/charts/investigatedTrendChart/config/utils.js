import { defineMessages } from 'react-intl';
import { messages } from '../../../../common/messages';

export const localMessages = defineMessages({
  yAxisInvestigationsTitle: {
    id: 'Chart.yAxisTitle',
    defaultMessage: '% of investigations',
  },
});

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage, isTimeline } = customProps;
  const activeItem = data[0];
  const { name, number, startTime, date } = itemsData[activeItem.index];
  const id = activeItem.id;
  return {
    itemName: isTimeline ? date : `${name} #${number}`,
    startTime: isTimeline ? null : Number(startTime),
    itemCases: `${Number(activeItem.value).toFixed(2)}%`,
    color: color(id),
    issueStatNameProps: { itemName: messages[id] ? formatMessage(messages[id]) : id },
  };
};

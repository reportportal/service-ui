import { defineMessages } from 'react-intl';
import { messages } from 'components/widgets/common/messages';

export const localMessages = defineMessages({
  yAxisInvestigationsTitle: {
    id: 'Chart.yAxisTitle',
    defaultMessage: '% of investigations',
  },
});

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage, isTimeline } = customProps;
  const { index, id, value } = data[0];
  const { name, number, startTime, date } = itemsData[index];

  return {
    itemName: isTimeline ? date : `${name} #${number}`,
    startTime: isTimeline ? null : Number(startTime),
    itemCases: `${Number(value).toFixed(2)}%`,
    color: color(id),
    issueStatNameProps: { itemName: messages[id] ? formatMessage(messages[id]) : id },
  };
};

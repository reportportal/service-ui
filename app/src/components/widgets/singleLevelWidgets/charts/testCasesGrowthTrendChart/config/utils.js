import { defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { dateFormat } from 'common/utils/timeDateUtils';

const localMessages = defineMessages({
  growTestCases: {
    id: 'Widgets.growtestCases',
    defaultMessage: 'Grow test cases',
  },
  totalTestCases: {
    id: 'Widgets.totalTestCases',
    defaultMessage: 'Total test cases',
  },
});

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, isTimeLineMode, formatMessage } = customProps;
  const { name, number, startTime, date } = itemsData[data[0].index];

  let total;
  let growth;
  if (this.positiveTrend[data[0].index]) {
    growth = data[1].value;
    total = data[0].value + data[1].value;
  } else {
    growth = -data[1].value;
    total = data[0].value;
  }

  const growthClass = classNames({
    increase: growth > 0,
    decrease: growth < 0,
  });

  return {
    itemName: isTimeLineMode ? date : `${name} #${number}`,
    startTime: isTimeLineMode ? '' : dateFormat(Number(startTime)),
    growth,
    growthClass,
    total,
    growTestCasesMessage: formatMessage(localMessages.growTestCases),
    totalTestCasesMessage: formatMessage(localMessages.totalTestCases),
  };
};

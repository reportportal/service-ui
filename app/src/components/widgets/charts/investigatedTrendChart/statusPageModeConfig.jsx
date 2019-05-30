import { getItemColor } from 'components/widgets/charts/common/utils';
import { PERIOD_VALUES_LENGTH } from 'common/constants/statusPeriodValues';
import { MESSAGES } from './common/constants';
import { Tooltip } from './common/tooltip';

const formatYAxisText = (value) => `${value}%`;

const getCategories = (itemData, interval) => {
  const ticksToShowPeriod = Math.floor(PERIOD_VALUES_LENGTH[interval] / 4);

  return itemData.reduce((acc, el, index) => {
    if (!((index - 1) % ticksToShowPeriod)) {
      return [...acc, (index + 1).toString()];
    }
    return [...acc, ''];
  }, []);
};

export const getStatusPageModeConfig = ({
  content,
  intl,
  positionCallback,
  size: { height },
  interval,
}) => {
  const chartData = {};
  const colors = {};
  const itemData = [];

  const data = content.map((value) => ({
    date: value.name,
    values: value.values,
  }));

  // prepare columns array and fill it witch field names
  Object.keys(data[0].values).forEach((key) => {
    const shortKey = key.split('$').pop();

    colors[shortKey] = getItemColor({ defectType: shortKey });
    chartData[shortKey] = [shortKey];
  });

  // fill columns arrays with values
  data.forEach((item) => {
    itemData.push(item.date);

    Object.keys(item.values).forEach((key) => {
      const splitted = key.split('$');
      const shortKey = splitted[splitted.length - 1];

      chartData[shortKey].push(item.values[key]);
    });
  });

  const itemNames = Object.keys(chartData);

  return {
    data: {
      columns: [chartData[itemNames[0]], chartData[itemNames[1]]],
      type: 'bar',
      order: null,
      groups: [itemNames],
      colors,
    },
    grid: {
      y: {
        show: true,
      },
    },
    axis: {
      x: {
        show: true,
        type: 'category',
        categories: getCategories(itemData, interval),
        tick: {
          width: 60,
          centered: true,
          inner: true,
          multiline: true,
          outer: false,
        },
        label: {
          text:
            interval === '1M'
              ? intl.formatMessage(MESSAGES.xAxisDaysTitle)
              : intl.formatMessage(MESSAGES.xAxisWeeksTitle),
          position: 'outer-center',
        },
      },
      y: {
        show: true,
        max: 100,
        padding: {
          top: 0,
        },
        tick: {
          format: formatYAxisText,
        },
      },
    },
    interaction: {
      enabled: true,
    },
    padding: {
      top: 0,
      left: 35,
      right: 10,
      bottom: 0,
    },
    legend: {
      show: false,
    },
    tooltip: {
      grouped: false,
      position: positionCallback,
      contents: Tooltip(itemData, intl),
    },
    size: {
      height,
    },
  };
};

import moment from 'moment';
import { getTimelineAxisTicks } from 'components/widgets/charts/common/utils';
import { MESSAGES, COLORS } from '../common/constants';
import { TimelineTooltip } from '../common/timelineTooltip';

export const getTimelineConfig = ({ content, isPreview, intl, positionCallback, size }) => {
  const chartData = {};
  const colors = {};
  const itemData = [];
  const { result } = content;
  const data = Object.keys(result).map((key) => ({
    date: key,
    values: result[key].values,
  }));

  // prepare columns array and fill it witch field names
  Object.keys(data[0].values).forEach((key) => {
    const shortKey = key.split('$').pop();
    colors[shortKey] = COLORS[shortKey];
    chartData[shortKey] = [shortKey];
  });
  // fill columns arrays with values
  data.forEach((item) => {
    itemData.push({
      date: item.date,
    });
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
        show: !isPreview,
      },
    },
    axis: {
      x: {
        show: !isPreview,
        type: 'category',
        categories: itemData.map((item) => {
          const day = moment(item.date)
            .format('dddd')
            .substring(0, 3);
          return `${day}, ${item.date}`;
        }),
        tick: {
          values: getTimelineAxisTicks(itemData.length),
          width: 60,
          centered: true,
          inner: true,
          multiline: true,
          outer: false,
        },
      },
      y: {
        show: true,
        max: 100,
        padding: {
          top: 0,
        },
        label: {
          text: intl.formatMessage(MESSAGES.yAxisInvestigationsTitle),
          position: 'outer-middle',
        },
      },
    },
    interaction: {
      enabled: !isPreview,
    },
    padding: {
      top: isPreview ? 0 : 85,
      left: isPreview ? 0 : 60,
      right: isPreview ? 0 : 20,
      bottom: 0,
    },
    legend: {
      show: false,
    },
    tooltip: {
      grouped: false,
      position: positionCallback,
      contents: TimelineTooltip(itemData, MESSAGES, intl),
    },
    size,
  };
};

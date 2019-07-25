import ReactDOMServer from 'react-dom/server';
import { getLaunchAxisTicks } from 'components/widgets/charts/common/utils';
import { TooltipContent } from '../common/tooltip';
import { COLORS, MESSAGES } from '../common/constants';

const renderTooltip = (itemData, intl) => (d, defaultTitleFormat, defaultValueFormat, color) => {
  const { name, number, startTime } = itemData[d[0].index];
  const id = d[0].id;

  return ReactDOMServer.renderToStaticMarkup(
    <TooltipContent
      launchName={name}
      launchNumber={number}
      startTime={+startTime}
      itemCases={d[0].value}
      color={color(id)}
      itemName={MESSAGES[id] ? intl.formatMessage(MESSAGES[id]) : id}
    />,
  );
};

export const getLaunchModeConfig = ({ content, isPreview, intl, positionCallback, size }) => {
  const { result } = content;
  const colors = {};
  const columns = [];

  const sortedResult = result.sort((item) => -item.number);
  const itemData = sortedResult.map((item) => ({
    id: item.id,
    name: item.name,
    number: item.number,
    startTime: item.startTime,
  }));
  const groups = Object.keys(sortedResult[0].values);

  groups.forEach((type) => {
    const values = sortedResult.map((item) => item.values[type] || 0);
    colors[type] = COLORS[type];
    columns.push([type, ...values]);
  });

  return {
    data: {
      columns,
      type: 'bar',
      order: null,
      groups: [groups],
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
        categories: itemData.map((item) => `#${item.number}`),
        tick: {
          values: getLaunchAxisTicks(itemData.length),
          width: 60,
          centered: true,
          inner: true,
          multiline: false,
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
      bottom: isPreview ? 0 : 10,
    },
    legend: {
      show: false,
    },
    tooltip: {
      grouped: false,
      position: positionCallback,
      contents: renderTooltip(itemData, intl),
    },
    size,
  };
};

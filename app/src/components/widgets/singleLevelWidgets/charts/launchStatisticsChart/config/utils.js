import { getItemColor } from 'components/widgets/common/utils';
import { messages } from 'components/widgets/common/messages';

const prepareData = (data, isTimeLine) =>
  isTimeLine
    ? Object.keys(data).map((item) => ({
        date: item,
        values: data[item].values,
      }))
    : data;

export const isSingleColumnChart = (content, isTimeLine) => {
  const data = prepareData(content.result, isTimeLine);

  return data.length < 2;
};

export const getConfigData = (
  data,
  { defectTypes, orderedContentFields, contentFields, isTimeline },
) => {
  const widgetData = prepareData(data, isTimeline);
  const itemsData = [];
  const chartData = {};
  const chartDataOrdered = [];
  const colors = {};

  contentFields.forEach((key) => {
    chartData[key] = [key];
    colors[key] = getItemColor(key, defectTypes);
  });

  widgetData.sort((a, b) => a.startTime - b.startTime).forEach((item) => {
    const currentItemData = {
      ...item,
    };
    delete currentItemData.values;
    itemsData.push(currentItemData);

    contentFields.forEach((contentFieldKey) => {
      const value = Number(item.values[contentFieldKey]) || 0;
      chartData[contentFieldKey].push(value);
    });
  });

  orderedContentFields.filter((name) => contentFields.indexOf(name) !== -1).forEach((key) => {
    chartDataOrdered.push(chartData[key]);
  });

  const itemNames = chartDataOrdered.map((item) => item[0]);

  return {
    itemsData,
    chartDataOrdered,
    itemNames,
    colors,
  };
};

export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage, defectTypes, isTimeline } = customProps;
  const { index, id, value } = data[0];
  const { name, number, startTime, date } = itemsData[index];

  return {
    itemName: isTimeline ? date : `${name} #${number}`,
    startTime: isTimeline ? null : Number(startTime),
    itemCases: `${value} ${formatMessage(messages.cases)}`,
    color: color(id),
    issueStatNameProps: { itemName: id, defectTypes, formatMessage },
  };
};

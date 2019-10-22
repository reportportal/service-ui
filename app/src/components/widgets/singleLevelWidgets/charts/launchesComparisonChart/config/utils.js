export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage, defectTypes } = customProps;
  const { index, id, value } = data[0];
  const { name, number, startTime } = itemsData[index];

  return {
    itemName: `${name} #${number}`,
    startTime: Number(startTime),
    itemCases: `${value}%`,
    color: color(id),
    issueStatNameProps: { itemName: id, defectTypes, noTotal: true, formatMessage },
  };
};

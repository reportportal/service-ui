export const calculateTooltipParams = (data, color, customProps) => {
  const { itemsData, formatMessage, defectTypes } = customProps;
  const activeItem = data[0];
  const { name, number, startTime } = itemsData[activeItem.index];
  const id = activeItem.id;

  return {
    itemName: `${name} #${number}`,
    startTime: Number(startTime),
    itemCases: `${activeItem.value}%`,
    color: color(id),
    issueStatNameProps: { itemName: id, defectTypes, noTotal: true, formatMessage },
  };
};

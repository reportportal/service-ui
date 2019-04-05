export const isWidgetDataAvailable = (data) => data.content && Object.keys(data.content).length;

export const prepareWidgetDataForSubmit = (data) => ({
  ...data,
  filterIds: (data.filters || []).map((item) => item.value),
});

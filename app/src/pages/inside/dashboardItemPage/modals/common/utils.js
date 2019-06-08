export const isWidgetDataAvailable = (data) => data.content && Object.keys(data.content).length;

export const prepareWidgetDataForSubmit = (data) => ({
  ...data,
  filterIds: (
    (data.filters && (Array.isArray(data.filters) ? data.filters : JSON.parse(data.filters))) ||
    []
  ).map((item) => item.value),
});

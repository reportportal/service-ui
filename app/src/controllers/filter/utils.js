export const updateFilter = (filters, filter, oldId) => {
  const id = oldId || filter.id;
  const filterIndex = filters.findIndex((item) => item.id === id);
  if (filterIndex === -1) {
    return [...filters, filter];
  }
  const newFilters = [...filters];
  newFilters.splice(filterIndex, 1, filter);
  return newFilters;
};

export const addFilteringFieldToConditions = (conditions = {}) =>
  Object.keys(conditions).map((key) => ({ ...conditions[key], filteringField: key }));

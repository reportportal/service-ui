export function bindDefaultValue(key, options = {}) {
  const { filterValues } = this.props;
  if (key in filterValues) {
    return filterValues[key];
  }
  return {
    filteringField: key,
    value: '',
    ...options,
  };
}

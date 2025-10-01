// Going to be resolved to id by folder name with UI search control
// Currently directly accepts id from name input

export const coerceToNumericId = (value: unknown): number | undefined => {
  if (value == null || value === '') return undefined;
  const id = Number(value);
  return Number.isFinite(id) ? id : undefined;
};

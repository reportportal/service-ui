export const validateIgnoreIncludeInAA = (item) => {
  if (!item.issue) {
    return 'noDefectType';
  }
  return null;
};

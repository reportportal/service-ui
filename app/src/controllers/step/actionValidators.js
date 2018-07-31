export const validateIgnoreInAA = (item) => {
  if (!item.issue) {
    return 'noDefectType';
  }
  return null;
};

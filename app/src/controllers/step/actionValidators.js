export const validateIgnoreInAA = (item) => {
  if (!item.issue) {
    return 'noDefectType';
  }
  if (item.issue && item.issue.ignoreAnalyzer) {
    return 'alreadyIgnored';
  }
  return null;
};

export const validateIncludeInAA = (item) => {
  if (!item.issue) {
    return 'noDefectType';
  }
  if (item.issue && !item.issue.ignoreAnalyzer) {
    return 'alreadyIncluded';
  }
  return null;
};

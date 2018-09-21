export const attachmentsSelector = (state) => {
  let contents = [];
  if (state.log && state.log.logItems) {
    contents = state.log.logItems
      .filter((item) => item.binary_content)
      .map((item) => item.binary_content);
  }
  return contents;
};

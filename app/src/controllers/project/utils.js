export const normalizeAttributesWithPrefix = (attributes, prefix) => {
  if (!prefix) {
    return attributes;
  }
  return Object.keys(attributes).reduce(
    (result, item) => ({
      ...result,
      [`${prefix}.${item}`]: attributes[item],
    }),
    {},
  );
};

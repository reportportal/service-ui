export const normalizeAttributesWithPrefix = (attributes, prefix) =>
  Object.keys(attributes).reduce(
    (result, item) => ({
      ...result,
      [`${prefix}.${item}`]: attributes[item],
    }),
    {},
  );

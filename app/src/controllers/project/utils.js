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

export const updateIntegrations = (integrations, { integrationParameters, enabled, id }) => {
  const integrationIndex = integrations.findIndex((item) => item.id === id);
  const updatedIntegrations = [...integrations];
  updatedIntegrations[integrationIndex] = {
    ...updatedIntegrations[integrationIndex],
    enabled,
    integrationParameters,
  };
  return updatedIntegrations;
};

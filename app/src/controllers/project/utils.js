import { PROJECT_ATTRIBUTES_DELIMITER } from './constants';

export const normalizeAttributesWithPrefix = (attributes, prefix) => {
  if (!prefix) {
    return attributes;
  }
  return Object.keys(attributes).reduce(
    (result, item) => ({
      ...result,
      [`${prefix}${PROJECT_ATTRIBUTES_DELIMITER}${item}`]: attributes[item],
    }),
    {},
  );
};

export const isPostIssueActionAvailable = (integrations) =>
  integrations.length &&
  integrations.some(
    (item) =>
      item.integrationParameters.defectFormFields &&
      item.integrationParameters.defectFormFields.length,
  );

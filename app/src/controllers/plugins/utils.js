import { AUTHORIZATION_GROUP_TYPE } from 'common/constants/pluginsGroupTypes';

export const filterIntegrationsByName = (integrations, integrationName) =>
  integrations.filter((integration) => integration.integrationType.name === integrationName);

export const filterIntegrationsByGroupType = (integrations, groupType) =>
  integrations.filter((integration) => integration.integrationType.groupType === groupType);

export const sortItemsByGroupType = (items) =>
  items.sort((a, b) => {
    const groupTypeA = a.groupType || a.integrationType.groupType;
    const groupTypeB = b.groupType || b.integrationType.groupType;
    return groupTypeA.localeCompare(groupTypeB);
  });

export const groupItems = (items) =>
  items.reduce((accum, item) => {
    const groupType = item.groupType || item.integrationType.groupType;
    const groupedItems = { ...accum };
    if (!groupedItems[groupType]) {
      groupedItems[groupType] = [item];
    } else {
      groupedItems[groupType].push(item);
    }
    return groupedItems;
  }, {});

// TODO: remove check for AUTHORIZATION_GROUP_TYPE when designs and backend implementation will exist
export const filterAvailablePlugins = (plugins) =>
  plugins.filter((item) => item.enabled && item.groupType !== AUTHORIZATION_GROUP_TYPE);

import { createSelector } from 'reselect';
import { OWNER } from 'common/constants/permissions';
import { ANALYZER_ATTRIBUTE_PREFIX, JOB_ATTRIBUTE_PREFIX } from './constants';

const projectSelector = (state) => state.project || {};

const projectInfoSelector = (state) => projectSelector(state).info || {};

export const projectConfigSelector = (state) => projectInfoSelector(state).configuration || {};

export const projectMembersSelector = (state) => projectInfoSelector(state).users || [];

export const projectCreationDateSelector = (state) => projectInfoSelector(state).creationDate || 0;

export const projectIntegrationsSelector = (state) => projectInfoSelector(state).integrations || [];

export const projectPreferencesSelector = (state) => projectSelector(state).preferences || {};

export const userFiltersSelector = (state) => projectPreferencesSelector(state).filters || [];

export const defectTypesSelector = (state) => projectConfigSelector(state).subTypes || {};

const attributesSelector = (state) => projectConfigSelector(state).attributes || {};

const createPrefixedAttributesSelector = (prefix) =>
  createSelector(attributesSelector, (attributes) =>
    Object.keys(attributes).reduce(
      (result, attribute) =>
        attribute.match(`${prefix}.`)
          ? {
              ...result,
              [attribute.replace(`${prefix}.`, '')]: attributes[attribute],
            }
          : result,
      {},
    ),
  );

export const analyzerAttributesSelector = createPrefixedAttributesSelector(
  ANALYZER_ATTRIBUTE_PREFIX,
);

export const jobAttributesSelector = createPrefixedAttributesSelector(JOB_ATTRIBUTE_PREFIX);

export const externalSystemSelector = (state) => projectConfigSelector(state).externalSystem || [];

export const projectIntegrationsSortedSelector = createSelector(
  projectIntegrationsSelector,
  (integrations) =>
    integrations.sort((a, b) =>
      a.integrationType.groupType.localeCompare(b.integrationType.groupType),
    ),
);

export const groupedIntegrationsSelector = createSelector(
  projectIntegrationsSortedSelector,
  (integrations) =>
    integrations.reduce((accum, item) => {
      const integrationGroupType = item.integrationType.groupType;
      const groupedIntegrations = { ...accum };
      if (!groupedIntegrations[integrationGroupType]) {
        groupedIntegrations[integrationGroupType] = [item];
      } else {
        groupedIntegrations[integrationGroupType].push(item);
      }
      return groupedIntegrations;
    }, {}),
);

export const createTypedIntegrationsSelector = (integrationType) =>
  createSelector(projectIntegrationsSelector, (integrations) =>
    integrations.filter((integration) => integration.integrationType.groupType === integrationType),
  );

export const projectNotificationsConfigurationSelector = (state) =>
  projectConfigSelector(state).notificationsConfiguration || {};

export const projectNotificationsCasesSelector = createSelector(
  projectNotificationsConfigurationSelector,
  ({ cases = [] }) =>
    cases.map((notificationCase) => ({
      ...notificationCase,
      informOwner: notificationCase.recipients.includes(OWNER),
      submitted: true,
      confirmed: true,
      recipients: notificationCase.recipients.filter((item) => item !== OWNER),
    })),
);

export const projectNotificationsEnabledSelector = (state) =>
  projectNotificationsConfigurationSelector(state).enabled || false;

export const defectColorsSelector = createSelector(projectConfigSelector, (config) => {
  const colors = {};
  Object.keys(config).length &&
    Object.keys(config.subTypes).forEach((key) => {
      colors[key.toLowerCase()] = config.subTypes[key][0].color;
      const defectGroup = config.subTypes[key];
      defectGroup.forEach((defect) => {
        colors[defect.locator] = defect.color;
      });
    });
  return colors;
});

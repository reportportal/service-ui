import { createSelector } from 'reselect';
import { OWNER } from 'common/constants/permissions';

const projectSelector = (state) => state.project || {};

const projectInfoSelector = (state) => projectSelector(state).info || {};

export const projectConfigSelector = (state) => projectInfoSelector(state).configuration || {};

export const projectMembersSelector = (state) => projectInfoSelector(state).users || [];

export const projectCreationDateSelector = (state) => projectInfoSelector(state).creationDate || 0;

export const projectPreferencesSelector = (state) => projectSelector(state).preferences || {};

export const userFiltersSelector = (state) => projectPreferencesSelector(state).filters || [];

export const defectTypesSelector = (state) => projectConfigSelector(state).subTypes || {};

export const projectAnalyzerConfigSelector = (state) =>
  projectConfigSelector(state).analyzerConfiguration || {};

export const externalSystemSelector = (state) => projectConfigSelector(state).externalSystem || [];

export const projectEmailConfigurationSelector = (state) =>
  projectConfigSelector(state).emailConfiguration || {};

export const projectEmailCasesSelector = createSelector(
  projectEmailConfigurationSelector,
  ({ emailCases }) =>
    emailCases.map((emailCase) => ({
      ...emailCase,
      informOwner: emailCase.recipients.includes(OWNER),
      submitted: true,
      confirmed: true,
      recipients: emailCase.recipients.filter((item) => item !== OWNER),
    })),
);

export const projectEmailEnabledSelector = (state) =>
  projectEmailConfigurationSelector(state).emailEnabled || false;


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

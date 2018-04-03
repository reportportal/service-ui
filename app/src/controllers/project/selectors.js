import { createSelector } from 'reselect';

const projectSelector = state => state.project || {};
const projectInfoSelector = state => projectSelector(state).info || {};

export const projectConfigSelector = state => projectInfoSelector(state).configuration || {};
export const projectMembersSelector = state => projectInfoSelector(state).users || [];
export const projectCreationDateSelector = state => projectInfoSelector(state).creationDate || 0;

export const projectPreferencesSelector = state => projectSelector(state).preferences || {};
export const userFiltersSelector = state => projectPreferencesSelector(state).filters || [];

export const defectColorsSelector = createSelector(
  projectConfigSelector,
  (config) => {
    const colors = {};
    Object.keys(config.subTypes).forEach((key) => {
      colors[key.toLowerCase()] = config.subTypes[key][0].color;
      const defectGroup = config.subTypes[key];
      defectGroup.forEach((defect) => {
        colors[defect.locator] = defect.color;
      });
    });
    return colors;
  },
);

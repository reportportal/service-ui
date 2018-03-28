const projectSelector = state => state.project || {};
const projectInfoSelector = state => projectSelector(state).info || {};

export const projectConfigSelector = state => projectInfoSelector(state).configuration || {};
export const projectMembersSelector = state => projectInfoSelector(state).users || [];
export const projectCreationDateSelector = state => projectInfoSelector(state).creationDate || 0;

export const projectPreferencesSelector = state => projectSelector(state).preferences || {};
export const userFiltersSelector = state => projectPreferencesSelector(state).filters || [];

const projectSelector = state => state.project || {};

export const projectConfigSelector = state => projectSelector(state).configuration || {};
export const projectMembersSelector = state => projectSelector(state).users || [];
export const projectCreationDateSelector = state => projectSelector(state).creationDate || 0;

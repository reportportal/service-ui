const userSelector = state => state.user || {};

export const userInfoSelector = state => userSelector(state).info || {};
export const defaultProjectSelector = state => userInfoSelector(state).default_project || '';
export const activeProjectSelector = state => userSelector(state).activeProject || defaultProjectSelector(state) || '';
export const userIdSelector = state => userInfoSelector(state).userId;

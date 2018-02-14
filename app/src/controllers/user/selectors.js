const userSelector = state => state.user || {};
const useInfoSelector = state => state.user.info || {};

export const userInfoSelector = state => userSelector(state).info || {};
export const defaultProjectSelector = state => useInfoSelector(state).default_project || '';
export const activeProjectSelector = state => userSelector(state).activeProject || defaultProjectSelector(state) || '';

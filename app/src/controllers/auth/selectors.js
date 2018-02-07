const authSelector = state => state.auth || {};

export const isAuthorizedSelector = state => !!authSelector(state).authorized;
export const userSelector = state => authSelector(state).user || {};
export const defaultProjectSelector = state => userSelector(state).default_project;

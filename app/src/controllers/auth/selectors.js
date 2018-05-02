const authSelector = state => state.auth || {};

export const isAuthorizedSelector = state => !!authSelector(state).authorized;

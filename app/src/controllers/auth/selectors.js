const getAuth = state => state.auth || {};

export const getToken = state => getAuth(state).token;
export const isAuthorized = state => !!getAuth(state).authorized;
export const getUser = state => getAuth(state).user;

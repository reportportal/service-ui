import { adminDomainSelector } from 'controllers/admin';

const domainSelector = (state) => adminDomainSelector(state).projectDetails || {};

export const loadingSelector = (state) => domainSelector(state).loading;
export const projectInfoSelector = (state) => domainSelector(state).projectInfo || {};

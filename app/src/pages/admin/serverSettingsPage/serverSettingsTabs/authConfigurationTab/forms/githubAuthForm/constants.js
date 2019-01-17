import { ENABLED_KEY } from '../../../../common/constants';

export const CLIENT_ID_KEY = 'clientId';
export const CLIENT_SECRET_KEY = 'clientSecret';
export const ORGANIZATIONS_KEY = 'restrictions.organizations';
export const NEW_ORGANIZATION_KEY = 'restrictions.organization';

export const GITHUB_AUTH_FORM = 'githubAuthForm';
export const DEFAULT_FORM_CONFIG = {
  [ENABLED_KEY]: false,
  restrictions: {
    organizations: '',
    organization: '',
  },
};

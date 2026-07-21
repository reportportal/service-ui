import {
  getBasicClickEventParameters,
  normalizeEventParameter,
} from '../common/ga4Utils';

export const LOGIN = 'login';

export const LOGIN_PAGE_CATEGORY = 'login_page';
export const SIDEBAR_CATEGORY = 'sidebar';

const LOGIN_PAGE = LOGIN_PAGE_CATEGORY;

const AUTH_TYPE_ANALYTICS_MAP = {
  saml: 'samlProviders',
};

const getLoginAuthElementName = (authType) => {
  if (authType === LOGIN) {
    return LOGIN;
  }

  const mappedAuthType = AUTH_TYPE_ANALYTICS_MAP[authType?.toLowerCase()] || authType;

  return `login_with_${mappedAuthType}`;
};

export const LOGIN_PAGE_EVENTS = {
  clickOnSocialIcon: (iconType) => ({
    ...getBasicClickEventParameters(LOGIN_PAGE),
    element_name: iconType,
  }),
  CLICK_ON_RPP_LOGO: {
    ...getBasicClickEventParameters(LOGIN_PAGE),
    element_name: 'logo',
    place: 'header',
  },
  clickOnLoginButton: (authType) => ({
    ...getBasicClickEventParameters(LOGIN_PAGE),
    element_name: getLoginAuthElementName(authType),
  }),
  clickOnFooterLink: (elementName) => ({
    ...getBasicClickEventParameters(LOGIN_PAGE),
    element_name: elementName,
  }),
  CLICK_ON_OPEN_MORE_NEWS: {
    ...getBasicClickEventParameters(LOGIN_PAGE),
    element_name: 'open_more_news',
  },
  CLICK_ON_READ_MORE: {
    ...getBasicClickEventParameters(LOGIN_PAGE),
    link_name: 'read_more',
  },
  clickOnNewsLink: (linkName) => ({
    ...getBasicClickEventParameters(LOGIN_PAGE),
    link_name: linkName,
  }),
  clickOnReleaseNotesLink: (category, linkText) => ({
    ...getBasicClickEventParameters(category),
    link_name: normalizeEventParameter(linkText),
  }),
  clickOnServiceUpdateLink: (category, serviceType) => ({
    ...getBasicClickEventParameters(category),
    element_name: 'update',
    type: normalizeEventParameter(serviceType),
  }),
};

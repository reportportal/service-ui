import { getBasicClickEventParameters } from '../common/ga4Utils';

const LOGIN_PAGE = 'login_page';

export const GIT_HUB = 'github';
export const LOGIN = 'login';
export const SAML_PROVIDERS = 'samlProviders';

export const LOGIN_PAGE_EVENTS = {
  clickOnSocialIcon: (iconType) => {
    return {
      ...getBasicClickEventParameters(LOGIN_PAGE),
      element_name: iconType,
      place: 'footer',
    };
  },
  CLICK_ON_RPP_LOGO: {
    ...getBasicClickEventParameters(LOGIN_PAGE),
    element_name: 'logo',
    place: 'header',
  },
  clickOnLoginButton: (authType) => {
    let elementName;

    switch (authType) {
      case GIT_HUB: {
        elementName = 'login_with_github';
        break;
      }
      case SAML_PROVIDERS: {
        elementName = 'login_with_saml';
        break;
      }
      case LOGIN: {
        elementName = LOGIN;
        break;
      }
      default: {
        elementName = 'login_with_epam';
      }
    }

    return {
      ...getBasicClickEventParameters(LOGIN_PAGE),
      element_name: elementName,
    };
  },
};

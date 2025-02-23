import { getBasicClickEventParameters } from '../common/ga4Utils';

export const LOGIN = 'login';

const LOGIN_PAGE = 'login_page';

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
    let elementName = 'login_with_epam';

    switch (authType) {
      case 'github': {
        elementName = 'login_with_github';
        break;
      }
      case 'samlProviders': {
        elementName = 'login_with_saml';
        break;
      }
      case LOGIN: {
        elementName = LOGIN;
        break;
      }
      default: {
        break;
      }
    }

    return {
      ...getBasicClickEventParameters(LOGIN_PAGE),
      element_name: elementName,
    };
  },
};

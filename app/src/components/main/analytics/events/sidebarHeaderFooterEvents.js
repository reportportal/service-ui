const SIDEBAR = 'sidebar';
export const SIDEBAR_EVENTS = {
  CLICK_DASHBOARD_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu button Dashboards',
    label: 'Transition on Dashboards Page',
  },
  CLICK_FILTERS_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu button Filters',
    label: 'Transition on Filters Page',
  },
  CLICK_DEBUG_BTN: {
    category: SIDEBAR,
    action: 'Click on Menu button Debug',
    label: 'Transition on Debug Page',
  },
};

const HEADER = 'header';
export const HEADER_EVENTS = {
  CLICK_MEMBERS_BTN: {
    category: HEADER,
    action: 'Click on Menu Bttn Members',
    label: 'Transition on Members Page',
  },
  CLICK_SETTINGS_BTN: {
    category: HEADER,
    action: 'Click on Menu Bttn Settings',
    label: 'Transition on Settings Page',
  },
  CLICK_PROFILE_DROPDOWN: {
    category: HEADER,
    action: 'Click on Profile Dropdown',
    label: 'Arise Dropdown Menu',
  },
  CLICK_PROFILE_LINK: {
    category: HEADER,
    action: 'Click on Profile link on Dropdown',
    label: 'Transition on Profile Page',
  },
  CLICK_ADMINISTRATE_LINK: {
    category: HEADER,
    action: 'Click on Administrate link on Dropdown',
    label: 'Transition to Administrate Mode',
  },
  CLICK_LOGOUT_LINK: {
    category: HEADER,
    action: 'Click on Logout link on Dropdown',
    label: 'Logout and transition on Landing Page',
  },
  CLICK_PROJECT_DROPDOWN: {
    category: HEADER,
    action: 'Click on Project Dropdown',
    label: 'Arise Dropdown with list of Projects',
  },
  CLICK_PROJECT_NAME_LINK: {
    category: HEADER,
    action: 'Click on Another Project Name',
    label: 'Transition to another project',
  },
  CLICK_API_LINK: {
    category: HEADER,
    action: 'Click on link API',
    label: 'Transition to API page',
  },
};

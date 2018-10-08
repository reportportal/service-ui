export const LOGIN_PAGE = 'login';
export const LOGIN_PAGE_EVENTS = {
  CLICK_TWITTER_LINK: {
    category: LOGIN_PAGE,
    action: 'Click on twitter link',
    label: 'Open twitter link',
  },
  CLICK_GITHUB_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon Github on Welcome screen',
    label: 'Transition to Github',
  },
  CLICK_FACEBOOK_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon Facebook on Welcome screen',
    label: 'Transition to Facebook',
  },
  CLICK_TWEETER_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon Tweeter on Welcome screen',
    label: 'Transition to Tweeter',
  },
  CLICK_YOUTUBE_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon YouTube on Welcome screen',
    label: 'Transition to YouTube',
  },
  CLICK_VK_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon VK on Welcome screen',
    label: 'Transition to VK',
  },
  CLICK_SLACK_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon Slack on Welcome screen',
    label: 'Transition to Slack',
  },
  CLICK_MAIL_ICON: {
    category: LOGIN_PAGE,
    action: 'Click on Icon Mail on Welcome screen',
    label: 'Arise Mail window',
  },
};

export const FILTERS_PAGE = 'filters';
export const FILTERS_PAGE_EVENTS = {
  SEARCH_FILTER: {
    category: FILTERS_PAGE,
    action: 'Enter parameter for search',
    label: 'Show filters by parameter',
  },
  CLICK_ADD_FILTER_BTN: {
    category: FILTERS_PAGE,
    action: 'Click on button Add Filter',
    label: 'Transition to Launches Page',
  },
  CLICK_FILTER_NAME: {
    category: FILTERS_PAGE,
    action: 'Click on Filter name',
    label: 'Transition to Launch Page',
  },
  CLICK_DISPLAY_ON_LAUNCH_SWITCHER: {
    category: FILTERS_PAGE,
    action: 'Click on Filter on/off switcher',
    label: 'Show/hide Filter on Launch Page',
  },
  CLICK_DELETE_FILTER_ICON: {
    category: FILTERS_PAGE,
    action: 'Click on icon Delete on Filter Page',
    label: 'Arise Modal Delete filter',
  },
  CLICK_EDIT_ICON: {
    category: FILTERS_PAGE,
    action: 'Click on icon Edit on Filter name',
    label: 'Arise Modal Edit filter',
  },
  CLICK_SHARED_ICON: {
    category: FILTERS_PAGE,
    action: 'Click on icon Shared on Filter',
    label: 'Arise Modal Edit filter',
  },
  CLICK_CLOSE_ICON_MODAL_EDIT_FILTER: {
    category: FILTERS_PAGE,
    action: 'Click on icon Close on Modal Edit Filter',
    label: 'Close Modal Edit Filter',
  },
  ENTER_DESCRIPTION_MODAL_EDIT_FILTER: {
    category: FILTERS_PAGE,
    action: 'Enter description in Modal Edit Filter',
    label: 'Description',
  },
  CLICK_SHARE_SWITCHER_MODAL_EDIT_FILTER: {
    category: FILTERS_PAGE,
    action: 'Click on Share on/off in Modal Edit Filter',
    label: 'Share/unshare Filter',
  },
  CLICK_CANCEL_BTN_MODAL_EDIT_FILTER: {
    category: FILTERS_PAGE,
    action: 'Click on button Cancel in Modal Edit Filter',
    label: 'Close Modal Edit Filter',
  },
  CLICK_UPDATE_BTN_MODAL_EDIT_FILTER: {
    category: FILTERS_PAGE,
    action: 'Click on button Update in Modal Edit Filter',
    label: 'Update Modal Edit Filter',
  },
  CLICK_CLOSE_ICON_MODAL_DELETE_FILTER: {
    category: FILTERS_PAGE,
    action: 'Click on icon Close on Modal Delete Filter',
    label: 'Close Modal Delete Filter',
  },
  CLICK_CANCEL_BTN_MODAL_DELETE_FILTER: {
    category: FILTERS_PAGE,
    action: 'Click on button Cancel in Modal Delete Filter',
    label: 'Close Modal Delete Filter',
  },
  CLICK_DELETE_BTN_MODAL_DELETE_FILTER: {
    category: FILTERS_PAGE,
    action: 'Click on button Delete in Modal Delete Filter',
    label: 'Delete Filter',
  },
  CLICK_ADD_BTN_EMPTY_FILTER_PAGE: {
    category: FILTERS_PAGE,
    action: 'Click on button Add Filter on empty page',
    label: 'Transition to Launches Page',
  },
};

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

const getActionTableFilter = (titleName) =>
  `Click on Filter Icon before Table title "${titleName}"`;
const getDescriptionTableFilter = () => 'Arise new field in filter';
export const LAUNCHES_PAGE = 'launches';
export const LAUNCHES_PAGE_EVENTS = {
  CLICK_ITEM_NAME: {
    category: LAUNCHES_PAGE,
    action: 'Click on Item Name',
    label: 'Transition to Item page',
  },
  CLICK_HAMBURGER_MENU: {
    category: LAUNCHES_PAGE,
    action: 'Click on Icon Menu near Launch Name',
    label: 'Arise Dropdown with single actions for this launch',
  },
  CLICK_MOVE_TO_DEBUG_LAUNCH_MENU: {
    category: LAUNCHES_PAGE,
    action: 'Click on "Move to Debug" in Launch Menu',
    label: 'Arise Modal "Move to Debug"',
  },
  CLICK_FORCE_FINISH_LAUNCH_MENU: {
    category: LAUNCHES_PAGE,
    action: 'Click on "Force Finish" in Launch Menu',
    label: 'Interrupt launch loading',
  },
  CLICK_ANALYSIS_LAUNCH_MENU: {
    category: LAUNCHES_PAGE,
    action: 'Click on "Analysis" in Launch Menu',
    label: 'Starts Analysing',
  },
  CLICK_DELETE_LAUNCH_MENU: {
    category: LAUNCHES_PAGE,
    action: 'Click on "Delete" in Launch Menu',
    label: 'Arise Modal "Delete Launch"',
  },
  CLICK_EXPORT_PDF: {
    category: LAUNCHES_PAGE,
    action: 'Click on "Export: PDF" in Launch Menu',
    label: 'Stars download of report in PDF',
  },
  CLICK_EXPORT_HTML: {
    category: LAUNCHES_PAGE,
    action: 'Click on "Export: HTML" in Launch Menu',
    label: 'Stars download of report in HTML',
  },
  CLICK_EXPORT_XLS: {
    category: LAUNCHES_PAGE,
    action: 'Click on "Export: XLS" in Launch Menu',
    label: 'Stars download of report in XLS',
  },
  CLICK_NAME_FILTER_ICON: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('NAME'),
    label: getDescriptionTableFilter(),
  },
  CLICK_START_FILTER_ICON: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('START'),
    label: getDescriptionTableFilter(),
  },
  CLICK_TOTAL_FILTER_ICON: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('TOTAL'),
    label: getDescriptionTableFilter(),
  },
  CLICK_PASSED_FILTER_ICON: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('PASSED'),
    label: getDescriptionTableFilter(),
  },
  CLICK_FAILED_FILTER_ICON: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('FAILED'),
    label: getDescriptionTableFilter(),
  },
  CLICK_SKIPPED_FILTER_ICON: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('SKIPPED'),
    label: getDescriptionTableFilter(),
  },
  CLICK_PRODUCT_BUG_FILTER_ICON: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('PRODUCT BUG'),
    label: getDescriptionTableFilter(),
  },
  CLICK_AUTO_BUG_FILTER_ICON: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('AUTO BUG'),
    label: getDescriptionTableFilter(),
  },
  CLICK_SYSTEM_ISSUE_FILTER_ICON: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('SYSTEM ISSUE'),
    label: getDescriptionTableFilter(),
  },
  CLICK_TO_INVESTIGATE_FILTER_ICON: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('TO INVESTIGATE'),
    label: getDescriptionTableFilter(),
  },
  CLICK_EDIT_ICON_AFTER_LAUNCH_NAME: {
    category: LAUNCHES_PAGE,
    action: 'Click on Edit Icon after launch name',
    label: 'Edit Launch/Arise Modal "Edit Launch"',
  },
  CLICK_PB_CIRCLE: {
    category: LAUNCHES_PAGE,
    action: 'Click on Product Bug Circle',
    label: 'Transition to inner level of launch with Product Bugs',
  },
  CLICK_AB_CIRCLE: {
    category: LAUNCHES_PAGE,
    action: 'Click on Auto Bug Circle',
    label: 'Transition to inner level of launch with Auto Bug',
  },
  CLICK_SI_CIRCLE: {
    category: LAUNCHES_PAGE,
    action: 'Click on System Issue Circle',
    label: 'Transition to inner level of launch with System Issue',
  },
  CLICK_TI_TAG: {
    category: LAUNCHES_PAGE,
    action: 'Click on To Investigate tag',
    label: 'Transition to inner level of launch with To Investigate',
  },
  CLICK_TOOLTIP_TTL_PB: {
    category: LAUNCHES_PAGE,
    action: 'Click on Tooltip "Total Product Bugs"',
    label: 'Transition to inner level of launch with Product Bugs',
  },
  CLICK_TOOLTIP_TTL_AB: {
    category: LAUNCHES_PAGE,
    action: 'Click on Tooltip "Total Auto Bug"',
    label: 'Transition to inner level of launch with Auto Bug',
  },
  CLICK_TOOLTIP_TTL_SI: {
    category: LAUNCHES_PAGE,
    action: 'Click on Tooltip "Total System Issue"',
    label: 'Transition to inner level of launch with System Issue',
  },
  CLICK_SELECT_ALL_ICON: {
    category: LAUNCHES_PAGE,
    action: 'Click on item icon "select all launches"',
    label: 'Select/unselect all launches',
  },
  CLICK_SELECT_ONE_ITEM: {
    category: LAUNCHES_PAGE,
    action: 'Click on item icon "select one launch"',
    label: 'Select/unselect one launch',
  },
  CLICK_ACTIONS_BTN: {
    category: LAUNCHES_PAGE,
    action: 'Click on button Actions',
    label: 'Arise Dropdown with list of actions',
  },
  CLICK_MERGE_ACTION: {
    category: LAUNCHES_PAGE,
    action: 'Click on button "Merge" in list of actions',
    label: 'Arise Modal "Merge Launches"',
  },
  CLICK_COMPARE_ACTION: {
    category: LAUNCHES_PAGE,
    action: 'Click on button "Compare" in list of actions',
    label: 'Arise Modal "Compare Launches"',
  },
  CLICK_MOVE_TO_DEBUG_ACTION: {
    category: LAUNCHES_PAGE,
    action: 'Click on button "Move to Debug" in list of actions',
    label: 'Arise Modal "Move to Debug"',
  },
  CLICK_FORCE_FINISH_ACTION: {
    category: LAUNCHES_PAGE,
    action: 'Click on button "Force Finish" in list of actions',
    label: 'Force Finish',
  },
  CLICK_DELETE_ACTION: {
    category: LAUNCHES_PAGE,
    action: 'Click on button "Delete" in list of actions',
    label: 'Arise Modal "Delete Launch"',
  },
  CLICK_CLOSE_ICON_FROM_SELECTION: {
    category: LAUNCHES_PAGE,
    action: 'Click on Close Icon on Tag of Launch',
    label: 'Remove launch from  selection',
  },
  CLICK_CLOSE_ICON_ALL_SELECTION: {
    category: LAUNCHES_PAGE,
    action: 'Click on Close Icon of all selection',
    label: 'Unselect all launches',
  },
};

export const SETTINGS_PAGE = 'settings';
export const SETTINGS_PAGE_EVENTS = {
  GENERAL_TAB: {
    category: SETTINGS_PAGE,
    action: 'MY CUSTOM EVENT',
    label: 'MY CUSTOM EVENT',
  },
  INACTIVITY_TIMEOUT_GENERAL: {
    category: SETTINGS_PAGE,
    action: 'Edit input Launch inactivity timeout on tab General',
    label: 'Change input Launch inactivity timeout on tab General',
  },
  KEEP_LOGS_GENERAL: {
    category: SETTINGS_PAGE,
    action: 'Edit input Keep logs on tab General',
    label: 'Change input Keep logs on tab General',
  },
  KEEP_SCREENSHOTS_GENERAL: {
    category: SETTINGS_PAGE,
    action: 'Edit input Keep screenshots on tab General',
    label: 'Change input Keep screenshots on tab General',
  },
  GENERAL_SUBMIT: {
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Submit on tab General',
    label: 'Submit changes on tab General',
  },
  NOTIFICATIONS_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Notifications in Settings',
    label: 'Open tab Notifications in Settings',
  },
  DELETE_RULE_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Delete rule on tab Notifications',
    label: 'Delete rule on tab Notifications',
  },
  EDIT_RECIPIENTS_INPUT_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit input Recipients on tab Notifications',
    label: 'Change input Recipients on tab Notifications',
  },
  CHECKBOX_LAUNCH_OWNER_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit checkbox Launch owner on tab Notifications',
    label: 'Check/uncheck Launch owner on tab Notifications',
  },
  EDIT_IN_CASE_INPUT_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit input In case on tab Notifications',
    label: 'Change input In case on tab Notifications',
  },
  LAUNCH_NAME_INPUT_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit input Launch names on tab Notifications',
    label: 'Change input Launch names on tab Notifications',
  },
  TAGS_INPUT_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Edit input Tags on tab Notifications',
    label: 'Change input Tags on tab Notifications',
  },
  ADD_RULE_BTN_NOTIFICATIONS: {
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Add new rule on tab Notifications',
    label: 'Add new rule on tab Notifications',
  },
  INTEGRATIONS_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Integrations in Settings',
    label: 'Open tab Integrations in Settings',
  },
  SELECT_BTS_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Edit input Bug tracking system on tab Integrations',
    label: 'Change input Bug tracking system on tab Integrations',
  },
  CHANGE_PROJECT_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Change project of BTS Instances on tab Integrations',
    label: 'Change project of BTS Instances on tab Integrations',
  },
  ADD_NEW_BTS_INSTANCE: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on link Add new instance on tab Integrations',
    label: 'Arise fields for adding new project on tab Integrations',
  },
  EDIT_PROJECT_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on icon Edit Projects BTS Instance on tab Integrations',
    label: 'Arise fields for editing Projects BTS Instance on tab Integrations',
  },
  DELETE_PROJECT_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on icon Delete Projects BTS Instance on tab Integrations',
    label: 'Arise Modal delete Projects BTS Instance on tab Integrations',
  },
  CANCEL_EDIT_PROJECT_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Cancel Edit Projects BTS Instance on tab Integrations',
    label: 'Cancel Change of Projects BTS Instance on tab Integrations',
  },
  SUBMIT_EDIT_PROJECT_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Submit Edit Projects BTS Instance on tab Integrations',
    label: 'Submit Change of Projects BTS Instance on tab Integrations',
  },
  CLOSE_ICON_DELETE_PROJECT_MODAL_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Delete Project',
    label: 'Close Modal Delete Project',
  },
  CANCEL_BTN_DELETE_PROJECT_MODAL_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Cancel on Modal Delete Project',
    label: 'Close Modal Delete Project',
  },
  DELETE_BTN_DELETE_PROJECT_MODAL_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Delete on Modal Delete Project',
    label: 'Delete Project',
  },
  EDIT_DEFAULT_PROPS_FOR_ISSUE_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Edit inputs of Default properties for issue form on tab Integrations',
    label: 'Change inputs of Default properties for issue form on tab Integrations',
  },
  UPDATE_BTN_DEFAULT_PROPS_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Update Default properties for issue form on tab Integrations',
    label: 'Update Default properties for issue form on tab Integrations',
  },
  SUBMIT_BTN_DEFAULT_PROPS_BTS: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Submit Default properties for issue form on tab Integrations',
    label: 'Submit Change of Default properties for issue form on tab Integrations',
  },
  EDIT_DEFECT_TAG_DEFECT_TYPES: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on icon Edit defect tag on tab Defect Types',
    label: 'Arise fields for editing defect tag on tab Defect Types',
  },
  DELETE_ICON_DEFECT_TYPE: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on icon Delete defect tag on tab Defect Types',
    label: 'Arise Modal Delete defect type on tab Defect Types',
  },
  EDIT_DEFECT_TYPE_NAME_DEFECT_TYPE: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Edit input Defect type name on tab Defect Types',
    label: 'Change Defect type name on tab Defect Types',
  },
  EDIT_DEFECT_TYPE_ABBREVIATION: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Edit input Defect type abbreviation on tab Defect Types',
    label: 'Change Defect type abbreviation on tab Defect Types',
  },
  CHANGE_DEFECT_TYPE_COLOR: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Edit input Defect type color on tab Defect Types',
    label: 'Change Defect type color on tab Defect Types',
  },
  SUBMIT_DEFECT_TYPE_CHANGES: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on icon Submit defect type change on tab Defect Types',
    label: 'Change defect type on tab Defect Types',
  },
  CANCEL_DEFECT_TYPE_CHANGES: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on icon Cancel defect type change on tab Defect Types',
    label: 'Cancel defect type change on tab Defect Types',
  },
  CLOSE_ICON_DELETE_DEFECT_TYPE: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Delete Defect type',
    label: 'Close Modal Delete Defect type',
  },
  CANCEL_BTN_DELETE_DEFECT_TYPE_MODAL: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Cancel on Modal Delete Defect type',
    label: 'Close Modal Delete Defect type',
  },
  DELETE_BTN_DELETE_DEFECT_TYPE_MODAL: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Delete on Modal Delete Defect type',
    label: 'Delete Defect type',
  },
  ADD_DEFECT_TYPE_BTN: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Add defect type on tab Defect types',
    label: 'Arise fieldes for Add defect type on tab Defect types',
  },
  RESET_DEFAULT_COLOR: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on link Reset to default colors on tab Defect types',
    label: 'Arise fieldes for Add defect type on tab Defect types',
  },
  CLOSE_ICON_RESET_DEFECT_COLORS_MODAL: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on icon Close on Modal Reset Defect colors',
    label: 'Close Modal Reset Defect colors',
  },
  CANCEL_BTN_RESET_DEFECT_COLORS_MODAL: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Cancel on Modal Reset Defect colors',
    label: 'Close Modal Reset Defect colors',
  },
  RESET_BTN_RESET_DEFECT_COLORS_MODAL: {
    // todo add analytics
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Reset on Modal Reset Defect colors',
    label: 'Reset Defect colors',
  },
  DEFECT_TYPE_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Defect Types in Settings',
    label: 'Open tab Defect Types in Settings',
  },
  DEMO_DATA_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Demo Data in Settings',
    label: 'Open tab Demo Data in Settings',
  },
  ENTER_POSTFIX_DEMO_DATA: {
    category: SETTINGS_PAGE,
    action: 'Edit input Postfix on tab Demo Data',
    label: 'Change Postfix on tab Demo Data',
  },
  GENERATE_DATA_BTN: {
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Generate Demo Data on tab Demo Data',
    label: 'Generate Demo Data on tab Demo Data',
  },
  AUTO_ANALYSIS_TAB: {
    category: SETTINGS_PAGE,
    action: 'Click on tab Auto-Analysis in Settings',
    label: 'Open tab Auto-Analysis in Settings',
  },
  AUTO_ANALYSIS_SWITCHER: {
    category: SETTINGS_PAGE,
    action: 'Click on Auto-Analysis on/off in Auto-Analysis tab',
    label: 'Auto-Analysis on/off',
  },
  AUTO_ANALYSIS_BASE_RADIO_BTN: {
    category: SETTINGS_PAGE,
    action: 'Choose radio bttn of Base for Auto-Analysis',
    label: 'Choose Base for Auto-Analysis',
  },
  TOGGLE_AUTO_ANALYSIS_MODE: {
    category: SETTINGS_PAGE,
    action: 'Toggle Mode of Auto-Analysis Accuracy',
    label: 'Choose Mode of Auto-Analysis',
  },
  SUBMIT_AUTO_ANALYSIS_SETTINGS: {
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Submit in Auto-Analysis tab',
    label: 'Submit changes in Auto-Analysis tab',
  },
  REMOVE_INDEX_BTN: {
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Remove index in Auto-Analysis tab',
    label: 'Remove index in Auto-Analysis tab',
  },
  GENERATE_INDEX_BTN: {
    category: SETTINGS_PAGE,
    action: 'Click on Bttn Generate index in Auto-Analysis tab',
    label: 'Generate index in Auto-Analysis tab',
  },
};

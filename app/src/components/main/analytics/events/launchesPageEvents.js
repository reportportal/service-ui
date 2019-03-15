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
  NAME_FILTER: {
    // todo
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('NAME'),
    label: getDescriptionTableFilter(),
  },
  START_TIME_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('START'),
    label: getDescriptionTableFilter(),
  },
  TOTAL_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('TOTAL'),
    label: getDescriptionTableFilter(),
  },
  PASSED_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('PASSED'),
    label: getDescriptionTableFilter(),
  },
  FAILED_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('FAILED'),
    label: getDescriptionTableFilter(),
  },
  SKIPPED_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('SKIPPED'),
    label: getDescriptionTableFilter(),
  },
  PB_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('PRODUCT BUG'),
    label: getDescriptionTableFilter(),
  },
  AB_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('AUTO BUG'),
    label: getDescriptionTableFilter(),
  },
  SI_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('SYSTEM ISSUE'),
    label: getDescriptionTableFilter(),
  },
  TI_FILTER: {
    category: LAUNCHES_PAGE,
    action: getActionTableFilter('TO INVESTIGATE'),
    label: getDescriptionTableFilter(),
  },
  EDIT_ICON_CLICK: {
    category: LAUNCHES_PAGE,
    action: 'Click on Edit Icon after launch name',
    label: 'Edit Launch/Arise Modal "Edit Launch"',
  },
  PB_CHART: {
    category: LAUNCHES_PAGE,
    action: 'Click on Product Bug Circle',
    label: 'Transition to inner level of launch with Product Bugs',
  },
  AB_CHART: {
    category: LAUNCHES_PAGE,
    action: 'Click on Auto Bug Circle',
    label: 'Transition to inner level of launch with Auto Bug',
  },
  SI_CHART: {
    category: LAUNCHES_PAGE,
    action: 'Click on System Issue Circle',
    label: 'Transition to inner level of launch with System Issue',
  },
  TI_CHART: {
    category: LAUNCHES_PAGE,
    action: 'Click on To Investigate tag',
    label: 'Transition to inner level of launch with To Investigate',
  },
  PB_TOOLTIP_CLICK: {
    category: LAUNCHES_PAGE,
    action: 'Click on Tooltip "Total Product Bugs"',
    label: 'Transition to inner level of launch with Product Bugs',
  },
  AB_TOOLTIP: {
    category: LAUNCHES_PAGE,
    action: 'Click on Tooltip "Total Auto Bug"',
    label: 'Transition to inner level of launch with Auto Bug',
  },
  SI_TOOLTIP_CLICK: {
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
  CLICK_PROCEED_ITEMS_BUTTON: {
    // todo
    category: LAUNCHES_PAGE,
    action: 'Click on button "Proceed Valid Items"',
    label: 'Remove invalid launches from selection',
  },
  CLICK_ALL_LAUNCHES_DROPDOWN: {
    category: LAUNCHES_PAGE,
    action: 'Click on All Launches dropdown icon',
    label: 'Arise dropdown',
  },
  SELECT_ALL_LAUNCHES: {
    category: LAUNCHES_PAGE,
    action: 'Select All Launches on dropdown',
    label: 'Transition to All Launches',
  },
  SELECT_LATEST_LAUNCHES: {
    category: LAUNCHES_PAGE,
    action: 'Select Latest Launches in dropdown',
    label: 'Transition to Latest Launches',
  },
  CLICK_IMPORT_BTN: {
    category: LAUNCHES_PAGE,
    action: 'Click on Bttn Import',
    label: 'Arise Modul Import Launch',
  },
};

const LAUNCHES_MODAL = 'Modal launches';
export const LAUNCHES_MODAL_EVENTS = {
  CLOSE_ICON_EDIT_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Edit Launch"',
    label: 'Close modal "Edit Launch"',
  },
  EDIT_DESCRIPTION_EDIT_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Edit description in Modal "Edit Launch"',
    label: 'Edit launch description',
  },
  CLICK_CANCEL_BTN_EDIT_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Cancel on Modal "Edit Launch"',
    label: 'Close modal "Edit Launch"',
  },
  CLICK_SAVE_BTN_EDIT_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Save on Modal "Edit Launch"',
    label: 'Save changes "Edit Launch"',
  },
  CLOSE_ICON_MOVE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Move to Debug"',
    label: 'Close modal "Move to Debug"',
  },
  CLICK_CANCEL_BTN_MOVE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Cancel on Modal "Move to Debug"',
    label: 'Close modal "Move to Debug"',
  },
  CLICK_MOVE_BTN_MOVE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Move on Modal "Move to Debug"',
    label: 'Save changes "Move to Debug"',
  },
  CLOSE_ICON_DELETE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Delete Launch"',
    label: 'Close modal "Delete Launch"',
  },
  CANCEL_BTN_DELETE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Cancel on Modal "Delete Launch"',
    label: 'Close modal "Delete Launch"',
  },
  DELETE_BTN_DELETE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Delete on Modal "Delete Launch"',
    label: 'Delete launch mentioned in modal "Delete Launch"',
  },
  CLOSE_ICON_MERGE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Merge Launches"',
    label: 'Close modal "Merge Launches"',
  },
  CANCEL_BTN_MERGE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Cancel on Modal "Merge Launches"',
    label: 'Close modal "Merge Launches"',
  },
  MERGE_BTN_MERGE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Merge on Modal "Merge Launches"',
    label: 'Merge launches mentioned in modal "Merge Launches"',
  },
  CLOSE_ICON_IMPORT_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Import Launch"',
    label: 'Close Modal Import Launch',
  },
  CANCEL_BTN_IMPORT_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Cancel on Modal "Import Launch"',
    label: 'Close Modal Import Launch',
  },
  OK_BTN_IMPORT_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Ok on Modal "Import Launch"',
    label: 'Import Launch',
  },
  LINEAR_MERGE_BTN_MERGE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Linear Merge on Modal "Merge Launches"',
    label: 'Linear Merge',
  },
  DEEP_MERGE_BTN_MERGE_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Deep Merge on Modal "Merge Launches"',
    label: 'Deep Merge',
  },
  OK_BTN_ANALYSIS_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Ok on Modal "Analysis Launch"',
    label: 'Analysis Launch',
  },
  CLOSE_BTN_ANALYSIS_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Close Icon on Modal "Analysis Launch"',
    label: 'Close Analysis Launch Modal',
  },
  CANCEL_BTN_ANALYSIS_MODAL: {
    category: LAUNCHES_MODAL,
    action: 'Click on Bttn Cancel on Modal "Analysis Launch"',
    label: 'Cancel Analysis Launch Modal',
  },
};

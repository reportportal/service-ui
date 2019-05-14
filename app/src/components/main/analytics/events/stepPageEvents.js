export const STEP_PAGE = 'step';
export const STEP_PAGE_EVENTS = {
  REFINE_BY_NAME: {
    category: STEP_PAGE,
    action: 'Enter parameters to refine by name',
    label: 'Refine by name',
  },
  REFINE_BTN_MORE: {
    category: STEP_PAGE,
    action: 'Click on Refine bttn More',
    label: 'Arise dropdown with parameters',
  },
  SELECT_REFINE_PARAMS: {
    category: STEP_PAGE,
    action: 'Select parameters to refine',
    label: 'Show parameters fields to refine',
  },
  METHOD_TYPE_SWITCHER: {
    category: STEP_PAGE,
    action: 'Click on Method type switcher',
    label: 'Show/Hide method type',
  },
  METHOD_TYPE_FILTER: {
    category: STEP_PAGE,
    action: 'Click on icon "filter" Method type',
    label: 'Arises active "Method type" input',
  },
  METHOD_TYPE_SORTING: {
    category: STEP_PAGE,
    action: 'Click on icon "sorting" Method type',
    label: 'Sort items by Method type',
  },
  NAME_FILTER: {
    category: STEP_PAGE,
    action: 'Click on icon "filter" Name',
    label: 'Suite name input becomes active',
  },
  NAME_SORTING: {
    category: STEP_PAGE,
    action: 'Click on icon "sorting" Name',
    label: 'Sort items by Name',
  },
  STATUS_FILTER: {
    category: STEP_PAGE,
    action: 'Click on icon "filter" Status',
    label: 'Arises active "Status" input',
  },
  STATUS_SORTING: {
    category: STEP_PAGE,
    action: 'Click on icon "sorting" Status',
    label: 'Sort items by Status',
  },
  START_TIME_FILTER: {
    category: STEP_PAGE,
    action: 'Click on icon "filter" Start time',
    label: 'Arises active "Start time" input',
  },
  START_TIME_SORTING: {
    category: STEP_PAGE,
    action: 'Click on icon "sorting" Start time',
    label: 'Sort items by Start time',
  },
  DEFECT_TYPE_FILTER: {
    category: STEP_PAGE,
    action: 'Click on icon "filter" Defect type',
    label: 'Arises active "Defect type" input',
  },
  DEFECT_TYPE_SORTING: {
    category: STEP_PAGE,
    action: 'Click on icon "sorting" Defect type',
    label: 'Sort items by Defect type',
  },
  EDIT_ICON_CLICK: {
    category: STEP_PAGE,
    action: 'Click on item icon "edit"',
    label: 'Arise Modal "Edit Item"',
  },
  EDIT_DEFECT_TYPE_ICON: {
    category: STEP_PAGE,
    action: 'Click on icon "edit" of Defect type tag',
    label: 'Arise Modal "Edit Defect Type"',
  },
  SELECT_ALL_ITEMS: {
    category: STEP_PAGE,
    action: 'Click on item icon "select all items"',
    label: 'Select/unselect all items',
  },
  SELECT_ONE_ITEM: {
    category: STEP_PAGE,
    action: 'Click on item icon "select one item"',
    label: 'Select/unselect one item',
  },
  CLOSE_ICON_EDIT_ITEM_MODAL: {
    // todo
    category: STEP_PAGE,
    action: 'Click on Close Icon on Modal "Edit Item"',
    label: 'Close modal "Edit Item"',
  },
  EDIT_ITEM_DESCRIPTION: {
    // todo
    category: STEP_PAGE,
    action: 'Edit description in Modal "Edit Item"',
    label: 'Edit description',
  },
  CANCEL_BTN_EDIT_ITEM_MODAL: {
    // todo
    category: STEP_PAGE,
    action: 'Click on Bttn Cancel on Modal "Edit Item',
    label: 'Close modal "Edit Item"',
  },
  SAVE_BTN_EDIT_ITEM_MODAL: {
    // todo
    category: STEP_PAGE,
    action: 'Click on Bttn Save on Modal "Edit Item"',
    label: 'Save changes',
  },
  CLOSE_ICON_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Close Icon on Modal "Edit Defect Type"',
    label: 'Close modal "Edit Defect Type"',
  },
  EDIT_DESCRIPTION_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Edit description in Modal "Edit Defect Type"',
    label: 'Edit description',
  },
  CANCEL_BTN_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Bttn Cancel on Modal "Edit Defect Type"',
    label: 'Close modal "Edit Defect Type"',
  },
  SAVE_BTN_EDIT_DEFECT_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Bttn Save on Modal "Edit Defect Type"',
    label: 'Save changes',
  },
  CLOSE_ICON_SELECTED_ITEM: {
    category: STEP_PAGE,
    action: 'Click on icon "close" on selected item',
    label: 'Unselect item',
  },
  PROCEED_VALID_ITEMS: {
    category: STEP_PAGE,
    action: 'Click on Bttn "Proceed Valid Items"',
    label: 'Remove invalid launches from selection',
  },
  CLOSE_ICON_FOR_ALL_SELECTIONS: {
    category: STEP_PAGE,
    action: 'Click on Close Icon of all selection',
    label: 'Close panel with selected items',
  },
  EDIT_DEFECT_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Bttn "Edit Defect"',
    label: 'Arise Modal "Edit Defect Type"',
  },
  POST_BUG_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Bttn "Post Bug"',
    label: 'Arise Modal "Post Bug"',
  },
  LOAD_BUG_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Bttn "Load Bug"',
    label: 'Arise Modal "Load Bug"',
  },
  DELETE_ACTION: {
    category: STEP_PAGE,
    action: 'Click on Bttn "Delete"',
    label: 'Arise Modal "Delete Item"',
  },
  HISTORY_BTN: {
    category: STEP_PAGE,
    action: 'Click on Bttn "History"',
    label: 'Transition to History View Page',
  },
  REFRESH_BTN: {
    category: STEP_PAGE,
    action: 'Click on Bttn "Refresh"',
    label: 'Refresh page',
  },
  CLOSE_ICON_POST_BUG_MODAL: {
    // todo
    category: STEP_PAGE,
    action: 'Click on Icon Close on Modal Post Bug',
    label: 'Close Modal Post Bug',
  },
  SCREENSHOTS_SWITCHER_POST_BUG_MODAL: {
    // todo
    category: STEP_PAGE,
    action: 'Click on Screenshots switcher on Modal Post Bug',
    label: 'On/off Screenshots in Modal Post Bug',
  },
  LOGS_SWITCHER_POST_BUG_MODAL: {
    // todo
    category: STEP_PAGE,
    action: 'Click on Logs switcher on Modal Post Bug',
    label: 'On/off Logs in Modal Post Bug',
  },
  COMMENT_SWITCHER_POST_BUG_MODAL: {
    // todo
    category: STEP_PAGE,
    action: 'Click on Comment switcher on Modal Post Bug',
    label: 'On/off Comment in Modal Post Bug',
  },
  CANCEL_BTN_POST_BUG_MODAL: {
    // todo
    category: STEP_PAGE,
    action: 'Click on Bttn Cancel on Modal Post Bug',
    label: 'Close Modal Post Bug',
  },
  POST_BTN_POST_BUG_MODAL: {
    // todo
    category: STEP_PAGE,
    action: 'Click on Bttn Post on Modal Post Bug',
    label: 'Post bug',
  },
  CLOSE_ICON_LOAD_BUG_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Icon Close on Modal Load Bug',
    label: 'Close Modal Load Bug',
  },
  ADD_NEW_ISSUE_BTN_LOAD_BUG_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Bttn Add New Issue on Modal Load Bug',
    label: 'Add input in Modal Load Bug',
  },
  CANCEL_BTN_LOAD_BUG_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Bttn Cancel on Modal Load Bug',
    label: 'Close Modal Load Bug',
  },
  LOAD_BTN_LOAD_BUG_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Bttn Load on Modal Load Bug',
    label: 'Load bug',
  },
  CLOSE_ICON_DELETE_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Icon Close on Modal Delete Item',
    label: 'Close Modal Delete Item',
  },
  CANCEL_BTN_DELETE_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Bttn Cancel on Modal Delete Item',
    label: 'Close Modal Delete Item',
  },
  DELETE_BTN_DELETE_ITEM_MODAL: {
    category: STEP_PAGE,
    action: 'Click on Bttn Delete on Modal Delete Item',
    label: 'Delete item',
  },
};

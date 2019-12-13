/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const DASHBOARD_PAGE = 'dashboards';
export const DASHBOARD_PAGE_EVENTS = {
  ADD_NEW_DASHBOARD_BTN: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add New Dashboard',
    label: 'Arise Modal Add New Dashboard',
  },
  ENTER_PARAM_FOR_SEARCH: {
    category: DASHBOARD_PAGE,
    action: 'Enter parameter for search',
    label: 'Show dashboards by parameter',
  },
  DASHBOARD_NAME_CLICK: {
    category: DASHBOARD_PAGE,
    action: 'Click on Dashboard name',
    label: 'Transition to Dashboard',
  },
  DELETE_ICON_DASHBOARD_TILE: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Close on Dashboard tile',
    label: 'Arise Modal Delete Dashboard',
  },
  SHARED_DASHBOARD_NAME: {
    category: DASHBOARD_PAGE,
    action: 'Click on Shared Dashboard name',
    label: 'Transition to Dashboard',
  },
  CLOSE_ICON_ADD_NEW_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Close on Modal Add New Dashboard',
    label: 'Close Modal Add New Dashboard',
  },
  ENTER_DESCRIPTION_ADD_NEW_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Enter description in Modal Add New Dashboard',
    label: 'Description',
  },
  SHARE_SWITCHER_ADD_NEW_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Share on/off in Modal Add New Dashboard',
    label: 'Share/unshare Dashboard',
  },
  CANCEL_BTN_ADD_NEW_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel in Modal Add New Dashboard',
    label: 'Close Modal Add New Dashboard',
  },
  ADD_BTN_ADD_NEW_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add in Modal Add New Dashboard',
    label: 'Add Dashboard',
  },
  CLOSE_ICON_EDIT_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Close on Modal Edit Dashboard',
    label: 'Close Modal Edit Dashboard',
  },
  ENTER_DESCRIPTION_EDIT_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Enter description in Modal Edit Dashboard',
    label: 'Description',
  },
  SHARE_SWITCHER_EDIT_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Share on/off in Modal Edit Dashboard',
    label: 'Share/unshare Dashboard',
  },
  CANCEL_BTN_EDIT_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel in Modal Edit Dashboard',
    label: 'Close Modal Edit Dashboard',
  },
  UPDATE_BTN_EDIT_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Update in Modal Edit Dashboard',
    label: 'Update Dashboard',
  },
  CLOSE_ICON_DELETE_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Close on Modal Delete Dashboard',
    label: 'Close Modal Delete Dashboard',
  },
  CANCEL_BTN_DELETE_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel in Modal Delete Dashboard',
    label: 'Close Modal Delete Dashboard',
  },
  DELETE_BTN_DELETE_DASHBOARD_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Delete in Modal Delete Dashboard',
    label: 'Delete Dashboard',
  },
  BREADCRUMB_ALL_DASHBOARD: {
    category: DASHBOARD_PAGE,
    action: 'Click on Bread Crumb All Dashboards',
    label: 'Transition to All Dashboards',
  },
  ADD_NEW_WIDGET_BTN: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add New Widget on Dashboard',
    label: 'Arise Modal Add New Widget',
  },
  ADD_SHARED_WIDGET_BTN: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add Shared Widget on Dashboard',
    label: 'Arise Modal Add Shared Widget',
  },
  EDIT_DASHBOARD_BTN: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Edit on Dashboard',
    label: 'Arise Modal Edit Dashboard',
  },
  FULL_SCREEN_BTN: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Full Screen on Dashboard',
    label: 'Full Screen of Dashboard',
  },
  DELETE_DASHBOARD: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Remove on Dashboard',
    label: 'Arise Modal Delete Dashboard',
  },
  DRAG_WIDGET: {
    category: DASHBOARD_PAGE,
    action: 'Click and drag Widget',
    label: 'Move Widget',
  },
  EDIT_WIDGET: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Edit on Widget',
    label: 'Arise Modal Edit Widget',
  },
  REFRESH_WIDGET: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Refresh on Widget',
    label: 'Refresh Widget',
  },
  REMOVE_WIDGET: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Remove on Widget',
    label: 'Arise Modal Delete Widget',
  },
  RESIZE_WIDGET: {
    category: DASHBOARD_PAGE,
    action: 'Click and drag on icon Resize on Widget',
    label: 'Resize Widget',
  },
  CLOSE_ICON_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Close on Modal Add New Widget',
    label: 'Close Modal Add New Widget',
  },
  CHOOSE_WIDGET_TYPE_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Choose radio Btn of Widget type in Modal Add New Widget',
    label: 'Choose Widget type in Modal Add New Widget',
  },
  NEXT_STEP_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Next Step on Modal Add New Widget',
    label: 'Transition to Next Step on Modal Add New Widget',
  },
  ENTER_PARAMS_FOR_SEARCH_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Enter parameter for search',
    label: 'Show filter by parameter',
  },
  ADD_FILTER_BTN_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add Filter in Modal Add New Widget',
    label: 'Arise fields for adding new filter',
  },
  CHOOSE_FILTER_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on radio Btn of Filter in Modal Add New Widget',
    label: 'Choose filter',
  },
  EDIT_FILTER_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Edit Filter in Modal Add New Widget',
    label: 'Arise fields to edit filter',
  },
  PREVIOUS_STEP_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Previous Step on Modal Add New Widget',
    label: 'Transition to Previous Step in Modal Add New Widget',
  },
  SELECT_PARAMS_FILTER_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Select parameters of filter in Modal Add New Widget',
    label: 'Show parameters of filter in Modal Add New Widget',
  },
  SELECT_SORTING_FILTER_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Select parameters of sorting in filter on Modal Add New Widget',
    label: 'Show parameters of sorting in filter on Modal Add New Widget',
  },
  CANCEL_BTN_ADD_NEW_FILTER_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel in Add new filter in Modal Add New Widget',
    label: 'Cancel adding new filter in Modal Add New Widget',
  },
  ADD_BTN_ADD_NEW_FILTER_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add in Add new filter in Modal Add New Widget',
    label: 'Add new filter in Modal Add New Widget',
  },
  EDIT_FILTER_NAME_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Edit filter name in Modal Add New Widget',
    label: 'Edited filter name in Modal Add New Widget',
  },
  CANCEL_BTN_EDIT_FILTER_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel in Edit filter in Modal Add New Widget',
    label: 'Cancel Edit filter in Modal Add New Widget',
  },
  SUBMIT_FILTER_EDIT_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Submit in Edit filter in Modal Add New Widget',
    label: 'Submit changes in filter in Modal Add New Widget',
  },
  ENTER_WIDGET_DESCRIPTION_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Enter Widget description in Modal Add New Widget',
    label: 'Widget description in Modal Add New Widget',
  },
  SHARE_WIDGET_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Share Widget on/off in Modal Add New Widget',
    label: 'Share/unshare Widget',
  },
  ADD_BTN_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add in Modal Add New Widget',
    label: 'Submit changes in filter in Modal Add New Widget',
  },
  CANCEL_BTN_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel in Modal Add New Widget',
    label: 'Close Modal Add New Widget',
  },
  WIDGET_NAME_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Change Widget name in Modal Add New Widget',
    label: 'New Widget name in Modal Add New Widget',
  },
  ENTER_SEARCH_PARAMS_ADD_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Enter parameter for search in Modal Add New Widget',
    label: 'Show filter by parameter in Modal Add New Widget',
  },
  CLOSE_ICON_SHARE_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Close on Modal Add Shared Widget',
    label: 'Close Modal Add Shared Widget',
  },
  WIDGET_TYPE_SHARE_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Choose radio Btn of Widget type in Modal Add Shared Widget',
    label: 'Choose Widget type in Modal Add Shared Widget',
  },
  SCROLL_WIDGET_SHARE_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Scroll widgets in Modal Add Shared Widget',
    label: 'Scroll widgets in Modal Add Shared Widget',
  },
  CANCEL_BTN_SHARE_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel in Modal Add Shared Widget',
    label: 'Cancel Modal Add Shared Widget',
  },
  ADD_BTN_SHARE_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add in Modal Add Shared Widget',
    label: 'Add Shared Widget',
  },
  CLOSE_ICON_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Close on Modal Edit Widget',
    label: 'Close Modal Edit Widget',
  },
  EDIT_FILTER_ICON_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on icon Edit Filter in Modal Edit Widget',
    label: 'Arise fields to edit filter in Modal Edit Widget',
  },
  WIDGET_NAME_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Change Widget name in Modal Edit Widget',
    label: 'New Widget name in Modal Edit Widget',
  },
  WIDGET_DESCRIPTION_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Change Widget description in Modal Edit Widget',
    label: 'New Widget description in Modal Edit Widget',
  },
  SHARE_WIDGET_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Share Widget on/off in Modal Edit Widget',
    label: 'Share/unshare Widget',
  },
  CANCEL_BTN_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel in Modal Edit Widget',
    label: 'Close Modal Edit Widget',
  },
  SAVE_BTN_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Save in Modal Edit Widget',
    label: 'Save changes in Modal Edit Widget',
  },
  ENTER_SEARCH_PARAMS_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Enter parameter for search in Modal Edit Widget',
    label: 'Show filter by parameter in Modal Edit Widget',
  },
  ADD_FILTER_BTN_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add Filter in Modal Edit Widget',
    label: 'Arise fields for adding new filter in Modal Edit Widget',
  },
  CHOOSE_FILTER_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on radio Btn of Filter in Modal Edit Widget',
    label: 'Choose filter in Modal Edit Widget',
  },
  SUBMIT_CHANGES_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Submit filter change in Modal Edit Widget',
    label: 'Save filter change in Modal Edit Widget',
  },
  PARAMS_FOR_FILTER_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Select parameters of filter in Modal Edit Widget',
    label: 'Show parameters of filter in Modal Edit Widget',
  },
  SORTING_FOR_NEW_FILTER_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Select parameters of sorting in new filter in Modal Edit Widget',
    label: 'Show parameters of sorting of new filter in Modal Edit Widget',
  },
  CANCEL_BTN_ADD_NEW_FILTER_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel in add new filter in Modal Edit Widget',
    label: 'Cancel add new filter in Modal Edit Widget',
  },
  ADD_NEW_FILTER_BTN_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add in add new filter in Modal Edit Widget',
    label: 'Add new filter in Modal Edit Widget',
  },
  CANCEL_EDIT_FILTER_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel in Edit filter in Modal Edit Widget',
    label: 'Cancel Edit filter in Modal Edit Widget',
  },
  SUBMIT_EDIT_FILTER_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Submit in Edit filter in Modal Edit Widget',
    label: 'Submit changes in filter in Modal Edit Widget',
  },
  EDIT_FILTER_NAME_EDIT_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Edit filter name in Modal Edit Widget',
    label: 'Edited filter name in Modal Edit Widget',
  },
  CLOSE_ICON_DELETE_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Icon Close on Modal Delete Widget',
    label: 'Close Modal Delete Widget',
  },
  CANCEL_BTN_DELETE_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Cancel on Modal Delete Widget',
    label: 'Close Modal Delete Widget',
  },
  DELETE_BTN_DELETE_WIDGET_MODAL: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Delete on Modal Delete Widget',
    label: 'Delete Widget',
  },
  EDIT_WIDGET_LEGEND: {
    category: DASHBOARD_PAGE,
    action: 'Edit Widget legend',
    label: 'Change Widget legend',
  },
  WIDGET_CLICK: {
    category: DASHBOARD_PAGE,
    action: 'Click on Widget',
    label: 'Transition to launches page',
  },
  ADD_NEW_WIDGET_LINK: {
    category: DASHBOARD_PAGE,
    action: 'Click on link Add New Widget on Dashboard',
    label: 'Arise Modal Add New Widget',
  },
  ADD_NEW_WIDGET_EMPTY_PAGE: {
    category: DASHBOARD_PAGE,
    action: 'Click on Btn Add New Dashboard on empty page',
    label: 'Arise Modal Add New Dashboard',
  },
};

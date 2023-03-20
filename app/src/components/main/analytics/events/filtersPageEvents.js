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

import { getBasicClickEventParameters } from './common/ga4Utils';
import { LAUNCHES_PAGE } from './launchesPageEvents';

export const FILTERS_PAGE = 'filters';

export const getAddEditFilterModalEvents = (isEditMode) => {
  const modalType = isEditMode ? 'Edit' : 'Add';
  const actionType = isEditMode ? 'Update' : 'Add';

  return {
    clickCloseIcon: {
      category: FILTERS_PAGE,
      action: `Click on icon Close on Modal ${modalType} Filter`,
      label: `Close Modal ${modalType} Filter`,
    },
    editDescription: {
      category: FILTERS_PAGE,
      action: `Enter description in Modal ${modalType} Filter`,
      label: 'Description',
    },
    clickCancelBtn: {
      category: FILTERS_PAGE,
      action: `Click on button Cancel in Modal ${modalType} Filter`,
      label: `Close Modal ${modalType} Filter`,
    },
    clickOkBtn: isEditMode
      ? {
          category: FILTERS_PAGE,
          action: `Click on button ${actionType} in Modal ${modalType} Filter`,
          label: `${actionType} filter in Modal ${modalType} Filter`,
        }
      : {
          ...getBasicClickEventParameters(LAUNCHES_PAGE),
          modal: 'add_filter',
          element_name: 'add',
        },
  };
};

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

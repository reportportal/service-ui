/*
 * Copyright 2023 EPAM Systems
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

import { getBasicClickEventParameters, normalizeEventParameter } from '../ga4Utils';
import { getFilterEntityType } from './utils';

// GA4 events
export const getClickItemNameEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'item_name',
});
export const getClickRefreshButtonEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'button_refresh',
});
export const getClickSelectAllItemsEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'select_all_item',
});
export const getClickSelectOneItemEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'select_one_item',
});
export const getClickDonutEvents = (category) => ({
  CLICK_DONUT_PB: {
    ...getBasicClickEventParameters(category),
    icon_name: 'donut_product_bug',
  },
  CLICK_DONUT_AB: {
    ...getBasicClickEventParameters(category),
    icon_name: 'donut_auto_bug',
  },
  CLICK_DONUT_SI: {
    ...getBasicClickEventParameters(category),
    icon_name: 'donut_system_issue',
  },
  CLICK_DONUT_TI: {
    ...getBasicClickEventParameters(category),
    icon_name: 'donut_to_invest',
  },
});
export const getClickDefectTooltipEvents = (category) => ({
  getClickTooltipPbEvent: (place = 'body') => ({
    ...getBasicClickEventParameters(category),
    icon_name: 'tooltip_product_bug',
    place,
  }),
  getClickTooltipAbEvent: (place = 'body') => ({
    ...getBasicClickEventParameters(category),
    icon_name: 'tooltip_auto_bug',
    place,
  }),
  getClickTooltipSiEvent: (place = 'body') => ({
    ...getBasicClickEventParameters(category),
    icon_name: 'tooltip_system_issue',
    place,
  }),
  getClickTooltipTiEvent: (place = 'body') => ({
    ...getBasicClickEventParameters(category),
    icon_name: 'tooltip_to_invest',
    place,
  }),
  getClickTooltipNdEvent: (place = 'body') => ({
    ...getBasicClickEventParameters(category),
    icon_name: 'tooltip_no_defect',
    place,
  }),
});
export const getClickActionsButtonEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'button_actions',
});
export const getClickPencilIconEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  icon_name: 'edit_item',
});
export const getRefineParametersEventCreator = (category) => (entity) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'parameter_refine',
  type: getFilterEntityType(entity),
});
export const getClickOnAttributesEvent = (category) => ({
  ...getBasicClickEventParameters(category),
  icon_name: 'icon_attributes',
});
export const getClickOnExpandEvent = (category, place) => ({
  ...getBasicClickEventParameters(category),
  place,
  icon_name: 'expand',
});
export const getClickOnTestItemsTabsEvents = (category) => ({
  CLICK_LIST_VIEW_TAB: {
    ...getBasicClickEventParameters(category),
    element_name: 'tab_list_view',
  },
  CLICK_LOG_VIEW_TAB: {
    ...getBasicClickEventParameters(category),
    element_name: 'tab_log_view',
  },
  CLICK_HISTORY_TAB: {
    ...getBasicClickEventParameters(category),
    element_name: 'tab_history',
  },
  CLICK_UNIQUE_ERRORS_TAB: {
    ...getBasicClickEventParameters(category),
    element_name: 'tab_unique_errors',
  },
});
export const getClickBreadcrumbsEvents = (category) => ({
  CLICK_ALL_LABEL_BREADCRUMB: {
    ...getBasicClickEventParameters(category),
    element_name: 'bread_crumb_all',
  },
  CLICK_ITEM_NAME_BREADCRUMB: {
    ...getBasicClickEventParameters(category),
    element_name: 'bread_crumb_item_name',
  },
  getClickOnPlusMinusBreadcrumbEvent: (expanded) => ({
    ...getBasicClickEventParameters(category),
    icon_name: expanded ? 'minus' : 'plus',
  }),
});
export const getChangeItemStatusEventCreator = (category) => (status) => ({
  ...getBasicClickEventParameters(category),
  type: 'status',
  element_name: status.toLowerCase(),
});

const getClickListOfActionsEventCreator = (category) => ({
  ...getBasicClickEventParameters(category),
  place: 'list_of_actions',
});

export const getDeleteActionEvent = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'delete',
});

export const getPostIssueActionEvent = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'post_issue',
});

export const getLinkIssueActionEvent = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'link_issue',
});

export const getUnlinkIssueActionEvent = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'unlink_issue',
});

export const getIgnoreInAutoAnalysisActionEventCreator = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'ignore_in_Auto_Analysis',
});

export const getIncludeInAutoAnalysisActionEventCreator = (category) => ({
  ...getClickListOfActionsEventCreator(category),
  element_name: 'include_into_auto_analysis',
});

export const getClickIssueTicketEvent = (category) => (pluginName) => ({
  ...getBasicClickEventParameters(category),
  element_name: 'issue_ticket',
  type: normalizeEventParameter(pluginName || 'BTS'),
});

export const getCommonActionEvents = (category) => ({
  // GA4 events
  PROCEED_VALID_ITEMS: {
    ...getBasicClickEventParameters(category),
    element_name: 'proceed_valid_items',
  },
  EDIT_ITEMS_ACTION: {
    ...getClickListOfActionsEventCreator(category),
    element_name: 'edit_items',
  },
});

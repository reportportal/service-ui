/*
 * Copyright 2024 EPAM Systems
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

import { normalizeEventString } from '../../utils';

const RATIO_BASED_ON = 'ratio_based_on';

const modalNames = {
  editWidgetModal: 'edit_modal',
  widgetWizardModal: 'add_modal',
};

const getBasicEventConfig = {
  action: 'click',
  category: 'dashboards',
};

const getBasicEventTypeConfig = (type) => ({
  ...getBasicEventConfig,
  type: normalizeEventString(type),
});

export const WIDGETS_EVENTS = {
  CLICK_ON_RATIO_BASED_OPTION_IN_PASSING_RATE_CHARTS: (modalId) => (place, type) => ({
    ...getBasicEventTypeConfig(type),
    place: normalizeEventString(place),
    modal: modalNames[modalId],
    element_name: RATIO_BASED_ON,
  }),
};

export const DASHBOARD_EVENTS = {
  CLICK_ON_ADD_NEW_DASHBOARD_BTN: {
    ...getBasicEventConfig,
    element_name: 'add_new_dashboard',
  },

  CLICK_ON_DASHBOARD_NAME: (dashboardName, dashboardId) => ({
    ...getBasicEventConfig,
    element_name: dashboardName,
    number: dashboardId,
  }),

  CLICK_ON_ICON_DASHBOARD: (iconName, dashboardId) => ({
    ...getBasicEventConfig,
    icon_name: iconName,
    number: dashboardId,
  }),

  CLICK_ON_BUTTON_UPDATE_IN_MODAL_EDIT_DASHBOARD: (dashboardId) => (linkName) => ({
    ...getBasicEventConfig,
    element_name: 'update',
    modal: 'edit_dashboard',
    link_name: linkName,
    number: dashboardId,
  }),

  CLICK_ON_BUTTON_ADD_IN_MODAL_ADD_NEW_DASHBOARD: (dashboardId) => (linkName) => ({
    ...getBasicEventConfig,
    element_name: 'add',
    modal: 'add_new_dashboard',
    link_name: linkName,
    number: dashboardId,
  }),

  CLICK_ON_BUTTON_DELETE_IN_MODAL_DELETE_DASHBOARD: (dashboardId) => ({
    ...getBasicEventConfig,
    element_name: 'delete',
    modal: 'delete_dashboard',
    number: dashboardId,
  }),
};

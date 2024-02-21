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
import { getBasicClickEventParameters } from '../common/ga4Utils';

const RATIO_BASED_ON = 'ratio_based_on';
const DASHBOARDS = 'dashboards';

const modalNames = {
  editWidgetModal: 'edit_modal',
  widgetWizardModal: 'add_modal',
};

const getBasicEventTypeConfig = (type) => ({
  ...getBasicClickEventParameters(DASHBOARDS),
  type: normalizeEventString(type),
});

export const WIDGETS_EVENTS = {
  createClickOnRatioBasedOptionInPassingRateCharts: (modalId) => (place, type) => ({
    ...getBasicEventTypeConfig(type),
    place: normalizeEventString(place),
    modal: modalNames[modalId],
    element_name: RATIO_BASED_ON,
  }),
};

export const DASHBOARD_EVENTS = {
  CLICK_ON_ADD_NEW_DASHBOARD_BTN: {
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'add_new_dashboard',
  },

  clickOnDashboardName: (dashboardName, dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: dashboardName,
    number: dashboardId,
  }),

  clickOnIconDashboard: (iconName, dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    icon_name: iconName,
    number: dashboardId,
  }),

  createClickOnButtonUpdateInModalEditDashboard: (dashboardId) => (linkName) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'update',
    modal: 'edit_dashboard',
    link_name: linkName,
    number: dashboardId,
  }),

  createCreateClickOnButtonAddInModalAddNewDashboard: (dashboardId) => (linkName) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'add',
    modal: 'add_new_dashboard',
    link_name: linkName,
    number: dashboardId,
  }),

  clickOnButtonDeleteInModalDeleteDashboard: (dashboardId) => ({
    ...getBasicClickEventParameters(DASHBOARDS),
    element_name: 'delete',
    modal: 'delete_dashboard',
    number: dashboardId,
  }),
};

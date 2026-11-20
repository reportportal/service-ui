/*
 * Copyright 2026 EPAM Systems
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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  projectDashboards: {
    id: 'DashboardItemPage.projectDashboards',
    defaultMessage: 'Project Dashboards',
  },
  addNewWidget: {
    id: 'DashboardItemPage.addNewWidgetButton',
    defaultMessage: 'Add New Widget',
  },
  fullWidthMode: {
    id: 'DashboardItemPage.fullWidthMode',
    defaultMessage: 'Wide view',
  },
  fullScreen: {
    id: 'DashboardItemPage.fullScreen',
    defaultMessage: 'Full Screen',
  },
  closeFullScreen: {
    id: 'DashboardItemPage.closeFullScreen',
    defaultMessage: 'Close full screen',
  },
  print: {
    id: 'DashboardPage.print',
    defaultMessage: 'Print',
  },
  exitFullScreenNote: {
    id: 'Fullscreen.exitNote',
    defaultMessage: 'Press <b>Esc</b> to exit fullscreen mode',
  },
  lockDashboard: {
    id: 'DashboardItemPage.lockDashboard',
    defaultMessage: 'Lock dashboard',
  },
  unlockDashboard: {
    id: 'DashboardItemPage.unlockDashboard',
    defaultMessage: 'Unlock dashboard',
  },
  editDashboard: {
    id: 'DashboardItemPage.editDashboardAction',
    defaultMessage: 'Edit dashboard',
  },
  deleteDashboard: {
    id: 'DashboardItemPage.deleteDashboardAction',
    defaultMessage: 'Delete dashboard',
  },
  addWidgetSuccess: {
    id: 'DashboardItemPage.addWidgetSuccess',
    defaultMessage: 'Widget has been added successfully',
  },
  emptyHeadline: {
    id: 'DashboardItemPage.emptyHeadline',
    defaultMessage: 'No added widgets yet',
  },
  emptyText: {
    id: 'DashboardItemPage.emptyText',
    defaultMessage:
      "Start by adding your first widget to create a dashboard that showcases your project's progress.",
  },
  emptyTextViewer: {
    id: 'DashboardItemPage.dashboardEmptyTextViewer',
    defaultMessage: 'Widgets will appear here once created by your team',
  },
});

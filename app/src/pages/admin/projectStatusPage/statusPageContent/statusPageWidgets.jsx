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

import { URLS } from 'common/urls';
import { AUTOMATION_BUG, SYSTEM_ISSUE, PRODUCT_BUG } from 'components/widgets/common/constants';
import {
  GeneralInfo,
  OwnersInfo,
  LastLaunch,
  Investigated,
  LaunchesQuantity,
  LaunchStatistics,
  IssuesChartWrapper,
  ActivityPanel,
} from './widgets';
import { WIDGETS_IDS } from '../constants';
import { messages } from './messages';

export const statusPageWidgets = [
  {
    title: messages.general,
    id: WIDGETS_IDS.general,
    source: WIDGETS_IDS.general,
    component: (data) => <GeneralInfo data={data} />,
    getUrl: URLS.projectStatus,
  },
  {
    title: messages.owners,
    id: WIDGETS_IDS.owners,
    source: WIDGETS_IDS.general,
    component: (data) => <OwnersInfo data={data} />,
  },
  {
    title: messages.lastLaunch,
    id: WIDGETS_IDS.lastLaunch,
    source: WIDGETS_IDS.lastLaunch,
    component: (data) => <LastLaunch data={data} />,
    getUrl: (projectId, interval) =>
      URLS.projectWidget(projectId, WIDGETS_IDS.lastLaunch, interval),
  },
  {
    title: messages.launchesQuantity,
    id: WIDGETS_IDS.launchesQuantity,
    source: WIDGETS_IDS.launchesQuantity,
    component: (data, interval) => <LaunchesQuantity data={data} interval={interval} />,
    getUrl: (projectId, interval) =>
      URLS.projectWidget(projectId, WIDGETS_IDS.launchesQuantity, interval),
  },
  {
    title: messages.launchStatistics,
    id: WIDGETS_IDS.launchStatistics,
    source: WIDGETS_IDS.issuesChart,
    component: (data, interval) => <LaunchStatistics data={data} interval={interval} />,
  },
  {
    title: messages.investigated,
    id: WIDGETS_IDS.investigated,
    source: WIDGETS_IDS.investigated,
    component: (data, interval) => <Investigated data={data} interval={interval} />,
    getUrl: (projectId, interval) =>
      URLS.projectWidget(projectId, WIDGETS_IDS.investigated, interval),
  },
  {
    title: messages.issuesChart,
    id: WIDGETS_IDS.issuesChart,
    source: WIDGETS_IDS.issuesChart,
    component: (data, interval) => (
      <IssuesChartWrapper data={data} interval={interval} targetFieldKey={PRODUCT_BUG} />
    ),
    getUrl: (projectId, interval) =>
      URLS.projectWidget(projectId, WIDGETS_IDS.issuesChart, interval),
  },
  {
    title: messages.systemIssues,
    id: WIDGETS_IDS.systemIssues,
    source: WIDGETS_IDS.issuesChart,
    component: (data, interval) => (
      <IssuesChartWrapper data={data} interval={interval} targetFieldKey={SYSTEM_ISSUE} />
    ),
  },
  {
    title: messages.autoBugs,
    id: WIDGETS_IDS.autoBugs,
    source: WIDGETS_IDS.issuesChart,
    component: (data, interval) => (
      <IssuesChartWrapper data={data} interval={interval} targetFieldKey={AUTOMATION_BUG} />
    ),
  },
];

export const activityItem = {
  title: messages.activities,
  id: WIDGETS_IDS.activities,
  source: WIDGETS_IDS.activities,
  component: (data) => <ActivityPanel data={data} />,
  getUrl: (projectId, interval) => URLS.projectWidget(projectId, WIDGETS_IDS.activities, interval),
};

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

export const descriptors = [
  {
    title: 'title1',
    id: 'link1',
    link: {
      type: 'PROJECT_FILTERS_PAGE',
      payload: {
        filterId: 'all',
        projectId: 'amsterget_personal',
      },
    },
    error: false,
    listView: false,
    active: false,
  },
  {
    title: 'title2',
    id: 'link2',
    link: {
      type: 'PROJECT_DASHBOARD_PAGE',
      payload: {
        filterId: 'all',
        projectId: 'amsterget_personal',
      },
    },
    error: false,
    listView: false,
    active: false,
  },
  {
    title: 'title3',
    id: 'link3',
    link: {
      type: 'PROJECT_LAUNCHES_PAGE',
      payload: {
        filterId: 'all',
        projectId: 'amsterget_personal',
      },
    },
    error: false,
    listView: false,
    active: false,
  },
  {
    title: 'title4',
    id: 'link4',
    link: {
      type: 'PROJECT_MEMBERS_PAGE',
      payload: {
        filterId: 'all',
        projectId: 'amsterget_personal',
      },
    },
    error: false,
    listView: false,
    active: false,
  },
];

export const errorDescriptors = descriptors.map((item) => ({ ...item, error: true }));

export const listViewDescriptors = descriptors.map((item) => ({ ...item, listView: true }));

export const descriptorsWithActive = descriptors.map((item) => ({ ...item, active: true }));

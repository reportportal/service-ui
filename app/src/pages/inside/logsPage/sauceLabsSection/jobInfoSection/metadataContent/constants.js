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

import { defaultDataFormatter as dataFormatter, timeDataFormatter } from './utils';

export const ASSIGNED_TUNNEL_ID = 'assigned_tunnel_id';
export const AUTOMATION_BACKEND = 'automation_backend';
export const BREAKPOINTED = 'breakpointed';
export const BROWSER = 'browser';
export const BROWSER_VERSION = 'browser_version';
export const BUILD = 'build';
export const CREATION_TIME = 'creation_time';
export const CUSTOM_DATA = 'custom-data';
export const END_TIME = 'end_time';
export const ERROR = 'error';
export const ID = 'id';
export const MANUAL = 'manual';
export const MODIFICATION_TIME = 'modification_time';
export const NAME = 'name';
export const OS = 'os';
export const OWNER = 'owner';
export const PASSED = 'passed';
export const PROXIED = 'proxied';
export const PUBLIC = 'public';
export const RECORD_SCREENSHOTS = 'record_screenshots';
export const RECORD_VIDEO = 'record_video';
export const SELENIUM_VERSION = 'selenium_version';
export const START_TIME = 'start_time';
export const TAGS = 'tags';

export const METADATA_FIELDS_CONFIG = [
  {
    key: ID,
    dataFormatter,
    message: 'ID',
  },
  {
    key: PASSED,
    dataFormatter,
    message: 'Passed',
  },
  {
    key: NAME,
    dataFormatter,
    message: 'Name',
  },
  {
    key: BUILD,
    dataFormatter,
    message: 'Build',
  },
  {
    key: TAGS,
    dataFormatter: (data) => (data && data.length ? JSON.stringify(data) : '-'),
    message: 'Tags',
  },
  {
    key: BROWSER,
    dataFormatter,
    message: 'Browser',
  },
  {
    key: BROWSER_VERSION,
    dataFormatter,
    message: 'Browser Version',
  },
  {
    key: OS,
    dataFormatter,
    message: 'OS',
  },
  {
    key: AUTOMATION_BACKEND,
    dataFormatter,
    message: 'Automation Backend',
  },
  {
    key: OWNER,
    dataFormatter,
    message: 'Owner',
  },
  {
    key: CREATION_TIME,
    dataFormatter: timeDataFormatter,
    message: 'Creation Time',
  },
  {
    key: START_TIME,
    dataFormatter: timeDataFormatter,
    message: 'Start time',
  },
  {
    key: END_TIME,
    dataFormatter: timeDataFormatter,
    message: 'End time',
  },
  {
    key: MODIFICATION_TIME,
    dataFormatter: timeDataFormatter,
    message: 'Modification Time',
  },
  {
    key: ERROR,
    dataFormatter,
    message: 'Error',
  },
  {
    key: SELENIUM_VERSION,
    dataFormatter,
    message: 'Selenium Version',
  },
  {
    key: PROXIED,
    dataFormatter,
    message: 'Proxied',
  },
  {
    key: ASSIGNED_TUNNEL_ID,
    dataFormatter,
    message: 'Assigned Tunnel Id',
  },
  {
    key: RECORD_SCREENSHOTS,
    dataFormatter,
    message: 'Record screenshots',
  },
  {
    key: RECORD_VIDEO,
    dataFormatter,
    message: 'Record Video',
  },
  {
    key: CUSTOM_DATA,
    dataFormatter,
    message: 'Custom Data',
  },
  {
    key: PUBLIC,
    dataFormatter,
    message: 'Public',
  },
  {
    key: MANUAL,
    dataFormatter,
    message: 'Manual',
  },
  {
    key: BREAKPOINTED,
    dataFormatter,
    message: 'Breakpointed',
  },
];

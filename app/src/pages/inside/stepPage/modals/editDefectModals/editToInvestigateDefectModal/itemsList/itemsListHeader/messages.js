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

import { defineMessages } from 'react-intl';
import { SEARCH_MODES } from './../../../constants';

export const messages = defineMessages({
  changeSimilarItems: {
    id: 'EditDefectModal.changeSimilarItems',
    defaultMessage: 'Change Similar Items',
  },
  currentLaunchMode: {
    id: 'EditDefectModal.currentLaunchMode',
    defaultMessage: 'For the current launch ',
  },
  sameLaunchNameMode: {
    id: 'EditDefectModal.sameLaunchNameMode',
    defaultMessage: 'Launches with the same name',
  },
  filterMode: {
    id: 'EditDefectModal.filterMode',
    defaultMessage: 'For the current applied filter',
  },
  [`${SEARCH_MODES.CURRENT_LAUNCH}Tooltip`]: {
    id: 'EditDefectModal.currentLaunchTooltip',
    defaultMessage: 'Test items with similar failure reason in launch <b>{launch}</b>',
  },
  [`${SEARCH_MODES.FILTER}Tooltip`]: {
    id: 'EditDefectModal.filterTooltip',
    defaultMessage:
      'Test items with similar failure reason in last 10 launches of filter <b>{filter}</b>',
  },
  [`${SEARCH_MODES.LAUNCH_NAME}Tooltip`]: {
    id: 'EditDefectModal.launchNameTooltip',
    defaultMessage:
      'Test items with similar failure reason in last 10 launches of launch <b>{launch}</b>',
  },
});

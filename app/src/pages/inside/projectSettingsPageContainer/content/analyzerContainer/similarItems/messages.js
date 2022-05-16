/*
 * Copyright 2022 EPAM Systems
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
  tabDescription: {
    id: 'SimilarItems.tabDescription',
    defaultMessage:
      'Besides known issues with selected defect types, there could be issues with a similar reason marked as "To investigate" defect types. All these items are displayed in the "Similar To Investigate" section in Defect editor modal',
  },
  searchLogsMinShouldMatch: {
    id: 'SimilarItems.searchLogsMinShouldMatch',
    defaultMessage: 'Minimum should match for similar To Investigate items',
  },
  searchLogsMinShouldMatchDescription: {
    id: 'SimilarItems.searchLogsMinShouldMatchDescription',
    defaultMessage:
      'Percent of words equality between a log from considered test item and a log from To Investigate item in the ElasticSearch. If a log from ElasticSearch has the value less than set, this log won’t be shown in the similar To Investigate items section',
  },
});

/*
 * Copyright 2021 EPAM Systems
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
  emptyUniqueErrDisableBtnTooltip: {
    id: 'EmptyUniqueErr.disableButtonTooltip',
    defaultMessage: 'This operation cannot be done for launches in progress',
  },
  emptyUniqueErrBtn: {
    id: 'EmptyUniqueErr.button',
    defaultMessage: 'Run Unique Error Analysis',
  },
  emptyUniqueErrHeadline: {
    id: 'EmptyUniqueErr.headline',
    defaultMessage: 'No Unique Error',
  },
  emptyUniqueErrText: {
    id: 'EmptyUniqueErr.text',
    defaultMessage:
      'Unique error analysis has not been run yet. To see unique error to this launch please run analysis manually',
  },
  uniqueErrAnalyzeModalText: {
    id: 'EmptyUniqueErrsAnalyzeModal.text',
    defaultMessage: 'Choose the base on witch the Unique Error Analysis will be performed:',
  },
  uniqueErrAnalyzeModalFieldName: {
    id: 'EmptyUniqueErrsAnalyzeModal.fieldName',
    defaultMessage: 'Numbers in error log:',
  },
  uniqueErrAnalyzeModalIncludeNumbers: {
    id: 'EmptyUniqueErrsAnalyzeModal.includeNumbers',
    defaultMessage: 'Include number to analyzed logs',
  },
  uniqueErrAnalyzeModalExcludeNumbers: {
    id: 'EmptyUniqueErrsAnalyzeModal.excludeNumbers',
    defaultMessage: 'Exclude numbers from analyzed logs',
  },
  uniqueErrAnalyzeModalOkBtn: {
    id: 'EmptyUniqueErrsAnalyzeModal.okBtn',
    defaultMessage: 'Analyze',
  },
  uniqueErrAnalyzeModalTitle: {
    id: 'EmptyUniqueErrsAnalyzeModal.title',
    defaultMessage: 'Analyze launch',
  },
});
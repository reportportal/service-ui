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
import {
  BUG_ID_COLUMN_KEY,
  SUBMIT_DATE_COLUMN_KEY,
  FOUND_IN_COLUMN_KEY,
  SUBMITTER_COLUMN_KEY,
} from './constants';

export const COLUMN_NAMES_MAP = defineMessages({
  [BUG_ID_COLUMN_KEY]: {
    id: 'UniqueBugsTable.bugIDColumn',
    defaultMessage: 'BUG ID',
  },
  [SUBMIT_DATE_COLUMN_KEY]: {
    id: 'UniqueBugsTable.submitDateColumn',
    defaultMessage: 'SUBMIT DATE',
  },
  [FOUND_IN_COLUMN_KEY]: {
    id: 'UniqueBugsTable.foundInColumn',
    defaultMessage: 'FOUND IN',
  },
  [SUBMITTER_COLUMN_KEY]: {
    id: 'UniqueBugsTable.submitterColumn',
    defaultMessage: 'SUBMITTER',
  },
});

export const hintMessages = defineMessages({
  submitDateHint: {
    id: 'UniqueBugsTable.submitDateHint',
    defaultMessage: 'Submit date:',
  },
});

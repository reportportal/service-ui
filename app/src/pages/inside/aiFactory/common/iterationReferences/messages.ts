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
  load: { id: 'IterationReferences.load', defaultMessage: 'Show iteration links' },
  loading: { id: 'IterationReferences.loading', defaultMessage: 'Loading iteration links…' },
  retry: { id: 'IterationReferences.retry', defaultMessage: 'Retry iteration links' },
  error: {
    id: 'IterationReferences.error',
    defaultMessage: 'Iteration links could not be loaded.',
  },
  unavailable: {
    id: 'IterationReferences.unavailable',
    defaultMessage: 'Iteration links are unavailable.',
  },
  previous: { id: 'IterationReferences.previous', defaultMessage: 'Source iteration #{number}' },
  result: { id: 'IterationReferences.result', defaultMessage: 'Fix iteration #{number}' },
  compare: { id: 'IterationReferences.compare', defaultMessage: 'Compare source and fix' },
});

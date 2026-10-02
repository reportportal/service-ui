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
  title: { id: 'GenerationCost.title', defaultMessage: 'Generation cost' },
  empty: { id: 'GenerationCost.empty', defaultMessage: 'No generation cost available' },
  loading: { id: 'GenerationCost.loading', defaultMessage: 'Loading generation cost' },
  loadError: {
    id: 'GenerationCost.loadError',
    defaultMessage: 'Generation cost could not be loaded',
  },
  retry: { id: 'GenerationCost.retry', defaultMessage: 'Retry' },
  approxTotal: { id: 'GenerationCost.approxTotal', defaultMessage: 'Approx. total' },
  iterationShare: {
    id: 'GenerationCost.iterationShare',
    defaultMessage: 'Iteration #{number} share',
  },
  shareFormula: {
    id: 'GenerationCost.shareFormula',
    defaultMessage: '{baseCost} ÷ {casesCount} cases = {amount}',
  },
  fixRound: { id: 'GenerationCost.fixRound', defaultMessage: 'Fix round {number}' },
  tokenUsage: { id: 'GenerationCost.tokenUsage', defaultMessage: 'Token usage' },
  tokenLine: {
    id: 'GenerationCost.tokenLine',
    defaultMessage:
      'Input {input} · Cache read {cacheRead} · Cache write {cacheWrite} · Output {output}',
  },
  model: { id: 'GenerationCost.model', defaultMessage: 'Model: {model}' },
});

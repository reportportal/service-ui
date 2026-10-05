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
  title: {
    id: 'IterationRerunModal.title',
    defaultMessage: 'Re-run iteration',
  },
  action: {
    id: 'IterationRerunModal.action',
    defaultMessage: 'Re-run',
  },
  description: {
    id: 'IterationRerunModal.description',
    defaultMessage:
      'Starts <strong>{pipeline}</strong> again for the same requirement. The result is a <strong>new iteration</strong> in its own Library folder; Iteration #{number} and its cases are not changed (US-020).',
  },
  requirement: {
    id: 'IterationRerunModal.requirement',
    defaultMessage: 'Requirement',
  },
  rerunOf: {
    id: 'IterationRerunModal.rerunOf',
    defaultMessage: 'Re-run of',
  },
  iteration: {
    id: 'IterationRerunModal.iteration',
    defaultMessage: 'Iteration #{number}',
  },
  model: {
    id: 'IterationRerunModal.model',
    defaultMessage: 'Model',
  },
  environment: {
    id: 'IterationRerunModal.environment',
    defaultMessage: 'Environment',
  },
  contractUnavailable: {
    id: 'IterationRerunModal.contractUnavailable',
    defaultMessage:
      'Starting Re-run is unavailable until the CI command, permission, and idempotency contract is accepted. This screen does not call the LP6 ingestion endpoint.',
  },
});

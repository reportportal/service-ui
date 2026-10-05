/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  title: { id: 'PipelineLinks.title', defaultMessage: 'Pipeline' },
  empty: { id: 'PipelineLinks.empty', defaultMessage: 'No pipeline links available' },
  loading: { id: 'PipelineLinks.loading', defaultMessage: 'Loading pipeline links' },
  loadError: {
    id: 'PipelineLinks.loadError',
    defaultMessage: 'Pipeline links could not be loaded',
  },
  retry: { id: 'PipelineLinks.retry', defaultMessage: 'Retry' },
  source: { id: 'PipelineLinks.source', defaultMessage: 'Source' },
  fixRound: { id: 'PipelineLinks.fixRound', defaultMessage: 'Fix round {number}' },
  iterationStage: {
    id: 'PipelineLinks.iterationStage',
    defaultMessage: 'Iteration #{number} · {stage}',
  },
  grade: { id: 'PipelineLinks.grade', defaultMessage: 'Grade' },
  review: { id: 'PipelineLinks.review', defaultMessage: 'Review' },
  sourceIteration: {
    id: 'PipelineLinks.sourceIteration',
    defaultMessage: '{pipeline} · Iteration #{number}',
  },
  fixRoundIteration: {
    id: 'PipelineLinks.fixRoundIteration',
    defaultMessage: 'Iteration #{number} · Fix round {round}',
  },
  createdFrom: {
    id: 'PipelineLinks.createdFrom',
    defaultMessage: 'created · {requirement}',
  },
  pipelineFallback: {
    id: 'PipelineLinks.pipelineFallback',
    defaultMessage: 'Test case generation',
  },
  requirementUnknown: {
    id: 'PipelineLinks.requirementUnknown',
    defaultMessage: 'Requirement unavailable',
  },
});

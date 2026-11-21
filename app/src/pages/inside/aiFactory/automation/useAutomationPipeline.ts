/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MessageDescriptor } from 'react-intl';
import { useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  isTestAutomationPipeline,
  TEST_AUTOMATION_PIPELINE_NAME,
} from 'controllers/aiFactory/pipelines/ciConnection';
import {
  adaptLivePipelinesPage,
  type ReducedPipeline,
} from 'controllers/aiFactory/pipelines/liveAdapters';
import { pipelineCiConnectionUpdateSelector } from 'controllers/aiFactory/pipelines/selectors';

import { messages } from './messages';

const PAGE_LIMIT = 100;

const findAutomationPipeline = async (
  projectKey: string,
  signal: AbortSignal,
  offset = 0,
): Promise<ReducedPipeline | undefined> => {
  if (signal.aborted) return undefined;
  const response = await fetch(
    URLS.pipelineCatalog(projectKey, {
      offset,
      limit: PAGE_LIMIT,
      name: TEST_AUTOMATION_PIPELINE_NAME,
    }),
    { signal },
  );
  const { content, page } = adaptLivePipelinesPage(response);
  if (page.number !== Math.floor(offset / page.size) + 1) {
    throw new Error('Unexpected automation pipeline catalog page');
  }
  const pipeline = content.find(isTestAutomationPipeline);
  if (pipeline || page.number >= page.totalPages) return pipeline;
  return findAutomationPipeline(projectKey, signal, offset + page.size);
};

interface AutomationPipelineScope {
  projectKey: string;
  attempt: number;
  ciUpdate: ReturnType<typeof pipelineCiConnectionUpdateSelector>;
}

interface AutomationPipelineRead {
  scope: AutomationPipelineScope;
  pipeline?: ReducedPipeline;
  failed?: boolean;
}

export interface AutomationPipelineGate {
  pipelineId?: number;
  disabledMessage?: MessageDescriptor;
  refresh: () => void;
}

export const useAutomationPipeline = (
  projectKey: string,
  enabled: boolean,
): AutomationPipelineGate => {
  const [attempt, setAttempt] = useState(0);
  const refresh = useCallback(() => setAttempt((previous) => previous + 1), []);
  const update = useSelector(pipelineCiConnectionUpdateSelector);
  const ciUpdate = update?.projectKey === projectKey ? update : undefined;
  const scope = useMemo(
    () => (enabled && projectKey ? { projectKey, attempt, ciUpdate } : undefined),
    [attempt, ciUpdate, enabled, projectKey],
  );
  const [read, setRead] = useState<AutomationPipelineRead>();

  useEffect(() => {
    if (!scope) return undefined;
    const controller = new AbortController();
    void findAutomationPipeline(scope.projectKey, controller.signal)
      .then((pipeline) => {
        if (!controller.signal.aborted) setRead({ scope, pipeline });
      })
      .catch(() => {
        if (!controller.signal.aborted) setRead({ scope, failed: true });
      });
    return () => controller.abort();
  }, [scope]);

  const currentRead = read?.scope === scope ? read : undefined;
  const pipeline = currentRead?.pipeline;
  const pipelineId = pipeline?.ciConnection?.canStartJobs === true ? pipeline.id : undefined;
  const disabledMessage = getDisabledMessage(Boolean(scope), currentRead);
  return useMemo(
    () => ({ pipelineId, disabledMessage, refresh }),
    [pipelineId, disabledMessage, refresh],
  );
};

const getDisabledMessage = (enabled: boolean, read?: AutomationPipelineRead) => {
  if (!enabled || read?.pipeline?.ciConnection?.canStartJobs === true) return undefined;
  if (!read) return messages.checkingCiConnection;
  if (read.failed) return messages.loadCiConnectionFailed;
  return messages.unavailableCiConnection;
};

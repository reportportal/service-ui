/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  adaptLivePipeline,
  pipelineCiConnectionUpdateSelector,
  type PipelineCiConnection,
} from 'controllers/aiFactory/pipelines';

export const usePipelineCiConnection = (projectKey: string, pipelineId?: number) => {
  const [attempt, setAttempt] = useState(0);
  const refresh = useCallback(() => setAttempt((previous) => previous + 1), []);
  const update = useSelector(pipelineCiConnectionUpdateSelector);
  const currentUpdate =
    update?.projectKey === projectKey && update.pipelineId === pipelineId ? update : undefined;
  const enabled = Boolean(
    projectKey && pipelineId && Number.isSafeInteger(pipelineId) && pipelineId > 0,
  );
  const scope = JSON.stringify([projectKey, pipelineId, attempt]);
  const [result, setResult] = useState<{
    scope: string;
    update: typeof currentUpdate;
    connection?: PipelineCiConnection;
  }>();

  useEffect(() => {
    if (!enabled || pipelineId === undefined) return undefined;

    const controller = new AbortController();
    fetch(URLS.pipelineById(projectKey, pipelineId), { signal: controller.signal })
      .then((body) => adaptLivePipeline(body, pipelineId).ciConnection)
      .then((connection) => {
        if (!controller.signal.aborted) setResult({ scope, update: currentUpdate, connection });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ scope, update: currentUpdate });
      });

    return () => controller.abort();
  }, [currentUpdate, enabled, pipelineId, projectKey, scope]);

  const current = result?.scope === scope && result.update === currentUpdate ? result : undefined;
  return {
    connection: current?.connection,
    refresh,
    isLoading: enabled && !current,
    failed: enabled && Boolean(current && !current.connection),
  };
};

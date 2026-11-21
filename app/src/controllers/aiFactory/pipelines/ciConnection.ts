/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

export type PipelineCiConnectionState = 'NOT_CONNECTED' | 'CONNECTED' | 'CONNECTION_FAILED';

export interface PipelineCiConnection {
  state: PipelineCiConnectionState;
  canStartJobs: boolean;
}

export interface PipelineCiTarget {
  projectKey: string;
  pipelineId: number;
}

export interface PipelineCiConnectionUpdate extends PipelineCiTarget {
  connection: PipelineCiConnection;
}

const isConnectionState = (value: unknown): value is PipelineCiConnectionState =>
  value === 'NOT_CONNECTED' || value === 'CONNECTED' || value === 'CONNECTION_FAILED';

export const readPipelineCiConnection = (value: unknown): PipelineCiConnection | undefined => {
  if (typeof value !== 'object' || value === null) return undefined;

  const { state, canStartJobs } = value as Partial<PipelineCiConnection>;
  if (!isConnectionState(state) || typeof canStartJobs !== 'boolean') return undefined;

  return { state, canStartJobs };
};

export const isCiNotConnectedError = (body: unknown): boolean => {
  if (typeof body !== 'object' || body === null) return false;

  const { reason, errorCode } = body as { reason?: unknown; errorCode?: unknown };
  return reason === 'CI_NOT_CONNECTED' || errorCode === 40916;
};

export const TEST_AUTOMATION_PIPELINE_NAME = 'Test automation';

export const isTestAutomationPipeline = ({
  type,
  name,
}: {
  type?: string;
  name: string;
}): boolean =>
  type
    ? ['TEST_AUTOMATION', 'TEST_CASE_AUTOMATION', 'AUTOMATION'].includes(type)
    : name === TEST_AUTOMATION_PIPELINE_NAME;

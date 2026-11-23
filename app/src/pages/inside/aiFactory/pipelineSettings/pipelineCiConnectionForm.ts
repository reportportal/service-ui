/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import {
  isTestAutomationPipeline,
  readPipelineCiConnection,
  type PipelineCiConnection,
  type ReducedPipeline,
} from 'controllers/aiFactory/pipelines';

export type PipelineCiFormKind = 'generation' | 'automation' | 'other';

export type PipelineCiReasonCode =
  | 'NO_CREDENTIAL'
  | 'REPOSITORY_OR_CREDENTIAL_INVALID'
  | 'UNREACHABLE'
  | 'UNEXPECTED_RESPONSE';

export interface PipelineCiCheck extends PipelineCiConnection {
  reasonCode?: PipelineCiReasonCode;
  checkedAt?: string;
}

export interface PipelineCiSettings extends PipelineCiCheck {
  repository: string;
  branch: string;
  credentialSaved: boolean;
  jobs: Record<string, string>;
  environments: string[];
  models: string[];
}

export interface PipelineCiDraft {
  repository: string;
  branch: string;
  credential: string;
  generation: string;
  fix: string;
  automation: string;
  jobs: string;
  environments: string;
  models: string;
}

interface PipelineCiPayload {
  repository: string;
  branch: string;
  credential?: string;
  jobs: Record<string, string>;
  environments: string[];
  models?: string[];
}

const DEFAULT_BRANCH = 'main';
const REASON_CODES = new Set<unknown>([
  'NO_CREDENTIAL',
  'REPOSITORY_OR_CREDENTIAL_INVALID',
  'UNREACHABLE',
  'UNEXPECTED_RESPONSE',
]);

const readOptionalText = (value: unknown) => (typeof value === 'string' ? value : undefined);

export const readCiCheck = (value: unknown): PipelineCiCheck => {
  const connection = readPipelineCiConnection(value);
  if (!connection) throw new Error('Invalid CI connection response');

  const { reasonCode, checkedAt } = value as { reasonCode?: unknown; checkedAt?: unknown };
  return {
    ...connection,
    reasonCode: REASON_CODES.has(reasonCode) ? (reasonCode as PipelineCiReasonCode) : undefined,
    checkedAt: readOptionalText(checkedAt),
  };
};

const readNames = (value: unknown) =>
  Array.isArray(value) ? value.filter((name): name is string => typeof name === 'string') : [];

const readJobs = (value: unknown) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value as Record<string, unknown>).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      )
    : {};

export const readCiSettings = (value: unknown): PipelineCiSettings => {
  const check = readCiCheck(value);
  const { repository, branch, credentialSaved, jobs, models, environments } = value as Record<
    string,
    unknown
  >;
  if (typeof credentialSaved !== 'boolean') throw new Error('Invalid CI settings response');
  return {
    ...check,
    repository: readOptionalText(repository) ?? '',
    branch: readOptionalText(branch) || DEFAULT_BRANCH,
    credentialSaved,
    jobs: readJobs(jobs),
    models: readNames(models),
    environments: readNames(environments),
  };
};

export const getCiFormKind = (pipeline: ReducedPipeline): PipelineCiFormKind => {
  if (pipeline.type === 'TEST_CASE_GENERATION') return 'generation';
  return isTestAutomationPipeline(pipeline) ? 'automation' : 'other';
};

export const toCiDraft = (settings: PipelineCiSettings): PipelineCiDraft => ({
  repository: settings.repository,
  branch: settings.branch,
  credential: '',
  generation: settings.jobs.generation ?? '',
  fix: settings.jobs.fix ?? '',
  automation: settings.jobs.automation ?? '',
  jobs: Object.entries(settings.jobs)
    .map(([purpose, job]) => `${purpose}=${job}`)
    .join(', '),
  environments: settings.environments.join(', '),
  models: settings.models.join(', '),
});

const splitNames = (value: string): string[] =>
  value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

const parseCustomJobs = (value: string): Record<string, string> | undefined => {
  const entries = splitNames(value).map((entry): [string, string] => {
    const equals = entry.indexOf('=');
    return equals < 0 ? ['', ''] : [entry.slice(0, equals).trim(), entry.slice(equals + 1).trim()];
  });
  const purposes = entries.map(([purpose]) => purpose);
  if (entries.some(([purpose, job]) => !purpose || !job) || hasDuplicates(purposes)) {
    return undefined;
  }
  return Object.fromEntries(entries);
};

const hasDuplicates = (values: string[]): boolean => new Set(values).size !== values.length;

const getRepositoryOrigin = (value: string): string | undefined => {
  try {
    const url = new URL(value);
    const valid =
      url.protocol === 'https:' &&
      Boolean(url.hostname && url.pathname.replace(/\//g, '')) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash;
    return valid ? url.origin : undefined;
  } catch {
    return undefined;
  }
};

export const requiresReplacementCredential = (
  draft: PipelineCiDraft,
  saved: PipelineCiSettings,
): boolean => {
  const nextOrigin = getRepositoryOrigin(draft.repository.trim());
  return Boolean(
    saved.credentialSaved && nextOrigin && nextOrigin !== getRepositoryOrigin(saved.repository),
  );
};

export const getCiDraftErrors = (draft: PipelineCiDraft, kind: PipelineCiFormKind) => ({
  repository: !getRepositoryOrigin(draft.repository.trim()),
  generation: false,
  fix: false,
  automation: kind === 'automation' && !draft.automation.trim(),
  jobs: kind === 'other' && !Object.keys(parseCustomJobs(draft.jobs) ?? {}).length,
  environments:
    !splitNames(draft.environments).length || hasDuplicates(splitNames(draft.environments)),
  models: kind === 'generation' && hasDuplicates(splitNames(draft.models)),
});

const makeJobMap = (
  draft: PipelineCiDraft,
  settings: PipelineCiSettings,
  kind: PipelineCiFormKind,
) => {
  if (kind === 'generation') {
    const otherJobs = { ...settings.jobs };
    delete otherJobs.generation;
    delete otherJobs.fix;
    return {
      ...otherJobs,
      ...(draft.generation.trim() ? { generation: draft.generation.trim() } : {}),
      ...(draft.fix.trim() ? { fix: draft.fix.trim() } : {}),
    };
  }
  if (kind === 'automation') {
    return { ...settings.jobs, automation: draft.automation.trim() };
  }
  return parseCustomJobs(draft.jobs) ?? {};
};

export const toCiPayload = (
  draft: PipelineCiDraft,
  settings: PipelineCiSettings,
  kind: PipelineCiFormKind,
): PipelineCiPayload => {
  const models = kind === 'generation' ? splitNames(draft.models) : settings.models;
  const credential = draft.credential.trim();
  return {
    repository: draft.repository.trim(),
    branch: draft.branch.trim() || DEFAULT_BRANCH,
    ...(credential ? { credential } : {}),
    jobs: makeJobMap(draft, settings, kind),
    ...(models.length ? { models } : {}),
    environments: splitNames(draft.environments),
  };
};

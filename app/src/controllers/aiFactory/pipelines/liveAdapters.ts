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

import {
  adaptIterationReference,
  type IterationReference,
} from 'controllers/aiFactory/pipelines/iterationProvenance';

import { IterationSummaryRS, LivePipelineStatus, PipelineRS } from 'types/aiFactory';

export type ReducedPipelineStatus =
  | LivePipelineStatus
  | 'RUNNING'
  | 'WAITING'
  | 'SKIPPED'
  | 'UNKNOWN';

export interface LivePipelineRaw {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  type?: unknown;
  attributes?: unknown;
  settings?: unknown;
  autoReadyEnabled?: unknown;
  autoReadyThreshold?: unknown;
  iterationsCount?: unknown;
  latestIteration?: unknown;
  createdAt?: unknown;
}

export interface LivePipelineStageRaw {
  id?: unknown;
  stageKey?: unknown;
  name?: unknown;
  shortName?: unknown;
  sequence?: unknown;
  parentStageId?: unknown;
  status?: unknown;
  statusCategory?: unknown;
  metrics?: unknown;
  summary?: unknown;
  message?: unknown;
  attributes?: unknown;
  durationMillis?: unknown;
  sections?: unknown;
  links?: unknown;
  attempt?: unknown;
  ownedBy?: unknown;
  affectsIterationStatus?: unknown;
  retryable?: unknown;
  startedAt?: unknown;
  finishedAt?: unknown;
  relatedEntities?: unknown;
}

export interface LivePipelineStageDetailRaw extends LivePipelineStageRaw {
  attributes?: unknown;
  result?: unknown;
  testCaseIds?: unknown;
  ci?: unknown;
  lastRetriedAt?: unknown;
  lastRetriedBy?: unknown;
}

export interface LivePipelineIterationRaw {
  id?: unknown;
  pipelineId?: unknown;
  pipelineName?: unknown;
  pipelineType?: unknown;
  iterationNumber?: unknown;
  status?: unknown;
  statusCategory?: unknown;
  metrics?: unknown;
  attributes?: unknown;
  trigger?: unknown;
  rerunOf?: unknown;
  rerun?: unknown;
  rerunOfIterationId?: unknown;
  stagesCount?: unknown;
  stages?: unknown;
  startedAt?: unknown;
  finishedAt?: unknown;
  durationMillis?: unknown;
  createdBy?: unknown;
  createdAt?: unknown;
  startedBy?: unknown;
  warnings?: unknown;
}

export interface ReducedPipelineAttribute {
  key: string;
  value: string;
  label?: string;
  description?: string;
  type?: 'META' | 'TAG' | 'NONE';
  valueType?: string;
  url?: string;
  order?: number;
  comparisonKey?: boolean;
  direction?: string;
  rollup?: string;
}

export interface ReducedPipelineSection {
  key: string;
  title: string;
  role: 'RESULT' | 'DETAILS';
  columns: Array<{ key: string; label: string; valueType?: string }>;
  rows: Array<{
    key: string;
    cells: Record<string, string>;
    cellLinks?: Record<string, { url?: string; entityType?: string; entityId?: string }>;
    details: Array<{ heading: string; items: string[] }>;
  }>;
}

export interface LivePipelineIterationDetailRaw extends LivePipelineIterationRaw {
  stages?: unknown;
}

export interface ReducedPipeline {
  kind: 'reduced';
  id: number;
  name: string;
  description?: string;
  type?: string;
  repository?: string;
  iterationsCount?: number;
  autoReady?: {
    enabled: boolean;
    threshold?: number;
  };
}

export interface ReducedPipelineStage {
  key: string;
  stageKey?: string;
  label: string;
  sequence?: number;
  status: ReducedPipelineStatus;
  statusText?: string;
  summary?: string;
  message?: string;
  attributes?: ReducedPipelineAttribute[];
  durationMs?: number;
  links?: Array<{ type: string; label: string; url: string }>;
}

export interface ReducedPipelineDetailStage extends ReducedPipelineStage {
  id: number;
  sequence: number;
  attempt?: number;
  ownedBy?: string;
  affectsIterationStatus?: boolean;
  retryable?: boolean;
  startedAt?: number;
  finishedAt?: number;
  relatedEntities?: Array<{ entityType: string; entityId: string }>;
  sections?: ReducedPipelineSection[];
}

export interface ReducedPipelineIterationDetail extends Omit<ReducedPipelineIteration, 'stages'> {
  pipelineName?: string;
  pipelineType?: string;
  createdAt?: number;
  startedBy?: string;
  warnings?: string[];
  warningDetails?: Array<{
    code?: string;
    message: string;
    stageId?: number;
    entityType?: string;
    entityIds?: string[];
  }>;
  stages: ReducedPipelineDetailStage[];
  rawResponse?: Record<string, unknown>;
}

export interface ReducedPipelineIteration {
  rerunOf?: IterationReference;
  kind: 'reduced';
  id: number;
  pipelineId: number;
  number: number;
  status: ReducedPipelineStatus;
  statusText?: string;
  trigger?: string;
  startedAt?: number;
  finishedAt?: number;
  durationMs?: number;
  attributes: ReducedPipelineAttribute[];
  stages: ReducedPipelineStage[];
}

export const isReducedPipeline = (
  pipeline: PipelineRS | ReducedPipeline,
): pipeline is ReducedPipeline => 'kind' in pipeline && pipeline.kind === 'reduced';

export const isReducedPipelineIteration = (
  iteration: IterationSummaryRS | ReducedPipelineIteration,
): iteration is ReducedPipelineIteration => 'kind' in iteration && iteration.kind === 'reduced';

export const isRichPipeline = (pipeline: PipelineRS | ReducedPipeline): pipeline is PipelineRS =>
  !isReducedPipeline(pipeline);

export const isRichPipelineIteration = (
  iteration: IterationSummaryRS | ReducedPipelineIteration,
): iteration is IterationSummaryRS => !isReducedPipelineIteration(iteration);

const LIVE_STATUSES = new Set<string>([
  'PENDING',
  'RUNNING',
  'WAITING',
  'PASSED',
  'FAILED',
  'SKIPPED',
  'NEEDS_HUMAN',
]);
const UNSAFE_ATTRIBUTE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_PIPELINES = 100;
const MAX_ITERATIONS = 1000;
const MAX_PAGE_SIZE = 200;
const MAX_STAGES = 100;
const MAX_ATTRIBUTES = 100;
const MAX_NAME_LENGTH = 255;
const MAX_KEY_LENGTH = 128;
const MAX_TEXT_LENGTH = 2000;

export interface LivePage {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext?: boolean;
}

export interface LivePipelinePage<T> {
  content: T[];
  page: LivePage;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asPositiveInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;

const asNonNegativeInteger = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;

const asPage = (value: unknown): LivePage | null => {
  const page = asRecord(value);
  if (!page) {
    return null;
  }
  const number = asPositiveInteger(page.number);
  const size = asPositiveInteger(page.size);
  const totalElements = asNonNegativeInteger(page.totalElements);
  const totalPages = asNonNegativeInteger(page.totalPages);
  const rawHasNext = page.hasNext;
  if (
    !number ||
    !size ||
    totalElements === undefined ||
    totalPages === undefined ||
    (rawHasNext !== undefined && typeof rawHasNext !== 'boolean')
  ) {
    return null;
  }
  const hasNext = typeof rawHasNext === 'boolean' ? rawHasNext : undefined;
  return { number, size, totalElements, totalPages, ...(hasNext === undefined ? {} : { hasNext }) };
};

const isCompleteSinglePage = (page: LivePage | null, contentLength: number): boolean => {
  if (!page) {
    return false;
  }
  return (
    page.number === 1 &&
    contentLength <= page.size &&
    page.totalPages <= 1 &&
    page.hasNext !== true &&
    page.totalElements === contentLength
  );
};

const asPageEnvelope = (value: unknown, maxItems: number): LivePipelinePage<unknown> | null => {
  const response = asRecord(value);
  const page = response ? asPage(response.page) : null;
  const content = response?.content;
  if (
    !page ||
    !Array.isArray(content) ||
    page.size > maxItems ||
    content.length > maxItems ||
    content.length > page.size ||
    page.totalElements < content.length ||
    page.totalPages !== Math.ceil(page.totalElements / page.size) ||
    (page.hasNext !== undefined && page.hasNext !== page.number < page.totalPages) ||
    (page.totalPages === 0 && page.number !== 1) ||
    (page.totalPages > 0 && page.number > page.totalPages) ||
    (page.number < page.totalPages && content.length !== page.size) ||
    (page.number === page.totalPages &&
      (page.number - 1) * page.size + content.length !== page.totalElements)
  ) {
    return null;
  }
  return { content, page };
};

const asTrimmedString = (value: unknown, maxLength = MAX_TEXT_LENGTH): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : undefined;
};

const asTimestamp = (value: unknown): number | undefined => {
  if (typeof value !== 'string' || value.length > MAX_NAME_LENGTH) {
    return undefined;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : undefined;
};

const asStatus = (value: unknown): ReducedPipelineStatus =>
  typeof value === 'string' && LIVE_STATUSES.has(value)
    ? (value as ReducedPipelineStatus)
    : 'UNKNOWN';

const adaptAttributeEntry = (entry: unknown): ReducedPipelineAttribute | null => {
  const raw = asRecord(entry);
  const key = raw && asTrimmedString(raw.key, MAX_KEY_LENGTH);
  const attributeValue = raw && asTrimmedString(raw.value, MAX_TEXT_LENGTH);
  if (!raw || !key || !attributeValue || UNSAFE_ATTRIBUTE_KEYS.has(key)) {
    return null;
  }
  const type = asTrimmedString(raw.type, MAX_KEY_LENGTH);
  const label = asTrimmedString(raw.label, MAX_NAME_LENGTH);
  const description = asTrimmedString(raw.description);
  const valueType = asTrimmedString(raw.valueType, MAX_KEY_LENGTH);
  const url = asTrimmedString(raw.url);
  const order = asNonNegativeInteger(raw.order);
  const comparisonKey = raw.comparisonKey;
  const direction = asTrimmedString(raw.direction, MAX_KEY_LENGTH);
  const rollup = asTrimmedString(raw.rollup, MAX_KEY_LENGTH);
  const validType = ['META', 'TAG', 'NONE'].includes(type ?? '')
    ? (type as ReducedPipelineAttribute['type'])
    : undefined;
  const optionalFields = [
    [raw.type, validType],
    [raw.label, label],
    [raw.description, description],
    [raw.valueType, valueType],
    [raw.url, url],
    [raw.order, order],
    [raw.direction, direction],
    [raw.rollup, rollup],
  ];
  if (
    optionalFields.some(([original, parsed]) => original !== undefined && parsed === undefined) ||
    (comparisonKey !== undefined && typeof comparisonKey !== 'boolean')
  ) {
    return null;
  }
  return {
    key,
    value: attributeValue,
    ...(validType ? { type: validType } : {}),
    ...(label ? { label } : {}),
    ...(description ? { description } : {}),
    ...(valueType ? { valueType } : {}),
    ...(url ? { url } : {}),
    ...(order !== undefined ? { order } : {}),
    ...(typeof comparisonKey === 'boolean' ? { comparisonKey } : {}),
    ...(direction ? { direction } : {}),
    ...(rollup ? { rollup } : {}),
  };
};

const adaptAttributes = (value: unknown): ReducedPipelineAttribute[] | null => {
  if (value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_ATTRIBUTES) {
      return null;
    }
    const attributes = value.map(adaptAttributeEntry);
    if (attributes.some((attribute) => !attribute)) {
      return null;
    }
    const normalized = attributes;
    if (new Set(normalized.map(({ key }) => key)).size !== normalized.length) {
      return null;
    }
    return normalized.sort((first, second) => first.key.localeCompare(second.key));
  }
  const attributes = asRecord(value);
  if (!attributes) {
    return null;
  }
  const entries = Object.entries(attributes);
  if (
    entries.length > MAX_ATTRIBUTES ||
    entries.some(
      ([key, attributeValue]) =>
        UNSAFE_ATTRIBUTE_KEYS.has(key) ||
        !asTrimmedString(key, MAX_KEY_LENGTH) ||
        !asTrimmedString(attributeValue, MAX_TEXT_LENGTH),
    )
  ) {
    return null;
  }
  entries.sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey));
  return entries.map(([key, attributeValue]) => ({
    key: key.trim(),
    value: (attributeValue as string).trim(),
  }));
};

const asCellText = (value: unknown): string | undefined => {
  const cell = asRecord(value);
  const content = cell ? cell.value : value;
  if (content === null || content === '') {
    return '';
  }
  return typeof content === 'number' && Number.isFinite(content)
    ? String(content)
    : asTrimmedString(content);
};

const adaptSectionColumns = (value: unknown): ReducedPipelineSection['columns'] | null => {
  if (!Array.isArray(value) || value.length > 30) {
    return null;
  }
  const columns: ReducedPipelineSection['columns'] = [];
  for (const entry of value) {
    const column = asRecord(entry);
    const key = column && asTrimmedString(column.key, MAX_KEY_LENGTH);
    const label = column && asTrimmedString(column.label, MAX_NAME_LENGTH);
    const valueType = column && asTrimmedString(column.valueType, MAX_KEY_LENGTH);
    if (
      !key ||
      !label ||
      UNSAFE_ATTRIBUTE_KEYS.has(key) ||
      (column?.valueType !== undefined && !valueType)
    ) {
      return null;
    }
    columns.push({ key, label, ...(valueType ? { valueType } : {}) });
  }
  return new Set(columns.map(({ key }) => key)).size === columns.length ? columns : null;
};

const adaptSectionDetails = (
  value: unknown,
): ReducedPipelineSection['rows'][number]['details'] | null => {
  const rawDetails = value === undefined ? [] : value;
  if (!Array.isArray(rawDetails) || rawDetails.length > 30) {
    return null;
  }
  const details: ReducedPipelineSection['rows'][number]['details'] = [];
  for (const entry of rawDetails) {
    const detail = asRecord(entry);
    const heading = detail && asTrimmedString(detail.heading, MAX_NAME_LENGTH);
    if (!heading || !Array.isArray(detail?.items) || detail.items.length > 30) {
      return null;
    }
    const items = detail.items.map((entryText) => asTrimmedString(entryText));
    if (items.some((entryText) => !entryText)) {
      return null;
    }
    details.push({ heading, items });
  }
  return details;
};

const adaptCellLink = (
  cell: unknown,
): NonNullable<ReducedPipelineSection['rows'][number]['cellLinks']>[string] | null => {
  const cellRecord = asRecord(cell);
  if (cellRecord?.url === undefined && cellRecord?.target === undefined) {
    return {};
  }
  const url = asTrimmedString(cellRecord.url);
  const target = asRecord(cellRecord.target);
  const entityType = target && asTrimmedString(target.entityType, MAX_KEY_LENGTH);
  const entityId = target && asTrimmedString(target.entityId, MAX_KEY_LENGTH);
  if (
    (cellRecord.url !== undefined && !url) ||
    (cellRecord.target !== undefined && (!entityType || !entityId))
  ) {
    return null;
  }
  return {
    ...(url ? { url } : {}),
    ...(entityType && entityId ? { entityType, entityId } : {}),
  };
};

const adaptSectionCells = (
  cells: Record<string, unknown>,
  columns: ReducedPipelineSection['columns'],
): Pick<ReducedPipelineSection['rows'][number], 'cells' | 'cellLinks'> | null => {
  const displayCells: Record<string, string> = {};
  const cellLinks: NonNullable<ReducedPipelineSection['rows'][number]['cellLinks']> = {};
  for (const { key } of columns) {
    const cell = cells[key];
    if (cell === undefined) continue;
    const displayValue = asCellText(cell);
    const link = adaptCellLink(cell);
    if (displayValue === undefined || !link) return null;
    displayCells[key] = displayValue;
    if (Object.keys(link).length) cellLinks[key] = link;
  }
  return { cells: displayCells, ...(Object.keys(cellLinks).length ? { cellLinks } : {}) };
};

const adaptSectionRow = (
  value: unknown,
  columns: ReducedPipelineSection['columns'],
): ReducedPipelineSection['rows'][number] | null => {
  const row = asRecord(value);
  const key = row && asTrimmedString(row.key, MAX_KEY_LENGTH);
  const cells = row && asRecord(row.cells);
  if (!row || !key || !cells || Object.keys(cells).length > 30) {
    return null;
  }
  const adaptedCells = adaptSectionCells(cells, columns);
  const details = adaptSectionDetails(row.details);
  return adaptedCells && details ? { key, ...adaptedCells, details } : null;
};

const adaptSection = (value: unknown): ReducedPipelineSection | null => {
  const section = asRecord(value);
  const key = section && asTrimmedString(section.key, MAX_KEY_LENGTH);
  const title = section && asTrimmedString(section.title, MAX_NAME_LENGTH);
  const role = section?.role;
  const columns = adaptSectionColumns(section?.columns);
  const rawRows = section?.rows;
  if (
    !key ||
    !title ||
    (role !== 'RESULT' && role !== 'DETAILS') ||
    !columns ||
    !Array.isArray(rawRows) ||
    rawRows.length > 200
  ) {
    return null;
  }
  const rows = rawRows.map((row) => adaptSectionRow(row, columns));
  if (rows.some((row) => !row)) {
    return null;
  }
  const normalizedRows = rows;
  if (new Set(normalizedRows.map(({ key: rowKey }) => rowKey)).size !== normalizedRows.length) {
    return null;
  }
  return { key, title, role, columns, rows: normalizedRows };
};

const adaptSections = (value: unknown): ReducedPipelineSection[] | null => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.length > 20) {
    return null;
  }
  const sections = value.map(adaptSection);
  if (sections.some((section) => !section)) {
    return null;
  }
  const normalized = sections;
  return new Set(normalized.map(({ key }) => key)).size === normalized.length ? normalized : null;
};

const adaptLinks = (value: unknown): ReducedPipelineStage['links'] | null => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.length > 20) {
    return null;
  }
  const links = value.map((item) => {
    const link = asRecord(item);
    const type = link && asTrimmedString(link.type, MAX_KEY_LENGTH);
    const label = link && asTrimmedString(link.label, MAX_NAME_LENGTH);
    const url = link && asTrimmedString(link.url);
    return type && label && url ? { type, label, url } : null;
  });
  return links.some((link) => !link) ? null : links;
};

const adaptStage = (value: unknown): ReducedPipelineStage | null => {
  const raw = asRecord(value);
  if (!raw) {
    return null;
  }
  const id = asPositiveInteger(raw.id);
  const reportedKey = asTrimmedString(raw.stageKey, MAX_KEY_LENGTH);
  const key = reportedKey ?? (id ? `stage-${id}` : undefined);
  const label =
    asTrimmedString(raw.shortName, MAX_NAME_LENGTH) ??
    asTrimmedString(raw.name, MAX_NAME_LENGTH) ??
    key;
  const sequence = asNonNegativeInteger(raw.sequence);
  const summary = asTrimmedString(raw.summary, MAX_NAME_LENGTH);
  const message = asTrimmedString(raw.message);
  const durationMs = asNonNegativeInteger(raw.durationMillis);
  const attributes = adaptAttributes(raw.attributes);
  const links = adaptLinks(raw.links);
  if (
    !key ||
    !label ||
    (raw.stageKey !== undefined && !reportedKey) ||
    (raw.sequence !== undefined && sequence === undefined) ||
    (raw.summary !== undefined && !summary) ||
    (raw.message !== undefined && !message) ||
    (raw.durationMillis !== undefined && durationMs === undefined) ||
    !attributes ||
    !links
  ) {
    return null;
  }

  return {
    key,
    ...(reportedKey ? { stageKey: reportedKey } : {}),
    label,
    sequence,
    status: asStatus(raw.statusCategory ?? raw.status),
    ...(raw.statusCategory !== undefined
      ? { statusText: asTrimmedString(raw.status, MAX_NAME_LENGTH) }
      : {}),
    ...(summary ? { summary } : {}),
    ...(message ? { message } : {}),
    ...(attributes.length ? { attributes } : {}),
    ...(durationMs !== undefined ? { durationMs } : {}),
    ...(links.length ? { links } : {}),
  };
};

const adaptRelatedEntities = (
  value: unknown,
): NonNullable<ReducedPipelineDetailStage['relatedEntities']> | null => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.length > 200) {
    return null;
  }
  const entities: NonNullable<ReducedPipelineDetailStage['relatedEntities']> = [];
  for (const entry of value) {
    const entity = asRecord(entry);
    const entityType = entity && asTrimmedString(entity.entityType, MAX_KEY_LENGTH);
    const entityId = entity && asTrimmedString(entity.entityId, MAX_KEY_LENGTH);
    if (!entityType || !entityId) {
      return null;
    }
    entities.push({ entityType, entityId });
  }
  return entities;
};

const adaptEntityIds = (value: unknown): string[] | null => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.length > 100) {
    return null;
  }
  const entityIds: string[] = [];
  for (const id of value) {
    const entityId = asTrimmedString(id, MAX_KEY_LENGTH);
    if (!entityId) {
      return null;
    }
    entityIds.push(entityId);
  }
  return entityIds;
};

const adaptDetailStageMetadata = (raw: Record<string, unknown>) => {
  const attempt = asPositiveInteger(raw.attempt);
  const ownedBy = asTrimmedString(raw.ownedBy, MAX_KEY_LENGTH);
  const startedAt = asTimestamp(raw.startedAt);
  const finishedAt = asTimestamp(raw.finishedAt);
  const relatedEntities = adaptRelatedEntities(raw.relatedEntities);
  if (
    !relatedEntities ||
    (raw.attempt !== undefined && !attempt) ||
    (raw.ownedBy !== undefined && !ownedBy) ||
    (raw.startedAt !== undefined && startedAt === undefined) ||
    (raw.finishedAt !== undefined && finishedAt === undefined) ||
    (raw.affectsIterationStatus !== undefined && typeof raw.affectsIterationStatus !== 'boolean') ||
    (raw.retryable !== undefined && typeof raw.retryable !== 'boolean')
  ) {
    return null;
  }
  return {
    ...(attempt ? { attempt } : {}),
    ...(ownedBy ? { ownedBy } : {}),
    ...(typeof raw.affectsIterationStatus === 'boolean'
      ? { affectsIterationStatus: raw.affectsIterationStatus }
      : {}),
    ...(typeof raw.retryable === 'boolean' ? { retryable: raw.retryable } : {}),
    ...(startedAt !== undefined ? { startedAt } : {}),
    ...(finishedAt !== undefined ? { finishedAt } : {}),
    ...(relatedEntities.length ? { relatedEntities } : {}),
  };
};

const adaptDetailStage = (value: unknown): ReducedPipelineDetailStage | null => {
  const raw = asRecord(value);
  const stage = adaptStage(value);
  const id = raw ? asPositiveInteger(raw.id) : null;
  const sections = raw ? adaptSections(raw.sections) : null;
  const metadata = raw && adaptDetailStageMetadata(raw);
  if (!stage || !id || stage.sequence === undefined || !sections || !metadata) {
    return null;
  }
  return {
    ...stage,
    id,
    sequence: stage.sequence,
    ...metadata,
    ...(sections.length ? { sections } : {}),
  };
};

const adaptStages = (value: unknown): ReducedPipelineStage[] | null => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.length > MAX_STAGES) {
    return null;
  }
  const uniqueStages = new Map<string, ReducedPipelineStage>();
  for (const rawStage of value) {
    const stage = adaptStage(rawStage);
    if (!stage || uniqueStages.has(stage.key)) {
      return null;
    }
    uniqueStages.set(stage.key, stage);
  }

  return Array.from(uniqueStages.values()).sort((first, second) => {
    const sequenceDifference =
      (first.sequence ?? Number.MAX_SAFE_INTEGER) - (second.sequence ?? Number.MAX_SAFE_INTEGER);
    return sequenceDifference || first.key.localeCompare(second.key);
  });
};

const adaptDetailStages = (value: unknown): ReducedPipelineDetailStage[] | null => {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.length > MAX_STAGES) {
    return null;
  }
  const stages = value.map(adaptDetailStage);
  if (stages.some((stage) => !stage)) {
    return null;
  }
  const normalized = stages;
  const ids = normalized.map(({ id }) => id);
  const keys = normalized.map(({ key }) => key);
  const sequences = normalized.map(({ sequence }) => sequence);
  if (
    new Set(ids).size !== normalized.length ||
    new Set(keys).size !== normalized.length ||
    new Set(sequences).size !== normalized.length
  ) {
    return null;
  }
  return [...normalized].sort(
    (first, second) => first.sequence - second.sequence || first.key.localeCompare(second.key),
  );
};

const adaptPipeline = (value: unknown): ReducedPipeline | null => {
  const raw = asRecord(value);
  if (!raw) {
    return null;
  }
  const id = asPositiveInteger(raw.id);
  const name = asTrimmedString(raw.name, MAX_NAME_LENGTH);
  const description = asTrimmedString(raw.description, MAX_TEXT_LENGTH);
  const type = asTrimmedString(raw.type, MAX_KEY_LENGTH);
  const attributes = adaptAttributes(raw.attributes);
  const repository = attributes?.find(({ key }) => key === 'repository')?.value;
  const settings = raw.settings === undefined ? undefined : asRecord(raw.settings);
  const nestedAutoReady =
    settings?.autoReady === undefined ? undefined : asRecord(settings.autoReady);
  if (!id || !name) {
    return null;
  }
  const autoReadyEnabled = nestedAutoReady?.enabled ?? raw.autoReadyEnabled;
  const rawAutoReadyThreshold = nestedAutoReady?.threshold ?? raw.autoReadyThreshold;
  const isAutoReadyConfigured = typeof autoReadyEnabled === 'boolean';
  const iterationsCount = asNonNegativeInteger(raw.iterationsCount);
  const autoReadyThreshold = asNonNegativeInteger(rawAutoReadyThreshold);
  if (
    !attributes ||
    (raw.type !== undefined && type === undefined) ||
    (raw.settings !== undefined && !settings) ||
    (settings?.autoReady !== undefined && !nestedAutoReady) ||
    (raw.iterationsCount !== undefined && iterationsCount === undefined) ||
    (raw.description !== undefined && description === undefined) ||
    (autoReadyEnabled !== undefined && !isAutoReadyConfigured) ||
    (rawAutoReadyThreshold !== undefined &&
      (!isAutoReadyConfigured || autoReadyThreshold === undefined || autoReadyThreshold > 100))
  ) {
    return null;
  }

  return {
    kind: 'reduced',
    id,
    name,
    description,
    ...(type ? { type } : {}),
    ...(repository ? { repository } : {}),
    iterationsCount,
    autoReady: isAutoReadyConfigured
      ? {
          enabled: autoReadyEnabled,
          threshold: autoReadyThreshold,
        }
      : undefined,
  };
};

const adaptIteration = (
  value: unknown,
  expectedPipelineId: number,
): ReducedPipelineIteration | null => {
  const raw = asRecord(value);
  if (!raw) {
    return null;
  }
  const id = asPositiveInteger(raw.id);
  const pipelineId = asPositiveInteger(raw.pipelineId);
  const number = asPositiveInteger(raw.iterationNumber);
  const durationMs = asNonNegativeInteger(raw.durationMillis);
  const trigger = asTrimmedString(raw.trigger, MAX_NAME_LENGTH);
  const startedAt = asTimestamp(raw.startedAt);
  const finishedAt = asTimestamp(raw.finishedAt);
  const attributes = adaptAttributes(raw.attributes);
  const attributeTrigger = attributes?.find(({ key }) => key === 'trigger')?.value;
  const stages = adaptStages(raw.stages);
  if (
    !id ||
    pipelineId !== expectedPipelineId ||
    !number ||
    (raw.durationMillis !== undefined && durationMs === undefined) ||
    (raw.trigger !== undefined && trigger === undefined) ||
    (raw.startedAt !== undefined && startedAt === undefined) ||
    (raw.finishedAt !== undefined && finishedAt === undefined) ||
    !attributes ||
    !stages
  ) {
    return null;
  }

  return {
    kind: 'reduced',
    id,
    pipelineId,
    number,
    rerunOf: adaptIterationReference(raw.rerunOf),
    status: asStatus(raw.statusCategory ?? raw.status),
    ...(raw.statusCategory !== undefined
      ? { statusText: asTrimmedString(raw.status, MAX_NAME_LENGTH) }
      : {}),
    trigger: trigger ?? attributeTrigger,
    startedAt,
    finishedAt,
    durationMs,
    attributes,
    stages,
  };
};

export const adaptLivePipelines = (value: unknown): ReducedPipeline[] => {
  const response = asRecord(value);
  const page = response ? asPage(response.page) : null;
  const content = response ? response.content : value;
  if (
    !Array.isArray(content) ||
    content.length > MAX_PIPELINES ||
    (response && !isCompleteSinglePage(page, content.length))
  ) {
    throw new Error('Invalid pipeline catalog response');
  }
  const pipelines = content.map(adaptPipeline);
  if (pipelines.some((pipeline) => !pipeline)) {
    throw new Error('Invalid pipeline catalog entity');
  }
  const normalized = pipelines;
  if (new Set(normalized.map((pipeline) => pipeline.id)).size !== normalized.length) {
    throw new Error('Duplicate pipeline id');
  }
  return normalized;
};

export const adaptLivePipelinesPage = (value: unknown): LivePipelinePage<ReducedPipeline> => {
  const envelope = asPageEnvelope(value, MAX_PAGE_SIZE);
  if (!envelope) {
    throw new Error('Invalid pipeline catalog response');
  }
  const content = envelope.content.map(adaptPipeline);
  if (content.some((pipeline) => !pipeline)) {
    throw new Error('Invalid pipeline catalog entity');
  }
  if (new Set(content.map(({ id }) => id)).size !== content.length) {
    throw new Error('Duplicate pipeline id');
  }
  return { content, page: envelope.page };
};

export const adaptLivePipelineIterations = (
  value: unknown,
  pipelineId: number,
): ReducedPipelineIteration[] => {
  const response = asRecord(value);
  const page = response ? asPage(response.page) : null;
  const content = response ? response.content : value;
  if (
    !Array.isArray(content) ||
    content.length > MAX_ITERATIONS ||
    (response && !isCompleteSinglePage(page, content.length))
  ) {
    throw new Error('Invalid pipeline iteration list response');
  }
  const iterations = content.map((iteration) => adaptIteration(iteration, pipelineId));
  if (iterations.some((iteration) => !iteration)) {
    throw new Error('Invalid pipeline iteration entity');
  }
  const normalized = iterations;
  if (new Set(normalized.map((iteration) => iteration.id)).size !== normalized.length) {
    throw new Error('Duplicate pipeline iteration id');
  }
  return normalized;
};

export const adaptLivePipelineIterationsPage = (
  value: unknown,
  pipelineId: number,
): LivePipelinePage<ReducedPipelineIteration> => {
  const envelope = asPageEnvelope(value, MAX_PAGE_SIZE);
  if (!envelope) {
    throw new Error('Invalid pipeline iteration list response');
  }
  const content = envelope.content.map((iteration) => adaptIteration(iteration, pipelineId));
  if (content.some((iteration) => !iteration)) {
    throw new Error('Invalid pipeline iteration entity');
  }
  if (new Set(content.map(({ id }) => id)).size !== content.length) {
    throw new Error('Duplicate pipeline iteration id');
  }
  return { content, page: envelope.page };
};

const adaptDetailMetadata = (raw: Record<string, unknown>) => {
  const pipelineName = asTrimmedString(raw.pipelineName, MAX_NAME_LENGTH);
  const pipelineType = asTrimmedString(raw.pipelineType, MAX_KEY_LENGTH);
  const createdAt = asTimestamp(raw.createdAt);
  const startedByRaw = asRecord(raw.startedBy);
  const startedBy = startedByRaw
    ? (asTrimmedString(startedByRaw.fullName, MAX_NAME_LENGTH) ??
      asTrimmedString(startedByRaw.login, MAX_NAME_LENGTH))
    : undefined;
  if (
    (raw.pipelineName !== undefined && pipelineName === undefined) ||
    (raw.pipelineType !== undefined && pipelineType === undefined) ||
    (raw.createdAt !== undefined && createdAt === undefined) ||
    (raw.startedBy !== undefined && !startedBy)
  ) {
    return null;
  }
  return {
    pipelineName,
    ...(pipelineType ? { pipelineType } : {}),
    createdAt,
    ...(startedBy ? { startedBy } : {}),
  };
};

export const adaptLivePipelineIterationDetail = (
  value: unknown,
  expectedPipelineId: number,
  expectedIterationId: number,
): ReducedPipelineIterationDetail => {
  if (
    asPositiveInteger(expectedPipelineId) !== expectedPipelineId ||
    asPositiveInteger(expectedIterationId) !== expectedIterationId
  ) {
    throw new Error('Invalid expected pipeline iteration identity');
  }
  const raw = asRecord(value);
  const iteration = adaptIteration(value, expectedPipelineId);
  const metadata = raw ? adaptDetailMetadata(raw) : null;
  const rawWarnings = raw?.warnings === undefined ? [] : raw.warnings;
  const warningDetails =
    Array.isArray(rawWarnings) && rawWarnings.length <= 20
      ? rawWarnings.map((warning) => {
          const entry = asRecord(warning);
          const message = entry && asTrimmedString(entry.message);
          const code = entry && asTrimmedString(entry.code, MAX_KEY_LENGTH);
          const stageId = entry && asPositiveInteger(entry.stageId);
          const entityType = entry && asTrimmedString(entry.entityType, MAX_KEY_LENGTH);
          const entityIds = adaptEntityIds(entry?.entityIds);
          if (
            !message ||
            !entityIds ||
            (entry?.code !== undefined && !code) ||
            (entry?.stageId !== undefined && !stageId) ||
            (entry?.entityType !== undefined && !entityType)
          ) {
            return null;
          }
          return {
            message,
            ...(code ? { code } : {}),
            ...(stageId ? { stageId } : {}),
            ...(entityType ? { entityType } : {}),
            ...(entityIds.length ? { entityIds } : {}),
          };
        })
      : null;
  const stages = raw ? adaptDetailStages(raw.stages) : null;
  if (
    !raw ||
    iteration?.id !== expectedIterationId ||
    !metadata ||
    !warningDetails ||
    warningDetails.some((warning) => !warning) ||
    !stages
  ) {
    throw new Error('Invalid pipeline iteration detail response');
  }
  return {
    ...iteration,
    ...metadata,
    ...(warningDetails.length
      ? {
          warnings: warningDetails.map(({ message }) => message),
          warningDetails,
        }
      : {}),
    stages,
    rawResponse: raw,
  };
};

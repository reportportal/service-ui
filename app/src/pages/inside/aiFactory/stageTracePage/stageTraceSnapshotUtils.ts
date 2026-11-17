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

import { formatCost, formatTokens } from 'common/utils/aiFactoryFormatUtils';
import type {
  ReducedPipelineAttribute,
  ReducedPipelineDetailStage,
  ReducedPipelineSection,
} from 'controllers/aiFactory/pipelines/liveAdapters';
import type { StageTraceAttempt } from 'controllers/aiFactory/stageTrace';

export const findAttemptSnapshot = (
  stage: ReducedPipelineDetailStage | undefined,
  attempt: StageTraceAttempt | undefined,
) => {
  if (!stage || !attempt) return undefined;
  if (stage.attempt === attempt.attempt) return stage;
  return stage.attempts?.find((item) => item.attempt === attempt.attempt);
};
export const formatSnapshotAttribute = (
  attribute: ReducedPipelineAttribute,
  isTokenUsage = false,
): string => {
  if (attribute.value.trim() === '') return attribute.value;
  const value = Number(attribute.value);
  if (!Number.isFinite(value)) return attribute.value;
  if (attribute.valueType === 'MONEY') return formatCost(value);
  if (isTokenUsage && attribute.valueType === 'NUMBER') return formatTokens(value);
  return attribute.value;
};
export const getTokenUsageFields = (sections: ReducedPipelineSection[] = []) =>
  sections
    .filter((section) => section.key === 'tokenUsage')
    .flatMap((section) =>
      section.rows.flatMap((row) =>
        section.columns.map((column) => ({
          key: `${section.key}-${row.key}-${column.key}`,
          label: column.label,
          value: formatSnapshotAttribute(
            { key: column.key, value: row.cells[column.key] ?? '—', valueType: column.valueType },
            true,
          ),
        })),
      ),
    );

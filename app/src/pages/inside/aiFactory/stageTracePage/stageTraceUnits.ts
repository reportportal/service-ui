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

import { AGENT_UNITS_SECTION_KEY, getAgentUnitName } from 'common/utils/agentUnitName';
import type { ReducedPipelineSection } from 'controllers/aiFactory/pipelines/liveAdapters';
import type { StageTraceEvent } from 'controllers/aiFactory/stageTrace';

export type StageTraceUnitFilter = 'all' | 'stage' | `unit:${string}`;

export const getStageTraceUnits = (
  sections: ReducedPipelineSection[] = [],
): Map<string, string> => {
  const units = new Map<string, string>();
  sections
    .filter((section) => section.key === AGENT_UNITS_SECTION_KEY)
    .flatMap((section) => section.rows)
    .forEach((row) => {
      if (!units.has(row.key)) {
        units.set(row.key, getAgentUnitName(row));
      }
    });
  return units;
};

export const getStageTraceEventUnit = (
  event: StageTraceEvent,
  units: Map<string, string>,
): string | undefined =>
  event.unitKey !== undefined && units.has(event.unitKey) ? event.unitKey : undefined;

export const getStageTraceUnitFilter = (
  filter: StageTraceUnitFilter,
  units: Map<string, string>,
): StageTraceUnitFilter =>
  filter === 'all' || filter === 'stage' || units.has(filter.slice(5)) ? filter : 'all';

export const filterStageTraceEvents = (
  events: StageTraceEvent[],
  units: Map<string, string>,
  filter: StageTraceUnitFilter,
): StageTraceEvent[] => {
  if (filter === 'all') return events;
  return events.filter((event) => {
    const unitKey = getStageTraceEventUnit(event, units);
    return filter === 'stage' ? unitKey === undefined : unitKey === filter.slice(5);
  });
};

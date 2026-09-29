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

/**
 * Formatting for the AI Factory PoC's token economics (docs/ai-factory-poc/01-knowledge-base.md §4.6).
 *
 * `formatDuration` already exists for iteration/stage durations (`common/utils/timeDateUtils`) —
 * it is reused as-is and not duplicated here.
 *
 * Neither helper adds an "≈" (approximate) prefix or a +/- sign: those are call-site decisions
 * (an exact fix-round cost has no "≈"; a Compare delta adds its own sign), matching the UX
 * reference (`money()`/`fk()` in the prototype).
 */

/** `0.32` → `"$0.32"`. Amounts are estimates supplied by the pipeline; RP never recalculates them. */
export const formatCost = (amount: number): string => `$${(Math.round(amount * 100) / 100).toFixed(2)}`;

/** `612000` → `"612.0k"`, `2104000` → `"2.10M"`, `900` → `"900"`. */
export const formatTokens = (count: number): string => {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(2)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}k`;
  }
  return String(Math.round(count));
};

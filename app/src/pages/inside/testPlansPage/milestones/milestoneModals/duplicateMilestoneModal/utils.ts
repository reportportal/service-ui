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
 * Builds the next name when duplicating a milestone:
 * "My milestone" → "My milestone (1)"
 * "My milestone (1)" → "My milestone (2)"
 */
export const getNextDuplicateMilestoneName = (currentName: string): string => {
  const suffixMatch = / \((\d+)\)$/.exec(currentName);
  if (suffixMatch) {
    const next = Number.parseInt(suffixMatch[1], 10) + 1;
    const base = currentName.slice(0, currentName.length - suffixMatch[0].length).trimEnd();
    return `${base} (${next})`;
  }
  return `${currentName} (1)`;
};

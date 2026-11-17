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
 * Joins base name with suffix, truncating the base so the result fits maxLength.
 * The suffix is always preserved.
 */
export const joinNameWithSuffix = (baseName: string, suffix: string, maxLength: number): string => {
  const maxBaseLength = Math.max(0, maxLength - suffix.length);
  const truncatedBase = baseName.slice(0, maxBaseLength).trimEnd();

  return `${truncatedBase}${suffix}`;
};

/**
 * Builds the next duplicate name:
 * "My item" → "My item (1)"
 * "My item (1)" → "My item (2)"
 * Truncates the base name when base + suffix would exceed maxLength.
 */
export const getNextDuplicateName = (currentName: string, maxLength: number): string => {
  const duplicateNumberPattern = / \((\d+)\)$/;
  const suffixMatch = duplicateNumberPattern.exec(currentName);
  if (suffixMatch) {
    const currentNumber = Number.parseInt(suffixMatch[1], 10);
    const nextNumber = currentNumber + 1;
    const nameWithoutSuffix = currentName
      .slice(0, currentName.length - suffixMatch[0].length)
      .trimEnd();

    return joinNameWithSuffix(nameWithoutSuffix, ` (${nextNumber})`, maxLength);
  }

  return joinNameWithSuffix(currentName, ' (1)', maxLength);
};

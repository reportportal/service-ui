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

interface IterationProvenanceAttribute {
  key: string;
  value: string;
  type?: 'META' | 'TAG' | 'NONE';
}

export interface IterationReference {
  id: number;
  iterationNumber?: number;
}

export const isPositiveIterationId = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

export const adaptIterationReference = (value: unknown): IterationReference | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const reference = value as Record<string, unknown>;
  if (!isPositiveIterationId(reference.id)) return undefined;
  return {
    id: reference.id,
    ...(isPositiveIterationId(reference.iterationNumber)
      ? { iterationNumber: reference.iterationNumber }
      : {}),
  };
};

export const getIterationFixLabel = (attributes: IterationProvenanceAttribute[]): string | undefined =>
  attributes.find(({ key, type }) => key === 'fixRound' && type === 'META')?.value;

export const isFixIteration = (attributes: IterationProvenanceAttribute[]): boolean =>
  Boolean(getIterationFixLabel(attributes)) ||
  attributes.some(
    ({ key, type, value }) =>
      key === 'fixRoundId' &&
      type === 'NONE' &&
      /^[1-9]\d*$/.test(value) &&
      Number.isSafeInteger(Number(value)),
  );

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

import { type ReactNode } from 'react';

/**
 * Highlights matching text segments with a specified className
 * @param text - The text to search in
 * @param query - The search query to highlight
 * @param highlightClassName - CSS class to apply to matched segments
 * @returns ReactNode with highlighted segments
 */
export const highlightText = (
  text: string,
  query: string,
  highlightClassName: string = 'highlight',
): ReactNode => {
  if (!query || !text) return text;

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return text;

  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`); // NOSONAR

  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  const nodes = parts.reduce<{ nodes: ReactNode[]; counter: number }>(
    (acc, part) => {
      if (!part) return acc;

      const currentKey = acc.counter;

      const isMatch = part.toLowerCase() === trimmedQuery.toLowerCase();

      const newNode = isMatch ? (
        <span key={`highlight-${currentKey}`} className={highlightClassName}>
          {part}
        </span>
      ) : (
        <span key={`text-${currentKey}`}>{part}</span>
      );

      return {
        nodes: [...acc.nodes, newNode],
        counter: acc.counter + 1,
      };
    },
    { nodes: [], counter: 0 },
  );

  return <>{nodes.nodes}</>;
};

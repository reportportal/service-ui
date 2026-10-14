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
 * Encoded filter value length budget for GET requests.
 * Tomcat rejects long request lines (HTTP 400 HTML). qs encodes commas as %2C.
 */
export const MAX_QUERY_FILTER_VALUE_LENGTH = 1500;

const ENCODED_COMMA_LENGTH = 3; // %2C

export const chunkIdsForQueryFilter = (
  ids: number[],
  maxEncodedLength = MAX_QUERY_FILTER_VALUE_LENGTH,
): number[][] => {
  if (ids.length === 0) {
    return [];
  }

  const chunks: number[][] = [];
  let currentChunk: number[] = [];
  let currentEncodedLength = 0;

  ids.forEach((id) => {
    const idLength = String(id).length;
    const nextEncodedLength =
      currentChunk.length === 0
        ? idLength
        : currentEncodedLength + ENCODED_COMMA_LENGTH + idLength;

    if (currentChunk.length > 0 && nextEncodedLength > maxEncodedLength) {
      chunks.push(currentChunk);
      currentChunk = [id];
      currentEncodedLength = idLength;
      return;
    }

    currentChunk.push(id);
    currentEncodedLength = nextEncodedLength;
  });

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
};

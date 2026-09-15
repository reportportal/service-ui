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

const NUMERIC_PREFIX = /^\d+/;

/**
 * Newest first, by version rather than by publish date. A patch for an older branch can be
 * published after a newer release — ordinary, and the registry itself already refuses to call it
 * "latest" for the same reason — so ordering by date would put 5.6.2 above 5.8.0 and make the
 * newest build look like an old one.
 */
export const sortVersionsNewestFirst = (versions) =>
  [...versions].sort((a, b) => compareVersions(b.version, a.version));

/**
 * Compares two version strings segment by segment, numerically where a segment is a number.
 *
 * <p>Deliberately not semver-strict: plugins are not disciplined about the third segment, and a
 * version recorded as `5.7` has to sort and compare rather than throw. A segment that does not
 * start with a digit compares as lower than one that does, which puts `5.8.0-rc1` below `5.8.0`.
 */
export const compareVersions = (left, right) => {
  const a = String(left ?? '').split('.');
  const b = String(right ?? '').split('.');

  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const diff = compareSegments(a[i], b[i]);

    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
};

const compareSegments = (left = '0', right = '0') => {
  const a = NUMERIC_PREFIX.exec(left);
  const b = NUMERIC_PREFIX.exec(right);

  if (!a || !b) {
    return (a ? 1 : 0) - (b ? 1 : 0);
  }

  const numeric = Number(a[0]) - Number(b[0]);

  if (numeric !== 0) {
    return numeric;
  }

  // 5.8.0 outranks 5.8.0-rc1: a bare number is the release, a suffix is on the way to it
  const restA = left.slice(a[0].length);
  const restB = right.slice(b[0].length);

  if (restA === restB) {
    return 0;
  }
  if (restA === '') {
    return 1;
  }
  if (restB === '') {
    return -1;
  }

  return restA.localeCompare(restB);
};

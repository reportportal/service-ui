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

// service-api's CompatibilityRange and PluginVersions, ported rule for rule: the verdict is the
// server's, and this side only has to find which of its constraints the verdict turned on, so it
// must read a range and order two versions exactly as the server did

// longest first, so `>=` is not read as `>` followed by `=25.0`
const RANGE_OPERATORS = ['>=', '<=', '==', '>', '<', '='];
// dotted digits, an optional pre-release, optional build metadata; anything else is not a version
const RANGE_VERSION = /^\d+(\.\d+)*(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;
const MAX_RANGE_VERSION_LENGTH = 256;

const parseConstraint = (text) => {
  const trimmed = text.trim();
  const operator = RANGE_OPERATORS.find((candidate) => trimmed.startsWith(candidate));
  // a bare version is an exact pin
  const version = operator ? trimmed.slice(operator.length).trim() : trimmed;

  if (version.length > MAX_RANGE_VERSION_LENGTH || !RANGE_VERSION.test(version)) {
    return null;
  }

  return { operator: operator || '=', version };
};

/**
 * Every constraint of a declared range, or null when any one of them is unreadable: the server
 * refuses a range it cannot read as a whole, so a half-read one would explain a different verdict.
 *
 * @returns {Array<{operator: string, version: string}>|null}
 */
export const parseCompatibilityRange = (range) => {
  if (typeof range !== 'string' || !range.trim()) {
    return null;
  }

  const constraints = range.trim().split(',').map(parseConstraint);

  return constraints.includes(null) ? null : constraints;
};

const stripLeadingZeroes = (digits) => digits.replace(/^0+(?=\d)/, '');

// numeric order over digit strings without parsing them, so a segment past 2^53 still orders
const compareDigits = (left, right) => {
  const a = stripLeadingZeroes(left);
  const b = stripLeadingZeroes(right);

  if (a.length !== b.length) {
    return a.length < b.length ? -1 : 1;
  }
  if (a === b) {
    return 0;
  }

  return a < b ? -1 : 1;
};

const withoutBuildMetadata = (version) => {
  const trimmed = String(version).trim();
  const plus = trimmed.indexOf('+');

  return plus < 0 ? trimmed : trimmed.slice(0, plus);
};

const coreOf = (version) => {
  const significant = withoutBuildMetadata(version);
  const dash = significant.indexOf('-');

  return dash < 0 ? significant : significant.slice(0, dash);
};

const segmentOf = (parts, index) => {
  if (index >= parts.length) {
    return '0';
  }
  const digits = /^\d*/.exec(parts[index])[0];

  return digits || '0';
};

const compareCores = (left, right) => {
  const a = left.split('.');
  const b = right.split('.');

  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const result = compareDigits(segmentOf(a, i), segmentOf(b, i));

    if (result !== 0) {
      return result;
    }
  }

  return 0;
};

const isNumericIdentifier = (identifier) => /^\d+$/.test(identifier);

const compareIdentifiers = (left, right) => {
  const leftNumeric = isNumericIdentifier(left);
  const rightNumeric = isNumericIdentifier(right);

  if (leftNumeric && rightNumeric) {
    return compareDigits(left, right);
  }
  if (leftNumeric !== rightNumeric) {
    return leftNumeric ? -1 : 1;
  }
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
};

// semver §11.4: a release outranks its pre-releases; identifiers compare one by one
const comparePreReleases = (left, right) => {
  if (left === right) {
    return 0;
  }
  if (!left) {
    return 1;
  }
  if (!right) {
    return -1;
  }

  const a = left.replace(/^-/, '').split('.');
  const b = right.replace(/^-/, '').split('.');

  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    const result = compareIdentifiers(a[i], b[i]);

    if (result !== 0) {
      return result;
    }
  }

  return Math.sign(a.length - b.length);
};

/** PluginVersions.compare: how service-api orders the product version against a bound. */
export const compareProductVersions = (left, right) => {
  const numbers = compareCores(coreOf(left), coreOf(right));

  if (numbers !== 0) {
    return numbers;
  }

  return comparePreReleases(
    withoutBuildMetadata(left).slice(coreOf(left).length),
    withoutBuildMetadata(right).slice(coreOf(right).length),
  );
};

const SATISFIES = {
  '>=': (comparison) => comparison >= 0,
  '<=': (comparison) => comparison <= 0,
  '>': (comparison) => comparison > 0,
  '<': (comparison) => comparison < 0,
  '=': (comparison) => comparison === 0,
  '==': (comparison) => comparison === 0,
};

/**
 * The first declared constraint the product version fails, as service-api's `failedBounds` would
 * list it, or null when the range is unreadable, the release unknown, or every bound holds.
 *
 * <p>Only the explanation is decided here. Whether a version runs is service-api's verdict; a
 * null here, beside a refusal, means "say only that it does not run", never "it runs".
 *
 * @returns {{operator: string, version: string}|null}
 */
export const violatedRangeBound = (range, productVersion) => {
  const constraints = parseCompatibilityRange(range);

  if (!constraints || typeof productVersion !== 'string' || !productVersion.trim()) {
    return null;
  }

  return (
    constraints.find(
      ({ operator, version }) =>
        !SATISFIES[operator](compareProductVersions(productVersion, version)),
    ) || null
  );
};

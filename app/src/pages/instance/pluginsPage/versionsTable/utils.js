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

// service-api's CompatibilityRange and PluginVersions, ported rule for rule: the verdict is the
// server's, and this side only has to find which of its constraints the verdict turned on, so it
// must read a range and order two versions exactly as the server did

// longest first, so `>=` is not read as `>` followed by `=25.0`
const RANGE_OPERATORS = ['>=', '<=', '==', '>', '<', '='];
// dotted digits, an optional pre-release, optional build metadata; anything else is not a version
const RANGE_VERSION = /^\d+(\.\d+)*(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$/;
const MAX_RANGE_VERSION_LENGTH = 256;

/**
 * Java's `String.split`, which the server's parsing is built on: trailing empty parts are dropped,
 * leading and inner ones kept, and a string with no separator at all comes back whole — even an
 * empty one. A plain `split` keeps the trailing parts, so `>=25.0,` would be unreadable here and
 * read as `>=25.0` there.
 */
const javaSplit = (text, separator) => {
  if (!text.includes(separator)) {
    return [text];
  }
  const parts = text.split(separator);

  while (parts.length > 0 && parts[parts.length - 1] === '') {
    parts.pop();
  }

  return parts;
};

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

  const constraints = javaSplit(range.trim(), ',').map(parseConstraint);

  return constraints.length === 0 || constraints.includes(null) ? null : constraints;
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
  const a = javaSplit(left, '.');
  const b = javaSplit(right, '.');

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

  const a = javaSplit(left.replace(/^-/, ''), '.');
  const b = javaSplit(right.replace(/^-/, ''), '.');

  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    const result = compareIdentifiers(a[i], b[i]);

    if (result !== 0) {
      return result;
    }
  }

  return Math.sign(a.length - b.length);
};

/**
 * PluginVersions.compare: how service-api orders two versions — the product against a bound, and
 * one plugin version against another. Missing segments count as zero, a pre-release sorts below its
 * release and pre-releases order by semver §11.4 (`rc.10` above `rc.2`), build metadata is ignored,
 * and an absent version sorts below any present one.
 */
export const compareProductVersions = (left, right) => {
  if (left == null || right == null) {
    if (left == null && right == null) {
      return 0;
    }

    return left == null ? -1 : 1;
  }

  const numbers = compareCores(coreOf(left), coreOf(right));

  if (numbers !== 0) {
    return numbers;
  }

  return comparePreReleases(
    withoutBuildMetadata(left).slice(coreOf(left).length),
    withoutBuildMetadata(right).slice(coreOf(right).length),
  );
};

/**
 * The one ordering for versions on these pages. Upgrade-or-downgrade, "a newer version exists" and
 * the newest-first table all ask the question service-api answers with PluginVersions, so they get
 * its answer: a private ordering that disagreed (it put `rc.10` below `rc.2`) would offer an update
 * the server does not see, or hide one it does.
 */
export const compareVersions = compareProductVersions;

/**
 * Newest first, by version rather than by publish date. A patch for an older branch can be
 * published after a newer release — ordinary, and the registry itself already refuses to call it
 * "latest" for the same reason — so ordering by date would put 5.6.2 above 5.8.0 and make the
 * newest build look like an old one.
 */
export const sortVersionsNewestFirst = (versions) =>
  [...versions].sort((a, b) => compareVersions(b.version, a.version));

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

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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { WarningIcon } from '@reportportal/ui-kit';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { TextTooltip } from 'components/main/tooltips/textTooltip';
import styles from './versionMark.scss';

const cx = classNames.bind(styles);

/** What a mark is about, which is also what colour it is. */
export const VERSION_MARK_TONES = {
  /** This build does not run here. A warning about fit, not about safety. */
  INCOMPATIBLE: 'incompatible',
  /** A security advisory, or a version the operator blocked. Both are about risk. */
  DANGER: 'danger',
};

const Mark = ({ tone, automationId }) => (
  <span
    role="img"
    className={cx('version-mark', tone)}
    data-automation-id={automationId}
    data-tone={tone}
  >
    <WarningIcon />
  </span>
);

Mark.propTypes = {
  tone: PropTypes.oneOf(Object.values(VERSION_MARK_TONES)).isRequired,
  automationId: PropTypes.string.isRequired,
};

/**
 * A mark beside a version, with the explanation the design draws as a tooltip.
 *
 * <p>The page used the browser's own `title` for these. That is not the same thing: it appears
 * after a delay the page cannot set, renders in a style it cannot control, truncates long text
 * without saying so, and on a touch device never appears at all. The explanations here are the
 * only place a reader is told why an action is dead, so they have to actually arrive.
 *
 * <p>`title` is kept exactly where the design asks for the browser's tooltip rather than this one:
 * the failure alert, where the point is to hold a long server message behind a short line.
 */
export const VersionMark = withTooltip({
  TooltipComponent: TextTooltip,
  data: { width: 240, align: 'left', dynamicWidth: false },
})(Mark);

VersionMark.propTypes = {
  tone: PropTypes.oneOf(Object.values(VERSION_MARK_TONES)).isRequired,
  automationId: PropTypes.string.isRequired,
  /** The explanation, which is the whole reason the mark is there. */
  tooltipContent: PropTypes.string.isRequired,
};

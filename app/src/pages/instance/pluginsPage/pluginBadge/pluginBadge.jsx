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
import styles from './pluginBadge.scss';

const cx = classNames.bind(styles);

/**
 * The small uppercase pill a plugin row and a plugin page both put under the name: the tier it
 * is offered at, and whatever the registry has said about it since.
 *
 * It is local, not from the ui-kit. The kit's Chip is a 28px sentence-case token with variants
 * for error, warning and link — a different object at a different size — and the kit has no
 * badge of this shape at all. Written here once because it was written twice: the row and the
 * detail page had the same nineteen lines of SCSS, already drifting apart in how they spelled
 * the font weight. Whether this belongs in the kit is a question for the designer, not one to
 * settle by inventing a design-system component out of one feature's needs.
 */
export const BADGE_TONES = {
  NEUTRAL: 'neutral',
  FREE: 'free',
  PREMIUM: 'premium',
  WARNING: 'warning',
  DANGER: 'danger',
};

export const PluginBadge = ({ tone = BADGE_TONES.FREE, children, ...rest }) => (
  <span className={cx('plugin-badge', tone)} {...rest}>
    {children}
  </span>
);

PluginBadge.propTypes = {
  tone: PropTypes.oneOf(Object.values(BADGE_TONES)),
  children: PropTypes.node.isRequired,
};

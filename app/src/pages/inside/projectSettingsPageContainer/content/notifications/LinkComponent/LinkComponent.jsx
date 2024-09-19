/*
 * Copyright 2024 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { useTracking } from 'react-tracking';
import styles from './LinkComponent.scss';
import { isInternalLink } from '../utils';

const cx = classNames.bind(styles);

export const LinkComponent = ({ to, children, icon, className, event, automationId, target }) => {
  const { trackEvent } = useTracking();
  const handleLinkTracking = () => {
    trackEvent(event);
  };
  return isInternalLink(to) ? (
    <Link
      to={to}
      onClick={handleLinkTracking}
      className={cx(className)}
      target={target}
      data-automation-id={automationId}
    >
      {children}
      {icon && <i className={cx('icon')}>{Parser(icon)}</i>}
    </Link>
  ) : (
    <a
      onClick={handleLinkTracking}
      href={to}
      className={cx(className)}
      target={target}
      rel="noopener noreferrer"
      data-automation-id={automationId}
    >
      {children}
      {icon && <i className={cx('icon')}>{Parser(icon)}</i>}
    </a>
  );
};

LinkComponent.propTypes = {
  to: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      type: PropTypes.string,
      payload: PropTypes.object,
    }),
  ]).isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.string,
  event: PropTypes.object,
  className: PropTypes.string,
  automationId: PropTypes.string,
  target: PropTypes.oneOf(['_blank', '_self', '_parent', '_top']),
};
LinkComponent.defaultProps = {
  className: 'link-item-wrapper',
  icon: null,
  automationId: null,
  target: '_blank',
};

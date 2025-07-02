/*
 * Copyright 2025 EPAM Systems
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
import React from 'react';
import classNames from 'classnames/bind';
import { ExternalLinkIcon } from '@reportportal/ui-kit';

import styles from './externalLink.scss';

const cx = classNames.bind(styles);

export const ExternalLink = ({
  href,
  children,
  dataAutomationId = '',
  className = '',
  onClick = () => {},
}) => (
  <a
    href={href}
    target="_blank"
    className={cx('link', className)}
    data-automation-id={dataAutomationId}
    onClick={onClick}
  >
    <span>{children}</span>
    <div className={cx('icon')}>
      <ExternalLinkIcon />
    </div>
  </a>
);

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  dataAutomationId: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

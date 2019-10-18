/*
 * Copyright 2019 EPAM Systems
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

import * as React from 'react';
import { string, element } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './launchInfoBlock.scss';

const cx = classNames.bind(styles);

export const LaunchInfoBlock = ({ launchName, issueType }) => (
  <div className={cx('info-block')}>
    <p>
      <FormattedMessage id="TestsTableWidget.header.launchName" defaultMessage="Launch name" />:{' '}
      <span className={cx('info-block-launch-name')}>{launchName}</span>
    </p>
    {issueType && (
      <p>
        <FormattedMessage id="TestsTableWidget.header.basedOn" defaultMessage="Based on" />:{' '}
        <span className={cx('info-block-launch-name')}>{issueType}</span>
      </p>
    )}
  </div>
);

LaunchInfoBlock.propTypes = {
  launchName: string.isRequired,
  issueType: element,
};

LaunchInfoBlock.defaultProps = {
  issueType: null,
};

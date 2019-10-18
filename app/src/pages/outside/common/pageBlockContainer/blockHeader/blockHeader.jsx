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

import classNames from 'classnames/bind';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import styles from './blockHeader.scss';

const cx = classNames.bind(styles);

export const BlockHeader = injectIntl(({ intl: { formatMessage }, header, hint }) => (
  <span className={cx('block-header')}>
    <span className={cx('huge-message')}>{formatMessage(header)}</span>
    <br />
    {formatMessage(hint)}
  </span>
));
BlockHeader.propTypes = {
  header: PropTypes.object,
  hint: PropTypes.object,
};
BlockHeader.defaultProps = {
  header: {},
  hint: {},
};

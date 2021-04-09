/*
 * Copyright 2021 EPAM Systems
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
import { messages } from 'pages/inside/stepPage/modals/editDefectModals/messages';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import styles from './optionsSection.scss';

const cx = classNames.bind(styles);

export const OptionsSection = ({ optionsBlock, itemsListBlock }) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('options-section')}>
      <div className={cx('header-block')}>
        <span className={cx('header')}>{formatMessage(messages.applyTo)}</span>
        <span className={cx('subheader')}>{formatMessage(messages.applyToSimilarItems)}:</span>
      </div>
      <div className={cx('options-block')}>
        {optionsBlock}
        <div className={cx('items-list')}>{itemsListBlock}</div>
      </div>
    </div>
  );
};
OptionsSection.propTypes = {
  optionsBlock: PropTypes.node,
  itemsListBlock: PropTypes.node,
};
OptionsSection.defaultProps = {
  optionsBlock: null,
  itemsListBlock: null,
};

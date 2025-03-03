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

import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';

import { intlMessageType } from 'common/constants/localization';

import styles from './numerableBlock.scss';

const cx = classNames.bind(styles);

export const NumerableBlock = ({ title, items, fullWidth = false }) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('numerable-block')}>
      <h2 className={cx('numerable-block__title')}>{title}</h2>
      <div className={cx('numerable-block__list')}>
        {items.map((message, index) => (
          <div
            className={cx('numerable-block__list-item', {
              'numerable-block__list-item--full-width': fullWidth,
            })}
            /* eslint-disable-next-line react/no-array-index-key */
            key={index}
          >
            <div className={cx('numerable-block__list-item-number')}>{index + 1}</div>
            <div className={cx('numerable-block__list-item-text')}>
              {Parser(formatMessage(message))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

NumerableBlock.propTypes = {
  items: PropTypes.arrayOf(intlMessageType),
  title: PropTypes.string,
  fullWidth: PropTypes.bool,
};

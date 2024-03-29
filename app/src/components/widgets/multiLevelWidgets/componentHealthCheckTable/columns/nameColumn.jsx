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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { COLOR_DEEP_RED, COLOR_PASSED } from 'common/constants/colors';
import { hintMessages } from '../messages';
import styles from '../componentHealthCheckTable.scss';

const cx = classNames.bind(styles);

const MAX_VALUE_LENGTH = 50;
const CHARACTERS_COUNT_BEFORE_ELLIPSIS = 45;
const CHARACTERS_COUNT_AFTER_ELLIPSIS = 5;

export const NameColumn = (
  { className, value },
  name,
  { minPassingRate, formatMessage, onClickAttribute, isClickableAttribute },
) => {
  const color = value.passingRate < minPassingRate ? COLOR_DEEP_RED : COLOR_PASSED;
  const { attributeValue } = value;

  const attributeValueToDisplay =
    attributeValue && attributeValue.length > MAX_VALUE_LENGTH
      ? `${attributeValue.slice(0, CHARACTERS_COUNT_BEFORE_ELLIPSIS)} ... ${attributeValue.slice(
          -CHARACTERS_COUNT_AFTER_ELLIPSIS,
        )}`
      : attributeValue;

  return (
    <div className={cx('name-col', className)}>
      {attributeValue ? (
        <div
          className={cx('name-attr', { 'cursor-pointer': isClickableAttribute })}
          onClick={
            isClickableAttribute
              ? () => onClickAttribute(attributeValue, value.passingRate, color)
              : undefined
          }
        >
          <span title={attributeValue}>{attributeValueToDisplay}</span>
        </div>
      ) : (
        <span className={cx('name-total', 'total-item')}>
          {formatMessage(hintMessages.nameTotal)}
        </span>
      )}
    </div>
  );
};

NameColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};

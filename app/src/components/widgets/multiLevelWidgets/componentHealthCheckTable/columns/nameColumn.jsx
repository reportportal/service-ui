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

export const NameColumn = (
  { className, value },
  name,
  { minPassingRate, formatMessage, onClickAttribute, isClickableAttribute },
) => {
  const color = value.passingRate < minPassingRate ? COLOR_DEEP_RED : COLOR_PASSED;

  const calculateName = () => {
    const ellipsisPlace = 45;
    const lengthAtWhichAppearsEllipsis = 50;
    const isNameLengthMoreThanFifty = value.attributeValue.length > lengthAtWhichAppearsEllipsis;

    if (!isNameLengthMoreThanFifty) return <span>{value.attributeValue}</span>;

    const nameBeforeEllipsis = value.attributeValue.slice(0, ellipsisPlace);
    const lastFiveSymbol = value.attributeValue.slice(-5);

    return (
      <>
        <span className={cx({ ellipsis: isNameLengthMoreThanFifty })}>{nameBeforeEllipsis}</span>
        <span>{lastFiveSymbol}</span>
      </>
    );
  };

  return (
    <div className={cx('name-col', className)}>
      {value.attributeValue ? (
        <div
          title={value.attributeValue}
          className={cx('name-attr', { 'cursor-pointer': isClickableAttribute })}
          onClick={
            isClickableAttribute
              ? () => onClickAttribute(value.attributeValue, value.passingRate, color)
              : undefined
          }
        >
          {calculateName()}
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

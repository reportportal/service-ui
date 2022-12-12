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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { formatAttributeWithSpacedDivider } from 'common/utils/attributeUtils';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import styles from './attribute.scss';

const cx = classNames.bind(styles);

const createRemoveClickHandler = (clickHandler) => (e) => {
  e.stopPropagation();
  clickHandler();
};

export const Attribute = ({
  attribute,
  onClick,
  onRemove,
  disabled,
  customClass,
  backgroundDark,
  maxCellWidth,
}) => (
  <div
    className={cx('attribute', customClass, { disabled }, { [`background-dark`]: backgroundDark })}
    onClick={disabled ? undefined : onClick}
  >
    {!disabled && (
      <div className={cx('remove-icon')} onClick={createRemoveClickHandler(onRemove)}>
        {Parser(CrossIcon)}
      </div>
    )}
    <div
      className={cx('label', { [`background-dark`]: backgroundDark })}
      title={formatAttributeWithSpacedDivider(attribute)}
    >
      {attribute.key ? (
        <>
          <div className={cx('key')} style={{ maxWidth: maxCellWidth }}>
            {attribute.key}
          </div>
          <div>:</div>
          <div className={cx('value')} style={{ maxWidth: maxCellWidth }}>
            {attribute.value}
          </div>
        </>
      ) : (
        <div>{attribute.value}</div>
      )}
    </div>
  </div>
);

Attribute.propTypes = {
  attribute: PropTypes.object,
  customClass: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  backgroundDark: PropTypes.bool,
  maxCellWidth: PropTypes.number,
};

Attribute.defaultProps = {
  attribute: {},
  customClass: '',
  disabled: false,
  onClick: () => {},
  onRemove: () => {},
  backgroundDark: false,
  maxCellWidth: 132,
};

/*
 * Copyright 2022 EPAM Systems
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
import CrossIcon from 'common/img/cross-icon-inline.svg';
import styles from './attribute.scss';

const cx = classNames.bind(styles);

export const Attribute = ({
  attribute,
  onClick,
  onRemove,
  disabled,
  customClass,
  variant,
  maxCellWidth,
  keyValueRefCallback,
  crossIconRefCallback,
  handleWrapperKeyDown,
  handleAttributeKeyValueKeyDown,
  handleCrossIconKeyDown,
  wrapperRefCallback,
}) => {
  const onClickRemove = (e) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div
      ref={wrapperRefCallback}
      tabIndex={0}
      className={cx('attribute', variant, customClass, { disabled })}
      onClick={disabled ? null : onClick}
      onKeyDown={disabled ? null : handleWrapperKeyDown}
    >
      <div
        ref={keyValueRefCallback}
        tabIndex={-1}
        className={cx('label', variant, { disabled })}
        onKeyDown={disabled ? null : handleAttributeKeyValueKeyDown}
      >
        {attribute.key ? (
          <>
            <div className={cx('key')} style={{ maxWidth: maxCellWidth }}>
              {attribute.key}
            </div>
            <div className={cx('separator')}>:</div>
            <div className={cx('value')} style={{ maxWidth: maxCellWidth }}>
              {attribute.value}
            </div>
          </>
        ) : (
          <div className={cx('value-without-key')}>{attribute.value}</div>
        )}
      </div>
      {!disabled && (
        <div
          tabIndex={-1}
          ref={crossIconRefCallback}
          className={cx('remove-icon', variant)}
          onClick={onClickRemove}
          onKeyDown={handleCrossIconKeyDown}
        >
          {Parser(CrossIcon)}
        </div>
      )}
    </div>
  );
};

Attribute.propTypes = {
  attribute: PropTypes.object,
  customClass: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  variant: PropTypes.string,
  maxCellWidth: PropTypes.number,
  keyValueRefCallback: PropTypes.func,
  crossIconRefCallback: PropTypes.func,
  handleWrapperKeyDown: PropTypes.func,
  handleAttributeKeyValueKeyDown: PropTypes.func,
  handleCrossIconKeyDown: PropTypes.func,
  wrapperRefCallback: PropTypes.func,
};

Attribute.defaultProps = {
  attribute: {},
  customClass: '',
  disabled: false,
  onClick: () => {},
  onRemove: () => {},
  variant: 'light',
  maxCellWidth: 162,
  keyValueRefCallback: () => {},
  crossIconRefCallback: () => {},
  handleWrapperKeyDown: () => {},
  handleAttributeKeyValueKeyDown: () => {},
  handleCrossIconKeyDown: () => {},
  wrapperRefCallback: () => {},
};

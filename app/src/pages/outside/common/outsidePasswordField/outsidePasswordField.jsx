/*
 * Copyright 2026 EPAM Systems
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
import { ArrowUpIcon, FieldText, Tooltip } from '@reportportal/ui-kit';
import { useCapsLock } from 'common/hooks/useCapsLock';
import styles from './outsidePasswordField.scss';

const cx = classNames.bind(styles);

export const OutsidePasswordField = ({
  value = '',
  onKeyDown,
  onKeyUp,
  capsLockMessage,
  disabled = false,
  ...rest
}) => {
  const { capsLockOn, handleKeyDown, handleKeyUp } = useCapsLock();
  const showCapsLock = capsLockOn && value.length >= 1 && !disabled;

  const capsLockIcon = showCapsLock ? (
    <Tooltip content={capsLockMessage} wrapperClassName={cx('caps-lock-tooltip')}>
      <span className={cx('caps-lock-icon')}>
        <ArrowUpIcon />
      </span>
    </Tooltip>
  ) : null;

  return (
    <FieldText
      value={value}
      type="password"
      disabled={disabled}
      endIcon={capsLockIcon}
      onKeyDown={(event) => {
        handleKeyDown(event);
        onKeyDown?.(event);
      }}
      onKeyUp={(event) => {
        handleKeyUp(event);
        onKeyUp?.(event);
      }}
      {...rest}
    />
  );
};

OutsidePasswordField.propTypes = {
  value: PropTypes.string,
  onKeyDown: PropTypes.func,
  onKeyUp: PropTypes.func,
  capsLockMessage: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

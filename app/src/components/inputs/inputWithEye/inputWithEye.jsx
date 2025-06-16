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
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import EyeIcon from 'common/img/newIcons/eye-inline.svg';
import CrossEyeIcon from 'common/img/newIcons/cross-eye-inline.svg';
import { withTooltip } from 'componentLibrary/tooltip';
import React from 'react';
import { messages } from './messages';
import styles from './inputWithEye.scss';

const cx = classNames.bind(styles);

function EyeComponent({ value }) {
  return Parser(value ? EyeIcon : CrossEyeIcon);
}
EyeComponent.propTypes = {
  value: PropTypes.string.isRequired,
};

function EyeTooltip({ formatMessage, value }) {
  return <span>{formatMessage(value ? messages.hideTooltip : messages.showTooltip)}</span>;
}
EyeTooltip.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

const EyeComponentWithTooltip = withTooltip({
  ContentComponent: EyeTooltip,
  side: 'bottom',
  dynamicWidth: true,
})(({ value }) => <EyeComponent value={value} />);
EyeComponentWithTooltip.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

export function InputWithEye({ value, disabled, onChange, onFocus, onBlur, className }) {
  const { formatMessage } = useIntl();

  return (
    // eslint-disable-next-line
    <label className={cx('input-with-eye', className)} onFocus={onFocus} onBlur={onBlur} tabIndex="1">
      <input
        type="checkbox"
        className={cx('input')}
        checked={value}
        disabled={disabled}
        onChange={onChange}
      />
      <div
        className={cx('eye', {
          disabled,
        })}
      >
        {disabled ? (
          <EyeComponent value={value} />
        ) : (
          <EyeComponentWithTooltip formatMessage={formatMessage} value={value} />
        )}
      </div>
    </label>
  );
}
InputWithEye.propTypes = {
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
};
InputWithEye.defaultProps = {
  value: false,
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  className: '',
};

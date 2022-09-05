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
import styles from './button.scss';

const cx = classNames.bind(styles);

export const Button = ({
  variant,
  startIcon,
  endIcon,
  wide,
  type,
  children,
  disabled,
  onClick,
  form,
  title,
  customClassName,
  dataAutomationId,
}) => {
  const classes = cx('button', variant, customClassName, {
    disabled,
    wide,
  });

  const icon = (variant === 'text' || variant === 'dark-text') && (startIcon || endIcon);

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      onClick={onClick}
      form={form}
      title={title}
      data-automation-id={dataAutomationId}
    >
      {icon && (
        <i className={cx('icon', { 'start-icon': startIcon, 'end-icon': endIcon })}>
          {Parser(icon)}
        </i>
      )}
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.string,
  startIcon: PropTypes.string,
  endIcon: PropTypes.string,
  wide: PropTypes.bool,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  onClick: PropTypes.func,
  form: PropTypes.string,
  title: PropTypes.string,
  customClassName: PropTypes.string,
  dataAutomationId: PropTypes.string,
};

Button.defaultProps = {
  variant: 'topaz',
  startIcon: '',
  endIcon: '',
  wide: false,
  children: '',
  disabled: false,
  type: 'button',
  onClick: () => {},
  form: null,
  title: '',
  customClassName: '',
  dataAutomationId: '',
};

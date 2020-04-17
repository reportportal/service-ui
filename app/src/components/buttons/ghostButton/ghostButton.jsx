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
import styles from './ghostButton.scss';

const cx = classNames.bind(styles);

export const GhostButton = ({
  type,
  children,
  disabled,
  title,
  color,
  icon,
  iconAtRight,
  onClick,
  tiny,
  notMinified,
  mobileDisabled,
  transparentBorder,
  large,
  style,
}) => {
  const classes = cx({
    'ghost-button': true,
    disabled,
    tiny,
    large,
    [`color-${color}`]: color,
    'with-icon': icon,
    'mobile-minified': icon && children && !notMinified,
    'mobile-disabled': mobileDisabled,
    'transparent-border': transparentBorder,
  });
  return (
    <button
      style={style}
      type={type}
      disabled={disabled}
      className={classes}
      onClick={onClick}
      title={title}
    >
      {icon && (
        <i className={cx('icon', { 'only-icon': !children, 'icon-at-right': iconAtRight })}>
          {Parser(icon)}
        </i>
      )}
      {children && <span className={cx('text')}>{children}</span>}
    </button>
  );
};

GhostButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  tiny: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
  iconAtRight: PropTypes.bool,
  notMinified: PropTypes.bool,
  title: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  type: PropTypes.string,
  onClick: PropTypes.func,
  transparentBorder: PropTypes.bool,
  large: PropTypes.bool,
  style: PropTypes.object,
};

GhostButton.defaultProps = {
  children: null,
  disabled: false,
  tiny: false,
  mobileDisabled: false,
  iconAtRight: false,
  notMinified: false,
  title: '',
  color: 'topaz',
  icon: '',
  type: 'button',
  onClick: () => {},
  transparentBorder: false,
  large: false,
  style: null,
};

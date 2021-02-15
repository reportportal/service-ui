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
  active,
  iconAtRight,
  onClick,
  tiny,
  notMinified,
  mobileDisabled,
  transparentBorder,
  transparentBorderHover,
  strokedIcon,
  filledIcon,
  large,
  style,
  transparentBackground,
}) => {
  const classes = cx('ghost-button', {
    disabled,
    tiny,
    large,
    active,
    [`color-${color}`]: color,
    'with-icon': icon,
    'stroked-icon': strokedIcon,
    'filled-icon': filledIcon,
    'mobile-minified': icon && children && !notMinified,
    'mobile-disabled': mobileDisabled,
    'transparent-border': transparentBorder,
    'transparent-border-hover': transparentBorderHover,
    'transparent-background': transparentBackground,
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
  active: PropTypes.bool,
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
  transparentBorderHover: PropTypes.bool,
  large: PropTypes.bool,
  style: PropTypes.object,
  filledIcon: PropTypes.bool,
  strokedIcon: PropTypes.bool,
  transparentBackground: PropTypes.bool,
};

GhostButton.defaultProps = {
  children: null,
  disabled: false,
  tiny: false,
  mobileDisabled: false,
  iconAtRight: false,
  notMinified: false,
  active: false,
  title: '',
  color: 'topaz',
  icon: '',
  type: 'button',
  onClick: () => {},
  transparentBorder: false,
  transparentBorderHover: false,
  large: false,
  style: null,
  filledIcon: true,
  strokedIcon: false,
  transparentBackground: false,
};

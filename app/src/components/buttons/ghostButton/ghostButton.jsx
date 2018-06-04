/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
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
  mobileDisabled,
  title,
}) => {
  const classes = cx({
    'ghost-button': true,
    disabled,
    tiny,
    [`color-${color}`]: color,
    'with-icon': icon,
    'mobile-minified': icon && children,
    'mobile-disabled': mobileDisabled,
  });
  return (
    <button type={type} disabled={disabled} className={classes} onClick={onClick} title={title}>
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
  title: PropTypes.string,
  tiny: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
  iconAtRight: PropTypes.bool,
  title: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  type: PropTypes.string,
  onClick: PropTypes.func,
};

GhostButton.defaultProps = {
  children: null,
  disabled: false,
  title: '',
  tiny: false,
  mobileDisabled: false,
  iconAtRight: false,
  title: '',
  color: 'topaz',
  icon: '',
  type: 'button',
  onClick: () => {},
};

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

export const GhostButton = ({ type, children, disabled, color, icon, onClick, tiny }) => {
  const classes = cx({
    'ghost-button': true,
    disabled,
    tiny,
    [`color-${color}`]: color,
    'with-icon': icon,
    'mobile-minified': icon && children,
  });
  return (
    <button type={type} disabled={disabled} className={classes} onClick={onClick} >
      {
        icon &&
        <i className={cx({ icon: true, 'only-icon': !children })} >
          { Parser(icon) }
        </i>
      }
      {
        children &&
        <span className={cx('text')}>
          { children }
        </span>
      }
    </button>
  );
};

GhostButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  tiny: PropTypes.bool,
  color: PropTypes.string,
  icon: PropTypes.string,
  type: PropTypes.string,
  onClick: PropTypes.func,
};

GhostButton.defaultProps = {
  children: null,
  disabled: false,
  tiny: false,
  color: 'topaz',
  icon: '',
  type: 'button',
  onClick: () => {},
};

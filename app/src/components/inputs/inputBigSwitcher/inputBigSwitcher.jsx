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
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './inputBigSwitcher.scss';

const cx = classNames.bind(styles);

export const InputBigSwitcher = ({ children, disabled, value, onChange, onFocus, onBlur }) => {
  const classes = cx({
    'switcher-wrapper': true,
    centered: !children,
    disabled,
  });
  const sliderClasses = cx({
    slider: true,
    'turned-on': !!value,
  });
  const handlerOnChange = (e) => {
    onChange(e.target.checked);
  };
  return (
    <label className={cx('input-big-switcher')} onFocus={onFocus} onBlur={onBlur} tabIndex="1">
      <div className={classes}>
        <div className={cx('on')}>
          <FormattedMessage
            id={'Input.switcher'}
            defaultMessage={'ON'}
          />
        </div>
        <div className={cx('off')}>OFF</div>
        <input className={cx('input')} type="checkbox" disabled={disabled} onChange={handlerOnChange} />
        <div className={sliderClasses} />
      </div>
      <span className={cx('children-container')}>{children}</span>
    </label>
  );
};

InputBigSwitcher.propTypes = {
  children: PropTypes.node,
  value: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

InputBigSwitcher.defaultProps = {
  children: '',
  value: false,
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
};

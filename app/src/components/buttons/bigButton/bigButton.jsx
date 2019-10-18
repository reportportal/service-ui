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
import styles from './bigButton.scss';

const cx = classNames.bind(styles);

export const BigButton = ({
  type,
  children,
  disabled,
  className,
  mobileDisabled,
  color,
  roundedCorners,
  onClick,
}) => {
  const classes = cx('big-button', className, {
    'rounded-corners': roundedCorners,
    'mobile-disabled': mobileDisabled,
    disabled,
    [`color-${color}`]: color,
  });

  return (
    <button type={type} disabled={disabled} className={classes} onClick={onClick}>
      {children}
    </button>
  );
};

BigButton.propTypes = {
  children: PropTypes.node,
  mobileDisabled: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  color: PropTypes.string,
  type: PropTypes.string,
  roundedCorners: PropTypes.bool,
  onClick: PropTypes.func,
};

BigButton.defaultProps = {
  children: '',
  mobileDisabled: false,
  className: '',
  disabled: false,
  color: 'booger',
  type: 'button',
  roundedCorners: false,
  onClick: () => {},
};

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
import EyeIcon from 'common/img/newIcons/eye-inline.svg';
import CrossEyeIcon from 'common/img/newIcons/cross-eye-inline.svg';
import styles from './Eye.scss';

const cx = classNames.bind(styles);

export const Eye = ({ disabled, centered, checked, transparentBackground }) => (
  <div
    className={cx('eye', {
      centered,
      disabled,
      'transparent-background': transparentBackground,
    })}
  >
    {checked ? Parser(EyeIcon) : Parser(CrossEyeIcon)}
  </div>
);

Eye.propTypes = {
  disabled: PropTypes.bool,
  centered: PropTypes.bool,
  checked: PropTypes.bool,
  transparentBackground: PropTypes.bool,
};

Eye.defaultProps = {
  disabled: false,
  centered: PropTypes.bool,
  checked: PropTypes.bool,
  transparentBackground: false,
};

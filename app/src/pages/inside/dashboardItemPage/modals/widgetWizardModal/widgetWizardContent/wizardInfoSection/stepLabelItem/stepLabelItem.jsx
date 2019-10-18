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
import styles from './stepLabelItem.scss';

const cx = classNames.bind(styles);

export const StepLabelItem = ({ step, label, active, completed }) => (
  <div className={cx('step-label-item', { active, completed })}>
    <div className={cx('number')}>{step + 1}</div>
    <div className={cx('label')}>{label}</div>
  </div>
);
StepLabelItem.propTypes = {
  step: PropTypes.number,
  label: PropTypes.string,
  active: PropTypes.bool,
  completed: PropTypes.bool,
};
StepLabelItem.defaultProps = {
  step: 0,
  label: '',
  active: false,
  completed: false,
};

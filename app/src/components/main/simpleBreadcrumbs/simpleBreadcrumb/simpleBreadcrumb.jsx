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

import styles from './simpleBreadcrumb.scss';

const cx = classNames.bind(styles);

export const SimpleBreadcrumb = ({ descriptor: { title }, active, onClick }) => (
  <div className={cx('simple-breadcrumb', { active })} onClick={active ? onClick : null}>
    {title}
  </div>
);
SimpleBreadcrumb.propTypes = {
  descriptor: PropTypes.object.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};
SimpleBreadcrumb.defaultProps = {
  active: false,
  onClick: () => {},
};

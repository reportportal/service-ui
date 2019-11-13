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
import { NavLink } from 'components/main/navLink';

import styles from './linkItem.scss';

const cx = classNames.bind(styles);

export const LinkItem = ({ link, active, title, onClick }) =>
  !active ? (
    <NavLink className={cx('link')} to={link} onClick={onClick}>
      {title}
    </NavLink>
  ) : (
    <span>{title}</span>
  );
LinkItem.propTypes = {
  link: PropTypes.object.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};
LinkItem.defaultProps = {
  active: false,
  onClick: () => {},
};

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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useTracking } from 'react-tracking';
import { NavLink } from 'components/main/navLink';
import styles from './navMenu.scss';

const cx = classNames.bind(styles);

export function NavMenu({ items }) {
  const { trackEvent } = useTracking();
  const createTrackingFunction = (eventInfo) => (eventInfo ? () => trackEvent(eventInfo) : null);

  return (
    <ul className={cx('menu')}>
      {items &&
        Object.keys(items).map((key) => (
          <NavLink
            to={items[key].link}
            key={key}
            onClick={createTrackingFunction(items[key].eventInfo)}
            className={cx('item')}
            activeClassName={cx('active')}
          >
            {items[key].name}
          </NavLink>
        ))}
    </ul>
  );
}
NavMenu.propTypes = {
  items: PropTypes.objectOf(
    PropTypes.shape({
      name: PropTypes.string,
      link: PropTypes.object,
      component: PropTypes.node,
      eventInfo: PropTypes.object,
      mobileDisabled: PropTypes.bool,
    }),
  ).isRequired,
};

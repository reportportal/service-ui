/*
 * Copyright 2024 EPAM Systems
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

import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { NavLink } from 'components/main/navLink';
import Link from 'redux-first-router-link';
import Parser from 'html-react-parser';
import styles from './sidebarButton.scss';

const cx = classNames.bind(styles);

export const SidebarButton = ({
  icon,
  onClick,
  message,
  link,
  isNav,
  secondaryMessage,
  iconColors,
}) => {
  const { hover, pressed } = iconColors;
  const inlineStyles = { '--icon-color-hover': hover, '--icon-color-pressed': pressed };

  const linkBody = (
    <>
      <i className={cx('btn-icon')}>{Parser(icon)}</i>
      <div className={cx('title-container')}>
        <span className={cx('title')}>{message}</span>
        {secondaryMessage && <span className={cx('sub-title')}>{secondaryMessage}</span>}
      </div>
    </>
  );

  return (
    <>
      {isNav ? (
        <NavLink
          to={link}
          className={cx('sidebar-button')}
          activeClassName={cx('active')}
          onClick={onClick}
          style={inlineStyles}
        >
          {linkBody}
        </NavLink>
      ) : (
        <Link to={link} className={cx('sidebar-button')} onClick={onClick} style={inlineStyles}>
          {linkBody}
        </Link>
      )}
    </>
  );
};

SidebarButton.propTypes = {
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  link: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  isNav: PropTypes.bool,
  secondaryMessage: PropTypes.string,
  iconColors: PropTypes.shape({
    hover: PropTypes.string,
    pressed: PropTypes.string,
  }),
};

SidebarButton.defaultProps = {
  isNav: true,
  secondaryMessage: '',
  iconColors: {
    hover: '',
    pressed: '',
  },
};

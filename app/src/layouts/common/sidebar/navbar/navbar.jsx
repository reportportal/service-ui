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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { useIntl, defineMessages } from 'react-intl';
import { SidebarButton } from 'components/buttons/sidebarButton/sidebarButton';
import { referenceDictionary } from 'common/utils';
import LogoTextIcon from '../img/logo-text-icon-inline.svg';
import { OrganizationsControlWithPopover } from '../organizationsControl';
import { UserControlWithPopover } from '../userControl';
import styles from './navbar.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  privacyPolicy: {
    id: 'Navbar.privacyPolicy',
    defaultMessage: 'Privacy Policy',
  },
});

export const Navbar = ({ active, topSidebarItems, closeNavbar }) => {
  const { formatMessage } = useIntl();

  const classes = cx('navbar', {
    active,
  });

  return (
    <div className={classes}>
      <div className={cx('logo-text-wrapper')}>
        <i className={cx('logo-text')}>{Parser(LogoTextIcon)}</i>
      </div>
      <OrganizationsControlWithPopover closeNavbar={closeNavbar} test={10} />
      <div className={cx('top-block')}>
        {topSidebarItems.map((item) => (
          <div
            key={item.component ? item.name : item.link.type}
            className={cx('navbar-btn')}
            onClick={() => {
              item.onClick();
              closeNavbar();
            }}
            role="button"
            tabIndex={0}
          >
            {item.component || (
              <SidebarButton link={item.link} isNavbar>
                {item.message}
              </SidebarButton>
            )}
          </div>
        ))}
      </div>
      <div className={cx('bottom-block')}>
        <div className={cx('policy-block')}>
          <a href={referenceDictionary.rpEpamPolicy} target="_blank">
            {formatMessage(messages.privacyPolicy)}
          </a>
        </div>
        <UserControlWithPopover closeNavbar={closeNavbar} />
      </div>
    </div>
  );
};

Navbar.propTypes = {
  active: PropTypes.bool,
  topSidebarItems: PropTypes.array,
  closeNavbar: PropTypes.func.isRequired,
};

Navbar.defaultProps = {
  active: false,
  topSidebarItems: [],
};

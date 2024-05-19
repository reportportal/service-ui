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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { referenceDictionary } from 'common/utils';
import { useIntl, defineMessages } from 'react-intl';
import { Sidebar } from 'componentLibrary/sidebar';
import { ServiceWithPopover } from 'layouts/common/appSidebar/helpAndService';
import LogoHelp from 'common/img/help-inline.svg';
import { useSelector } from 'react-redux';
import { userIdSelector } from 'controllers/user';
import { getFAQOpenStatus } from 'controllers/log/storageUtils';
import Parser from 'html-react-parser';
import LogoBlockIcon from './img/logo-icon-inline.svg';
import LogoControlIcon from './img/logo-text-icon-inline.svg';
import { UserAvatar } from './userAvatar';
import { UserControlWithPopover } from './userControl';
import styles from './appSidebar.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  privacyPolicy: {
    id: 'AppSidebar.privacyPolicy',
    defaultMessage: 'Privacy Policy',
  },
});

export const AppSidebar = ({
  createMainBlock,
  createMainControlBlock,
  topSidebarItems,
  bottomSidebarItems,
  topSidebarControlItems,
  bottomSidebarControlItems,
  isOpenOrganizationPopover,
}) => {
  const userId = useSelector(userIdSelector);
  const [isFAQOpened, setIsFAQOpened] = useState(!!getFAQOpenStatus(userId));

  const { formatMessage } = useIntl();
  const [isOpenAvatarPopover, setIsOpenAvatarPopover] = useState(false);
  const [isOpenSupportPopover, setIsOpenSupportPopover] = useState(false);
  const [isHoveredUser, setIsHoveredUser] = useState(false);
  const [isHoveredService, setIsHoveredService] = useState(false);

  const onHoverUser = () => {
    setIsHoveredUser(true);
  };

  const onClearUser = () => {
    setIsHoveredUser(false);
  };
  const onHoverService = () => {
    setIsHoveredService(true);
  };

  const onClearService = () => {
    setIsHoveredService(false);
  };

  const createFooterBlock = (openNavbar) => (
    <>
      <div className={cx('policy-block')} />
      <button
        className={cx('service-block', { 'active-tooltip': !isFAQOpened })}
        onClick={() => {
          openNavbar();
          setIsOpenSupportPopover(!isOpenSupportPopover);
        }}
        onMouseEnter={onHoverService}
        onMouseLeave={onClearService}
      >
        <i>{Parser(LogoHelp)}</i>
      </button>
      <UserAvatar
        onClick={() => {
          openNavbar();
          setIsOpenAvatarPopover(!isOpenAvatarPopover);
        }}
        onHoverUser={onHoverUser}
        onClearUser={onClearUser}
        isHoveredUser={isHoveredUser}
      />
    </>
  );

  const createFooterControlBlock = (onCloseNavbar) => (
    <>
      <div className={cx('policy-control')}>
        <a href={referenceDictionary.rpEpamPolicy} target="_blank">
          {formatMessage(messages.privacyPolicy)}
        </a>
      </div>
      <div className={cx('service-control', { hover: isHoveredService })}>
        <ServiceWithPopover
          closeNavbar={onCloseNavbar}
          isOpenPopover={isOpenSupportPopover}
          togglePopover={setIsOpenSupportPopover}
          isFAQOpened={isFAQOpened}
          onFAQOpen={setIsFAQOpened}
        />
      </div>
      <div className={cx('user-control', { hover: isHoveredUser })}>
        <UserControlWithPopover
          closeNavbar={onCloseNavbar}
          isOpenPopover={isOpenAvatarPopover}
          togglePopover={setIsOpenAvatarPopover}
        />
      </div>
    </>
  );

  return (
    <Sidebar
      logoBlockIcon={LogoBlockIcon}
      logoControlIcon={LogoControlIcon}
      createMainBlock={createMainBlock}
      createMainControlBlock={createMainControlBlock}
      topSidebarItems={topSidebarItems}
      topSidebarControlItems={topSidebarControlItems}
      bottomSidebarItems={bottomSidebarItems}
      bottomSidebarControlItems={bottomSidebarControlItems}
      createFooterControlBlock={createFooterControlBlock}
      createFooterBlock={createFooterBlock}
      shouldBeCollapsedOnLeave={
        !(isOpenAvatarPopover || isOpenOrganizationPopover || isOpenSupportPopover)
      }
    />
  );
};

AppSidebar.propTypes = {
  topSidebarItems: PropTypes.array,
  bottomSidebarItems: PropTypes.array,
  topSidebarControlItems: PropTypes.array,
  bottomSidebarControlItems: PropTypes.array,
  createMainControlBlock: PropTypes.func,
  createMainBlock: PropTypes.func,
  isOpenOrganizationPopover: PropTypes.bool,
};

AppSidebar.defaultProps = {
  topSidebarItems: [],
  bottomSidebarItems: [],
  topSidebarControlItems: [],
  bottomSidebarControlItems: [],
  isOpenOrganizationPopover: false,
  createMainControlBlock: () => {},
  createMainBlock: () => {},
};

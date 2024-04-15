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
}) => {
  const { formatMessage } = useIntl();
  const [isOpenAvatarPopover, setIsOpenAvatarPopover] = useState(false);
  const [isHoveredUser, setIsHoveredUser] = useState(false);

  const onHoverUser = () => {
    setIsHoveredUser(true);
  };

  const onClearUser = () => {
    setIsHoveredUser(false);
  };

  const createFooterBlock = (openNavbar) => (
    <>
      <div className={cx('policy-block')} />
      <UserAvatar
        onClick={() => {
          openNavbar();
          setIsOpenAvatarPopover(true);
        }}
        onHoverUser={onHoverUser}
        onClearUser={onClearUser}
        isHoveredUser={isHoveredUser}
      />
    </>
  );

  const createFooterControlBlock = (onCloseNavbar, setIsOpenPopover, sidebarRef) => (
    <>
      <div className={cx('policy-control')}>
        <a href={referenceDictionary.rpEpamPolicy} target="_blank">
          {formatMessage(messages.privacyPolicy)}
        </a>
      </div>
      <div className={cx('user-control', { hover: isHoveredUser })}>
        <UserControlWithPopover
          closeNavbar={onCloseNavbar}
          setIsOpenPopover={setIsOpenPopover}
          isOpenPopover={isOpenAvatarPopover}
          closePopover={() => setIsOpenAvatarPopover(false)}
          wrapperParentRef={sidebarRef}
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
};

AppSidebar.defaultProps = {
  topSidebarItems: [],
  bottomSidebarItems: [],
  topSidebarControlItems: [],
  bottomSidebarControlItems: [],
  createMainControlBlock: () => {},
  createMainBlock: () => {},
};

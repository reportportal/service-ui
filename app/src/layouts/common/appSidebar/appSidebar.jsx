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

import { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { referenceDictionary } from 'common/utils';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { useSelector } from 'react-redux';
import { Sidebar } from 'componentLibrary/sidebar';
import { userIdSelector } from 'controllers/user';
import { getFAQOpenStatus } from './utils';
import { ServiceWithPopover } from './helpAndService';
import LogoLeftIcon from './img/logo-icon-inline.svg';
import LogoRightIcon from './img/logo-text-icon-inline.svg';
import OpenOutsideIcon from './img/open-outside-inline.svg';
import { UserControlWithPopover } from './userControl';
import { messages } from './messages';
import styles from './appSidebar.scss';

const cx = classNames.bind(styles);

export const AppSidebar = ({ createMainBlock, topSidebarItems, isOpenOrganizationPopover }) => {
  const userId = useSelector(userIdSelector);
  const [isFaqTouched, setIsFaqTouched] = useState(!!getFAQOpenStatus(userId));

  const { formatMessage } = useIntl();
  const [isOpenAvatarPopover, setIsOpenAvatarPopover] = useState(false);
  const [isOpenSupportPopover, setIsOpenSupportPopover] = useState(false);

  const createFooterBlock = (openSidebar, closeSidebar) => (
    <>
      <div className={cx('policy-block')}>
        <a
          className={cx('policy-block-link')}
          href={referenceDictionary.rpEpamPolicy}
          target="_blank"
        >
          {formatMessage(messages.privacyPolicy)}
          <i className={cx('policy-block-icon')}>{Parser(OpenOutsideIcon)}</i>
        </a>
      </div>
      <ServiceWithPopover
        closeSidebar={closeSidebar}
        isOpenPopover={isOpenSupportPopover}
        togglePopover={setIsOpenSupportPopover}
        isFaqTouched={isFaqTouched}
        onOpen={setIsFaqTouched}
        title={formatMessage(messages.helpAndServiceVersions)}
        onClick={() => {
          openSidebar();
          setIsOpenSupportPopover(!isOpenSupportPopover);
        }}
      />
      <UserControlWithPopover
        closeSidebar={closeSidebar}
        isOpenPopover={isOpenAvatarPopover}
        togglePopover={setIsOpenAvatarPopover}
        onClick={() => {
          openSidebar();
          setIsOpenAvatarPopover(!isOpenAvatarPopover);
        }}
      />
    </>
  );

  return (
    <Sidebar
      logoLeftIcon={LogoLeftIcon}
      logoRightIcon={LogoRightIcon}
      createMainBlock={createMainBlock}
      topSidebarItems={topSidebarItems}
      createFooterBlock={createFooterBlock}
      shouldBeCollapsedOnLeave={
        !(isOpenAvatarPopover || isOpenOrganizationPopover || isOpenSupportPopover)
      }
    />
  );
};

AppSidebar.propTypes = {
  topSidebarItems: PropTypes.array,
  isOpenOrganizationPopover: PropTypes.bool,
  createMainBlock: PropTypes.func,
};

AppSidebar.defaultProps = {
  topSidebarItems: [],
  isOpenOrganizationPopover: false,
  createMainBlock: () => {},
};

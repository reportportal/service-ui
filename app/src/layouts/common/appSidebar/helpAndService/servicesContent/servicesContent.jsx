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
import { FormattedMessage, useIntl } from 'react-intl';
import { API_PAGE } from 'controllers/pages';
import React, { useState } from 'react';
import { referenceDictionary, uniqueId } from 'common/utils';
import { LinkItem } from 'layouts/common/appSidebar/helpAndService/linkItem/linkItem';
import { FAQWithPopover } from '../FAQpreview';
import styles from './servicesContent.scss';
import { messages } from '../messages';

const cx = classNames.bind(styles);

export const ServicesContent = ({ closePopover, closeNavbar, isFAQOpened, onFAQOpen }) => {
  const [isHovered, setIsHovered] = useState(false);

  const onClearHover = () => {
    setIsHovered(false);
  };

  const onSetHover = () => {
    setIsHovered(true);
  };
  const ServiceContentItems = [
    {
      linkTo: referenceDictionary.rpDoc,
      message: (
        <FormattedMessage id={'Sidebar.footer.documentation'} defaultMessage={'Documentation'} />
      ),
    },
    {
      isInternal: true,
      linkTo: { type: API_PAGE },
      message: <FormattedMessage id={'Sidebar.footer.api'} defaultMessage={'OpenAPI'} />,
    },
    {
      linkTo: referenceDictionary.rpGitHub,
      message: <FormattedMessage id={'Sidebar.footer.github'} defaultMessage={'GitHub'} />,
    },
    {
      linkTo: referenceDictionary.rpSlack,
      message: <FormattedMessage id={'Sidebar.footer.slack'} defaultMessage={'Slack'} />,
    },
    {
      linkTo: referenceDictionary.rpEmail,
      message: <FormattedMessage id={'Sidebar.footer.contactUs'} defaultMessage={'Contact us'} />,
    },
    {
      linkTo: referenceDictionary.rpEpam,
      message: <FormattedMessage id={'Sidebar.footer.epam'} defaultMessage={'EPAM'} />,
    },
  ];
  const { formatMessage } = useIntl();
  const currentYear = new Date().getFullYear();
  return (
    <>
      <button
        className={cx('FAQ-control', { hover: isHovered })}
        onMouseLeave={onClearHover}
        onMouseEnter={onSetHover}
      >
        <FAQWithPopover
          closeNavbar={closeNavbar}
          closePopover={closePopover}
          isFAQOpened={isFAQOpened}
          onFAQOpen={onFAQOpen}
        />
      </button>

      {ServiceContentItems.map((contentItem) => {
        return (
          <LinkItem
            link={contentItem.linkTo}
            content={contentItem.message}
            onClick={() => {
              closePopover();
              closeNavbar();
            }}
            className={cx('menu-item')}
            isInternal={contentItem.isInternal}
            activeClassName={cx('active')}
            key={`service-${uniqueId()}`}
          />
        );
      })}

      <div className={cx('divider')} />

      <p className={cx('menu-item')}>
        <FormattedMessage
          id={'Sidebar.services.versions'}
          defaultMessage={'Versions of connected services'}
        />
      </p>
      <p className={cx('menu-item', 'rights')}>{formatMessage(messages.rights, { currentYear })}</p>
    </>
  );
};

ServicesContent.propTypes = {
  closePopover: PropTypes.func.isRequired,
  closeNavbar: PropTypes.func.isRequired,
  isFAQOpened: PropTypes.bool.isRequired,
  onFAQOpen: PropTypes.func.isRequired,
};

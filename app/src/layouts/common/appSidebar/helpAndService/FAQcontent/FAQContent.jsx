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
import OpenIcon from 'common/img/open-in-new-tab-inline.svg';
import React from 'react';
import { referenceDictionary, uniqueId } from 'common/utils';
import { showModalAction } from 'controllers/modal';
import { useDispatch, useSelector } from 'react-redux';
import { userIdSelector } from 'controllers/user';
import { setFAQOpenStatusTrue } from 'controllers/log/storageUtils';
import { messages } from 'layouts/common/appSidebar/helpAndService/messages';
import { LinkItem } from 'layouts/common/appSidebar/helpAndService/linkItem/linkItem';
import { referenceFAQDictionary } from 'common/utils/referenceDictionary';
import styles from './FAQContent.scss';

const cx = classNames.bind(styles);

export const FAQContent = ({ onFAQOpen, closeNavbar, closePopover }) => {
  const { formatMessage } = useIntl();
  onFAQOpen(true);
  const userId = useSelector(userIdSelector);
  setFAQOpenStatusTrue(userId);
  const dispatch = useDispatch();

  const FAQContentItems = [
    {
      linkTo: referenceFAQDictionary.configureReportingFAQ,
      message: messages.configureReporting,
    },
    {
      linkTo: referenceFAQDictionary.improvePerformanceFAQ,
      message: messages.improvePerformance,
    },
    {
      linkTo: referenceFAQDictionary.configureAnalyzerFAQ,
      message: messages.configureAnalyzer,
    },
    {
      linkTo: referenceFAQDictionary.integrateJiraFAQ,
      message: messages.integrateJira,
    },
    {
      linkTo: referenceFAQDictionary.configureCertificateFAQ,
      message: messages.configureCertificate,
    },
    {
      linkTo: referenceFAQDictionary.fileStorageOptionsFAQ,
      message: messages.fileStorageOptions,
    },
    {
      linkTo: referenceFAQDictionary.pricingOptionsFAQ,
      message: messages.pricingOptions,
    },
  ];
  const openModal = () => {
    closePopover();
    closeNavbar();
    dispatch(
      showModalAction({
        id: 'requestSupportModal',
      }),
    );
  };

  const furtherAssistanceValues = {
    support: (
      <LinkItem
        link={referenceDictionary.rpEmail}
        content={formatMessage(messages.supportTeam)}
        icon={OpenIcon}
        className={cx('inline-ref')}
      />
    ),
    channel: (
      <LinkItem
        link={referenceDictionary.rpSlack}
        content={formatMessage(messages.slackChannel)}
        className={cx('inline-ref')}
        icon={OpenIcon}
      />
    ),
  };
  return (
    <>
      {FAQContentItems.map((contentItem) => {
        return (
          <LinkItem
            link={contentItem.linkTo}
            content={formatMessage(contentItem.message)}
            className={cx('menu-item')}
            onClick={() => {
              closePopover();
              closeNavbar();
            }}
            key={`faq-${uniqueId()}`}
          />
        );
      })}
      <p className={cx('assistance')}>
        {formatMessage(messages.furtherAssistance, {
          support: () => furtherAssistanceValues.support,
          channel: () => furtherAssistanceValues.channel,
        })}
      </p>
      <div className={cx('divider')} />
      <button className={cx('menu-item')} onClick={openModal}>
        <FormattedMessage
          id={'Sidebar.services.requestService'}
          defaultMessage={'Request professional service'}
        />
      </button>
    </>
  );
};

FAQContent.propTypes = {
  onFAQOpen: PropTypes.func.isRequired,
  closeNavbar: PropTypes.func.isRequired,
  closePopover: PropTypes.func.isRequired,
};

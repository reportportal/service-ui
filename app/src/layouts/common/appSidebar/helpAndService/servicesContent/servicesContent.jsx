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
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import {
  API_PAGE_INSTANCE_LEVEL,
  API_PAGE_ORGANIZATION_LEVEL,
  API_PAGE_PROJECT_LEVEL,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
} from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { referenceDictionary } from 'common/utils';
import { useEffect, useState } from 'react';
import fetchJsonp from 'fetch-jsonp';
import { useTracking } from 'react-tracking';
import { HELP_AND_SERVICE_VERSIONS_EVENTS } from 'analyticsEvents/helpAndServiceVersionsEvents';
import { LinkItem } from '../linkItem';
import { FAQWithPopover } from '../index';
import styles from './servicesContent.scss';
import { messages } from '../../messages';

const cx = classNames.bind(styles);

export const ServicesContent = ({ closePopover, closeSidebar, isFaqTouched, onOpen }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const [latestServiceVersions, setLatestServiceVersions] = useState({});

  const currentYear = new Date().getFullYear();

  const getApiLink = () => {
    if (projectSlug && organizationSlug) {
      return {
        type: API_PAGE_PROJECT_LEVEL,
        payload: { organizationSlug, projectSlug },
      };
    }

    if (organizationSlug) {
      return {
        type: API_PAGE_ORGANIZATION_LEVEL,
        payload: { organizationSlug },
      };
    }

    return {
      type: API_PAGE_INSTANCE_LEVEL,
    };
  };

  const ServiceContentItems = [
    {
      linkTo: referenceDictionary.rpDoc,
      message: messages.documentation,
    },
    {
      isInternal: true,
      linkTo: getApiLink(),
      message: messages.openAPI,
    },
    {
      linkTo: referenceDictionary.rpGitHub,
      message: messages.github,
    },
    {
      linkTo: referenceDictionary.rpSlack,
      message: messages.slack,
    },
    {
      linkTo: referenceDictionary.rpEmail,
      message: messages.contactUs,
    },
    {
      linkTo: referenceDictionary.rpEpam,
      message: messages.epam,
    },
  ];

  useEffect(() => {
    fetchJsonp('https://status.reportportal.io/versions', {
      jsonpCallback: 'jsonp',
    })
      .then((res) => res.json())
      .then((latestVersions) => setLatestServiceVersions(latestVersions));
  }, []);

  const openModal = () => {
    closePopover();
    closeSidebar();
    dispatch(
      showModalAction({
        id: 'versionsOfConnectedServicesModal',
        data: {
          latestServiceVersions,
        },
      }),
    );
    const linkName = messages.servicesVersions.defaultMessage;
    trackEvent(HELP_AND_SERVICE_VERSIONS_EVENTS.onClickPopoverItem(linkName));
  };

  return (
    <>
      <FAQWithPopover
        closeSidebar={closeSidebar}
        closePopover={closePopover}
        isFaqTouched={isFaqTouched}
        onOpen={onOpen}
        title={formatMessage(messages.FAQ)}
      />

      {ServiceContentItems.map((contentItem) => (
        <LinkItem
          link={contentItem.linkTo}
          content={formatMessage(contentItem.message)}
          onClick={() => {
            closePopover();
            closeSidebar();
            const linkName = contentItem.message.defaultMessage;
            trackEvent(HELP_AND_SERVICE_VERSIONS_EVENTS.onClickPopoverItem(linkName));
          }}
          className={cx('menu-item')}
          isInternal={contentItem.isInternal}
          activeClassName={cx('active')}
          key={contentItem.linkTo.type || contentItem.linkTo}
        />
      ))}
      <LinkItem
        className={cx('menu-item', 'with-divider')}
        onClick={openModal}
        content={formatMessage(messages.servicesVersions)}
      />
      <p className={cx('menu-item', 'rights')}>{formatMessage(messages.rights, { currentYear })}</p>
    </>
  );
};

ServicesContent.propTypes = {
  closePopover: PropTypes.func.isRequired,
  closeSidebar: PropTypes.func.isRequired,
  isFaqTouched: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
};

/*
 * Copyright 2025 EPAM Systems
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
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { ChevronDownDropdownIcon } from '@reportportal/ui-kit';

import { HelpPanel } from 'pages/inside/common/helpPanel';
import discoverPluginsIcon from 'common/img/discover-icon-inline.svg';
import openInNewTabIcon from 'common/img/open-in-new-tab-inline.svg';

import { PRODUCT_VERSION_TAB_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { DOCUMENTATION } from 'pages/inside/productVersionPage/constants';
import Link from 'redux-first-router-link';
import styles from './content.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);

export const Content = ({ versions }) => {
  const { formatMessage, formatDate } = useIntl();
  const { organizationSlug, projectSlug } = useSelector(urlOrganizationAndProjectSelector);

  const infoItems = [
    {
      title: formatMessage(messages.productVersionWorkTitle),
      mainIcon: discoverPluginsIcon,
      description: formatMessage(messages.productVersionWorkDescription),
      openIcon: openInNewTabIcon,
      automationId: 'productVersionWorkLink',
      link: 'https://reportportal.io/docs/',
    },
    {
      title: formatMessage(messages.manageProductVersionsTitle),
      mainIcon: discoverPluginsIcon,
      description: formatMessage(messages.manageProductVersionsDescription),
      openIcon: openInNewTabIcon,
      automationId: 'manageProductVersionLink',
      link: 'https://reportportal.io/docs/',
    },
    {
      title: formatMessage(messages.linkToTestCaseVersionTitle),
      mainIcon: discoverPluginsIcon,
      description: formatMessage(messages.linkToTestCaseVersionDescription),
      openIcon: openInNewTabIcon,
      automationId: 'testCaseVersionLink',
      link: 'https://reportportal.io/docs/',
    },
  ];

  return (
    <>
      <div className={cx('content-list')}>
        {versions.map(({ productVersion, timestamp }) => (
          <Link
            to={{
              type: PRODUCT_VERSION_TAB_PAGE,
              payload: {
                productVersionId: productVersion,
                projectSlug,
                productVersionTab: DOCUMENTATION,
                organizationSlug,
              },
            }}
            className={cx('content-list__item')}
            key={productVersion}
          >
            <div className={cx('content-list__item-title')}>{productVersion}</div>
            <div className={cx('content-list__item-timestamp')}>
              {formatMessage(messages.lastUpdatedDate, {
                date: formatDate(timestamp, {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                }),
              })}
            </div>
            <ChevronDownDropdownIcon />
          </Link>
        ))}
      </div>
      <HelpPanel items={infoItems} />
    </>
  );
};

Content.propTypes = {
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      productVersion: PropTypes.string,
      timestamp: PropTypes.object,
    }),
  ).isRequired,
};

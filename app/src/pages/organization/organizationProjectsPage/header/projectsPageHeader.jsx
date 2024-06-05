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

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { PROJECTS_PAGE } from 'controllers/pages';
import { activeOrganizationSelector } from 'controllers/organizations';
import searchIcon from 'common/img/newIcons/search-outline-inline.svg';
import filterIcon from 'common/img/newIcons/filters-outline-inline.svg';
import plusIcon from 'common/img/plus-button-inline.svg';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { Button } from 'componentLibrary/button';
import { messages } from '../messages';
import styles from './projectsPageHeader.scss';

const cx = classNames.bind(styles);

export const ProjectsPageHeader = ({ hasPermission }) => {
  const { formatMessage } = useIntl();
  const organization = useSelector(activeOrganizationSelector);

  const orgName = organization.name;
  const isNotEmpty = organization.relationships?.projects?.meta.count > 0;

  const breadcrumbs = [
    {
      title: formatMessage(messages.allOrganizations),
      link: { type: PROJECTS_PAGE },
    },
    {
      title: orgName,
    },
  ];

  return (
    <div className={cx('projects-page-header-container')}>
      <div className={cx('top-breadcrumbs')}>
        <Breadcrumbs descriptors={breadcrumbs} />
      </div>
      <div className={cx('header')}>
        <span className={cx('title')}>{orgName}</span>
        <div className={cx('actions')}>
          {isNotEmpty && (
            <div className={cx('icons')}>
              <i className={cx('search-icon')}>{Parser(searchIcon)}</i>
              <i className={cx('filters-icon')}>{Parser(filterIcon)}</i>
            </div>
          )}
          {isNotEmpty && hasPermission && (
            <Button variant={'text'} customClassName={cx('button')} startIcon={plusIcon}>
              {formatMessage(messages.createProject)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
ProjectsPageHeader.propTypes = {
  hasPermission: PropTypes.bool,
};
ProjectsPageHeader.defaultProps = {
  hasPermission: false,
};

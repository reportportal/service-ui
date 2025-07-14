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

import classNames from 'classnames/bind';
import { InputFilter } from 'components/inputs/inputFilter';
import { FilterEntitiesURLContainer } from 'components/filterEntities/containers';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { ACTIVITIES } from 'components/filterEntities/constants';
import { activeOrganizationNameSelector } from 'controllers/organization';
import {
  ORGANIZATION_PROJECTS_PAGE,
  ORGANIZATIONS_PAGE,
  urlOrganizationSlugSelector,
} from 'controllers/pages';
import { ADMIN_EVENT_MONITORING_PAGE_EVENTS } from 'components/main/analytics/events';
import { defineMessages, useIntl } from 'react-intl';
import { EventsEntities } from '../eventsEntities';
import styles from './eventsToolbar.scss';
import { useSelector } from 'react-redux';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'administrateEventsPageToolbar.searchPlaceholder',
    defaultMessage: 'Search by user, action, object type, object name',
  },
  allOrganizations: {
    id: 'administrateEventsPageToolbar.allOrganizations',
    defaultMessage: 'All organizations',
  },
  activity: {
    id: 'administrateEventsPageToolbar.activity',
    defaultMessage: 'Activity',
  },
});

const cx = classNames.bind(styles);

export const EventsToolbar = () => {
  const { formatMessage } = useIntl();
  const organizationName = useSelector(activeOrganizationNameSelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);

  const breadcrumbs = [
    {
      title: formatMessage(messages.allOrganizations),
      link: { type: ORGANIZATIONS_PAGE },
    },
    {
      title: organizationName,
      link: { type: ORGANIZATION_PROJECTS_PAGE, payload: { organizationSlug } },
    },
    {
      title: formatMessage(messages.activity),
    },
  ];

  return (
    <div className={cx('events-toolbar')}>
      <div className={cx('top-breadcrumbs')}>
        <Breadcrumbs descriptors={breadcrumbs} />
      </div>
      <div className={cx('filter')}>
        <FilterEntitiesURLContainer
          debounced={false}
          render={({ entities, onChange }) => (
            <InputFilter
              id={ACTIVITIES}
              entitiesProvider={EventsEntities}
              filterValues={entities}
              onChange={onChange}
              eventsInfo={ADMIN_EVENT_MONITORING_PAGE_EVENTS}
              placeholder={formatMessage(messages.searchPlaceholder)}
            />
          )}
        />
      </div>
    </div>
  );
};

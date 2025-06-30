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

import { FC } from 'react';
import { DropdownSorting } from 'components/dropdownSorting';
import {
  NAMESPACE,
  ORGANIZATIONS_DEFAULT_SORT_COLUMN,
  SORTING_KEY,
  SortingFields,
} from 'controllers/instance/organizations/constants';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { SortingDirection, WithSortingURLProps } from 'controllers/sorting/types';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { messages } from './messages';

interface OrganizationsSortingWrappedProps {
  sortingColumn: string;
  sortingDirection: SortingDirection;
  onChangeSorting: (field: string) => void;
}

const OrganizationsSortingWrapped: FC<OrganizationsSortingWrappedProps> = ({
  sortingColumn,
  sortingDirection,
  onChangeSorting,
}: OrganizationsSortingWrappedProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const sortingOptions = [
    { value: SortingFields.CREATED_AT, label: formatMessage(messages.creationDate) },
    { value: SortingFields.NAME, label: formatMessage(messages.name) },
    { value: SortingFields.USERS, label: formatMessage(messages.users) },
    { value: SortingFields.PROJECTS, label: formatMessage(messages.projects) },
    { value: SortingFields.LAST_LAUNCH_DATE, label: formatMessage(messages.lastLaunchDate) },
  ];

  const handleChangeSorting = ({ value }: { value: string }) => {
    onChangeSorting(value);
    trackEvent(ORGANIZATION_PAGE_EVENTS.organizationsSorting(value));
  };

  return (
    <DropdownSorting
      options={sortingOptions}
      value={sortingColumn}
      direction={sortingDirection}
      onChange={handleChangeSorting}
    />
  );
};

const sortingProps: WithSortingURLProps = {
  defaultFields: [ORGANIZATIONS_DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: NAMESPACE,
  namespaceSelector: null,
};

export const OrganizationsSorting = withSortingURL(sortingProps)(OrganizationsSortingWrapped);

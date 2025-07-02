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

import { Button, ExportIcon } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { URLS } from 'common/urls';
import { downloadFile } from 'common/utils/downloadFile';
import { prepareQueryFilters } from 'components/filterEntities/utils';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { LAST_RUN_DATE_FILTER_NAME } from 'components/main/filterButton';
import { querySelector } from 'controllers/instance/organizations/selectors';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { ApiError, QueryParams } from 'types/common';
import { showDefaultErrorNotification, showSuccessNotification } from 'controllers/notification';
import { ORGANIZATIONS_EXPORT_LIMIT } from './constants';

interface OrganizationsExportProps {
  appliedFiltersCount: number;
}

const messages = defineMessages({
  startExport: {
    id: 'OrganizationsPage.startExport',
    defaultMessage: 'Export has been started successfully',
  },
});

export const OrganizationsExport = ({ appliedFiltersCount }: OrganizationsExportProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const query = useSelector(querySelector) as QueryParams;

  const handleClick = () => {
    const filtersParams: QueryParams = { ...query, offset: 0, limit: ORGANIZATIONS_EXPORT_LIMIT };
    const data = prepareQueryFilters(filtersParams, LAST_RUN_DATE_FILTER_NAME);
    const requestParams = {
      method: 'post',
      data,
      headers: {
        Accept: 'text/csv',
      },
    };

    dispatch(showSuccessNotification({ message: formatMessage(messages.startExport) }));
    trackEvent(ORGANIZATION_PAGE_EVENTS.export(appliedFiltersCount));

    downloadFile(URLS.organizationSearches(), requestParams).catch(({ message }: ApiError) => {
      dispatch(showDefaultErrorNotification({ message }));
    });
  };

  return (
    <Button variant="text" adjustWidthOn="content" icon={<ExportIcon />} onClick={handleClick}>
      {formatMessage(COMMON_LOCALE_KEYS.EXPORT)}
    </Button>
  );
};

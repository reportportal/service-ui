/*!
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

import { useSelector } from 'react-redux';
import { userRolesSelector } from 'controllers/pages';
import { canCreateOrganization } from 'common/utils/permissions';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { BubblesLoader, PlusIcon } from '@reportportal/ui-kit';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { EmptyPageState } from 'pages/common/emptyPageState';
import {
  organizationsListLoadingSelector,
  organizationsListSelector,
} from 'controllers/organizations';
import EmptyIcon from './img/empty-organizations-inline.svg';
import { messages } from './messages';
import styles from './organizationsPage.scss';
import { OrganizationsPageHeader } from './organizationsPageHeader';
import { OrganizationsPanelView } from './organizationsPanelView';

const cx = classNames.bind(styles);

export const OrganizationsPage = () => {
  const { formatMessage } = useIntl();
  const userRoles = useSelector(userRolesSelector);
  const hasPermission = canCreateOrganization(userRoles);
  const organizationsList = useSelector(organizationsListSelector);
  const isOrganizationsLoading = useSelector(organizationsListLoadingSelector);
  const isEmptyOrganizations = organizationsList.length === 0;

  const getEmptyPageState = () =>
    isOrganizationsLoading ? (
      <div className={cx('loader')}>
        <BubblesLoader />
      </div>
    ) : (
      <EmptyPageState
        hasPermission={hasPermission}
        emptyIcon={EmptyIcon}
        icon={<PlusIcon />}
        label={formatMessage(
          hasPermission ? messages.noOrganizationsYet : messages.noOrganizationsAvailableYet,
        )}
        description={formatMessage(
          hasPermission ? messages.createNewOrganization : messages.description,
        )}
        buttonTitle={formatMessage(messages.createOrganization)}
      />
    );

  return (
    <ScrollWrapper autoHeightMax={100}>
      <div className={cx('organizations-page')}>
        <OrganizationsPageHeader
          hasPermission={hasPermission}
          title={formatMessage(messages.title)}
          isNotEmpty={!isEmptyOrganizations}
        />
        {isEmptyOrganizations ? (
          getEmptyPageState()
        ) : (
          <OrganizationsPanelView organizationsList={organizationsList} />
        )}
      </div>
    </ScrollWrapper>
  );
};

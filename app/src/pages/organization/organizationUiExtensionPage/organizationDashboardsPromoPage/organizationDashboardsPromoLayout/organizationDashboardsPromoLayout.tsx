/*
 * Copyright 2026 EPAM Systems
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
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Button } from '@reportportal/ui-kit';
import { HelpPanel } from 'pages/inside/common/helpPanel';
import { LocationHeaderLayout } from 'layouts/locationHeaderLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { PreservedText } from 'components/preservedText';
import { ORGANIZATIONS_PAGE } from 'controllers/pages';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { messages as layoutMessages } from 'layouts/messages';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { messages } from '../messages';
import styles from './organizationDashboardsPromoLayout.scss';
import bgImage from './img/organization-dashboards-bg.svg';

const cx = classNames.bind(styles);

interface HelpItem {
  title: string;
  mainIcon: string;
  link: string;
  description: string;
  openIcon: string;
  event?: Record<string, unknown>;
  automationId?: string;
}

interface OrganizationDashboardsPromoLayoutProps {
  helpItems: HelpItem[];
  showButton?: boolean;
  onButtonClick?: () => void;
}

export const OrganizationDashboardsPromoLayout = ({
  helpItems,
  showButton,
  onButtonClick,
}: OrganizationDashboardsPromoLayoutProps) => {
  const { formatMessage } = useIntl();
  const organizationName = useSelector(activeOrganizationNameSelector);
  const { canUpdateOrganizationSettings } = useUserPermissions();

  const breadcrumbs = [
    {
      title: formatMessage(layoutMessages.allOrganizations),
      link: { type: ORGANIZATIONS_PAGE },
    },
    ...(organizationName
      ? [
          {
            title: <PreservedText>{organizationName}</PreservedText>,
          },
        ]
      : []),
  ];

  return (
    <ScrollWrapper>
      <LocationHeaderLayout
        title={formatMessage(layoutMessages.organizationDashboards)}
        breadcrumbs={breadcrumbs}
        className={cx('location-header')}
        headerClassName={cx('header')}
      />
      <div className={cx('promo-container')}>
        <span className={cx('title')}>{formatMessage(messages.promoTitle)}</span>
        <span className={cx('description')}>
          {formatMessage(
            canUpdateOrganizationSettings
              ? messages.promoDescriptionManager
              : messages.promoDescriptionMember,
          )}
        </span>
        {showButton && (
          <div className={cx('create-button')}>
            <Button onClick={onButtonClick} data-automation-id="createOrganizationDashboardButton">
              {formatMessage(messages.createDashboard)}
            </Button>
          </div>
        )}
        <div className={cx('bg-image-wrapper')}>
          <img
            className={cx('bg-image')}
            src={bgImage as unknown as string}
            alt={formatMessage(messages.promoImageAlt)}
          />
        </div>
        <HelpPanel items={helpItems} />
      </div>
    </ScrollWrapper>
  );
};

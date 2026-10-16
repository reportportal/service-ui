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

import { useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import { useIntl } from 'react-intl';
import { showModalAction } from 'controllers/modal';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { PremiumPromoModal } from 'components/premiumPromoModal';
import discoverPluginsIcon from 'common/img/discover-icon-inline.svg';
import billingIcon from 'common/img/billing-icon-inline.svg';
import openInNewTabIcon from 'common/img/open-in-new-tab-inline.svg';
import { ORGANIZATION_DASHBOARDS_PROMO_EVENTS } from 'analyticsEvents/organizationDashboardsPageEvents';
import { messages } from './messages';
import { OrganizationDashboardsPromoLayout } from './organizationDashboardsPromoLayout';

export const OrganizationDashboardsPromoPage = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const { canUpdateOrganizationSettings } = useUserPermissions();

  const handleButtonClick = () => {
    dispatch(
      showModalAction({
        component: (
          <PremiumPromoModal
            onExplorePlans={() => {
              trackEvent(ORGANIZATION_DASHBOARDS_PROMO_EVENTS.CLICK_EXPLORE_PLANS_POPUP);
              window.open(
                referenceDictionary.rpExplorePlansOrgDashboards,
                '_blank',
                'noopener,noreferrer',
              );
            }}
            onContactUs={() => {
              trackEvent(ORGANIZATION_DASHBOARDS_PROMO_EVENTS.CLICK_CONTACT_US_POPUP);
              window.open(
                referenceDictionary.rpContactUsOrgDashboards,
                '_blank',
                'noopener,noreferrer',
              );
            }}
            onNotNow={() =>
              trackEvent(ORGANIZATION_DASHBOARDS_PROMO_EVENTS.CLICK_NOT_NOW_POPUP)
            }
          />
        ),
      }),
    );
  };

  const helpItems = [
    {
      title: formatMessage(messages.exploreBillingPlans),
      mainIcon: billingIcon,
      link: referenceDictionary.rpExploreBillingPlansOrgDashboards,
      description: formatMessage(messages.exploreBillingPlansDescription),
      openIcon: openInNewTabIcon,
      event: ORGANIZATION_DASHBOARDS_PROMO_EVENTS.clickPromoLink('explore_billing_plans'),
      automationId: 'organizationDashboardsExploreBillingPlansLink',
    },
    {
      title: formatMessage(messages.explorePremiumFeatures),
      mainIcon: discoverPluginsIcon,
      link: referenceDictionary.rpExplorePremiumFeaturesOrgDashboards,
      description: formatMessage(messages.explorePremiumFeaturesDescription),
      openIcon: openInNewTabIcon,
      event: ORGANIZATION_DASHBOARDS_PROMO_EVENTS.clickPromoLink('explore_premium_features'),
      automationId: 'organizationDashboardsExplorePremiumFeaturesLink',
    },
    {
      title: formatMessage(messages.dashboardDocumentation),
      mainIcon: discoverPluginsIcon,
      link: referenceDictionary.rpOrgDashboardsDocs,
      description: formatMessage(messages.dashboardDocDescription),
      openIcon: openInNewTabIcon,
      event: ORGANIZATION_DASHBOARDS_PROMO_EVENTS.clickPromoLink(
        'organization_dashboard_documentation',
      ),
      automationId: 'organizationDashboardsDocLink',
    },
  ];

  return (
    <OrganizationDashboardsPromoLayout
      helpItems={helpItems}
      onButtonClick={handleButtonClick}
      showButton={canUpdateOrganizationSettings}
    />
  );
};

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

import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { useIntl } from 'react-intl';
import { showModalAction } from 'controllers/modal';
import {
  ORGANIZATION_PROJECTS_PAGE,
  ORGANIZATIONS_PAGE,
  PROJECT_DASHBOARD_PAGE,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
} from 'controllers/pages';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { projectNameSelector } from 'controllers/project';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { PremiumPromoModal } from 'components/premiumPromoModal';
import { PreservedText } from 'components/preservedText';
import discoverPluginsIcon from 'common/img/discover-icon-inline.svg';
import billingIcon from 'common/img/billing-icon-inline.svg';
import openInNewTabIcon from 'common/img/open-in-new-tab-inline.svg';
import { TEST_EXECUTIONS_PROMO_EVENTS } from 'analyticsEvents/testExecutionsPageEvents';
import { messages as layoutMessages } from 'layouts/messages';
import { messages } from './messages';
import { TestExecutionsPromoLayout } from './testExecutionsPromoLayout';

export const TestExecutionsPromoPage = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const { canUpdateSettings } = useUserPermissions();
  const organizationName = useSelector(activeOrganizationNameSelector);
  const projectName = useSelector(projectNameSelector);
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);

  const routeCrumbData = useMemo(() => {
    const rootCrumb = {
      title: formatMessage(layoutMessages.allOrganizations),
      link: { type: ORGANIZATIONS_PAGE },
      children: [],
    };
    let lastCrumb = rootCrumb;

    if (organizationSlug) {
      const organizationCrumb = {
        title:  <PreservedText>{organizationName}</PreservedText>,
        link: { type: ORGANIZATION_PROJECTS_PAGE, payload: { organizationSlug } },
        children: [],
      };
      rootCrumb.children.push(organizationCrumb);
      lastCrumb = organizationCrumb;

      if (projectSlug) {
        const projectCrumb = {
          title: <PreservedText>{projectName}</PreservedText>,
          link: {
            type: PROJECT_DASHBOARD_PAGE,
            payload: { organizationSlug, projectSlug },
          },
        };
        organizationCrumb.children.push(projectCrumb);
        lastCrumb = projectCrumb;
      }
    }

    return { rootCrumb, lastCrumb };
  }, [
    formatMessage,
    organizationName,
    organizationSlug,
    projectName,
    projectSlug,
  ]);

  const handleButtonClick = () => {
    trackEvent(TEST_EXECUTIONS_PROMO_EVENTS.CLICK_START_SEARCHING);
    dispatch(
      showModalAction({
        component: (
          <PremiumPromoModal
            onExplorePlans={() => {
              trackEvent(TEST_EXECUTIONS_PROMO_EVENTS.CLICK_EXPLORE_PLANS_POPUP);
              window.open(referenceDictionary.rpExplorePlansTEP, '_blank', 'noopener,noreferrer');
            }}
            onContactUs={() => {
              trackEvent(TEST_EXECUTIONS_PROMO_EVENTS.CLICK_CONTACT_US_POPUP);
              window.open(referenceDictionary.rpContactUsTEP, '_blank', 'noopener,noreferrer');
            }}
            onNotNow={() => trackEvent(TEST_EXECUTIONS_PROMO_EVENTS.CLICK_NOT_NOW_POPUP)}
          />
        ),
      }),
    );
  };

  const helpItems = [
    {
      title: formatMessage(messages.exploreBillingPlans),
      mainIcon: billingIcon,
      link: referenceDictionary.rpExploreBillingPlansTEP,
      description: formatMessage(messages.exploreBillingPlansDescription),
      openIcon: openInNewTabIcon,
      event: TEST_EXECUTIONS_PROMO_EVENTS.clickPromoLink('explore_billing_plans'),
      automationId: 'tepExploreBillingPlansLink',
    },
    {
      title: formatMessage(messages.explorePremiumFeatures),
      mainIcon: discoverPluginsIcon,
      link: referenceDictionary.rpExplorePremiumFeaturesTEP,
      description: formatMessage(messages.explorePremiumFeaturesDescription),
      openIcon: openInNewTabIcon,
      event: TEST_EXECUTIONS_PROMO_EVENTS.clickPromoLink('explore_premium_features'),
      automationId: 'tepExplorePremiumFeaturesLink',
    },
    {
      title: formatMessage(messages.testExecutionsDocumentation),
      mainIcon: discoverPluginsIcon,
      link: referenceDictionary.rpTestExecutionsDocsTEP,
      description: formatMessage(messages.testExecutionsDocumentationDescription),
      openIcon: openInNewTabIcon,
      event: TEST_EXECUTIONS_PROMO_EVENTS.clickPromoLink('test_executions_documentation'),
      automationId: 'tepTestExecutionsDocLink',
    },
  ];

  return (
    <TestExecutionsPromoLayout
      helpItems={helpItems}
      onButtonClick={handleButtonClick}
      showButton={canUpdateSettings}
      breadcrumbs={[routeCrumbData.lastCrumb]}
      tree={[routeCrumbData.rootCrumb]}
    />
  );
};

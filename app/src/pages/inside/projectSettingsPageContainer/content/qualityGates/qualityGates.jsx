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

import React from 'react';
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

import { PROJECT_SETTINGS_QUALITY_GATES_EVENTS } from 'analyticsEvents/projectSettingsPageEvents';
import { messages } from './messages';
import { QualityGatesPromoLayout } from './qualityGatesPromoLayout';

export const QualityGates = () => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const { canUpdateSettings } = useUserPermissions();

  const handleButtonClick = () => {
    trackEvent(PROJECT_SETTINGS_QUALITY_GATES_EVENTS.CLICK_CREATE_QUALITY_GATE_WITHOUT_PLUGIN);
    dispatch(
      showModalAction({
        component: (
          <PremiumPromoModal
            onExplorePlans={() => {
              trackEvent(PROJECT_SETTINGS_QUALITY_GATES_EVENTS.CLICK_EXPLORE_PLANS_POPUP);
              window.open(
                referenceDictionary.rpExploreBillingPlansQG,
                '_blank',
                'noopener,noreferrer',
              );
            }}
            onContactUs={() => {
              trackEvent(PROJECT_SETTINGS_QUALITY_GATES_EVENTS.CLICK_CONTACT_US_POPUP);
              window.open(referenceDictionary.rpContactUsQG, '_blank', 'noopener,noreferrer');
            }}
            onNotNow={() =>
              trackEvent(PROJECT_SETTINGS_QUALITY_GATES_EVENTS.CLICK_NOT_NOW_POPUP)
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
      link: referenceDictionary.rpExploreBillingPlansQG,
      description: formatMessage(messages.exploreBillingPlansDescription),
      openIcon: openInNewTabIcon,
      event: PROJECT_SETTINGS_QUALITY_GATES_EVENTS.clickPromoLink('explore_billing_plans'),
      automationId: 'exploreBillingPlansLink',
    },
    {
      title: formatMessage(messages.explorePremiumFeatures),
      mainIcon: discoverPluginsIcon,
      link: referenceDictionary.rpExplorePremiumFeaturesQG,
      description: formatMessage(messages.explorePremiumFeaturesDescription),
      openIcon: openInNewTabIcon,
      event: PROJECT_SETTINGS_QUALITY_GATES_EVENTS.clickPromoLink('explore_premium_features'),
      automationId: 'explorePremiumFeaturesLink',
    },
    {
      title: formatMessage(messages.qualityGatesDocumentation),
      mainIcon: discoverPluginsIcon,
      link: referenceDictionary.rpQualityGatesDocsQG,
      description: formatMessage(messages.qualityGatesDocDescription),
      openIcon: openInNewTabIcon,
      event: PROJECT_SETTINGS_QUALITY_GATES_EVENTS.clickPromoLink('quality_gates_documentation'),
      automationId: 'qualityGatesDocLink',
    },
  ];

  return (
    <QualityGatesPromoLayout
      helpItems={helpItems}
      onButtonClick={handleButtonClick}
      showButton={canUpdateSettings}
    />
  );
};

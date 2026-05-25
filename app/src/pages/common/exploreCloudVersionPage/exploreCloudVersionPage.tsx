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

import { ReactElement } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { Button, ExternalLinkIcon } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils/createClassnames';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import discoverPluginsIcon from 'common/img/discover-icon-inline.svg';
import openInNewTabIcon from 'common/img/open-in-new-tab-inline.svg';
import { HelpPanel } from 'pages/inside/common/helpPanel';
import { PageLayout, PageSection } from 'layouts/pageLayout';
import { EXPLORE_CLOUD_VERSION_PAGE_EVENTS } from 'analyticsEvents/exploreCloudVersionPageEvents';
import qualityGatesHighlight from './img/quality-gates-highlight.png';
import scimServerHighlight from './img/scim-server-highlight.png';
import testExecutionsHighlight from './img/test-executions-highlight.png';
import { messages } from './messages';
import styles from './exploreCloudVersionPage.scss';

const cx = createClassnames(styles);

const openExternalLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const ExploreCloudVersionPage = (): ReactElement => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const helpItems = [
    {
      title: formatMessage(messages.explorePremiumFeatures),
      mainIcon: discoverPluginsIcon,
      link: referenceDictionary.rpExplorePremiumFeaturesCloud,
      description: formatMessage(messages.explorePremiumFeaturesDescription),
      openIcon: openInNewTabIcon,
      event: EXPLORE_CLOUD_VERSION_PAGE_EVENTS.clickPromoLink('explore_premium_features'),
      automationId: 'explorePremiumFeaturesLink',
    },
  ];

  const highlights = [
    {
      title: formatMessage(messages.testExecutions),
      image: testExecutionsHighlight,
      customClassName: 'te',
    },
    {
      title: formatMessage(messages.qualityGates),
      image: qualityGatesHighlight,
      customClassName: 'qg',
    },
    {
      title: formatMessage(messages.scimServer),
      image: scimServerHighlight,
      customClassName: 'scim',
    },
  ];

  return (
    <PageLayout>
      <PageSection>
        <div className={cx('promo-container')}>
          <h1 className={cx('title')}>{formatMessage(messages.pageTitle)}</h1>
          <p className={cx('description')}>{formatMessage(messages.pageDescription)}</p>
          <div className={cx('actions')}>
            <Button
              variant="ghost"
              onClick={() => {
                trackEvent(
                  EXPLORE_CLOUD_VERSION_PAGE_EVENTS.clickPromoLink('request_cloud_access'),
                );
                openExternalLink(referenceDictionary.rpRequestCloudAccessCloud);
              }}
              data-automation-id="requestCloudAccessButton"
            >
              {formatMessage(messages.requestCloudAccess)}
            </Button>
            <Button
              className={cx('explore-billing-button')}
              icon={<ExternalLinkIcon />}
              iconPlace="end"
              onClick={() => {
                trackEvent(
                  EXPLORE_CLOUD_VERSION_PAGE_EVENTS.clickPromoLink('explore_billing_plans'),
                );
                openExternalLink(referenceDictionary.rpExploreBillingPlansCloud);
              }}
              data-automation-id="exploreBillingPlansButton"
            >
              {formatMessage(messages.exploreBillingPlans)}
            </Button>
          </div>
          <div className={cx('highlights')}>
            {highlights.map(({ title, image, customClassName }) => (
              <div key={title} className={cx('highlight')}>
                <span className={cx('highlight-title')}>{title}</span>
                <div className={cx('highlight-visual', customClassName)}>
                  <img className={cx('highlight-image')} src={image} alt="" />
                </div>
              </div>
            ))}
          </div>
          <div className={cx('footer')}>
            <HelpPanel items={helpItems} className={cx('help-panel')} />
          </div>
        </div>
      </PageSection>
    </PageLayout>
  );
};

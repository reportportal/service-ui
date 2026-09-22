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
import { PremiumPromoModal } from 'components/premiumPromoModal';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import { referenceDictionary } from 'common/utils/referenceDictionary';

/**
 * What "Discover Premium" does, in one place because it is one action on two screens.
 *
 * The catalogue row and the plugin page both offer it, and they had drifted: the row opened the
 * plugin's contact URL in a new tab while the page opened this modal. One button, two
 * behaviours, and a user who met both had no way to tell which they would get.
 *
 * `contactUrl` is the plugin's own purchase CTA, which the manifest schema requires of every
 * premium plugin — for a third-party plugin that is its vendor's page, and sending the enquiry
 * to ReportPortal's sales instead would send it to the wrong company. So it wins when the
 * registry published one; the instance-wide link is the fallback for when it did not.
 *
 * @param trackEvent  the screen's own tracking function
 * @param title       plugin name, for the analytics event
 * @param contactUrl  the plugin's contact URL, or null
 * @returns the payload for showModalAction
 */
export const premiumPromoModal = ({ trackEvent, title, contactUrl = null }) => {
  trackEvent(PLUGINS_PAGE_EVENTS.clickDiscoverPremium(title));

  const openExternal = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  return {
    component: (
      <PremiumPromoModal
        onExplorePlans={() => {
          trackEvent(PLUGINS_PAGE_EVENTS.clickPremiumModalExplorePlans);
          openExternal(referenceDictionary.rpExplorePlansPlugins);
        }}
        onContactUs={() => {
          trackEvent(PLUGINS_PAGE_EVENTS.clickPremiumModalContactUs);
          openExternal(contactUrl || referenceDictionary.rpContactUsPlugins);
        }}
        onNotNow={() => trackEvent(PLUGINS_PAGE_EVENTS.clickPremiumModalNotNow)}
      />
    ),
  };
};

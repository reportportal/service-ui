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

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import { Button } from '@reportportal/ui-kit';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import { PremiumPromoModal } from 'components/premiumPromoModal';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import { showModalAction } from 'controllers/modal';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import { PLUGIN_TIERS } from '../availablePluginsCatalog';
import styles from './availablePluginDetail.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  free: {
    id: 'PluginItem.free',
    defaultMessage: 'Free',
  },
  premium: {
    id: 'PluginItem.premium',
    defaultMessage: 'Premium',
  },
  premiumDescription: {
    id: 'PluginItem.premiumDescription',
    defaultMessage: 'Upgrade your subscription to access this plugin',
  },
  freeDescription: {
    id: 'PluginItem.freeDescription',
    defaultMessage: 'Available with your current plan',
  },
  discoverPremium: {
    id: 'AvailablePluginDetail.discoverPremium',
    defaultMessage: 'Discover Premium',
  },
  install: {
    id: 'AvailablePluginDetail.install',
    defaultMessage: 'Install',
  },
});

export const AvailablePluginDetail = ({ plugin }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const title = plugin.details?.name || plugin.name;
  const isPremium = plugin.tier === PLUGIN_TIERS.PREMIUM;

  useEffect(() => {
    trackEvent(PLUGINS_PAGE_EVENTS.availablePluginDetailPageView(title));
  }, [title, trackEvent]);

  const handleInstall = () => {
    if (!plugin.documentationUrl) {
      return;
    }

    trackEvent(PLUGINS_PAGE_EVENTS.clickInstallAvailablePlugin(title));
    window.open(plugin.documentationUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDiscoverPremium = () => {
    trackEvent(PLUGINS_PAGE_EVENTS.clickDiscoverPremium(title));
    dispatch(
      showModalAction({
        component: (
          <PremiumPromoModal
            onExplorePlans={() => {
              trackEvent(PLUGINS_PAGE_EVENTS.clickPremiumModalExplorePlans);
              window.open(
                referenceDictionary.rpExplorePlansPlugins,
                '_blank',
                'noopener,noreferrer',
              );
            }}
            onContactUs={() => {
              trackEvent(PLUGINS_PAGE_EVENTS.clickPremiumModalContactUs);
              window.open(referenceDictionary.rpContactUsPlugins, '_blank', 'noopener,noreferrer');
            }}
            onNotNow={() => trackEvent(PLUGINS_PAGE_EVENTS.clickPremiumModalNotNow)}
          />
        ),
      }),
    );
  };

  return (
    <div className={cx('available-plugin-detail')}>
      <PluginIcon className={cx('logo')} pluginData={plugin} alt={title} />
      <div className={cx('content')}>
        <div className={cx('header')}>
          <div className={cx('info')}>
            <h2 className={cx('title')}>{title}</h2>
            <div className={cx('tier-row')}>
              <span className={cx('tier', { premium: isPremium })}>
                {formatMessage(isPremium ? messages.premium : messages.free)}
              </span>
              <span className={cx('tier-description')}>
                {formatMessage(isPremium ? messages.premiumDescription : messages.freeDescription)}
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            adjustWidthOn="content"
            className={cx(isPremium ? 'discover-button' : 'install-button')}
            onClick={isPremium ? handleDiscoverPremium : handleInstall}
            disabled={!isPremium && !plugin.documentationUrl}
          >
            {formatMessage(isPremium ? messages.discoverPremium : messages.install)}
          </Button>
        </div>
        <p className={cx('description')}>{plugin.description}</p>
      </div>
    </div>
  );
};

AvailablePluginDetail.propTypes = {
  plugin: PropTypes.shape({
    name: PropTypes.string.isRequired,
    tier: PropTypes.string.isRequired,
    description: PropTypes.string,
    documentationUrl: PropTypes.string,
    details: PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
};

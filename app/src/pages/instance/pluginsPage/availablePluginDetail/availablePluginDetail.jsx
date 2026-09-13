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
import { PluginBadge, BADGE_TONES } from '../pluginBadge';
import { PluginTrustMark } from '../pluginTrustMark';
import { PluginIcon } from 'components/integrations/elements/pluginIcon';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import { showModalAction } from 'controllers/modal';
import { PLUGIN_TIERS } from 'common/constants/pluginTiers';
import { PluginMarketplaceBlocks } from '../pluginMarketplaceBlocks';
import { premiumPromoModal } from '../premiumPromo';
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
  installing: {
    id: 'PluginItem.installingState',
    defaultMessage: 'Installing…',
  },
  version: {
    id: 'AvailablePluginDetail.version',
    defaultMessage: 'version {version}',
  },
  author: {
    id: 'AvailablePluginDetail.author',
    defaultMessage: 'by {author}',
  },
});

/**
 * A marketplace plugin's page. The header is what service-api merged for the catalogue row; the
 * blocks under it are the registry's own answer for this plugin, and they say nothing at all
 * unless that answer can be believed.
 */
export const AvailablePluginDetail = ({
  plugin,
  detail,
  loading = false,
  offline = false,
  failed = false,
  registryHost = null,
  onInstall = () => {},
  onRetry = () => {},
  installing = false,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const title = plugin.details?.name || plugin.name;
  const isPremium = plugin.tier === PLUGIN_TIERS.PREMIUM;
  // premium alone is not a lock: an instance with a licence installs premium plugins normally
  const isLocked = Boolean(plugin.locked);
  const version = plugin.latestVersion || plugin.details?.version;
  // the registry's, read off the detail response; the row's copy is the same value
  const author = detail?.plugin?.author || plugin.author || null;

  useEffect(() => {
    trackEvent(PLUGINS_PAGE_EVENTS.availablePluginDetailPageView(title));
  }, [title, trackEvent]);

  const handleInstall = () => {
    trackEvent(PLUGINS_PAGE_EVENTS.clickInstallAvailablePlugin(title));
    onInstall(plugin);
  };

  const handleDiscoverPremium = () =>
    dispatch(
      showModalAction(premiumPromoModal({ trackEvent, title, contactUrl: plugin.contactUrl })),
    );

  return (
    <div className={cx('available-plugin-detail')}>
      <div className={cx('head')}>
        <PluginIcon className={cx('logo')} pluginData={plugin} alt={title} />
        <div className={cx('content')}>
          <div className={cx('header')}>
            <div className={cx('info')}>
              <div className={cx('title-row')}>
                <h2 className={cx('title')} data-automation-id="pluginDetailTitle">
                  {title}
                </h2>
                {/* the other axis, and the reason it sits by the name rather than in the row
                    below: who wrote the plugin is not what it costs */}
                <PluginTrustMark trust={plugin.trust} />
              </div>
              {version && (
                <span className={cx('version')} data-automation-id="pluginDetailVersion">
                  {formatMessage(messages.version, { version })}
                </span>
              )}
              {/* FR-U-02 names the author among what a detail page shows. Absent, not guessed:
                  the registry either named someone or it did not. */}
              {author && (
                <span className={cx('author')} data-automation-id="pluginDetailAuthor">
                  {formatMessage(messages.author, { author })}
                </span>
              )}
              <div className={cx('tier-row')}>
                <PluginBadge tone={isPremium ? BADGE_TONES.PREMIUM : BADGE_TONES.FREE}>
                  {formatMessage(isPremium ? messages.premium : messages.free)}
                </PluginBadge>
                <span className={cx('tier-description')}>
                  {formatMessage(
                    isPremium ? messages.premiumDescription : messages.freeDescription,
                  )}
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              adjustWidthOn="content"
              data-automation-id={isLocked ? 'discoverPremiumAction' : 'installAction'}
              className={cx(isLocked ? 'discover-button' : 'install-button')}
              onClick={isLocked ? handleDiscoverPremium : handleInstall}
              // a second press while the first install is still in flight would start a second
              // download of the same plugin; the row in the catalogue has always said so, and
              // this button is the same request made from a different place
              disabled={!isLocked && (!version || installing)}
            >
              {formatMessage(
                // eslint-disable-next-line no-nested-ternary
                isLocked
                  ? messages.discoverPremium
                  : installing
                    ? messages.installing
                    : messages.install,
              )}
            </Button>
          </div>
          <p className={cx('description')}>{plugin.description}</p>
        </div>
      </div>
      {/* this page states both axes in its own header, so the blocks are told not to */}
      <PluginMarketplaceBlocks
        detail={detail}
        loading={loading}
        offline={offline}
        failed={failed}
        registryHost={registryHost}
        onRetry={onRetry}
        showTier={false}
        installing={installing}
        // a version row on this page installs that version; on an installed plugin's page the
        // same row switches to it, which is why the label is asked for rather than assumed
        useVersionLabel="install"
        onUseVersion={isLocked ? null : (chosen) => onInstall(plugin, chosen)}
      />
    </div>
  );
};

AvailablePluginDetail.propTypes = {
  installing: PropTypes.bool,
  plugin: PropTypes.shape({
    name: PropTypes.string.isRequired,
    tier: PropTypes.string.isRequired,
    /** The other axis: who stands behind the plugin, or null if the registry named nobody. */
    trust: PropTypes.string,
    description: PropTypes.string,
    author: PropTypes.string,
    latestVersion: PropTypes.string,
    locked: PropTypes.bool,
    contactUrl: PropTypes.string,
    registryId: PropTypes.string,
    details: PropTypes.shape({
      name: PropTypes.string,
      version: PropTypes.string,
    }),
  }).isRequired,
  detail: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  offline: PropTypes.bool,
  failed: PropTypes.bool,
  registryHost: PropTypes.string,
  onInstall: PropTypes.func,
  onRetry: PropTypes.func,
};

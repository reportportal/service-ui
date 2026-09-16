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

import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { BubblesLoader, SystemMessage } from '@reportportal/ui-kit';
import { PLUGIN_TIERS, toPluginTier, toTrustTier } from 'common/constants/pluginTiers';
import { PluginBadge, BADGE_TONES } from '../pluginBadge';
import { PluginTrustMark } from '../pluginTrustMark';
import { RegistryOfflineAlert } from '../registryOfflineAlert';
import { CatalogueUnavailableAlert } from '../catalogueUnavailableAlert';
import { isMarketplaceTrusted } from '../pluginsCatalog';
import { VersionsTable } from '../versionsTable';
import { formatPublishDate } from './utils';
import styles from './pluginMarketplaceBlocks.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  versions: {
    id: 'PluginMarketplaceBlocks.versions',
    defaultMessage: 'Versions',
  },
  installedVersion: {
    id: 'PluginMarketplaceBlocks.installedVersion',
    defaultMessage: 'Installed',
  },
  blockedVersion: {
    id: 'PluginMarketplaceBlocks.blockedVersion',
    defaultMessage: 'Blocked',
  },
  // Not "Roll back": install, update and rollback are one request, and this list is ordered by
  // publish date, which is not version order — so naming a direction would sometimes be a lie.
  useVersion: {
    id: 'PluginMarketplaceBlocks.useVersion',
    defaultMessage: 'Use this version',
  },
  installVersion: {
    id: 'PluginItem.install',
    defaultMessage: 'Install',
  },
  screenshots: {
    id: 'PluginMarketplaceBlocks.screenshots',
    defaultMessage: 'Screenshots',
  },
  screenshotAlt: {
    id: 'PluginMarketplaceBlocks.screenshotAlt',
    defaultMessage: 'Plugin screenshot {index}',
  },
  // the version number is part of the heading, not a line inside the card
  changelogHeader: {
    id: 'PluginMarketplaceBlocks.changelogHeader',
    defaultMessage: "What's new in {version}",
  },
  advisoryHeader: {
    id: 'PluginMarketplaceBlocks.advisoryHeader',
    defaultMessage: 'Security advisory — {severity}',
  },
  advisoryReported: {
    id: 'PluginMarketplaceBlocks.advisoryReported',
    defaultMessage: 'Reported {date}.',
  },
  // marketplace state is about what may be installed, never about switching off what is here
  advisoryKeepsRunning: {
    id: 'PluginMarketplaceBlocks.advisoryKeepsRunning',
    defaultMessage:
      'The plugin keeps running; an advisory changes which version you should be on, not whether this one works.',
  },
  blockedHeader: {
    id: 'PluginMarketplaceBlocks.blockedHeader',
    defaultMessage: 'This version is blocked',
  },
  blockedBody: {
    id: 'PluginMarketplaceBlocks.blockedBody',
    defaultMessage:
      'Blocked on {date}: {reason}. The plugin keeps running, but this version cannot be reinstalled or rolled back to. Archive the current .jar before upgrading if you may need to return to it.',
  },
  removedHeader: {
    id: 'PluginMarketplaceBlocks.removedHeader',
    defaultMessage: 'Plugin removed from the marketplace',
  },
  removedBody: {
    id: 'PluginMarketplaceBlocks.removedBody',
    defaultMessage:
      'Removed on {date} following {reason}. It keeps running here, but no version can be installed, updated or rolled back to. Manual .jar upload is the only remaining path.',
  },
  // silence would read as "nothing to report", which is a claim this screen cannot make
  unmatchedHeader: {
    id: 'PluginMarketplaceBlocks.unmatchedHeader',
    defaultMessage: 'Uploaded manually',
  },
  // It names the version, because that is the fact the sentence exists to deliver: this is the
  // only one that will ever be known here. And it describes the plugin for what it is rather than
  // for what the registry lacks — hand-installed is provenance, not a verdict on its health.
  unmatchedBody: {
    id: 'PluginMarketplaceBlocks.unmatchedBody',
    defaultMessage:
      'This plugin was installed from a .jar file and has no match in the marketplace, so {version} is the only version known here. Changing its version is possible through uploading another .jar.',
  },
  unmatchedBodyNoVersion: {
    id: 'PluginMarketplaceBlocks.unmatchedBodyNoVersion',
    defaultMessage:
      'This plugin was installed from a .jar file and has no match in the marketplace, so no other version is known here. Changing its version is possible through uploading another .jar.',
  },
  unmatchedVersions: {
    id: 'PluginMarketplaceBlocks.unmatchedVersions',
    defaultMessage:
      "This plugin isn't in the marketplace, so no other versions are listed. Uploading another .jar is the only way to change it.",
  },
  // the same words the catalogue row and the available-plugin page use for the same axis
  premium: {
    id: 'PluginItem.premium',
    defaultMessage: 'Premium',
  },
});

/**
 * Everything on a plugin's page that comes out of the registry: the three marketplace alerts, the
 * screenshots strip, the version history and the changelog.
 *
 * None of it is rendered unless the registry half of the response can be believed, and that is
 * decided by the same helper the catalogue uses. A block with no data is left out entirely rather
 * than explained, exactly as an empty group is on the catalogue — but the reason there is nothing
 * to show is always given, so a plugin the registry has never heard of does not look like one it
 * has nothing to say about.
 */
export const PluginMarketplaceBlocks = ({
  detail,
  loading = false,
  offline = false,
  failed = false,
  unmatched = false,
  registryHost = null,
  onRetry = () => {},
  installedVersion = null,
  onUseVersion = null,
  showTier = true,
  installing = false,
  productVersion = null,
}) => {
  const { formatMessage, formatDate } = useIntl();
  const trusted = isMarketplaceTrusted({ offline, failed, unmatched });
  // Both axes, off the registry's own answer for this plugin. While a request is in flight the
  // answer on the store is still the last plugin's, so nothing is read from it until it lands.
  const { access, tier } = (trusted && !loading && detail.plugin) || {};
  const trust = toTrustTier(tier);
  const isPremium = toPluginTier(access) === PLUGIN_TIERS.PREMIUM;
  const { versions, changelog, screenshots, advisory, blocked, removed } = trusted
    ? detail
    : {
        versions: [],
        changelog: null,
        screenshots: [],
        advisory: null,
        blocked: null,
        removed: null,
      };
  const date = (value) => formatPublishDate(formatDate, value);

  return (
    <div className={cx('plugin-marketplace-blocks')}>
      {/* What the plugin is, before what has happened to it. An installed plugin's page has a
          header of its own that knows nothing of the registry, so this is the only place its
          tier can be stated; the available-plugin page states it up there and turns this off. */}
      {showTier && (trust || isPremium) && (
        <div className={cx('tier-row')} data-automation-id="pluginDetailTierRow">
          <PluginTrustMark trust={trust} />
          {/* public is the ordinary case and the design gives it no pill of its own */}
          {isPremium && (
            <PluginBadge
              tone={BADGE_TONES.PREMIUM}
              data-automation-id="pluginBadge"
              data-badge={PLUGIN_TIERS.PREMIUM}
            >
              {formatMessage(messages.premium)}
            </PluginBadge>
          )}
        </div>
      )}
      {offline && <RegistryOfflineAlert host={registryHost} />}
      {/* an unmatched plugin is one the catalogue could not place, so that is the request that
          failed; otherwise the failure is this plugin's own detail request */}
      {failed && (
        <CatalogueUnavailableAlert onRetry={onRetry} scope={unmatched ? 'catalogue' : 'plugin'} />
      )}
      {/* offline and failed already say why the registry knows nothing of this plugin */}
      {unmatched && !offline && !failed && (
        <>
          <div className={cx('alert')} data-automation-id="pluginUnmatchedAlert">
            <SystemMessage mode="info" header={formatMessage(messages.unmatchedHeader)}>
              {installedVersion
                ? formatMessage(messages.unmatchedBody, { version: installedVersion })
                : formatMessage(messages.unmatchedBodyNoVersion)}
            </SystemMessage>
          </div>
          {/* One row, because one version is all that is known. The table is still the table —
              the row expands and says it is the current one — it simply has nothing to offer,
              since changing the version here means uploading another .jar. */}
          {installedVersion && (
            <VersionsTable
              versions={[{ version: installedVersion }]}
              installedVersion={installedVersion}
              description={formatMessage(messages.unmatchedVersions)}
              onUseVersion={null}
            />
          )}
        </>
      )}
      {loading && (
        <div className={cx('loader')} data-automation-id="pluginDetailLoader">
          <BubblesLoader />
        </div>
      )}
      {!loading && (
        <div className={cx('sections')}>
          {advisory && (
            <div className={cx('alert')} data-automation-id="pluginAdvisoryAlert">
              <SystemMessage
                mode="error"
                header={formatMessage(messages.advisoryHeader, {
                  severity: advisory.severity || '',
                })}
              >
                {advisory.text}{' '}
                {advisory.attachedAt &&
                  `${formatMessage(messages.advisoryReported, {
                    date: date(advisory.attachedAt),
                  })} `}
                {/* the registry states only what the advisory is, never which version fixes it */}
                {formatMessage(messages.advisoryKeepsRunning)}
              </SystemMessage>
            </div>
          )}
          {blocked && (
            <div className={cx('alert')} data-automation-id="pluginBlockedAlert">
              <SystemMessage mode="warning" header={formatMessage(messages.blockedHeader)}>
                {formatMessage(messages.blockedBody, {
                  date: date(blocked.blockedAt),
                  reason: blocked.reason || '',
                })}
              </SystemMessage>
            </div>
          )}
          {removed && (
            <div className={cx('alert')} data-automation-id="pluginRemovedAlert">
              <SystemMessage mode="warning" header={formatMessage(messages.removedHeader)}>
                {formatMessage(messages.removedBody, {
                  date: date(removed.removed),
                  reason: removed.removalReason || '',
                })}
              </SystemMessage>
            </div>
          )}
          {screenshots.length > 0 && (
            <section className={cx('block')} data-automation-id="pluginScreenshots">
              <h3 className={cx('block-header')}>{formatMessage(messages.screenshots)}</h3>
              <div className={cx('screenshot-strip')}>
                {screenshots.map((url, index) => (
                  <img
                    key={url}
                    className={cx('screenshot')}
                    data-automation-id="pluginScreenshot"
                    src={url}
                    alt={formatMessage(messages.screenshotAlt, { index: index + 1 })}
                  />
                ))}
              </div>
            </section>
          )}
          {changelog && (
            <section className={cx('block')} data-automation-id="pluginChangelog">
              <h3 className={cx('block-header')}>
                {formatMessage(messages.changelogHeader, { version: changelog.version })}
              </h3>
              <div className={cx('card')}>
                {(changelog.lines || []).map((line) => (
                  <p
                    key={line}
                    className={cx('changelog-line')}
                    data-automation-id="pluginChangelogLine"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </section>
          )}
          <VersionsTable
            versions={versions}
            installedVersion={installedVersion}
            latestVersion={detail?.plugin?.latestVersion || null}
            productVersion={productVersion}
            changelog={changelog}
            onUseVersion={onUseVersion}
            installing={installing}
            removed={Boolean(removed)}
          />
        </div>
      )}
    </div>
  );
};

PluginMarketplaceBlocks.propTypes = {
  /** An install for this plugin is on its way, so no version may start another. */
  installing: PropTypes.bool,
  /** The release this instance reports, quoted when a version will not run here. */
  productVersion: PropTypes.string,
  detail: PropTypes.shape({
    /** The registry's own answer about the plugin, `access` and `tier` among it. */
    plugin: PropTypes.object,
    versions: PropTypes.array,
    changelog: PropTypes.object,
    screenshots: PropTypes.array,
    advisory: PropTypes.object,
    blocked: PropTypes.object,
    removed: PropTypes.object,
  }).isRequired,
  loading: PropTypes.bool,
  offline: PropTypes.bool,
  failed: PropTypes.bool,
  unmatched: PropTypes.bool,
  registryHost: PropTypes.string,
  onRetry: PropTypes.func,
  /** The version running here, labelled rather than offered. Null on the available-plugin page. */
  installedVersion: PropTypes.string,
  /** Makes a version the active one. Null hides the column: nothing is installed to change. */
  onUseVersion: PropTypes.func,
  /** False on a page whose own header already carries the tier, so it is not said twice. */
  showTier: PropTypes.bool,
};

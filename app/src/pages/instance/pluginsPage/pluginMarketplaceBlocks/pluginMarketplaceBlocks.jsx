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
import { RegistryOfflineAlert } from '../registryOfflineAlert';
import { CatalogueUnavailableAlert } from '../catalogueUnavailableAlert';
import { isMarketplaceTrusted } from '../pluginsCatalog';
import { formatPublishDate, sortVersionsNewestFirst } from './utils';
import styles from './pluginMarketplaceBlocks.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  versions: {
    id: 'PluginMarketplaceBlocks.versions',
    defaultMessage: 'Versions',
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
    defaultMessage: 'The registry has no entry for this plugin',
  },
  unmatchedBody: {
    id: 'PluginMarketplaceBlocks.unmatchedBody',
    defaultMessage:
      'The registry lists no plugin matching this one, so no advisory, block, removal or update can be checked for it and none of its versions, screenshots or changelog can be shown. It keeps running, and uploading a .jar by hand is the only way to change its version.',
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
}) => {
  const { formatMessage, formatDate } = useIntl();
  const trusted = isMarketplaceTrusted({ offline, failed, unmatched });
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
      {offline && <RegistryOfflineAlert host={registryHost} />}
      {failed && <CatalogueUnavailableAlert onRetry={onRetry} />}
      {/* offline and failed already say why the registry knows nothing of this plugin */}
      {unmatched && !offline && !failed && (
        <div className={cx('alert')} data-automation-id="pluginUnmatchedAlert">
          <SystemMessage mode="info" header={formatMessage(messages.unmatchedHeader)}>
            {formatMessage(messages.unmatchedBody)}
          </SystemMessage>
        </div>
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
          {versions.length > 0 && (
            <section className={cx('block')} data-automation-id="pluginVersions">
              <h3 className={cx('block-header')}>{formatMessage(messages.versions)}</h3>
              <div className={cx('card')}>
                {sortVersionsNewestFirst(versions).map((entry) => (
                  <div
                    key={entry.version}
                    className={cx('version-row')}
                    data-automation-id="pluginVersionRow"
                  >
                    <span className={cx('version')}>{`v.${entry.version}`}</span>
                    <span className={cx('version-date')}>{date(entry.publishedAt)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

PluginMarketplaceBlocks.propTypes = {
  detail: PropTypes.shape({
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
};

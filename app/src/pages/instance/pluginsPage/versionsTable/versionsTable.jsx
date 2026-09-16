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

import { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Button, ChevronDownDropdownIcon, DownloadIcon } from '@reportportal/ui-kit';
import { VersionMark, VERSION_MARK_TONES } from '../versionMark';
import { sortVersionsNewestFirst, compareVersions, readRangeBound } from './utils';
import styles from './versionsTable.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  header: {
    id: 'PluginMarketplaceBlocks.versions',
    defaultMessage: 'Versions',
  },
  description: {
    id: 'VersionsTable.description',
    defaultMessage:
      'All versions published to the marketplace. Expand a version for its release notes, where provided.',
  },
  columnVersion: {
    id: 'VersionsTable.columnVersion',
    defaultMessage: 'Version',
  },
  columnReleased: {
    id: 'VersionsTable.columnReleased',
    defaultMessage: 'Released',
  },
  install: {
    id: 'PluginItem.install',
    defaultMessage: 'Install',
  },
  upgrade: {
    id: 'VersionsTable.upgrade',
    defaultMessage: 'Upgrade',
  },
  downgrade: {
    id: 'VersionsTable.downgrade',
    defaultMessage: 'Downgrade',
  },
  currentVersion: {
    id: 'PluginMarketplaceBlocks.installedVersion',
    defaultMessage: 'Current version',
  },
  blocked: {
    id: 'PluginMarketplaceBlocks.blockedVersion',
    defaultMessage: 'Blocked',
  },
  releaseNotes: {
    id: 'VersionsTable.releaseNotes',
    defaultMessage: 'Release notes',
  },
  noReleaseNotes: {
    id: 'VersionsTable.noReleaseNotes',
    defaultMessage: 'No changes were documented for this version.',
  },
  needsNewer: {
    id: 'VersionsTable.needsNewer',
    defaultMessage: 'Needs ReportPortal {version} or later. This instance runs {productVersion}.',
  },
  needsOlder: {
    id: 'VersionsTable.needsOlder',
    defaultMessage:
      'Built for ReportPortal {version} or earlier. This instance runs {productVersion}.',
  },
  incompatibleNoRelease: {
    id: 'VersionsTable.incompatibleNoRelease',
    defaultMessage: "This version doesn't run on the release this instance uses.",
  },
  blockedWithReason: {
    id: 'VersionsTable.blockedWithReason',
    defaultMessage:
      "Blocked on {blockedAt}: {reason} It keeps running, but can't be reinstalled or downgraded"
      + ' to.',
  },
  blockedOn: {
    id: 'VersionsTable.blockedOn',
    defaultMessage:
      "Blocked on {blockedAt}. It keeps running, but can't be reinstalled or downgraded to.",
  },
  blockedUndated: {
    id: 'VersionsTable.blockedUndated',
    defaultMessage:
      "Blocked by the marketplace. It keeps running, but can't be reinstalled or downgraded to.",
  },
  advisory: {
    id: 'VersionsTable.advisory',
    defaultMessage:
      'A {severity} security advisory was attached on {attachedAt}. Upgrade to {latestVersion}.',
  },
  advisoryNoUpgrade: {
    id: 'VersionsTable.advisoryNoUpgrade',
    defaultMessage: 'A {severity} security advisory was attached on {attachedAt}.',
  },
});

const ROW_ACTIONS = {
  INSTALL: 'INSTALL',
  UPGRADE: 'UPGRADE',
  DOWNGRADE: 'DOWNGRADE',
};

/**
 * Which way this version moves the instance. With nothing installed every row installs; otherwise
 * the row is the one running, a step forward, or a step back.
 */
const rowAction = (version, installedVersion) => {
  if (!installedVersion) {
    return ROW_ACTIONS.INSTALL;
  }
  if (version === installedVersion) {
    return null;
  }

  return compareVersions(version, installedVersion) > 0
    ? ROW_ACTIONS.UPGRADE
    : ROW_ACTIONS.DOWNGRADE;
};

const ACTION_MESSAGE = {
  [ROW_ACTIONS.INSTALL]: messages.install,
  [ROW_ACTIONS.UPGRADE]: messages.upgrade,
  [ROW_ACTIONS.DOWNGRADE]: messages.downgrade,
};

/**
 * Every version the registry published, and what each of them means for this instance.
 *
 * <p>A row carries two marks that are deliberately different colours and different questions. The
 * amber one says this build does not run here — the action is dead and the tooltip names the range
 * it wants beside the release this instance reports. The red one says the build runs but is under
 * a security advisory, and there the action stays alive: taking it is the user's call, and refusing
 * to let them move off a vulnerable version would be the worse answer.
 *
 * <p>Release notes are per version in the design and per *latest version* on the wire, so an
 * expanded row shows notes when it is the version the changelog belongs to and the "nothing was
 * documented" panel otherwise. That is not a placeholder: the empty panel is its own frame, and the
 * two states are honest about what the registry actually published.
 */
export const VersionsTable = ({
  versions,
  installedVersion = null,
  latestVersion = null,
  productVersion = null,
  changelog = null,
  onUseVersion = null,
  installing = false,
  removed = false,
  description = null,
}) => {
  const { formatMessage, formatDate } = useIntl();
  const ordered = sortVersionsNewestFirst(versions);
  // FR-A-04 asks the detail page to expose the changelog of the version on offer without the reader
  // having to find it, so the newer row opens on load. Only when there is one: with nothing
  // installed, or already on the newest build, no row is more interesting than any other and the
  // table starts closed.
  const newerThanInstalled =
    installedVersion && ordered.length > 0 && compareVersions(ordered[0].version, installedVersion) > 0
      ? ordered[0].version
      : null;
  const [expanded, setExpanded] = useState(newerThanInstalled);

  if (versions.length === 0) {
    return null;
  }

  const day = (value) =>
    value ? formatDate(value, { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const incompatibleReason = (entry) => {
    const bound = readRangeBound(entry.requires);
    // without a release to compare against, or a range this cannot make a sentence of, the honest
    // thing is to say only that it does not run here rather than print a range at the reader
    if (!bound || !productVersion) {
      return formatMessage(messages.incompatibleNoRelease);
    }

    return formatMessage(bound.direction === 'newer' ? messages.needsNewer : messages.needsOlder, {
      version: bound.version,
      productVersion,
    });
  };

  const blockedReason = (entry) => {
    if (!entry.blockedAt) {
      return formatMessage(messages.blockedUndated);
    }
    const blockedAt = day(entry.blockedAt);

    return entry.blockReason
      ? formatMessage(messages.blockedWithReason, { blockedAt, reason: entry.blockReason })
      : formatMessage(messages.blockedOn, { blockedAt });
  };

  const advisoryReason = ({ advisory }) => {
    const common = { severity: advisory.severity, attachedAt: day(advisory.attachedAt) };

    // nothing to move to when the advisory is on the newest build there is
    return latestVersion && latestVersion !== installedVersion
      ? formatMessage(messages.advisory, { ...common, latestVersion })
      : formatMessage(messages.advisoryNoUpgrade, common);
  };

  const renderInstalledState = () => (
    <span className={cx('state')} data-automation-id="installedVersionMarker">
      {formatMessage(messages.currentVersion)}
    </span>
  );

  const renderAction = (entry) => {
    // "Current version" is a state, not an action: a page that offers no version changes — a
    // removed plugin, or one that is not in the marketplace at all — still says which version is
    // running. Only the offers are withheld.
    const isInstalled = Boolean(installedVersion) && entry.version === installedVersion;
    if (removed || !onUseVersion) {
      return isInstalled ? renderInstalledState() : null;
    }
    // A blocked version keeps whatever the row would otherwise say — it is still the current one
    // if it is installed — and simply offers nothing. What happened to it is the mark's to explain,
    // beside the version it happened to, rather than a word where an action would be.
    if (entry.blocked) {
      return rowAction(entry.version, installedVersion) ? null : renderInstalledState();
    }

    const action = rowAction(entry.version, installedVersion);
    if (!action) {
      return renderInstalledState();
    }

    return (
      <Button
        variant="text"
        adjustWidthOn="content"
        data-automation-id="useVersionAction"
        data-action={action}
        icon={<DownloadIcon />}
        disabled={installing || entry.compatible === false}
        onClick={() => onUseVersion(entry.version)}
      >
        {formatMessage(ACTION_MESSAGE[action])}
      </Button>
    );
  };

  return (
    <section className={cx('versions-table')} data-automation-id="pluginVersions">
      <h3 className={cx('header')}>{formatMessage(messages.header)}</h3>
      <p className={cx('description')}>{description || formatMessage(messages.description)}</p>
      <div className={cx('columns')} data-automation-id="versionsColumns">
        <span className={cx('column')}>{formatMessage(messages.columnVersion)}</span>
        <span className={cx('column')}>{formatMessage(messages.columnReleased)}</span>
        <span />
      </div>
      {ordered.map((entry) => {
        const isOpen = expanded === entry.version;
        const notes = changelog?.version === entry.version ? changelog.lines || [] : [];

        return (
          <div
            key={entry.version}
            className={cx('version')}
            data-automation-id="pluginVersionRow"
            data-version={entry.version}
          >
            <div className={cx('row')}>
              <span className={cx('cell', 'version-cell')}>
                <button
                  type="button"
                  className={cx('chevron', { open: isOpen })}
                  aria-expanded={isOpen}
                  aria-label={entry.version}
                  data-automation-id="expandVersion"
                  onClick={() => setExpanded(isOpen ? null : entry.version)}
                >
                  <ChevronDownDropdownIcon />
                </button>
                <span className={cx('number')}>{entry.version}</span>
                {/* red, because a withdrawn version is about risk rather than about fit */}
                {entry.blocked && (
                  <VersionMark
                    tone={VERSION_MARK_TONES.DANGER}
                    automationId="blockedVersionMark"
                    tooltipContent={blockedReason(entry)}
                  />
                )}
                {entry.compatible === false && (
                  <VersionMark
                    tone={VERSION_MARK_TONES.INCOMPATIBLE}
                    automationId="incompatibleVersionMark"
                    tooltipContent={incompatibleReason(entry)}
                  />
                )}
                {entry.advisory && (
                  <VersionMark
                    tone={VERSION_MARK_TONES.DANGER}
                    automationId="advisoryVersionMark"
                    tooltipContent={advisoryReason(entry)}
                  />
                )}
              </span>
              <span className={cx('cell', 'date-cell')}>{day(entry.publishedAt)}</span>
              <span className={cx('cell', 'action-cell')}>{renderAction(entry)}</span>
            </div>
            {isOpen && (
              <div className={cx('notes')} data-automation-id="versionReleaseNotes">
                <h4 className={cx('notes-header')}>{formatMessage(messages.releaseNotes)}</h4>
                {notes.length > 0 ? (
                  notes.map((line) => (
                    <p key={line} className={cx('notes-line')} data-automation-id="releaseNoteLine">
                      {line}
                    </p>
                  ))
                ) : (
                  <p className={cx('notes-empty')} data-automation-id="noReleaseNotes">
                    {formatMessage(messages.noReleaseNotes)}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

VersionsTable.propTypes = {
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      version: PropTypes.string.isRequired,
      publishedAt: PropTypes.string,
      blocked: PropTypes.bool,
      /** service-api's verdict. Absent means it could not be decided, which is not a refusal. */
      compatible: PropTypes.bool,
      /** The range the version declares, quoted in the reason. */
      requires: PropTypes.string,
      advisory: PropTypes.shape({
        severity: PropTypes.string,
        text: PropTypes.string,
        attachedAt: PropTypes.string,
      }),
    }),
  ).isRequired,
  /** The version this instance runs, or null when the plugin is not installed. */
  installedVersion: PropTypes.string,
  /** The newest published version, named when advising a move off an advisory. */
  latestVersion: PropTypes.string,
  /** The release this instance reports, quoted when explaining a refusal. */
  productVersion: PropTypes.string,
  /** Release notes, which the wire carries for one version only. */
  changelog: PropTypes.shape({ version: PropTypes.string, lines: PropTypes.array }),
  /** Null when this page offers no version actions at all. */
  onUseVersion: PropTypes.func,
  installing: PropTypes.bool,
  removed: PropTypes.bool,
  /** Overrides the standard line under the heading, for a table that is not the usual history. */
  description: PropTypes.string,
};

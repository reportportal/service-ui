/*
 * Copyright 2019 EPAM Systems
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

import React, { Component } from 'react';
import track from 'react-tracking';
import { ADMIN_PROJECTS_PAGE_EVENTS } from 'components/main/analytics/events';
import { injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Icon } from 'components/main/icon/icon';
import { getRelativeUnits } from 'common/utils/timeDateUtils';
import { ProjectMenu } from '../../projectMenu';
import { StatisticsItem } from './statisticsItem';
import { ProjectTooltipIcon } from './projectTooltipIcon';
import { ProjectStatisticButton } from '../../projectStatisticButton';
import { ProjectName } from '../../projectName';
import { UPSA_PROJECT, PERSONAL_PROJECT, INTERNAL_PROJECT } from './constants';
import { messages } from './../../messages';
import styles from './projectPanel.scss';

const cx = classNames.bind(styles);

@injectIntl
@track()
export class ProjectPanel extends Component {
  static propTypes = {
    project: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  getProjectIcon() {
    const {
      intl,
      project: { entryType },
    } = this.props;
    switch (entryType) {
      case UPSA_PROJECT:
        return (
          <span className={cx('header-item')}>
            <ProjectTooltipIcon tooltipContent={intl.formatMessage(messages.linkedTooltip)}>
              <Icon type="icon-linked" />
            </ProjectTooltipIcon>
          </span>
        );
      case PERSONAL_PROJECT:
        return (
          <span className={cx('header-item')}>
            <ProjectTooltipIcon tooltipContent={intl.formatMessage(messages.personalTooltip)}>
              <Icon type="icon-person" />
            </ProjectTooltipIcon>
          </span>
        );
      default:
        return (
          <span className={cx('header-item')}>
            <ProjectTooltipIcon tooltipContent={intl.formatMessage(messages.internalTooltip)}>
              <Icon type="icon-internal" />
            </ProjectTooltipIcon>
          </span>
        );
    }
  }
  getOrganization() {
    const {
      intl,
      project: { entryType, organization },
    } = this.props;
    return (
      organization ||
      (entryType === PERSONAL_PROJECT && intl.formatMessage(messages.personal)) ||
      (entryType === INTERNAL_PROJECT && intl.formatMessage(messages.internal))
    );
  }

  render() {
    const {
      project: { projectName, entryType, lastRun, launchesQuantity, usersQuantity },
      intl,
    } = this.props;
    const { value: relativeTime, unit } = getRelativeUnits(new Date(lastRun).getTime());

    return (
      <div className={cx('container')}>
        <div className={cx('info-block')}>
          <div className={cx('header')}>
            {this.getProjectIcon(entryType)}
            <span className={cx('header-stretch-item', 'gray-text')}>{this.getOrganization()}</span>
            <span className={cx('header-item')}>
              <ProjectMenu project={this.props.project} />
            </span>
          </div>
          <div className={cx('name')}>
            <ProjectName project={this.props.project} />
          </div>
          {lastRun && (
            <div className={cx('gray-text')}>
              {intl.formatMessage(messages.lastLaunch, {
                date: intl.formatRelativeTime(relativeTime, unit),
              })}
            </div>
          )}
        </div>
        <hr className={cx('hr')} />
        <div className={cx('info-block')}>
          <div className={cx('statistic-items')}>
            <StatisticsItem
              caption={intl.formatMessage(messages.launchesQuantity)}
              value={launchesQuantity}
              emptyValueCaption={intl.formatMessage(messages.noLaunches)}
            />
            <StatisticsItem
              caption={intl.formatMessage(messages.membersQuantity)}
              value={usersQuantity}
              emptyValueCaption={intl.formatMessage(messages.noMembers)}
            />
            <ProjectStatisticButton
              projectName={projectName}
              onClick={() =>
                this.props.tracking.trackEvent(ADMIN_PROJECTS_PAGE_EVENTS.STATISTIC_ICON)
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

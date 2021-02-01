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
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { IN_PROGRESS, NOT_FOUND } from 'common/constants/testStatuses';
import { defectTypesSelector } from 'controllers/project';
import { statusLocalization } from 'common/constants/localization/statusLocalization';
import { getDuration } from 'common/utils';
import { HistoryLineItemBadge } from './historyLineItemBadges';
import styles from './historyLineItem.scss';

const cx = classNames.bind(styles);

@connect((state) => ({
  defectTypes: defectTypesSelector(state),
}))
@injectIntl
@track()
export class HistoryLineItem extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    defectTypes: PropTypes.object.isRequired,
    launchNumber: PropTypes.number,
    launchId: PropTypes.number,
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    active: PropTypes.bool,
    isLastItem: PropTypes.bool,
    statistics: PropTypes.shape({
      defects: PropTypes.object,
    }),
    hasChildren: PropTypes.bool,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    launchNumber: null,
    launchId: 0,
    id: 0,
    status: '',
    active: false,
    isLastItem: false,
    statistics: {},
    hasChildren: false,
    startTime: null,
    endTime: null,
    onClick: () => {},
  };

  getItemTitle = () => {
    const { intl, status, startTime, endTime } = this.props;
    let itemTitle = statusLocalization[status]
      ? intl.formatMessage(statusLocalization[status])
      : status;
    const isThreeDecimalPlaces = true;

    if (status !== NOT_FOUND && status !== IN_PROGRESS) {
      itemTitle = itemTitle.concat(`; ${getDuration(startTime, endTime, isThreeDecimalPlaces)}`);
    }
    return itemTitle;
  };

  render() {
    const {
      intl,
      launchNumber,
      status,
      active,
      isLastItem,
      statistics,
      onClick,
      tracking,
      ...rest
    } = this.props;
    const isNotEmpty = !this.props.hasChildren ? Object.keys(statistics.defects).length : false;

    return (
      <div
        className={cx('history-line-item', { active, 'last-item': isLastItem })}
        onClick={() => {
          tracking.trackEvent(LOG_PAGE_EVENTS.HISTORY_LINE_ITEM);
          onClick();
        }}
      >
        <div className={cx('status-block', `status-${status}`)} title={this.getItemTitle()}>
          #{launchNumber}
        </div>
        <div className={cx('defect-block', { 'not-empty': isNotEmpty })}>
          <HistoryLineItemBadge
            active={active}
            status={status}
            defects={!this.props.hasChildren ? statistics.defects : {}}
            {...rest}
          />
        </div>
      </div>
    );
  }
}

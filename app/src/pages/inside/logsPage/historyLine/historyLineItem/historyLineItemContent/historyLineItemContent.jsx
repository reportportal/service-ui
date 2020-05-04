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
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { NOT_FOUND, IN_PROGRESS } from 'common/constants/testStatuses';
import { statusLocalization } from 'common/constants/localization/statusLocalization';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { getDuration } from 'common/utils';
import classNames from 'classnames/bind';
import { HistoryLineItemBadges } from './historyLineItemBadges';
import styles from './historyLineItemContent.scss';

const cx = classNames.bind(styles);

@injectIntl
@track()
export class HistoryLineItemContent extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    status: PropTypes.string,
    statistics: PropTypes.shape({
      defects: PropTypes.object,
    }),
    hasChildren: PropTypes.bool,
    active: PropTypes.bool,
    isFirstItem: PropTypes.bool,
    isLastItem: PropTypes.bool,
    startTime: PropTypes.number,
    endTime: PropTypes.number,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    onClick: () => {},
    status: '',
    statistics: {},
    hasChildren: false,
    active: false,
    isFirstItem: false,
    isLastItem: false,
    startTime: null,
    endTime: null,
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
      status,
      active,
      isFirstItem,
      isLastItem,
      statistics,
      onClick,
      tracking,
      ...rest
    } = this.props;

    return (
      <div
        className={cx('history-line-item-content', `status-${status}`, {
          active,
          'first-item': isFirstItem,
          'last-item': isLastItem,
        })}
        title={this.getItemTitle()}
        onClick={() => {
          tracking.trackEvent(LOG_PAGE_EVENTS.HISTORY_LINE_ITEM);
          onClick();
        }}
      >
        <div className={cx('item-block-bg')} />
        <HistoryLineItemBadges
          active={active}
          status={status}
          defects={!this.props.hasChildren ? statistics.defects : {}}
          {...rest}
        />
      </div>
    );
  }
}

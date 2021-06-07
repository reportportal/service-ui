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
import { defectTypesSelector } from 'controllers/project';
import {
  includeAllLaunchesSelector,
  updateHistoryItemLaunchAttributesAction,
} from 'controllers/log';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { HistoryLineItemTooltip } from './historyLineItemTooltip';
import { HistoryLineItemBadge } from './historyLineItemBadges';
import { Triangles } from './triangles';
import styles from './historyLineItem.scss';

const cx = classNames.bind(styles);

export const HistoryLineItemContent = ({ active, showTriangles, testItem, defectTypes }) => {
  const { status, hasChildren, growthDuration, launchNumber, statistics } = testItem;
  const isNotEmpty = !hasChildren ? Object.keys(statistics.defects).length : false;

  return (
    <div className={cx('history-line-item-content')}>
      {showTriangles && (
        <div className={cx('triangles-wrapper')}>
          <Triangles growthDuration={growthDuration} />
        </div>
      )}
      <div className={cx('status-block', `status-${status}`)}>#{launchNumber}</div>
      <div className={cx('defect-block', { 'not-empty': isNotEmpty })}>
        <HistoryLineItemBadge
          active={active}
          defectTypes={defectTypes}
          defects={!hasChildren ? statistics.defects : {}}
          {...testItem}
        />
      </div>
    </div>
  );
};
HistoryLineItemContent.propTypes = {
  active: PropTypes.bool,
  defectTypes: PropTypes.object.isRequired,
  testItem: PropTypes.object.isRequired,
  showTriangles: PropTypes.bool,
  includeAllLaunches: PropTypes.bool,
  updateLaunchAttributes: PropTypes.func,
};
HistoryLineItemContent.defaultProps = {
  active: false,
  showTriangles: true,
  includeAllLaunches: false,
  updateLaunchAttributes: () => {},
};

const HistoryLineItemContentWithTooltip = withTooltip({
  TooltipComponent: HistoryLineItemTooltip,
  data: {
    dynamicWidth: true,
    placement: 'bottom',
    noMobile: true,
    dark: true,
    modifiers: {
      preventOverflow: { enabled: false },
      hide: { enabled: false },
    },
  },
})(HistoryLineItemContent);

@connect(
  (state) => ({
    includeAllLaunches: includeAllLaunchesSelector(state),
    defectTypes: defectTypesSelector(state),
  }),
  {
    updateLaunchAttributes: updateHistoryItemLaunchAttributesAction,
  },
)
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
    launchAttributes: PropTypes.array,
    includeAllLaunches: PropTypes.bool,
    updateLaunchAttributes: PropTypes.func,
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
    launchAttributes: null,
    includeAllLaunches: false,
    updateLaunchAttributes: () => {},
  };

  render() {
    const {
      intl,
      active,
      isLastItem,
      onClick,
      tracking,
      defectTypes,
      includeAllLaunches,
      updateLaunchAttributes,
      ...rest
    } = this.props;

    return (
      <div
        className={cx('history-line-item', { active, 'last-item': isLastItem })}
        onClick={() => {
          tracking.trackEvent(LOG_PAGE_EVENTS.HISTORY_LINE_ITEM);
          onClick();
        }}
      >
        <HistoryLineItemContentWithTooltip
          includeAllLaunches={includeAllLaunches}
          active={active}
          defectTypes={defectTypes}
          testItem={rest}
          updateLaunchAttributes={updateLaunchAttributes}
        />
      </div>
    );
  }
}

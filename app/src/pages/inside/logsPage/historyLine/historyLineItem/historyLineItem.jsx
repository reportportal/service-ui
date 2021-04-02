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
import { withTooltip } from 'components/main/tooltips/tooltip';
import { HistoryLineItemTooltip } from './historyLineItemTooltip';
import { HistoryLineItemBadge } from './historyLineItemBadges';
import { Triangles } from './triangles';
import styles from './historyLineItem.scss';

const cx = classNames.bind(styles);

export const HistoryLineItemContent = ({
  active,
  status,
  statistics,
  launchNumber,
  hasChildren,
  growthDuration,
  showTriangles,
  ...rest
}) => {
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
          status={status}
          defects={!hasChildren ? statistics.defects : {}}
          {...rest}
        />
      </div>
    </div>
  );
};
HistoryLineItemContent.propTypes = {
  active: PropTypes.bool,
  status: PropTypes.string,
  hasChildren: PropTypes.bool,
  statistics: PropTypes.shape({
    defects: PropTypes.object,
  }),
  launchNumber: PropTypes.number,
  growthDuration: PropTypes.number,
  showTriangles: PropTypes.bool,
};
HistoryLineItemContent.defaultProps = {
  active: false,
  status: '',
  hasChildren: false,
  statistics: {
    defects: {},
  },
  launchNumber: 0,
  growthDuration: null,
  showTriangles: true,
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
    isDefectEditorOpen: PropTypes.bool,
    launchAttributes: PropTypes.array,
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
    isDefectEditorOpen: false,
    launchAttributes: null,
  };

  render() {
    const { intl, active, isLastItem, onClick, tracking, isDefectEditorOpen, ...rest } = this.props;

    return (
      <div
        className={cx('history-line-item', {
          active,
          'last-item': isLastItem,
          inactive: !active && isDefectEditorOpen,
        })}
        onClick={() => {
          tracking.trackEvent(LOG_PAGE_EVENTS.HISTORY_LINE_ITEM);
          onClick();
        }}
      >
        <HistoryLineItemContentWithTooltip active={active} {...rest} />
      </div>
    );
  }
}

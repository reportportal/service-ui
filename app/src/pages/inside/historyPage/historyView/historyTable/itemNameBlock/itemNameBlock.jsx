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
import classNames from 'classnames/bind';
import { withTooltip } from 'components/main/tooltips/tooltip';
import { HISTORY_PAGE_EVENTS } from 'components/main/analytics/events';
import { NameLink } from 'pages/inside/common/nameLink';
import { ItemInfoToolTip } from './itemInfoToolTip';
import styles from './itemNameBlock.scss';

const cx = classNames.bind(styles);

@withTooltip({
  TooltipComponent: ItemInfoToolTip,
  data: {
    width: 'auto',
    placement: 'left',
    noArrow: true,
    desktopOnly: true,
  },
})
@track()
export class ItemNameBlock extends Component {
  static propTypes = {
    data: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    ownLinkParams: PropTypes.object,
  };

  static defaultProps = {
    data: {},
    ownLinkParams: {},
  };

  render() {
    const { data, ownLinkParams, tracking } = this.props;

    return (
      <NameLink
        itemId={data.id}
        ownLinkParams={ownLinkParams}
        className={cx('name-link')}
        onClick={() => tracking.trackEvent(HISTORY_PAGE_EVENTS.CLICK_ON_ITEM)}
      >
        <p className={cx('history-grid-record-name')}>{data.name}</p>
      </NameLink>
    );
  }
}

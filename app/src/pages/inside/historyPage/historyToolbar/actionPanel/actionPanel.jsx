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

import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import track from 'react-tracking';
import RefreshIcon from 'common/img/refresh-inline.svg';
import { HISTORY_PAGE_EVENTS } from 'components/main/analytics/events';
import { breadcrumbsSelector, restorePathAction } from 'controllers/testItem';
import { Breadcrumbs, breadcrumbDescriptorShape } from 'components/main/breadcrumbs';
import { GhostButton } from 'components/buttons/ghostButton';
import { CompareWithFilterControl } from './compareWithFilterControl';
import styles from './actionPanel.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    breadcrumbs: breadcrumbsSelector(state),
  }),
  {
    restorePath: restorePathAction,
  },
)
@track()
export class ActionPanel extends Component {
  static propTypes = {
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    breadcrumbs: PropTypes.arrayOf(breadcrumbDescriptorShape),
    customBlock: PropTypes.node,
    buttons: PropTypes.array,
    hasErrors: PropTypes.bool,
    showBreadcrumbs: PropTypes.bool,
    onRefresh: PropTypes.func,
    restorePath: PropTypes.func,
  };

  static defaultProps = {
    breadcrumbs: [],
    customBlock: null,
    buttons: [],
    hasErrors: false,
    showBreadcrumbs: true,
    onRefresh: () => {},
    restorePath: () => {},
  };

  refreshItemsAction = () => {
    this.props.tracking.trackEvent(HISTORY_PAGE_EVENTS.REFRESH_BTN);
    this.props.onRefresh();
  };

  render() {
    const {
      breadcrumbs,
      restorePath,
      showBreadcrumbs,
      hasErrors,
      buttons,
      customBlock,
    } = this.props;

    return (
      <div className={cx('action-panel', { 'right-buttons-only': !showBreadcrumbs && !hasErrors })}>
        {showBreadcrumbs && <Breadcrumbs descriptors={breadcrumbs} onRestorePath={restorePath} />}
        {customBlock}
        <div className={cx('action-buttons')}>
          <div className={cx('action-button')}>
            <CompareWithFilterControl disabled={!showBreadcrumbs} />
          </div>
          {!!buttons.length &&
            buttons.map((button, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className={cx('action-button')}>
                {button}
              </div>
            ))}
          <div className={cx('action-button')}>
            <GhostButton
              icon={RefreshIcon}
              onClick={this.refreshItemsAction}
              disabled={!showBreadcrumbs}
            >
              <FormattedMessage id="Common.refresh" defaultMessage="Refresh" />
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }
}

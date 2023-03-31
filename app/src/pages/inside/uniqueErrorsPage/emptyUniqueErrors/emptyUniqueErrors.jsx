/*
 * Copyright 2021 EPAM Systems
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

import classNames from 'classnames/bind';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { track } from 'react-tracking';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { IN_PROGRESS } from 'common/constants/testStatuses';
import { UNIQUE_ERRORS_PAGE_EVENTS } from 'components/main/analytics/events';
import { ANALYZER_TYPES } from 'common/constants/analyzerTypes';
import { activeProjectSelector } from 'controllers/user';
import { showModalAction } from 'controllers/modal';
import { loadingSelector } from 'controllers/uniqueErrors';
import { fetchParentLaunchSuccessAction } from 'controllers/testItem/actionCreators';
import { showDefaultErrorNotification, showNotification } from 'controllers/notification';
import { GhostButton } from 'components/buttons/ghostButton';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { BubblesPreloader } from 'components/preloaders/bubblesPreloader';
import { RP_CLUSTER_LAST_RUN } from '../constants';
import { messages } from '../messages';
import styles from './emptyUniqueErrors.scss';

const cx = classNames.bind(styles);

@track()
@injectIntl
@connect(
  (state) => ({
    projectId: activeProjectSelector(state),
    loading: loadingSelector(state),
  }),
  {
    showModal: showModalAction,
    showNotification,
    showDefaultErrorNotification,
    fetchParentLaunchSuccessAction,
  },
)
export class EmptyUniqueErrors extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    projectId: PropTypes.string,
    showModal: PropTypes.func,
    showNotification: PropTypes.func,
    showDefaultErrorNotification: PropTypes.func,
    parentLaunch: PropTypes.object,
    loading: PropTypes.bool,
    fetchParentLaunchSuccessAction: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    projectId: '',
    showModal: () => {},
    showNotification: () => {},
    showDefaultErrorNotification: () => {},
    parentLaunch: {},
    loading: false,
  };

  openModal = () => {
    const { tracking } = this.props;
    this.props.showModal({
      id: 'uniqueErrorsAnalyzeModal',
      data: {
        launch: this.props.parentLaunch,
        updateLaunchLocally: (data) => this.props.fetchParentLaunchSuccessAction(data),
        events: UNIQUE_ERRORS_PAGE_EVENTS,
      },
    });
    UNIQUE_ERRORS_PAGE_EVENTS.CLICK_RUN_BUTTON &&
      tracking.trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.CLICK_RUN_BUTTON);
  };

  getBody = () => {
    const {
      parentLaunch: { status, metadata, analysing },
      intl: { formatMessage },
    } = this.props;
    const clusterActive =
      analysing && analysing.find((item) => item === ANALYZER_TYPES.CLUSTER_ANALYSER);
    const disabled = status === IN_PROGRESS;
    const lastRunAnalysis = metadata && metadata[RP_CLUSTER_LAST_RUN];

    if (clusterActive) {
      return (
        <>
          <div className={cx('empty-unique-errors-loader')}>
            <BubblesPreloader />
          </div>
          <p className={cx('empty-unique-errors-text')}>
            {formatMessage(messages.inProgressAnalysisText)}
          </p>
          <div className={cx('empty-unique-errors-btn')}>
            <GhostButton disabled>{formatMessage(messages.inProgressUniqueErrBtn)}</GhostButton>
          </div>
        </>
      );
    } else {
      return (
        <>
          <p className={cx('empty-unique-errors-headline')}>
            {formatMessage(messages.emptyUniqueErrHeadline)}
          </p>

          <p className={cx('empty-unique-errors-text')}>
            {lastRunAnalysis
              ? formatMessage(messages.rerunAnalysisText)
              : formatMessage(messages.emptyUniqueErrText)}
          </p>

          <div className={cx('empty-unique-errors-btn')}>
            <GhostButton
              onClick={this.openModal}
              disabled={disabled}
              title={disabled ? formatMessage(messages.emptyUniqueErrDisableBtnTooltip) : null}
            >
              {formatMessage(messages.emptyUniqueErrBtn)}
            </GhostButton>
          </div>
        </>
      );
    }
  };

  render() {
    const { loading } = this.props;

    return (
      <>
        {loading ? (
          <SpinningPreloader />
        ) : (
          <div className={cx('empty-unique-errors')}>
            <div className={cx('empty-unique-errors-content')}>
              <div className={cx('empty-unique-errors-img')} />
              {this.getBody()}
            </div>
          </div>
        )}
      </>
    );
  }
}

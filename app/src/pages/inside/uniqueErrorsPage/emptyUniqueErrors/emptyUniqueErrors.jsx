/*
 * Copyright 2024 EPAM Systems
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
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { BubblesLoader } from '@reportportal/ui-kit';
import { IN_PROGRESS } from 'common/constants/testStatuses';
import { UNIQUE_ERRORS_PAGE_EVENTS } from 'components/main/analytics/events';
import { ANALYZER_TYPES } from 'common/constants/analyzerTypes';
import { showModalAction } from 'controllers/modal';
import { loadingSelector } from 'controllers/uniqueErrors';
import { fetchParentLaunchSuccessAction } from 'controllers/testItem/actionCreators';
import { GhostButton } from 'components/buttons/ghostButton';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { canWorkWithTests } from 'common/utils/permissions';
import { userRolesSelector } from 'controllers/pages';
import { RP_CLUSTER_LAST_RUN } from '../constants';
import { messages } from '../messages';
import styles from './emptyUniqueErrors.scss';

const cx = classNames.bind(styles);

export function EmptyUniqueErrors({ parentLaunch }) {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const loading = useSelector(loadingSelector);
  const dispatch = useDispatch();
  const userRoles = useSelector(userRolesSelector);

  const { status, metadata, analysing } = parentLaunch;
  const clusterActive = analysing?.find((item) => item === ANALYZER_TYPES.CLUSTER_ANALYSER);
  const disabled = status === IN_PROGRESS;
  const lastRunAnalysis = metadata?.[RP_CLUSTER_LAST_RUN];
  const canManageItems = canWorkWithTests(userRoles);

  const openModal = () => {
    dispatch(
      showModalAction({
        id: 'uniqueErrorsAnalyzeModal',
        data: {
          launch: parentLaunch,
          updateLaunchLocally: (data) => dispatch(fetchParentLaunchSuccessAction(data)),
          events: UNIQUE_ERRORS_PAGE_EVENTS,
        },
      }),
    );
    UNIQUE_ERRORS_PAGE_EVENTS.CLICK_RUN_BUTTON &&
      trackEvent(UNIQUE_ERRORS_PAGE_EVENTS.CLICK_RUN_BUTTON);
  };

  const getHeadlineMessage = () => {
    if (!canManageItems) {
      return formatMessage(messages.noUniqueErrYetHeadline);
    }
    return lastRunAnalysis
      ? formatMessage(messages.noUniqueErrHeadline)
      : formatMessage(messages.noUniqueErrRunHeadline);
  };

  const getTextMessage = () => {
    if (!canManageItems) {
      return formatMessage(messages.emptyUniqueErrTextViewer);
    }
    return lastRunAnalysis
      ? formatMessage(messages.rerunAnalysisText)
      : formatMessage(messages.emptyUniqueErrText);
  };

  if (loading) {
    return <SpinningPreloader />;
  }

  return (
    <div className={cx('empty-unique-errors')}>
      <div className={cx('empty-unique-errors-content')}>
        <div className={cx('empty-unique-errors-img')} />
        {clusterActive ? (
          <>
            <div className={cx('empty-unique-errors-loader')}>
              <BubblesLoader />
            </div>
            <p className={cx('empty-unique-errors-text')}>
              {formatMessage(messages.inProgressAnalysisText)}
            </p>
            <div className={cx('empty-unique-errors-btn')}>
              <GhostButton disabled>{formatMessage(messages.inProgressUniqueErrBtn)}</GhostButton>
            </div>
          </>
        ) : (
          <>
            <p className={cx('empty-unique-errors-headline')}>{getHeadlineMessage()}</p>
            <p className={cx('empty-unique-errors-text')}>{getTextMessage()}</p>

            {canManageItems && (
              <div className={cx('empty-unique-errors-btn')}>
                <GhostButton
                  onClick={openModal}
                  disabled={disabled}
                  title={disabled ? formatMessage(messages.emptyUniqueErrDisableBtnTooltip) : null}
                >
                  {formatMessage(messages.emptyUniqueErrBtn)}
                </GhostButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

EmptyUniqueErrors.propTypes = {
  parentLaunch: PropTypes.object,
};

EmptyUniqueErrors.defaultProps = {
  parentLaunch: {},
};

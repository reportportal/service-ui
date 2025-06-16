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

import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { BigButton } from 'components/buttons/bigButton';
import { GhostButton } from 'components/buttons/ghostButton';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './footer.scss';

const messages = defineMessages({
  deleteImportantLaunches: {
    id: 'Footer.deleteImportantLaunches',
    defaultMessage: 'Delete Important Launches',
  },
  deleteImportantLaunch: {
    id: 'Footer.deleteImportantLaunch',
    defaultMessage: 'Delete Important Launch',
  },
  deleteWithImportantLaunch: {
    id: 'Footer.deleteWithImportantLaunch',
    defaultMessage: 'Delete with Important Launches',
  },
  deleteOnlyRegular: {
    id: 'Footer.deleteOnlyRegular',
    defaultMessage: 'Delete only regular',
  },
});

const cx = classNames.bind(styles);

export function Footer({
  launches,
  selectedRegularLaunches,
  selectedImportantLaunches,
  confirmDeleteLaunches,
  onClickOk,
  closeHandler,
}) {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  return (
    <div className={cx('modal-footer')}>
      <div className={cx('buttons-block')}>
        <div className={cx('button-container', 'left')}>
          {selectedRegularLaunches.length > 0 ? (
            <GhostButton
              color="red"
              onClick={() => {
                confirmDeleteLaunches(launches);
                onClickOk();
                trackEvent(
                  LAUNCHES_MODAL_EVENTS.getClickDeleteWithImportantLaunchesBtnModalEvent(
                    launches.length > 1,
                  ),
                );
              }}
              transparentBorder
            >
              {formatMessage(messages.deleteWithImportantLaunch)}
            </GhostButton>
          ) : (
            <GhostButton
              color="red"
              onClick={() => {
                confirmDeleteLaunches(selectedImportantLaunches);
                onClickOk();
                trackEvent(
                  LAUNCHES_MODAL_EVENTS.getClickDeleteImportantLaunchesBtnModalEvent(
                    selectedImportantLaunches.length > 1,
                  ),
                );
              }}
              transparentBorder
            >
              {formatMessage(
                selectedImportantLaunches.length > 1
                  ? messages.deleteImportantLaunches
                  : messages.deleteImportantLaunch,
              )}
            </GhostButton>
          )}
        </div>
        <div className={cx('button-container')}>
          <BigButton color="gray-60" onClick={closeHandler}>
            {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
          </BigButton>
        </div>
        {selectedRegularLaunches.length > 0 && (
          <div className={cx('button-container')}>
            <BigButton
              color="tomato"
              onClick={() => {
                confirmDeleteLaunches(selectedRegularLaunches);
                onClickOk();
                trackEvent(
                  LAUNCHES_MODAL_EVENTS.getClickDeleteRegularLaunchesBtnModalEvent(
                    selectedRegularLaunches.length > 1,
                  ),
                );
              }}
            >
              {formatMessage(messages.deleteOnlyRegular)}
            </BigButton>
          </div>
        )}
      </div>
    </div>
  );
}
Footer.propTypes = {
  launches: PropTypes.array.isRequired,
  selectedRegularLaunches: PropTypes.array.isRequired,
  selectedImportantLaunches: PropTypes.array.isRequired,
  confirmDeleteLaunches: PropTypes.func.isRequired,
  onClickOk: PropTypes.func.isRequired,
  closeHandler: PropTypes.func.isRequired,
};

/*
 * Copyright 2025 EPAM Systems
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
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { ModalLayout } from 'components/main/modal';
import { setLogsPaginationAction } from 'controllers/user';
import { NAMESPACE, refreshLogPageData } from 'controllers/log';
import { querySelector } from 'controllers/log/selectors';
import { updatePagePropertiesAction } from 'controllers/pages';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { messages } from '../messages';
import styles from './paginationModal.scss';

const cx = classNames.bind(styles);

export const PaginationModal = ({ paginationOn }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const currentQuery = useSelector((state) => querySelector(state, NAMESPACE));

  const handleConfirm = (closeModal) => {
    const newQuery = { ...currentQuery };
    delete newQuery[PAGE_KEY];
    delete newQuery[SIZE_KEY];

    trackEvent(LOG_PAGE_EVENTS.getTogglePaginationEvent(paginationOn));
    dispatch(setLogsPaginationAction(paginationOn));
    dispatch(updatePagePropertiesAction(createNamespacedQuery(newQuery, NAMESPACE)));
    dispatch(refreshLogPageData());
    closeModal();
  };

  return (
    <ModalLayout
      title={paginationOn ? formatMessage(messages.turnOn) : formatMessage(messages.turnOff)}
      okButton={{
        text: paginationOn
          ? formatMessage(messages.turnOnAndReload)
          : formatMessage(messages.turnOffAndReload),
        onClick: handleConfirm,
      }}
      cancelButton={{
        text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
    >
      <div className={cx('content')}>
        <p>
          {paginationOn
            ? formatMessage(messages.turnOnDescription)
            : formatMessage(messages.turnOffDescription)}
        </p>
        {!paginationOn && <p>{formatMessage(messages.turnOffNote)}</p>}
      </div>
    </ModalLayout>
  );
};

PaginationModal.propTypes = {
  paginationOn: PropTypes.bool.isRequired,
};

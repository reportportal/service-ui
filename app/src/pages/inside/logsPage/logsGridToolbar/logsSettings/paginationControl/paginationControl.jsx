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
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { showModalAction } from 'controllers/modal';
import { logsPaginationSelector } from 'controllers/user';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { messages } from './messages';
import { PaginationModal } from './paginationModal/paginationModal';
import styles from './paginationControl.scss';

const cx = classNames.bind(styles);

export const PaginationControl = ({ closeDropdown }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const logsPagination = useSelector(logsPaginationSelector);

  const handleTogglePagination = () => {
    const newValue = !logsPagination;

    dispatch(showModalAction({ component: <PaginationModal paginationOn={newValue} /> }));
    trackEvent(LOG_PAGE_EVENTS.getClickPaginationOptionEvent(newValue));
    closeDropdown();
  };

  return (
    <button className={cx('pagination-option')} onClick={handleTogglePagination}>
      {logsPagination ? formatMessage(messages.turnOff) : formatMessage(messages.turnOn)}
      <span>...</span>
    </button>
  );
};

PaginationControl.propTypes = {
  closeDropdown: PropTypes.func.isRequired,
};

/*
 * Copyright 2026 EPAM Systems
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

import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { BubblesLoader } from '@reportportal/ui-kit';
import { useCanLockDashboard } from 'common/hooks/useCanLockDashboard';
import { activeProjectSelector } from 'controllers/user';
import { URLS } from 'common/urls';
import { ERROR_CANCELED, fetch } from 'common/utils/fetch';
import { messages } from '../messages';
import styles from './lockedFilterTooltipContent.scss';

const cx = classNames.bind(styles);

const VISIBLE_LIMIT = 9;

export const LockedFilterTooltipContent = ({ itemId }) => {
  const { formatMessage } = useIntl();
  const activeProject = useSelector(activeProjectSelector);
  const canLock = useCanLockDashboard();
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const cancelRequestRef = useRef(() => {});

  useEffect(() => {
    if (!activeProject || !itemId || !canLock) return;


    const loadDashboards = () => {
      const cancelRequestFunc = (cancel) => {
        cancelRequestRef.current = cancel;
      };

      setLoading(true);

      fetch(URLS.filter(activeProject, itemId), { abort: cancelRequestFunc })
        .then((data = {}) => {
          setNames(data.lockedDashboards || []);
        })
        .catch((err) => {
          if (err.message !== ERROR_CANCELED) {
            setNames([]);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    };

    loadDashboards();

    return () => {
      cancelRequestRef.current();
    };
  }, [activeProject, itemId, canLock]);

  if (!canLock) {
    return <div className={cx('content', 'narrow')}>{formatMessage(messages.lockedFilter)}</div>;
  }

  const intro = formatMessage(messages.lockedFilterIntro);
  const visible = names.slice(0, VISIBLE_LIMIT);
  const restCount = names.length - VISIBLE_LIMIT;

  return (
    <div className={cx('content', 'wide')}>
      <div className={cx('intro')}>{intro}</div>
      {loading ? (
        <BubblesLoader />
      ) : (
        visible.length > 0 && (
          <>
            <ul className={cx('list')}>
              {visible.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            {restCount > 0 && (
              <div className={cx('more')}>
                {formatMessage(messages.lockedFilterMore, { count: restCount })}
              </div>
            )}
          </>
        )
      )}
    </div>
  );
};

LockedFilterTooltipContent.propTypes = {
  itemId: PropTypes.number,
};
LockedFilterTooltipContent.defaultProps = {
  itemId: null,
};

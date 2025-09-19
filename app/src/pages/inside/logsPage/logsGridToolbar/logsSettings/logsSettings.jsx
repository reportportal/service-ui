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

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { useTracking } from 'react-tracking';
import { useSelector, useDispatch } from 'react-redux';
import { Manager, Reference, Popper } from 'react-popper';
import { useOnClickOutside } from 'common/hooks';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import { noLogsCollapsingSelector, setNoLogsCollapsingAction } from 'controllers/user';
import SettingsIcon from 'common/img/settings-icon-inline.svg';
import { messages } from './messages';
import styles from './logsSettings.scss';

const cx = classNames.bind(styles);

export const LogsSettings = ({ isConsoleViewMode }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const noLogsCollapsing = useSelector(noLogsCollapsingSelector);
  const [isOpened, setOpened] = useState(false);
  const containerRef = useRef(null);

  const handleClickOutside = () => {
    if (isOpened) {
      setOpened(false);
    }
  };
  useOnClickOutside(containerRef, handleClickOutside);

  const toggleDropdown = () => {
    trackEvent(LOG_PAGE_EVENTS.clickSettingsIcon(!isOpened));
    setOpened((prevState) => !prevState);
  };

  const toggleNoLogsCollapsing = () => {
    const newValue = !noLogsCollapsing;
    trackEvent(LOG_PAGE_EVENTS.getToggleNoLogsCollapsingEvent(newValue));

    dispatch(setNoLogsCollapsingAction(newValue));
    setOpened(false);
  };

  return (
    <Manager>
      <div ref={containerRef} className={cx('logs-settings-container')}>
        <Reference>
          {({ ref }) => (
            <i
              ref={ref}
              className={cx('settings-icon', { opened: isOpened })}
              onClick={toggleDropdown}
            >
              {Parser(SettingsIcon)}
            </i>
          )}
        </Reference>
        {isOpened && (
          <Popper
            placement="bottom"
            modifiers={{
              preventOverflow: {
                boundariesElement: 'viewport',
                priority: ['left', 'right'],
              },
              flip: {
                enabled: false,
              },
            }}
          >
            {({ placement, ref, style }) => (
              <div
                data-placement={placement}
                ref={ref}
                style={style}
                className={cx('settings-content', { opened: isOpened })}
              >
                <div className={cx('settings-block')}>
                  <div className={cx('header')}>{formatMessage(messages.logAppearance)}</div>
                  {!isConsoleViewMode && (
                    <div className={cx('item')}>
                      <InputCheckbox value={noLogsCollapsing} onChange={toggleNoLogsCollapsing}>
                        {formatMessage(messages.noLogsCollapsing)}
                      </InputCheckbox>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Popper>
        )}
      </div>
    </Manager>
  );
};

LogsSettings.propTypes = {
  isConsoleViewMode: PropTypes.bool,
};

LogsSettings.defaultProps = {
  isConsoleViewMode: false,
};

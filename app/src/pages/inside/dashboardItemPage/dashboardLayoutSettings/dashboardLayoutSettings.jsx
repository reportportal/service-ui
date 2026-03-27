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

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { Manager, Popper, Reference } from 'react-popper';
import { useOnClickOutside } from 'common/hooks';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import SettingsIcon from 'common/img/settings-icon-inline.svg';
import styles from './dashboardLayoutSettings.scss';

const messages = defineMessages({
  dashboardLayout: {
    id: 'DashboardLayoutSettings.dashboardLayout',
    defaultMessage: 'Dashboard Layout',
  },
  fullWidthMode: {
    id: 'DashboardLayoutSettings.fullWidthMode',
    defaultMessage: 'Full-width Mode',
  },
});

const cx = classNames.bind(styles);

export const DashboardLayoutSettings = ({
  className,
  fullWidthMode,
  onOpen,
  onToggleFullWidthMode,
}) => {
  const { formatMessage } = useIntl();
  const [isOpened, setOpened] = useState(false);
  const containerRef = useRef(null);

  const closeDropdown = () => {
    setOpened(false);
  };

  useOnClickOutside(containerRef, () => {
    if (isOpened) {
      closeDropdown();
    }
  });

  const toggleDropdown = () => {
    if (!isOpened) {
      onOpen();
    }

    setOpened((prevState) => !prevState);
  };

  const toggleFullWidthMode = () => {
    onToggleFullWidthMode();
    closeDropdown();
  };

  return (
    <Manager>
      <div ref={containerRef} className={cx('dashboard-layout-settings', className)}>
        <Reference>
          {({ ref }) => (
            <button
              ref={ref}
              className={cx('settings-icon', { opened: isOpened })}
              onClick={toggleDropdown}
              type="button"
              title={formatMessage(messages.dashboardLayout)}
              aria-label={formatMessage(messages.dashboardLayout)}
            >
              {Parser(SettingsIcon)}
            </button>
          )}
        </Reference>
        {isOpened && (
          <Popper
            placement="bottom-start"
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
                className={cx('settings-content')}
              >
                <div className={cx('settings-block')}>
                  <div className={cx('header')}>{formatMessage(messages.dashboardLayout)}</div>
                  <div className={cx('item')}>
                    <InputCheckbox value={fullWidthMode} onChange={toggleFullWidthMode}>
                      {formatMessage(messages.fullWidthMode)}
                    </InputCheckbox>
                  </div>
                </div>
              </div>
            )}
          </Popper>
        )}
      </div>
    </Manager>
  );
};

DashboardLayoutSettings.propTypes = {
  className: PropTypes.string,
  fullWidthMode: PropTypes.bool,
  onOpen: PropTypes.func,
  onToggleFullWidthMode: PropTypes.func,
};

DashboardLayoutSettings.defaultProps = {
  className: '',
  fullWidthMode: false,
  onOpen: () => {},
  onToggleFullWidthMode: () => {},
};

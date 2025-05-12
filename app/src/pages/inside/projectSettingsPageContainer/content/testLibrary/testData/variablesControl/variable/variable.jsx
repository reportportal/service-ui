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
import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';

import { MeatballMenuIcon, EditIcon, HideIcon, DeleteIcon } from '@reportportal/ui-kit';

import { PopoverControl } from 'pages/common/popoverControl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import styles from './variable.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  hideValues: {
    id: 'Variable.hideValues',
    defaultMessage: 'Hide values',
  },
  deleteVariable: {
    id: 'Variable.deleteVariable',
    defaultMessage: 'Delete variable',
  },
});

export const Variable = ({ variable }) => {
  const [isBlockHovered, setIsBlockHovered] = useState(false);
  const [areToolsOpen, setAreToolsOpen] = useState(false);
  const [areToolsShown, setAreToolsShown] = useState(false);
  const { formatMessage } = useIntl();

  const toolItems = [
    {
      label: formatMessage(COMMON_LOCALE_KEYS.RENAME),
      icon: <EditIcon />,
    },
    {
      label: formatMessage(messages.hideValues),
      icon: <HideIcon />,
    },
    {
      label: formatMessage(messages.deleteVariable),
      icon: <DeleteIcon />,
      className: cx('variable__tools--red'),
    },
  ];

  useEffect(() => {
    if (areToolsOpen || isBlockHovered) {
      setAreToolsShown(true);
    }

    if (!areToolsOpen && !isBlockHovered) {
      setAreToolsShown(false);
    }
  }, [areToolsOpen, isBlockHovered]);

  return (
    <div
      key={variable}
      className={cx('variable')}
      role="menuitem"
      tabIndex={0}
      onFocus={() => setIsBlockHovered(true)}
      onBlur={() => setIsBlockHovered(false)}
      onMouseEnter={() => setIsBlockHovered(true)}
      onMouseLeave={() => setIsBlockHovered(false)}
    >
      <div className={cx('variable__name-wrapper')}>
        <div className={cx('variable__name')}>{variable.name}</div>
        {variable.areValuesHidden && <HideIcon />}
      </div>
      <button
        className={cx('variable__tools', {
          'variable__tools--shown': areToolsShown,
        })}
        onClick={() => setAreToolsOpen(true)}
      >
        <PopoverControl items={toolItems} isOpened={areToolsOpen} setIsOpened={setAreToolsOpen}>
          <div className={cx('variable__meatball')}>
            <MeatballMenuIcon />
          </div>
        </PopoverControl>
      </button>
    </div>
  );
};

Variable.propTypes = {
  variable: PropTypes.object.isRequired,
};

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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import classNames from 'classnames/bind';
import { TO_INVESTIGATE_LOCATOR_PREFIX } from 'common/constants/defectTypes';
import { isEmptyObject } from 'common/utils';
import { messages } from '../../../../messages';
import styles from './itemsListHeader.scss';

const cx = classNames.bind(styles);

export const ItemsListHeader = ({
  currentTestItem,
  testItems,
  setItems,
  selectedItemsLength,
  selectedItems,
  showErrorLogs,
  onShowErrorLogsChange,
  optionValue,
  eventsInfo,
}) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const [isAllSelected, setIsAllSelected] = useState(selectedItems.length === testItems.length);
  const defectFromTIGroup = (
    (!isEmptyObject(currentTestItem) && currentTestItem) ||
    testItems[0]
  ).issue.issueType.startsWith(TO_INVESTIGATE_LOCATOR_PREFIX);

  useEffect(() => {
    setIsAllSelected(selectedItems.length === testItems.length);
  }, [selectedItems]);

  const onToggleAllItems = () => {
    setItems({
      selectedItems: isAllSelected ? [] : testItems,
    });
    const { onSelectAllItems } = eventsInfo;
    const args = {
      defectFromTIGroup,
      state: isAllSelected,
      optionLabel: optionValue && messages[optionValue].defaultMessage,
    };
    onSelectAllItems && trackEvent(onSelectAllItems(args));
  };
  const onShowLogsChange = () => {
    setItems({
      testItems: testItems.map((item) => ({ ...item, opened: !showErrorLogs })),
    });
    onShowErrorLogsChange(!showErrorLogs);
    const { toggleShowErrLogsSwitcher } = eventsInfo;
    trackEvent(toggleShowErrLogsSwitcher({ defectFromTIGroup, state: !showErrorLogs }));
  };

  return (
    <div className={cx('header-row')}>
      <InputCheckbox value={isAllSelected} onChange={onToggleAllItems} iconTransparentBackground>
        <span className={cx('checkbox-label')}>
          {formatMessage(messages.selectedItemCount, {
            selected: selectedItemsLength,
            total: testItems.length,
          })}
        </span>
      </InputCheckbox>
      <InputCheckbox value={showErrorLogs} onChange={onShowLogsChange} iconTransparentBackground>
        <span className={cx('checkbox-label')}>{formatMessage(messages.showErrorLogs)}</span>
      </InputCheckbox>
    </div>
  );
};
ItemsListHeader.propTypes = {
  currentTestItem: PropTypes.object,
  testItems: PropTypes.array,
  setItems: PropTypes.func,
  selectedItemsLength: PropTypes.number,
  selectedItems: PropTypes.array,
  showErrorLogs: PropTypes.bool,
  onShowErrorLogsChange: PropTypes.func,
  optionValue: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  eventsInfo: PropTypes.object,
};
ItemsListHeader.defaultProps = {
  currentTestItem: {},
  setItems: () => {},
  selectedItemsLength: 0,
  testItems: [],
  selectedItems: [],
  showErrorLogs: false,
  onShowErrorLogsChange: () => {},
  optionValue: '',
  eventsInfo: {},
};

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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { messages } from '../../messages';
import { ItemsList } from './itemsList';
import { OptionsBlock } from './optionsBlock';
import { CURRENT_EXECUTION_ONLY } from '../../constants';
import styles from './optionsSection.scss';

const cx = classNames.bind(styles);

export const OptionsSection = ({
  currentTestItem,
  setModalState,
  modalState,
  eventsInfo,
  loading,
}) => {
  const { formatMessage } = useIntl();
  const { optionValue, testItems, selectedItems } = modalState;

  return (
    <>
      <div className={cx('header-block')}>
        <span className={cx('header')}>{formatMessage(messages.applyFor)}</span>
        <OptionsBlock
          optionValue={optionValue}
          currentTestItem={currentTestItem}
          loading={loading}
          setModalState={setModalState}
          eventsInfo={eventsInfo}
        />
      </div>
      <div className={cx('items-list')}>
        <ItemsList
          currentTestItem={currentTestItem}
          setItems={setModalState}
          testItems={testItems}
          selectedItems={selectedItems}
          loading={loading}
          optionValue={optionValue}
          eventsInfo={eventsInfo}
        />
        {!loading && !testItems.length && optionValue !== CURRENT_EXECUTION_ONLY && (
          <div className={cx('no-items')}>{formatMessage(messages.noItems)}</div>
        )}
      </div>
    </>
  );
};
OptionsSection.propTypes = {
  currentTestItem: PropTypes.object,
  setModalState: PropTypes.func,
  loading: PropTypes.bool,
  isBulkOperation: PropTypes.bool,
  modalState: PropTypes.object,
  eventsInfo: PropTypes.object,
};
OptionsSection.defaultProps = {
  currentTestItem: {},
  setModalState: () => {},
  loading: false,
  isBulkOperation: false,
  modalState: {},
  eventsInfo: {},
};

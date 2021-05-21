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
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { CURRENT_EXECUTION_ONLY } from 'pages/inside/stepPage/modals/editDefectModals/constants';
import { ItemsListHeader } from './itemsListHeader';
import { ItemsListBody } from './itemsListBody';

export const ItemsList = ({
  testItems,
  selectedItems,
  setModalState,
  loading,
  optionValue,
  isShownLess,
  isBulkOperation,
}) => {
  const [showErrorLogs, setShowErrorLogs] = useState(false);
  useEffect(() => {
    setShowErrorLogs(false);
  }, [optionValue]);

  return loading ? (
    <SpinningPreloader />
  ) : (
    testItems.length > 0 && (
      <>
        {optionValue !== CURRENT_EXECUTION_ONLY && (
          <ItemsListHeader
            testItems={testItems}
            setModalState={setModalState}
            selectedItems={selectedItems}
            selectedItemsLength={selectedItems.length}
            showErrorLogs={showErrorLogs}
            onShowErrorLogsChange={setShowErrorLogs}
            optionValue={optionValue}
            isShownLess={isShownLess}
            isBulkOperation={isBulkOperation}
          />
        )}
        <ScrollWrapper autoHeight autoHeightMax={515} hideTracksWhenNotNeeded>
          <ItemsListBody
            testItems={testItems}
            selectedItems={selectedItems}
            setModalState={setModalState}
            showErrorLogs={optionValue === CURRENT_EXECUTION_ONLY || showErrorLogs}
            optionValue={optionValue}
            isShownLess={isShownLess}
            isBulkOperation={isBulkOperation}
          />
        </ScrollWrapper>
      </>
    )
  );
};
ItemsList.propTypes = {
  testItems: PropTypes.array,
  selectedItems: PropTypes.array,
  loading: PropTypes.bool,
  setModalState: PropTypes.func,
  optionValue: PropTypes.string,
  selectAllItems: PropTypes.func,
  isBulkOperation: PropTypes.bool,
  isShownLess: PropTypes.bool,
};
ItemsList.defaultProps = {
  testItems: [],
  selectedItems: [],
  loading: false,
  setModalState: () => {},
  optionValue: '',
  selectAllItems: () => {},
  isBulkOperation: false,
  isShownLess: true,
};

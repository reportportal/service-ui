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
import { useIntl } from 'react-intl';
import { Accordion, useAccordionTabsState } from 'pages/inside/common/accordion';
import { SOURCE_DETAILS } from '../../constants';
import { SourceDetails } from './sourceDetails';
import { ItemsList } from './itemsList';
import { OptionsBlock } from './optionsBlock';
import { OptionsSection } from './optionsSection';
import { messages } from './../../messages';

export const OptionsStepForm = ({
  info,
  currentTestItem,
  optionValue,
  onChangeOption,
  loading,
  testItems,
  selectedItems,
  setModalState,
}) => {
  const { formatMessage } = useIntl();
  const [tab, toggleTab, collapseTabsExceptCurr] = useAccordionTabsState({
    [SOURCE_DETAILS]: true,
  });
  const tabsData = [
    {
      id: SOURCE_DETAILS,
      shouldShow: true,
      isOpen: tab[SOURCE_DETAILS],
      title: formatMessage(messages.sourceDetails),
      content: <SourceDetails info={info} />,
    },
  ];
  const changeOption = (value) => {
    onChangeOption(value);
    collapseTabsExceptCurr();
  };

  return (
    <>
      <Accordion tabs={tabsData} toggleTab={toggleTab} />
      <OptionsSection
        optionsBlock={
          <OptionsBlock
            optionValue={optionValue}
            onChange={changeOption}
            currentTestItem={currentTestItem}
            loading={loading}
          />
        }
        itemsListBlock={
          <ItemsList
            setModalState={setModalState}
            testItems={testItems}
            selectedItems={selectedItems}
            loading={loading}
            optionValue={optionValue}
          />
        }
      />
    </>
  );
};
OptionsStepForm.propTypes = {
  info: PropTypes.object,
  currentTestItem: PropTypes.object,
  optionValue: PropTypes.string,
  onChangeOption: PropTypes.func,
  loading: PropTypes.bool,
  testItems: PropTypes.array,
  selectedItems: PropTypes.array,
  setModalState: PropTypes.func,
};
OptionsStepForm.defaultProps = {
  info: {},
  currentTestItem: {},
  optionValue: '',
  onChangeOption: () => {},
  loading: false,
  testItems: [],
  selectedItems: [],
  setModalState: () => {},
};

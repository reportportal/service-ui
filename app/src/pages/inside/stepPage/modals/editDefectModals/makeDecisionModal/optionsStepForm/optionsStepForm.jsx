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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { defectTypesSelector } from 'controllers/project';
import { Accordion, useAccordionTabsState } from 'pages/inside/common/accordion';
import {
  CURRENT_EXECUTION_ONLY,
  SOURCE_DETAILS,
} from 'pages/inside/stepPage/modals/editDefectModals/constants';
import { InputRadioGroup } from 'components/inputs/inputRadioGroup';
import { LogItem } from 'pages/inside/logsPage/defectEditor/logItem';
import { SourceDetails } from './sourceDetails';
import { messages } from './../../messages';
import styles from './optionsStepForm.scss';

const cx = classNames.bind(styles);

export const OptionsStepForm = ({ info, itemData }) => {
  const { formatMessage } = useIntl();
  const defectTypes = Object.values(useSelector(defectTypesSelector)).flat();

  const [tab, toggleTab] = useAccordionTabsState({
    [SOURCE_DETAILS]: true,
  });
  const [optionValue, setOptionValue] = useState(CURRENT_EXECUTION_ONLY);
  const options = [
    {
      ownValue: CURRENT_EXECUTION_ONLY,
      label: {
        id: CURRENT_EXECUTION_ONLY,
        defaultMessage: formatMessage(messages.currentExecutionOnly),
      },
    },
  ];

  const tabsData = [
    {
      id: SOURCE_DETAILS,
      shouldShow: true,
      isOpen: tab[SOURCE_DETAILS],
      title: formatMessage(messages.sourceDetails),
      content: <SourceDetails info={info} defectTypes={defectTypes} />,
    },
  ];

  return (
    <>
      <Accordion tabs={tabsData} toggleTab={toggleTab} />
      <div className={cx('options-section')}>
        <div className={cx('header-block')}>
          <span className={cx('header')}>{formatMessage(messages.applyTo)}</span>
          <span className={cx('subheader')}>{formatMessage(messages.applyToSimilarItems)}:</span>
        </div>
        <div className={cx('options-block')}>
          <div className={cx('options')}>
            <InputRadioGroup
              value={optionValue}
              onChange={setOptionValue}
              options={options}
              inputGroupClassName={cx('radio-input-group')}
              inputClassNames={{
                togglerClassName: cx('input-toggler'),
                childrenClassName: cx('input-children'),
              }}
            />
          </div>
          <div className={cx('items-list')}>
            {optionValue === CURRENT_EXECUTION_ONLY && (
              <LogItem item={itemData} showErrorLogs preselected />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
OptionsStepForm.propTypes = {
  info: PropTypes.object,
  toggleAccordionTab: PropTypes.func,
  itemData: PropTypes.object,
};

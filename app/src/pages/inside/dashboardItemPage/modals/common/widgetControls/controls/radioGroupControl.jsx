/*
 * Copyright 2019 EPAM Systems
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
import { ModalField } from 'components/main/modal';
import { RadioGroup } from 'componentLibrary/radioGroup';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import {
  EXCLUDING_SKIPPED,
  formGroupControlMessage,
  getWidgetPassingRateOptions,
  TOTAL_TEST_CASES,
} from '../utils/getWidgetPassingRateOptions';
import style from './radioGroupControl.scss';

const cx = classNames.bind(style);
const LABEL_WIDTH = 120;

export const RadioGroupControl = ({ onChange, radioButtonValue }) => {
  const { formatMessage } = useIntl();
  const options = getWidgetPassingRateOptions(formatMessage);

  const handleValueChange = ({ target: { value } }) => {
    const includeSkipped = value === TOTAL_TEST_CASES;
    onChange(includeSkipped);
  };

  return (
    <ModalField
      label={formatMessage(formGroupControlMessage)}
      labelWidth={LABEL_WIDTH}
      className={cx('radioGroupControl-wrapper')}
    >
      <RadioGroup
        options={options}
        className={cx('radioGroup')}
        value={radioButtonValue ? TOTAL_TEST_CASES : EXCLUDING_SKIPPED}
        onChange={handleValueChange}
      />
    </ModalField>
  );
};

RadioGroupControl.propTypes = {
  onChange: PropTypes.func,
  radioButtonValue: PropTypes.bool,
};

RadioGroupControl.defaultProps = {
  onChange: () => {},
  radioButtonValue: true,
};

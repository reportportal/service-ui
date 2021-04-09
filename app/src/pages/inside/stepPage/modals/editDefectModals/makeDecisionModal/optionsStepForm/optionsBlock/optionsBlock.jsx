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
import { InputRadioGroup } from 'components/inputs/inputRadioGroup';
import classNames from 'classnames/bind';
import { TO_INVESTIGATE } from 'common/constants/defectTypes';
import { useSelector } from 'react-redux';
import { activeFilterSelector } from 'controllers/filter';
import { defectTypesSelector } from 'controllers/project';
import {
  CURRENT_EXECUTION_ONLY,
  LAST_TEN_LAUNCHES,
  SIMILAR_TI_CURRENT_LAUNCH,
  WITH_FILTER,
} from '../../../constants';
import { messages } from '../../../messages';
import styles from './optionsBlock.scss';

const cx = classNames.bind(styles);

export const OptionsBlock = ({ optionValue, onChange, currentTestItem, loading }) => {
  const { formatMessage } = useIntl();
  const activeFilter = useSelector(activeFilterSelector);
  const defectTypes = Object.values(useSelector(defectTypesSelector)).flat();
  const getOptions = () => {
    const currentDefectType = defectTypes.find(
      (type) => type.locator === currentTestItem.issue.issueType,
    );
    const options = [
      {
        ownValue: CURRENT_EXECUTION_ONLY,
        label: {
          id: CURRENT_EXECUTION_ONLY,
          defaultMessage: formatMessage(messages.currentExecutionOnly),
        },
      },
    ];
    if (currentDefectType.typeRef === TO_INVESTIGATE.toUpperCase()) {
      const optionalOptions = [
        {
          ownValue: SIMILAR_TI_CURRENT_LAUNCH,
          label: {
            id: SIMILAR_TI_CURRENT_LAUNCH,
            defaultMessage: formatMessage(messages.similarTICurrentLaunch),
          },
        },
        {
          ownValue: LAST_TEN_LAUNCHES,
          label: {
            id: LAST_TEN_LAUNCHES,
            defaultMessage: formatMessage(messages.lastTenLaunches),
          },
        },
      ];
      activeFilter &&
        optionalOptions.push({
          ownValue: WITH_FILTER,
          label: {
            id: WITH_FILTER,
            defaultMessage: formatMessage(messages.withFilter, {
              filterName: activeFilter.name,
            }),
          },
        });
      return [...options, ...optionalOptions];
    }
    return options;
  };

  return (
    <div className={cx('options', { loading })}>
      <InputRadioGroup
        value={optionValue}
        onChange={onChange}
        options={getOptions()}
        inputGroupClassName={cx('radio-input-group')}
        inputClassNames={{
          togglerClassName: cx('input-toggler'),
          childrenClassName: cx('input-children'),
        }}
      />
    </div>
  );
};
OptionsBlock.propTypes = {
  optionValue: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  currentTestItem: PropTypes.object,
  loading: PropTypes.bool,
};
OptionsBlock.defaultProps = {
  onChange: PropTypes.func,
  currentTestItem: {},
  loading: false,
};

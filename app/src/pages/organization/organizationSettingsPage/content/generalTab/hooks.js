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

import { settingsMessages } from 'common/constants/localization/settingsLocalization';
import { useIntl } from 'react-intl';

export const useRetentionUtils = (formValues) => {
  const { formatMessage } = useIntl();

  const getRetentionOptions = () => {
    return [
      { label: formatMessage(settingsMessages.week1), value: 7 },
      { label: formatMessage(settingsMessages.week2), value: 14 },
      { label: formatMessage(settingsMessages.week3), value: 21 },
      { label: formatMessage(settingsMessages.month1), value: 30 },
      { label: formatMessage(settingsMessages.month3), value: 90 },
      { label: formatMessage(settingsMessages.month6), value: 180 },
      { label: formatMessage(settingsMessages.forever), value: 0 },
    ];
  };

  const formatInputValues = (values) => {
    if (!values) {
      return {};
    }
    const arrValues = Object.entries(values).map(([key, value]) => [
      key,
      value === 0 ? Infinity : value,
    ]);
    const mapValues = new Map(arrValues);
    const inputValues = Object.fromEntries(mapValues);
    return inputValues;
  };

  const getLaunchesOptions = () => {
    const inputValues = formatInputValues(formValues);
    const options = getRetentionOptions();
    const newOptions = options.map((elem) => {
      const disabled =
        elem.value !== 0 &&
        (elem.value < inputValues.keepLogs || elem.value < inputValues.keepScreenshots);
      return {
        ...elem,
        disabled,
        title: formatMessage(settingsMessages.keepLaunchesTooltip),
      };
    });

    return newOptions;
  };

  const getLogOptions = () => {
    const inputValues = formatInputValues(formValues);
    const options = getRetentionOptions();
    const newOptions = options.map((elem) => {
      const disabled =
        elem.value === 0
          ? inputValues.keepLaunches !== Infinity
          : elem.value < inputValues.keepScreenshots;
      const hidden =
        elem.value === 0
          ? inputValues.keepLaunches !== Infinity
          : elem.value > inputValues.keepLaunches;
      return {
        ...elem,
        disabled,
        hidden,
        title: formatMessage(settingsMessages.keepLogsTooltip),
      };
    });

    return newOptions;
  };

  const getScreenshotsOptions = () => {
    const inputValues = formatInputValues(formValues);
    const options = getRetentionOptions();
    const newOptions = options.map((elem) => {
      const isHidden =
        elem.value === 0 ? elem.value !== inputValues.keepLogs : elem.value > inputValues.keepLogs;
      const hidden = inputValues.keepLogs === Infinity ? false : isHidden;
      return { ...elem, hidden };
    });

    return newOptions;
  };

  return {
    getLaunchesOptions,
    getLogOptions,
    getScreenshotsOptions,
  };
};

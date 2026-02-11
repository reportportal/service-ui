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

import { useState } from 'react';
import {
  NAME_FIELD_KEY,
  LEVEL_FIELD_KEY,
  LABEL_COLOR_FIELD_KEY,
  BACKGROUND_COLOR_FIELD_KEY,
  TEXT_COLOR_FIELD_KEY,
  DEFAULT_LABEL_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
} from './constants';

const getDefaultColors = () => ({
  [LABEL_COLOR_FIELD_KEY]: DEFAULT_LABEL_COLOR,
  [BACKGROUND_COLOR_FIELD_KEY]: DEFAULT_BACKGROUND_COLOR,
  [TEXT_COLOR_FIELD_KEY]: DEFAULT_TEXT_COLOR,
});

export const useLogTypeFormState = (initialColors = null, initialTextBold = false) => {
  const [colors, setColors] = useState(initialColors || getDefaultColors());
  const [textBold, setTextBold] = useState(initialTextBold);

  const handleColorChange = (tabKey, color) => {
    setColors((prev) => ({
      ...prev,
      [tabKey]: color,
    }));
  };

  const getFormData = (formValues, isFilterable = false, isSystem = false) => ({
    name: (formValues[NAME_FIELD_KEY] || '').trim(),
    level: Number(formValues[LEVEL_FIELD_KEY]),
    style: {
      label_color: colors[LABEL_COLOR_FIELD_KEY],
      background_color: colors[BACKGROUND_COLOR_FIELD_KEY],
      text_color: colors[TEXT_COLOR_FIELD_KEY],
      text_style: textBold ? 'bold' : 'normal',
    },
    is_filterable: isFilterable,
    is_system: isSystem,
  });

  return {
    colors,
    textBold,
    handleColorChange,
    setTextBold,
    getFormData,
  };
};

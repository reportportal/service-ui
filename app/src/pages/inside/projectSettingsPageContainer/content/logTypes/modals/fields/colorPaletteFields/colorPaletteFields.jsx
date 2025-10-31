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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import className from 'classnames/bind';
import { useIntl } from 'react-intl';
import { FieldLabel, Toggle } from '@reportportal/ui-kit';
import { HexColorPickerComponent } from 'components/main/hexColorPicker';
import { FieldProvider } from 'components/fields';
import { ColorPalettePreview } from '../../../colorPalettePreview';
import { messages } from '../../messages';
import {
  LABEL_COLOR_FIELD_KEY,
  BACKGROUND_COLOR_FIELD_KEY,
  TEXT_COLOR_FIELD_KEY,
  TEXT_BOLD_FIELD_KEY,
  DEFAULT_LABEL_COLOR,
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TEXT_COLOR,
} from '../../constants';
import styles from './colorPaletteFields.scss';

const cx = className.bind(styles);

const tabsMessages = {
  [LABEL_COLOR_FIELD_KEY]: messages.labelColor,
  [BACKGROUND_COLOR_FIELD_KEY]: messages.backgroundColor,
  [TEXT_COLOR_FIELD_KEY]: messages.textColor,
};

export const ColorPaletteFields = ({ colors, textBold, onColorChange, onTextBoldChange }) => {
  const { formatMessage } = useIntl();
  const [activeTab, setActiveTab] = useState(LABEL_COLOR_FIELD_KEY);

  return (
    <div className={cx('color-palette')}>
      <FieldLabel className={cx('color-palette-title')}>
        {formatMessage(messages.colorPalette)}
      </FieldLabel>
      <div className={cx('color-palette-settings')}>
        {[LABEL_COLOR_FIELD_KEY, BACKGROUND_COLOR_FIELD_KEY, TEXT_COLOR_FIELD_KEY].map((tabKey) => (
          <div key={tabKey} className={cx('color-palette-item')}>
            <button
              className={cx('color-tab', { active: activeTab === tabKey })}
              style={{ backgroundColor: colors[tabKey] }}
              onClick={() => setActiveTab(tabKey)}
            />
            <span>{formatMessage(tabsMessages[tabKey])}</span>
          </div>
        ))}
        <div className={cx('color-palette-item')}>
          <div className={cx('toggle')}>
            <FieldProvider
              name={TEXT_BOLD_FIELD_KEY}
              onChange={(event) => onTextBoldChange(event.target.checked)}
              value={textBold}
            >
              <Toggle />
            </FieldProvider>
          </div>
          <span>{formatMessage(messages.textBold)}</span>
        </div>
      </div>
      <ColorPalettePreview
        backgroundColor={colors[BACKGROUND_COLOR_FIELD_KEY]}
        borderColor={colors[LABEL_COLOR_FIELD_KEY]}
        color={colors[TEXT_COLOR_FIELD_KEY]}
        fontWeight={textBold ? 'bold' : 'normal'}
        text="Preview: log example"
      />
      {[LABEL_COLOR_FIELD_KEY, BACKGROUND_COLOR_FIELD_KEY, TEXT_COLOR_FIELD_KEY].map((tabKey) => (
        <div key={tabKey} className={cx('hex-color-picker', { active: activeTab === tabKey })}>
          <FieldProvider
            name={tabKey}
            onChange={(color) => onColorChange(tabKey, color)}
            value={colors[tabKey]}
          >
            <HexColorPickerComponent />
          </FieldProvider>
        </div>
      ))}
    </div>
  );
};

ColorPaletteFields.propTypes = {
  colors: PropTypes.shape({
    [LABEL_COLOR_FIELD_KEY]: PropTypes.string,
    [BACKGROUND_COLOR_FIELD_KEY]: PropTypes.string,
    [TEXT_COLOR_FIELD_KEY]: PropTypes.string,
  }).isRequired,
  textBold: PropTypes.bool.isRequired,
  onColorChange: PropTypes.func.isRequired,
  onTextBoldChange: PropTypes.func.isRequired,
};

ColorPaletteFields.defaultProps = {
  colors: {
    [LABEL_COLOR_FIELD_KEY]: DEFAULT_LABEL_COLOR,
    [BACKGROUND_COLOR_FIELD_KEY]: DEFAULT_BACKGROUND_COLOR,
    [TEXT_COLOR_FIELD_KEY]: DEFAULT_TEXT_COLOR,
  },
};

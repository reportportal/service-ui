/*
 * Copyright 2022 EPAM Systems
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
import { HexColorPicker, HexColorInput } from 'react-colorful';
import classNames from 'classnames/bind';
import { COLORS } from './hexColorPickerSettings';
import styles from './hexColorPicker.scss';

const cx = classNames.bind(styles);

export const HexColorPickerComponent = ({ label, color, onChange }) => {
  const [currentColor, setCurrentColor] = useState(color);

  useEffect(() => onChange(currentColor), [currentColor]);

  useEffect(() => setCurrentColor(color), [color]);

  return (
    <div className={cx('hex-color-picker')}>
      <div className={cx('label')}>{label}</div>
      <HexColorPicker color={currentColor} onChange={setCurrentColor} />
      <section>
        <div className={cx('hex-color-input-wrapper')}>
          <span>HEX</span>
          <HexColorInput color={currentColor} onChange={setCurrentColor} prefixed />
          <div className={cx('hex-color-preset', 'current')} style={{ background: currentColor }} />
        </div>
        <div className={cx('hex-color-presets')}>
          {COLORS.map((presetColor) => (
            <button
              key={presetColor}
              className={cx('hex-color-preset')}
              style={{ background: presetColor }}
              onClick={() => setCurrentColor(presetColor)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

HexColorPickerComponent.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

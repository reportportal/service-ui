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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { MarkdownViewer } from 'components/main/markdown';
import styles from './colorPalettePreview.scss';

const cx = classNames.bind(styles);

export const ColorPalettePreview = ({ backgroundColor, color, borderColor, fontWeight, text }) => {
  return (
    <div className={cx('sample-container')}>
      <div className={cx('log-sample')} style={{ backgroundColor, color, borderColor }}>
        <MarkdownViewer className={cx('log-text', { bold: fontWeight === 'bold' })} value={text} />
      </div>
    </div>
  );
};

ColorPalettePreview.propTypes = {
  backgroundColor: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
  fontWeight: PropTypes.string.isRequired,
  text: PropTypes.string,
};

ColorPalettePreview.defaultProps = {
  text: 'Log example',
};

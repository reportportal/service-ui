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

import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import DOMPurify from 'dompurify';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import styles from './sectionBlockHeader.scss';

const cx = classNames.bind(styles);

export const SectionBlockHeader = injectIntl(({ 
  intl: { formatMessage }, 
  header = {}, 
  hint = {}, 
  hintParams = {}, 
  leftAligned = false,
}) => (
  <span className={cx('block-header', { 'left-aligned': leftAligned })}>
    <span className={cx('huge-message')}>{formatMessage(header)}</span>
    <span className={cx('section-hint-message')}>
      {Parser(
        DOMPurify.sanitize(
          formatMessage(hint, {
            b: (data) => `<b>${data}</b>`,
            ...hintParams,
          }),
        ),
      )}
    </span>
  </span>
));
SectionBlockHeader.propTypes = {
  header: PropTypes.object,
  hint: PropTypes.object,
  hintParams: PropTypes.object,
  leftAligned: PropTypes.bool,
};

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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import LeftArrowIcon from 'common/img/arrow-left-small-inline.svg';
import Parser from 'html-react-parser';
import styles from './mostPopularPatterns.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  back: {
    id: 'MostPopularPatterns.back',
    defaultMessage: 'Back',
  },
});

export const SecondLevelPanel = injectIntl(({ intl, patternName, onBackClick }) => (
  <div className={cx('second-level-panel')}>
    <div className={cx('back')} onClick={onBackClick}>
      <i className={cx('icon')}>{Parser(LeftArrowIcon)}</i>
      <span className={cx('back-text')}>{intl.formatMessage(messages.back)}</span>
    </div>
    <div className={cx('pattern')}>{patternName}</div>
  </div>
));

SecondLevelPanel.propTypes = {
  patternName: PropTypes.string,
  onBackClick: PropTypes.func,
};

SecondLevelPanel.defaultProps = {
  patternName: '',
  onBackClick: () => {},
};

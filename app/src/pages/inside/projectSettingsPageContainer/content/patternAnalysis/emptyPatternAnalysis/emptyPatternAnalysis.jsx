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

import React from 'react';
import classNames from 'classnames/bind';
import { Button } from 'componentLibrary/button';
import Parser from 'html-react-parser';
import ExternalLinkIcon from 'common/img/open-in-rounded-inline.svg';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import PropTypes from 'prop-types';
import styles from './emptyPatternAnalysis.scss';
import { messages } from './messages';

const cx = classNames.bind(styles);

const EmptyPatternAnalysis = ({ onAddPattern }) => {
  const { formatMessage } = useIntl();
  return (
    <div className={cx('container')}>
      <div className={cx('img')} />
      <span className={cx('title')}>{formatMessage(messages.noPatternAnalysisTitle)}</span>
      <span className={cx('description')}>
        {formatMessage(messages.noPatternAnalysisDescription)}
      </span>
      <Button wide onClick={onAddPattern}>
        {formatMessage(messages.noPatternAnalysisCreate)}
      </Button>
      <a
        href={'https://reportportal.io/docs/Pattern-Analysis'}
        target="_blank"
        className={cx('link')}
      >
        <span>{formatMessage(COMMON_LOCALE_KEYS.documentation)}</span>
        <div className={cx('icon')}>{Parser(ExternalLinkIcon)}</div>
      </a>
    </div>
  );
};

EmptyPatternAnalysis.propTypes = {
  onAddPattern: PropTypes.func,
};

EmptyPatternAnalysis.defaultProps = {
  onAddPattern: () => {},
};

export default EmptyPatternAnalysis;

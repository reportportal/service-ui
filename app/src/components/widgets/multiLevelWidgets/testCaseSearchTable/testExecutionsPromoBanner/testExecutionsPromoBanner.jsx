/*
 * Copyright 2026 EPAM Systems
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
import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import NavigationIcon from 'common/img/navigation-icon-inline.svg';
import OpenInNewTabIcon from 'common/img/open-in-new-tab-inline.svg';
import { widgetDocsReferences } from 'common/utils/referenceDictionary';
import { messages } from '../messages';
import styles from './testExecutionsPromoBanner.scss';

const cx = classNames.bind(styles);

export const TestExecutionsPromoBanner = ({ onOpenNewSearch, onDocumentationClick }) => {
  const { formatMessage } = useIntl();

  const handleDocumentationClick = () => {
    onDocumentationClick?.();
  };

  return (
    <div className={cx('banner')}>
      <div className={cx('banner-content')}>
        <div className={cx('search-icon')} aria-hidden="true">
          {Parser(NavigationIcon)}
        </div>
        <div className={cx('banner-text')}>
          <span className={cx('banner-title')}>{formatMessage(messages.bannerTitle)}</span>
          <span className={cx('banner-subtitle')}>{formatMessage(messages.bannerSubtitle)}</span>
        </div>
      </div>
      <div className={cx('banner-actions')}>
        <a
          className={cx('documentation-link')}
          href={widgetDocsReferences.testExecutions}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDocumentationClick}
        >
          {formatMessage(messages.documentationButton)}
          <span className={cx('external-link-icon')}>{Parser(OpenInNewTabIcon)}</span>
        </a>
        <button type="button" className={cx('open-new-search-btn')} onClick={onOpenNewSearch}>
          {formatMessage(messages.openNewSearchButton)}
        </button>
      </div>
    </div>
  );
};

TestExecutionsPromoBanner.propTypes = {
  onOpenNewSearch: PropTypes.func,
  onDocumentationClick: PropTypes.func,
};

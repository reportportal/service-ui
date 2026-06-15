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
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import DOMPurify from 'dompurify';
import { useIntl } from 'react-intl';
import { marked } from 'marked-lts';

import styles from './postBlock.scss';

const cx = classNames.bind(styles);

export const renderer = {
  link(href, text, title) {
    if (text && title) {
      return `<a class=${cx(
        'twit-link',
      )} href="${href}" target="_blank" rel="noopener noreferrer" title="${text}">${title}</a>`;
    } else if (title) {
      return `<a class=${cx(
        'twit-link',
      )} href="${href}" target="_blank" rel="noopener noreferrer"">${title}</a>`;
    }
    return `<a class=${cx(
      'twit-link',
    )} href="${href}" target="_blank" rel="noopener noreferrer"">${href}</a>`;
  },
};

marked.use(
  {
    mangle: false,
    headerIds: false,
    breaks: true,
  },
  {
    renderer,
  },
);

const getPostContent = (text) => marked.parse(text);

const formatTweetDate = (tweetData, locale) => {
  const dateValue = tweetData.created_at || tweetData.date || tweetData.createdAt;
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
};

export const PostBlock = ({ tweetData, stackLayer, isStacked, isStackFront, stackTopOffset, isExpanded }) => {
  const { locale } = useIntl();
  const formattedDate = formatTweetDate(tweetData, locale);

  return (
    <div
      className={cx('post-block', {
        'post-block--stacked': isStacked && stackLayer !== null,
        'post-block--stack-front': isStacked && isStackFront,
        'post-block--stack-back': isStacked && !isStackFront,
        [`post-block--stack-layer-${stackLayer}`]: isStacked && stackLayer !== null,
        'post-block--expanded': isExpanded,
      })}
      style={stackTopOffset !== null ? { top: `${stackTopOffset}px` } : undefined}
    >
      <div className={cx('post-header')}>
        <div className={cx('post-avatar')} />
        <div className={cx('post-meta')}>
          <div className={cx('post-author')}>
            <span className={cx('post-name')}>ReportPortal.io</span>
            <span className={cx('post-handle')}>@ReportPortal.io</span>
            {formattedDate && (
              <>
                <span className={cx('post-separator')}>•</span>
                <span className={cx('post-date')}>{formattedDate}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={cx('post-content')}>
        {Parser(DOMPurify.sanitize(getPostContent(tweetData.text)))}
      </div>
    </div>
  );
};

PostBlock.propTypes = {
  tweetData: PropTypes.object,
  stackLayer: PropTypes.number,
  isStacked: PropTypes.bool,
  isStackFront: PropTypes.bool,
  stackTopOffset: PropTypes.number,
  isExpanded: PropTypes.bool,
};

PostBlock.defaultProps = {
  tweetData: {},
  stackLayer: null,
  isStacked: false,
  isStackFront: false,
  stackTopOffset: null,
  isExpanded: false,
};

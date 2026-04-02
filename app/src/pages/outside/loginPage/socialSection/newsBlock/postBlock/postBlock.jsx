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

const getPostContent = (text) => {
  const result = marked.parse(text);
  return result;
};

export const PostBlock = ({ tweetData }) => (
  <div className={cx('post-block')}>
    {Parser(DOMPurify.sanitize(getPostContent(tweetData.text)))}
  </div>
);

PostBlock.propTypes = {
  tweetData: PropTypes.object,
};

PostBlock.defaultProps = {
  tweetData: {},
};

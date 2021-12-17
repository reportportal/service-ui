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
import { LOGIN_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './postBlock.scss';

const cx = classNames.bind(styles);
const HREF_TAG_NAME = 'A';

const getPostContent = (text, entities) => {
  const replaceObjects = [];
  let result = '';
  let currentReplaceObject;

  const parseEntitie = (curEntities, getHtml) => {
    Object.keys(curEntities).map((objKentityey) => {
      const entity = curEntities[objKentityey];
      if (entity.indices[0] !== entity.indices[1]) {
        replaceObjects.push({
          start: entity.indices[0],
          end: entity.indices[1],
          html: getHtml(entity),
        });
      }
      return true;
    });
  };

  entities.urls &&
    parseEntitie(
      entities.urls,
      (entity) =>
        `<a class=${cx('twit-link')} target="_blank" href="${entity.url}">${
          entity.display_url
        }</a>`,
    );
  entities.user_mentions &&
    parseEntitie(
      entities.user_mentions,
      (entity) =>
        `<a class=${cx(
          'twit-link',
        )} target="_blank" href="https://twitter.com/intent/user?user_id=${entity.id}">@${
          entity.screen_name
        }</a>`,
    );
  entities.hashtags &&
    parseEntitie(
      entities.hashtags,
      (entity) =>
        `<a class=${cx('twit-link')} target="_blank" href="https://twitter.com/hashtag/${
          entity.text
        }">#${entity.text}</a>`,
    );
  entities.media &&
    parseEntitie(
      entities.media,
      (entity) =>
        `<a class=${cx('twit-link')} target="_blank" href="${entity.url}">${
          entity.display_url
        }</a>`,
    );
  replaceObjects.sort((a, b) => a.start - b.start);
  text.split('').forEach((letter, index) => {
    if (!currentReplaceObject && replaceObjects.length) {
      currentReplaceObject = replaceObjects.shift();
    }

    if (!currentReplaceObject || index < currentReplaceObject.start) {
      result += letter;
    } else if (currentReplaceObject.start === index) {
      result += currentReplaceObject.html;
    } else if (index >= currentReplaceObject.end) {
      currentReplaceObject = null;
      result += ' ';
    }
  });

  return result.replace(/\n/g, '<br>');
};

const handleClick = (e, tracking) => {
  const { href, tagName } = e.target;
  if (tagName === HREF_TAG_NAME) {
    tracking.trackEvent(LOGIN_PAGE_EVENTS.click_twitter_link(href));
  }
};

export const PostBlock = ({ tweetData, tracking }) => (
  <div className={cx('post-block')} onClick={(e) => handleClick(e, tracking)}>
    {Parser(getPostContent(tweetData.text, tweetData.entities))}
  </div>
);

PostBlock.propTypes = {
  tweetData: PropTypes.object,
  tracking: PropTypes.shape({
    trackEvent: PropTypes.func,
    getTrackingData: PropTypes.func,
  }).isRequired,
};
PostBlock.defaultProps = {
  tweetData: {},
};

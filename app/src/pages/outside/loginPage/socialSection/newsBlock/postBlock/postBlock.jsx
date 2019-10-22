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
import styles from './postBlock.scss';

const cx = classNames.bind(styles);

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
  currentReplaceObject = replaceObjects.shift();

  text.split('').forEach((letter, index) => {
    if (!currentReplaceObject && replaceObjects.length) {
      currentReplaceObject = replaceObjects.shift();
    }
    if (!currentReplaceObject || index < currentReplaceObject.start) {
      result += letter;
      return true;
    }
    if (currentReplaceObject.start === index) {
      result += currentReplaceObject.html;
      return true;
    }
    if (index >= currentReplaceObject.end) {
      result += letter;
      currentReplaceObject = null;
    }
    return true;
  });

  return result.replace(/\n/g, '<br>');
};

export const PostBlock = ({ tweetData }) => (
  <div className={cx('post-block')}>
    {Parser(getPostContent(tweetData.text, tweetData.entities))}
  </div>
);

PostBlock.propTypes = {
  tweetData: PropTypes.object,
};
PostBlock.defaultProps = {
  tweetData: {},
};

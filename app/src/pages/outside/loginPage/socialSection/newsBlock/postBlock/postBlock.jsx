/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
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

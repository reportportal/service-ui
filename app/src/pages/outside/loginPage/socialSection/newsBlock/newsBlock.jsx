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
import { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import styles from './newsBlock.scss';
import { PostBlock } from './postBlock';

const cx = classNames.bind(styles);

const MAX_TWEETS = 3;
const STACK_STEP_PX = 34;

const getTweetKey = (tweet, index) =>
  tweet.id ?? tweet.created_at ?? tweet.date ?? tweet.createdAt ?? `tweet-${index}`;

export const NewsBlock = ({ tweets, onExpandedChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleTweets = tweets.slice(0, MAX_TWEETS);
  const hasMoreTweets = visibleTweets.length > 1;
  const isStacked = !isExpanded && visibleTweets.length > 1;
  const stackedTweets = isStacked ? [...visibleTweets].reverse() : visibleTweets;
  const maxStackLayer = visibleTweets.length - 1;
  const stackPaddingTop = isStacked ? maxStackLayer * STACK_STEP_PX : 0;

  const handleToggle = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    onExpandedChange?.(nextExpanded);
  };

  return (
    <div className={cx('news-block', { 'news-block--expanded': isExpanded })}>
      <div
        className={cx('posts-stack', {
          'posts-stack--stacked': isStacked,
          'posts-stack--expanded': isExpanded,
        })}
        style={
          isStacked
            ? { paddingTop: `${stackPaddingTop}px` }
            : { paddingTop: 0 }
        }
      >
        {(isExpanded ? [...stackedTweets].reverse() : stackedTweets).map(
          (tweet, index) => {
            const stackLayer = isStacked ? visibleTweets.length - 1 - index : null;
            const isStackFront = stackLayer === 0;
            const adjustedStep = STACK_STEP_PX - (index * 2);
            const stackTopOffset =
              isStacked && stackLayer > 0
                ? (maxStackLayer - stackLayer) * adjustedStep
                : null;

            return (
            <PostBlock
                key={getTweetKey(tweet, index)}
                tweetData={tweet}
                stackLayer={stackLayer}
                isStacked={isStacked}
                isStackFront={isStackFront}
                stackTopOffset={stackTopOffset}
                isExpanded={isExpanded}
              />
            );
          }
        )}
      </div>
      {hasMoreTweets && (
        <button type="button" className={cx('toggle-button')} onClick={handleToggle}>
          {isExpanded ? (
            <FormattedMessage id="NewsBlock.close" defaultMessage="Close" />
          ) : (
            <FormattedMessage id="NewsBlock.openMoreNews" defaultMessage="Open more news" />
          )}
        </button>
      )}
    </div>
  );
};

NewsBlock.propTypes = {
  tweets: PropTypes.array,
  onExpandedChange: PropTypes.func,
};

NewsBlock.defaultProps = {
  tweets: [],
  onExpandedChange: null,
};

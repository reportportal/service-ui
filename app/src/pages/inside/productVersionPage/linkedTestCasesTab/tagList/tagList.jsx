/*
 * Copyright 2025 EPAM Systems
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

import { useEffect, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { Button } from '@reportportal/ui-kit';

import isEmpty from 'lodash.isempty';
import styles from './tagList.scss';

import { messages } from './messages';

const cx = classNames.bind(styles);

export const TagList = ({ tags, isFullWidthMode = false }) => {
  const { formatMessage } = useIntl();
  const listRef = useRef(null);
  const [count, setCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hiddenIndices, setHiddenIndices] = useState(new Set());

  const getOffset = () => {
    const parentElement = listRef.current;

    const overflowedElements = [...parentElement.children].reduce((acc, childElement) => {
      if (childElement.offsetTop !== parentElement.offsetTop) {
        return acc + 1;
      }

      return acc;
    }, 0);

    setCount(overflowedElements);
  };

  const getFullWidthOffset = () => {
    const parentElement = listRef.current;
    const hiddenSet = new Set();

    if (!parentElement) {
      return;
    }

    const tagElementsWithoutButtons = [...parentElement.children].filter(
      (child) => !child.classList.contains('tag-list__item--button'),
    );

    if (isEmpty(tagElementsWithoutButtons)) {
      return;
    }

    const firstElementOffsetTop = tagElementsWithoutButtons[0].offsetTop;
    const containerRect = parentElement.getBoundingClientRect();
    const containerRight = containerRect.right;
    let overflowedElementsCount = 0;

    tagElementsWithoutButtons.forEach((childElement, index) => {
      const elementRect = childElement.getBoundingClientRect();
      const elementOffsetTop = childElement.offsetTop;

      // Check if element is on a different line OR extends beyond container width
      const isOnDifferentLine = elementOffsetTop !== firstElementOffsetTop;
      const isExtendingRightBoundary = elementRect.right > containerRight;

      if (isOnDifferentLine || isExtendingRightBoundary) {
        hiddenSet.add(index);
        overflowedElementsCount += 1;
      }
    });

    setHiddenIndices(hiddenSet);
    setCount(overflowedElementsCount);
  };

  useEffect(() => {
    const parentElement = listRef.current;

    if (!parentElement) {
      return;
    }
    // It is needed because script executes earlier than font-family applies to the text
    const timeoutId = setTimeout(() => {
      isFullWidthMode ? getFullWidthOffset() : getOffset();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [listRef, isFullWidthMode]);

  const toggleExpanded = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const isCounterButtonVisible = useMemo(() => count > 0 && !isExpanded, [count, isExpanded]);

  if (isEmpty(tags)) {
    return (
      <div className={cx('tag-list-wrapper')}>
        <div
          className={cx('tag-list', 'tag-list--no-tags', {
            'tag-list--full-width': isFullWidthMode,
          })}
        >
          <div className={cx('no-tags-message')}>{formatMessage(messages.noTagsAdded)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx('tag-list-wrapper')}>
      <div
        className={cx('tag-list', {
          'tag-list--expanded': isExpanded,
          'tag-list--full-width': isFullWidthMode,
        })}
        ref={listRef}
      >
        {tags.map((tag, index) => {
          const isItemHidden = isFullWidthMode && !isExpanded && hiddenIndices.has(index);

          return (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`${index}-${tag}`}
              className={cx('tag-list__item')}
              style={{
                display: isItemHidden ? 'none' : 'flex',
              }}
            >
              <div className={cx('tag-list__item-title')}>{tag}</div>
            </div>
          );
        })}
        {isExpanded && (
          <Button className={cx('tag-list__item--button')} onClick={toggleExpanded} variant="text">
            {formatMessage(messages.showLess)}
          </Button>
        )}
      </div>
      {isCounterButtonVisible ? (
        <div className={cx('tag-list__item', 'tag-list__item--count')} onClick={toggleExpanded}>
          +{count}
        </div>
      ) : null}
    </div>
  );
};

TagList.propTypes = {
  tags: PropTypes.array,
  isFullWidthMode: PropTypes.bool,
};

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

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { Button } from '@reportportal/ui-kit';
import isEmpty from 'lodash.isempty';
import styles from './tagList.scss';
import { messages } from './messages';
import {
  DEFAULT_VISIBLE_LINES,
  TAG_LINE_HEIGHT,
  TAG_GAP_HEIGHT,
  IMMEDIATE_DELAY,
  FONT_LOADING_DELAY,
  OFFSET_TOLERANCE,
} from './constants';

const cx = classNames.bind(styles);

interface AdaptiveTagListProps {
  tags: string[];
  isShowAllView?: boolean;
  defaultVisibleLines?: number;
}

export const AdaptiveTagList = ({
  tags,
  isShowAllView = false,
  defaultVisibleLines = DEFAULT_VISIBLE_LINES,
}: AdaptiveTagListProps) => {
  const { formatMessage } = useIntl();
  const listRef = useRef(null);
  const [count, setCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());
  const [isExceedsVisibleLines, setIsExceedsVisibleLines] = useState(false);
  const [isCalculating, setIsCalculating] = useState(!isShowAllView); // Only calculate for non-show-all-view

  const getFullWidthOffset = useCallback(() => {
    const parentElement = listRef.current;
    const hiddenSet = new Set<number>();

    if (!parentElement) {
      setIsCalculating(false);
      return;
    }

    const tagElementsWithoutButtons = [...parentElement.children].filter(
      (child) => !child.classList.contains('tag-list__item--button'),
    );

    if (isEmpty(tagElementsWithoutButtons)) {
      setIsCalculating(false);
      return;
    }

    const firstElementOffsetTop = tagElementsWithoutButtons[0].offsetTop;
    const containerRect = parentElement.getBoundingClientRect();
    const containerRight = containerRect.right;
    let overflowedElementsCount = 0;

    tagElementsWithoutButtons.forEach((childElement, index) => {
      const elementRect = childElement.getBoundingClientRect();
      const elementOffsetTop = childElement.offsetTop;
      const isOnDifferentLine = elementOffsetTop !== firstElementOffsetTop;
      const isExtendingRightBoundary = elementRect.right > containerRight;

      if (isOnDifferentLine || isExtendingRightBoundary) {
        hiddenSet.add(index);
        overflowedElementsCount += 1;
      }
    });

    setHiddenIndices(hiddenSet);
    setCount(overflowedElementsCount);
    setIsCalculating(false);
  }, [listRef]);

  const getVisibleLinesOffset = useCallback(() => {
    const parentElement = listRef.current;
    const hiddenSet = new Set<number>();

    if (!parentElement || !defaultVisibleLines) {
      setIsCalculating(false);
      return;
    }

    const tagElementsWithoutButtons = [...parentElement.children].filter(
      (child) => !child.classList.contains('tag-list__item--button'),
    );

    if (isEmpty(tagElementsWithoutButtons)) {
      setIsCalculating(false);
      return;
    }

    const firstElementOffsetTop = tagElementsWithoutButtons[0].offsetTop;
    const lineHeight = tagElementsWithoutButtons[0].offsetHeight;
    const maxAllowedTopOffset = firstElementOffsetTop + lineHeight * (defaultVisibleLines - 1);
    let overflowedElementsCount = 0;
    let hasOverflow = false;

    tagElementsWithoutButtons.forEach((childElement, index) => {
      const elementOffsetTop = childElement.offsetTop;

      if (elementOffsetTop > maxAllowedTopOffset + OFFSET_TOLERANCE) {
        hiddenSet.add(index);
        overflowedElementsCount += 1;
        hasOverflow = true;
      }
    });

    setHiddenIndices(hiddenSet);
    setCount(overflowedElementsCount);
    setIsExceedsVisibleLines(hasOverflow);
    setIsCalculating(false);
  }, [defaultVisibleLines, listRef]);

  const getMaxHeightStyle = useMemo(() => {
    if (isShowAllView && defaultVisibleLines && !isExpanded) {
      const lineHeight = TAG_LINE_HEIGHT;
      const gapHeight = TAG_GAP_HEIGHT;
      const maxHeight = lineHeight * defaultVisibleLines + gapHeight * (defaultVisibleLines - 1);
      return {
        maxHeight: `${maxHeight}px`,
        overflow: 'hidden',
      };
    }
    return {};
  }, [isShowAllView, defaultVisibleLines, isExpanded]);

  useEffect(() => {
    const parentElement = listRef.current;

    if (!parentElement) {
      return;
    }

    const delay = isShowAllView && defaultVisibleLines ? IMMEDIATE_DELAY : FONT_LOADING_DELAY;

    const timeoutId = setTimeout(() => {
      if (isShowAllView && defaultVisibleLines) {
        getVisibleLinesOffset();
      } else {
        getFullWidthOffset();
      }
    }, delay);

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timeoutId);
  }, [
    listRef,
    isShowAllView,
    defaultVisibleLines,
    getFullWidthOffset,
    getVisibleLinesOffset,
    hiddenIndices,
  ]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prevState) => !prevState);
  }, []);

  const handleCountClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    toggleExpanded();
  };

  const handleButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      toggleExpanded();
    },
    [toggleExpanded],
  );

  const isCounterButtonVisible = useMemo(() => count > 0 && !isExpanded, [count, isExpanded]);
  const isShowAllButtonVisible = useMemo(
    () => isShowAllView && defaultVisibleLines && isExceedsVisibleLines && !isExpanded,
    [isShowAllView, defaultVisibleLines, isExceedsVisibleLines, isExpanded],
  );

  const showAllButtonTemplate = useMemo(() => {
    return (
      <div className={cx('tag-list__item--button-wrapper')}>
        <Button
          className={cx('tag-list__item--button', 'tag-list__item--button-show-all-view')}
          onClick={handleButtonClick}
          variant="text"
        >
          {formatMessage(messages.showAll)}
        </Button>
      </div>
    );
  }, [formatMessage, handleButtonClick]);

  const hideAllButtonTemplate = useMemo(() => {
    return (
      <div className={cx({ 'tag-list__item--button-wrapper': isShowAllView })}>
        <Button
          className={cx('tag-list__item--button', {
            'tag-list__item--button-show-all-view': isShowAllView && defaultVisibleLines,
          })}
          onClick={handleButtonClick}
          variant="text"
        >
          {isShowAllView && defaultVisibleLines
            ? formatMessage(messages.hideAll)
            : formatMessage(messages.showLess)}
        </Button>
      </div>
    );
  }, [formatMessage, handleButtonClick, isShowAllView, defaultVisibleLines]);

  if (isEmpty(tags)) {
    return (
      <div className={cx('tag-list-wrapper')}>
        <div className={cx('tag-list', 'tag-list--no-tags', 'tag-list--full-width')}>
          <div className={cx('no-tags-message')}>{formatMessage(messages.noTagsAdded)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx('tag-list-wrapper', { 'tag-list-wrapper--show-all-view': isShowAllView })}>
      <div
        className={cx('tag-list', 'tag-list--full-width', {
          'tag-list--expanded': isExpanded,
          'tag-list--show-all-view': isShowAllView && !isExpanded,
        })}
        style={getMaxHeightStyle}
        ref={listRef}
      >
        {isCalculating
          ? tags.map((tag, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`${index}-${tag}`}
                className={cx('tag-list__item')}
                style={{ visibility: 'hidden' }}
              >
                <div className={cx('tag-list__item-title')}>{tag}</div>
              </div>
            ))
          : tags.map((tag, index) => {
              const isHasHiddenIndex = !isExpanded && hiddenIndices.has(index);
              const shouldHideTag = !isShowAllView && isHasHiddenIndex;

              return (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${index}-${tag}`}
                  className={cx('tag-list__item')}
                  style={{
                    display: shouldHideTag ? 'none' : 'flex',
                  }}
                >
                  <div className={cx('tag-list__item-title')}>{tag}</div>
                </div>
              );
            })}
        {!isShowAllView && (
          <>
            {isExpanded && hideAllButtonTemplate}
            {isShowAllButtonVisible && showAllButtonTemplate}
          </>
        )}
      </div>
      {isShowAllView && (
        <>
          {isExpanded && hideAllButtonTemplate}
          {isShowAllButtonVisible && showAllButtonTemplate}
        </>
      )}
      {isCounterButtonVisible && !isShowAllView ? (
        <button
          type="button"
          className={cx('tag-list__item', 'tag-list__item--count')}
          onClick={handleCountClick}
        >
          +{count}
        </button>
      ) : null}
    </div>
  );
};

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

const cx = classNames.bind(styles);

interface AdaptiveTagListProps {
  tags: string[];
  isShowAllView?: boolean;
  defaultVisibleLines?: number;
}

export const AdaptiveTagList = ({
  tags,
  isShowAllView = false,
  defaultVisibleLines = null,
}: AdaptiveTagListProps) => {
  const { formatMessage } = useIntl();
  const listRef = useRef(null);
  const [count, setCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set());
  const [isExceedsVisibleLines, setIsExceedsVisibleLines] = useState(false);

  const getFullWidthOffset = useCallback(() => {
    const parentElement = listRef.current;
    const hiddenSet = new Set<number>();

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
  }, [listRef]);

  const getVisibleLinesOffset = useCallback(() => {
    const parentElement = listRef.current;
    const hiddenSet = new Set<number>();

    if (!parentElement || !defaultVisibleLines) {
      return;
    }

    const tagElementsWithoutButtons = [...parentElement.children].filter(
      (child) => !child.classList.contains('tag-list__item--button'),
    );

    if (isEmpty(tagElementsWithoutButtons)) {
      return;
    }

    const firstElementOffsetTop = tagElementsWithoutButtons[0].offsetTop;
    const lineHeight = tagElementsWithoutButtons[0].offsetHeight;
    const maxAllowedTopOffset = firstElementOffsetTop + lineHeight * (defaultVisibleLines - 1);
    let overflowedElementsCount = 0;
    let hasOverflow = false;

    tagElementsWithoutButtons.forEach((childElement, index) => {
      const elementOffsetTop = childElement.offsetTop;

      if (elementOffsetTop > maxAllowedTopOffset) {
        hiddenSet.add(index);
        overflowedElementsCount += 1;
        hasOverflow = true;
      }
    });

    setHiddenIndices(hiddenSet);
    setCount(overflowedElementsCount);
    setIsExceedsVisibleLines(hasOverflow);
  }, [defaultVisibleLines, listRef]);

  useEffect(() => {
    const parentElement = listRef.current;

    if (!parentElement) {
      return;
    }
    // It is needed because script executes earlier than font-family applies to the text
    const timeoutId = setTimeout(() => {
      if (isShowAllView && defaultVisibleLines) {
        getVisibleLinesOffset();
        return;
      }
      getFullWidthOffset();
    }, 500);

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timeoutId);
  }, [listRef, isShowAllView, defaultVisibleLines, getFullWidthOffset, getVisibleLinesOffset]);

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
        })}
        ref={listRef}
      >
        {tags.map((tag, index) => {
          const isHasHiddenIndex = !isExpanded && hiddenIndices.has(index);
          const isItemHidden =
            isHasHiddenIndex || (isShowAllView && defaultVisibleLines && isHasHiddenIndex);
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

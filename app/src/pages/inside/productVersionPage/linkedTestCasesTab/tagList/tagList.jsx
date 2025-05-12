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

import React, { useEffect, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { Button } from '@reportportal/ui-kit';

import styles from './tagList.scss';

import { messages } from './messages';

const cx = classNames.bind(styles);

export const TagList = ({ tags }) => {
  const { formatMessage } = useIntl();
  const listRef = useRef(null);
  const [count, setCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

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

  useEffect(() => {
    const parentElement = listRef.current;

    if (!parentElement) {
      console.error(`Element with ID not found.`);
      return;
    }
    // It is needed because script executes earlier than font-family applies to the text
    const timeoutId = setTimeout(() => {
      getOffset();
    }, 500);

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timeoutId);
  }, [listRef]);

  const toggleExpanded = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const isCounterButtonVisible = useMemo(() => count > 0 && !isExpanded, [count, isExpanded]);

  return (
    <div className={cx('tag-list-wrapper')}>
      <div
        className={cx('tag-list', {
          'tag-list--expanded': isExpanded,
        })}
        ref={listRef}
      >
        {tags.map((tag, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className={cx('tag-list__item')}>
            <div className={cx('tag-list__item-title')}>{tag}</div>
          </div>
        ))}
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
};
